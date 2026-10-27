import { randomInt, randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { readJsonFile, writeJsonFile } from "./json-store";
import {
  ATTENDEES,
  GARNISHES,
  INGREDIENTS,
  INGREDIENT_BUDGET_MXN,
  PURCHASE_RESERVE,
  SHOT_VOLUME_ML,
  VELVIQUE_CATALOG_VERSION,
  VELVIQUE_SENSORY_MODEL_VERSION,
  getGarnish,
  getIngredient,
  type GarnishId,
  type IngredientId,
  type SensoryVector,
} from "./velvique-catalog";
import { conflictsWith, denseOf, excludesCandidate, rankCandidates, rankGarnishes, type RecipeComponent } from "./velvique-engine";
import type { AnswerSet } from "./velvique-questions";

export type AssignmentStatus = "queued" | "preparing" | "ready" | "served" | "void";

export type Narrative = {
  name: string;
  description: string;
  reading: string;
  provider: string;
  model: string | null;
};

/* One collectible per guest recipe. "reserved" means the guest linked a Base
   Account; the mint itself runs later against this same record (addendum:
   deferred claim, idempotent retries, never a second identity). */
export type Collectible = {
  walletAddress: string;
  status: "reserved" | "minting" | "minted" | "failed";
  connectedAt: string;
  txHash: string | null;
};

export type Guest = {
  guestId: string;
  answerIds: AnswerSet;
  restrictions: string[];
  /* Optional name the guest asked to print on their card. */
  displayName: string | null;
  profileCode: string;
  sensoryTarget: SensoryVector;
  createdAt: string;
};

export type Assignment = {
  assignmentId: string;
  guestId: string;
  guestName: string | null;
  queueNumber: number;
  recipeId: string;
  recipeSignature: string;
  signatureHash: string;
  components: RecipeComponent[];
  volumeTotalMl: number;
  garnishId: GarnishId | null;
  sensoryModelVersion: string;
  catalogVersion: string;
  profileCode: string;
  sensoryError: number;
  status: AssignmentStatus;
  idempotencyKey: string;
  narrative: Narrative | null;
  collectible: Collectible | null;
  assignedAt: string;
  servedAt: string | null;
  updatedAt: string;
};

export type LedgerEvent = {
  ingredientId: string;
  batchId: string;
  eventType: "batch-in" | "reserve" | "release" | "consume" | "garnish-reserve" | "garnish-release";
  quantity: number;
  assignmentId: string | null;
  occurredAt: string;
};

export type VelviqueState = {
  catalogVersion: string;
  guests: Record<string, Guest>;
  assignments: Assignment[];
  stockMl: Record<string, number>;
  reservedMl: Record<string, number>;
  garnishStock: Record<string, number>;
  garnishReserved: Record<string, number>;
  ledger: LedgerEvent[];
  queueSequence: number;
  /* Tonight's free-bottle draw. Entrants are guests who saved their card. */
  draw: { assignmentId: string; drawnAt: string } | null;
};

export class VelviqueCapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VelviqueCapacityError";
  }
}

export function createInitialState(): VelviqueState {
  return {
    catalogVersion: VELVIQUE_CATALOG_VERSION,
    guests: {},
    assignments: [],
    stockMl: Object.fromEntries(INGREDIENTS.map((item) => [item.id, item.initialStockMl])),
    reservedMl: Object.fromEntries(INGREDIENTS.map((item) => [item.id, 0])),
    garnishStock: Object.fromEntries(GARNISHES.map((item) => [item.id, item.initialStockUnits])),
    garnishReserved: Object.fromEntries(GARNISHES.map((item) => [item.id, 0])),
    ledger: [],
    queueSequence: 0,
    draw: null,
  };
}

const STATE_FILE = process.env.VELVIQUE_STATE_FILE?.trim() || path.join(os.tmpdir(), "axis-velvique-state.json");

declare global {
  var velviqueState: VelviqueState | undefined;
  var velviqueLock: Promise<unknown> | undefined;
}

async function loadState() {
  if (globalThis.velviqueState?.catalogVersion !== VELVIQUE_CATALOG_VERSION) {
    const stored = await readJsonFile<VelviqueState | null>(STATE_FILE, { fallback: null });
    globalThis.velviqueState = stored?.catalogVersion === VELVIQUE_CATALOG_VERSION ? stored : createInitialState();
  }
  return globalThis.velviqueState;
}

async function persist(state: VelviqueState) {
  try {
    await writeJsonFile(STATE_FILE, state);
  } catch (error) {
    console.warn("Velvique state persistence failed; continuing in memory", error);
  }
}

/* Serialized allocation coordinator: every mutation runs one at a time, so
   signature, distance and stock checks see all committed assignments. This
   holds for one server process; a multi-instance deploy needs a shared lock. */
export async function withState<T>(mutate: (state: VelviqueState) => T | Promise<T>, write = true): Promise<T> {
  const run = async () => {
    const state = await loadState();
    const result = await mutate(state);
    if (write) await persist(state);
    return result;
  };
  const next = (globalThis.velviqueLock ?? Promise.resolve()).then(run, run);
  globalThis.velviqueLock = next.catch(() => undefined);
  return next;
}

export function activeAssignments(state: VelviqueState) {
  return state.assignments.filter((item) => item.status !== "void");
}

export function findGuestAssignment(state: VelviqueState, guestId: string) {
  return activeAssignments(state).find((item) => item.guestId === guestId);
}

export function availableMl(state: VelviqueState, id: string) {
  return (state.stockMl[id] ?? 0) - (state.reservedMl[id] ?? 0);
}

function availableGarnish(state: VelviqueState, id: string) {
  return (state.garnishStock[id] ?? 0) - (state.garnishReserved[id] ?? 0);
}

/* Assignment transaction: idempotent per guest, exact signature unique,
   pairwise distance enforced, stock reserved conditionally. Throws
   VelviqueCapacityError instead of ever reusing a recipe. */
export function assignRecipe(state: VelviqueState, guest: Guest, idempotencyKey: string): { assignment: Assignment; created: boolean } {
  const existing = findGuestAssignment(state, guest.guestId);
  if (existing) return { assignment: existing, created: false };
  const replay = state.assignments.find((item) => item.idempotencyKey === idempotencyKey && item.status !== "void");
  if (replay) return { assignment: replay, created: false };

  const active = activeAssignments(state);
  const usedSignatures = new Set(active.map((item) => item.recipeSignature));
  const usedDense = active.map((item) => denseOf(item.components));

  for (const { candidate, error } of rankCandidates(guest.sensoryTarget)) {
    if (usedSignatures.has(candidate.signature)) continue;
    if (excludesCandidate(candidate, guest.restrictions)) continue;
    if (candidate.components.some((c) => availableMl(state, c.ingredientId) < c.ml)) continue;
    if (conflictsWith(candidate, usedDense)) continue;

    const now = new Date().toISOString();
    const assignmentId = randomUUID();
    const garnish = rankGarnishes(candidate.profile, guest.restrictions).find((item) => availableGarnish(state, item.id) > 0) ?? null;

    for (const c of candidate.components) {
      state.reservedMl[c.ingredientId] = (state.reservedMl[c.ingredientId] ?? 0) + c.ml;
      state.ledger.push({ ingredientId: c.ingredientId, batchId: getIngredient(c.ingredientId)!.batchId, eventType: "reserve", quantity: c.ml, assignmentId, occurredAt: now });
    }
    if (garnish) {
      state.garnishReserved[garnish.id] = (state.garnishReserved[garnish.id] ?? 0) + 1;
      state.ledger.push({ ingredientId: garnish.id, batchId: `${garnish.id}-planning`, eventType: "garnish-reserve", quantity: 1, assignmentId, occurredAt: now });
    }

    state.queueSequence += 1;
    const assignment: Assignment = {
      assignmentId,
      guestId: guest.guestId,
      guestName: guest.displayName ?? null,
      queueNumber: state.queueSequence,
      recipeId: `VLQ-${candidate.signatureHash.slice(0, 8).toUpperCase()}`,
      recipeSignature: candidate.signature,
      signatureHash: candidate.signatureHash,
      components: candidate.components,
      volumeTotalMl: SHOT_VOLUME_ML,
      garnishId: garnish?.id ?? null,
      sensoryModelVersion: VELVIQUE_SENSORY_MODEL_VERSION,
      catalogVersion: VELVIQUE_CATALOG_VERSION,
      profileCode: guest.profileCode,
      sensoryError: Number(error.toFixed(5)),
      status: "queued",
      idempotencyKey,
      narrative: null,
      collectible: null,
      assignedAt: now,
      servedAt: null,
      updatedAt: now,
    };
    state.assignments.push(assignment);
    return { assignment, created: true };
  }

  throw new VelviqueCapacityError(
    `No unique feasible recipe remains for guest ${guest.guestId} (${guest.profileCode}). ${active.length} recipes assigned. Check stock, exclusions and the candidate pool before continuing; recipes are never reused.`,
  );
}

const TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  queued: ["preparing", "void"],
  preparing: ["ready", "queued", "void"],
  ready: ["served", "preparing", "void"],
  served: [],
  void: [],
};

export function setAssignmentStatus(state: VelviqueState, assignmentId: string, status: AssignmentStatus) {
  const assignment = state.assignments.find((item) => item.assignmentId === assignmentId);
  if (!assignment) return { ok: false as const, error: "Assignment not found." };
  if (assignment.status === status) return { ok: true as const, assignment };
  if (!TRANSITIONS[assignment.status].includes(status)) {
    return { ok: false as const, error: `Cannot move from ${assignment.status} to ${status}.` };
  }

  const now = new Date().toISOString();
  if (status === "served" || status === "void") {
    for (const c of assignment.components) {
      state.reservedMl[c.ingredientId] -= c.ml;
      if (status === "served") state.stockMl[c.ingredientId] -= c.ml;
      state.ledger.push({ ingredientId: c.ingredientId, batchId: getIngredient(c.ingredientId)!.batchId, eventType: status === "served" ? "consume" : "release", quantity: c.ml, assignmentId, occurredAt: now });
    }
    if (assignment.garnishId) {
      state.garnishReserved[assignment.garnishId] -= 1;
      if (status === "served") state.garnishStock[assignment.garnishId] -= 1;
      else state.ledger.push({ ingredientId: assignment.garnishId, batchId: `${assignment.garnishId}-planning`, eventType: "garnish-release", quantity: 1, assignmentId, occurredAt: now });
    }
  }
  if (status === "served") assignment.servedAt = now;
  assignment.status = status;
  assignment.updatedAt = now;
  return { ok: true as const, assignment };
}

export function addBatch(state: VelviqueState, ingredientId: IngredientId, batchId: string, quantityMl: number) {
  state.stockMl[ingredientId] = (state.stockMl[ingredientId] ?? 0) + quantityMl;
  state.ledger.push({ ingredientId, batchId, eventType: "batch-in", quantity: quantityMl, assignmentId: null, occurredAt: new Date().toISOString() });
}

export function stockReport(state: VelviqueState) {
  return {
    ingredients: INGREDIENTS.map((item) => ({
      id: item.id,
      name: item.name,
      stockMl: state.stockMl[item.id] ?? 0,
      reservedMl: state.reservedMl[item.id] ?? 0,
      availableMl: availableMl(state, item.id),
      placeholderStock: item.batchId.endsWith("-planning"),
    })),
    garnishes: GARNISHES.map((item) => ({
      id: item.id,
      name: item.name,
      stockUnits: state.garnishStock[item.id] ?? 0,
      reservedUnits: state.garnishReserved[item.id] ?? 0,
      availableUnits: availableGarnish(state, item.id),
    })),
  };
}

/* use_ml[i] = sum q[assigned, i]; order_ml = 1.15 * use; packages = ceil(order / package) */
export function procurementReport(state: VelviqueState) {
  const active = activeAssignments(state);
  const rows = INGREDIENTS.map((item) => {
    const useMl = active.reduce((sum, a) => sum + (a.components.find((c) => c.ingredientId === item.id)?.ml ?? 0), 0);
    const orderMl = Math.round((1 + PURCHASE_RESERVE) * useMl * 100) / 100;
    const packages = item.confirmedPackageMl ? Math.ceil(orderMl / item.confirmedPackageMl) : null;
    const spendMxn = packages !== null && item.supplierPriceMxn !== null ? packages * item.supplierPriceMxn : null;
    return { id: item.id, name: item.name, useMl, orderMl, confirmedPackageMl: item.confirmedPackageMl, packages, spendMxn };
  });
  const priced = rows.every((row) => row.spendMxn !== null);
  const spend = priced ? rows.reduce((sum, row) => sum + (row.spendMxn ?? 0), 0) : null;
  return {
    assigned: active.length,
    baselineMl: ATTENDEES * SHOT_VOLUME_ML,
    reserveBaselineMl: ATTENDEES * SHOT_VOLUME_ML * (1 + PURCHASE_RESERVE),
    rows,
    ingredientSpendMxn: spend,
    ingredientBudgetMxn: INGREDIENT_BUDGET_MXN,
    withinBudget: spend === null ? null : spend <= INGREDIENT_BUDGET_MXN,
    note: priced ? null : "Package sizes and supplier prices are not confirmed yet; spend cannot be computed.",
  };
}

export function buildCard(assignment: Assignment) {
  const garnish = assignment.garnishId ? getGarnish(assignment.garnishId) : null;
  return {
    ...assignment,
    build: assignment.components.map((c) => ({ ...c, name: getIngredient(c.ingredientId)!.name })),
    garnish: garnish ? { id: garnish.id, name: garnish.name, instruction: garnish.preparationInstruction } : null,
  };
}

export function linkCollectible(state: VelviqueState, guestId: string, walletAddress: string) {
  const assignment = findGuestAssignment(state, guestId);
  if (!assignment) return { ok: false as const, status: 404, error: "No shot is assigned to this guest yet." };
  const existing = assignment.collectible;
  if (existing) {
    if (existing.walletAddress.toLowerCase() === walletAddress.toLowerCase()) return { ok: true as const, assignment };
    return { ok: false as const, status: 409, error: "This card is already saved to another pass." };
  }
  assignment.collectible = { walletAddress, status: "reserved", connectedAt: new Date().toISOString(), txHash: null };
  assignment.updatedAt = assignment.collectible.connectedAt;
  return { ok: true as const, assignment };
}

export function drawEntrants(state: VelviqueState) {
  return activeAssignments(state).filter((item) => item.collectible);
}

/* Picks one entrant at random and keeps the result, so a refresh never
   changes the winner. Pass redraw to pick again (e.g. the winner is absent). */
export function runDraw(state: VelviqueState, redraw: boolean) {
  const entrants = drawEntrants(state);
  const current = state.draw && entrants.find((item) => item.assignmentId === state.draw?.assignmentId);
  if (current && !redraw) return { winner: current, entrants: entrants.length, drawnAt: state.draw!.drawnAt };
  const pool = redraw && current ? entrants.filter((item) => item.assignmentId !== current.assignmentId) : entrants;
  if (pool.length === 0) return { winner: null, entrants: entrants.length, drawnAt: null };
  const winner = pool[randomInt(pool.length)];
  state.draw = { assignmentId: winner.assignmentId, drawnAt: new Date().toISOString() };
  return { winner, entrants: entrants.length, drawnAt: state.draw.drawnAt };
}
