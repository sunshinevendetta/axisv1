import { randomUUID } from "node:crypto";
import {
  GARNISHES,
  INGREDIENTS,
  SHOT_VOLUME_ML,
  VELVIQUE_CATALOG_VERSION,
  VELVIQUE_SENSORY_MODEL_VERSION,
  type GarnishId,
  type SensoryVector,
} from "./velvique-catalog";
import { conflictsWith, denseOf, excludesCandidate, rankCandidates, rankGarnishes, type RecipeComponent } from "./velvique-engine";
import type { AnswerSet } from "./velvique-questions";

/* Types shared by the engine, the narrative agent and the release checks.
   There is no database: live assignments are the cards in the Brevo
   guest list (see velvique-registry). The in-memory state below exists only to
   simulate a full night for the release checks. */

export type Narrative = {
  name: string;
  description: string;
  reading: string;
  provider: string;
  model: string | null;
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
  recipeSignature: string;
  signatureHash: string;
  components: RecipeComponent[];
  volumeTotalMl: number;
  garnishId: GarnishId | null;
  sensoryModelVersion: string;
  catalogVersion: string;
  idempotencyKey: string;
};

export type SimulationState = {
  assignments: Assignment[];
  stockMl: Record<string, number>;
  reservedMl: Record<string, number>;
  garnishStock: Record<string, number>;
  garnishReserved: Record<string, number>;
};

export class VelviqueCapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VelviqueCapacityError";
  }
}

export function createInitialState(): SimulationState {
  return {
    assignments: [],
    stockMl: Object.fromEntries(INGREDIENTS.map((item) => [item.id, item.initialStockMl])),
    reservedMl: Object.fromEntries(INGREDIENTS.map((item) => [item.id, 0])),
    garnishStock: Object.fromEntries(GARNISHES.map((item) => [item.id, item.initialStockUnits])),
    garnishReserved: Object.fromEntries(GARNISHES.map((item) => [item.id, 0])),
  };
}

function availableMl(state: SimulationState, id: string) {
  return (state.stockMl[id] ?? 0) - (state.reservedMl[id] ?? 0);
}

/* Same selection rules the live registry applies against the chain: exact
   signature unique, pairwise distance, stock. Throws instead of reusing. */
export function assignRecipe(state: SimulationState, guest: Guest, idempotencyKey: string): { assignment: Assignment; created: boolean } {
  const existing = state.assignments.find((item) => item.guestId === guest.guestId || item.idempotencyKey === idempotencyKey);
  if (existing) return { assignment: existing, created: false };

  const usedSignatures = new Set(state.assignments.map((item) => item.recipeSignature));
  const usedDense = state.assignments.map((item) => denseOf(item.components));

  for (const { candidate } of rankCandidates(guest.sensoryTarget)) {
    if (usedSignatures.has(candidate.signature)) continue;
    if (excludesCandidate(candidate, guest.restrictions)) continue;
    if (candidate.components.some((c) => availableMl(state, c.ingredientId) < c.ml)) continue;
    if (conflictsWith(candidate, usedDense)) continue;

    const garnish = rankGarnishes(candidate.profile, guest.restrictions).find((item) => state.garnishStock[item.id] - state.garnishReserved[item.id] > 0) ?? null;
    for (const c of candidate.components) state.reservedMl[c.ingredientId] += c.ml;
    if (garnish) state.garnishReserved[garnish.id] += 1;

    const assignment: Assignment = {
      assignmentId: randomUUID(),
      guestId: guest.guestId,
      recipeSignature: candidate.signature,
      signatureHash: candidate.signatureHash,
      components: candidate.components,
      volumeTotalMl: SHOT_VOLUME_ML,
      garnishId: garnish?.id ?? null,
      sensoryModelVersion: VELVIQUE_SENSORY_MODEL_VERSION,
      catalogVersion: VELVIQUE_CATALOG_VERSION,
      idempotencyKey,
    };
    state.assignments.push(assignment);
    return { assignment, created: true };
  }

  throw new VelviqueCapacityError(`No unique feasible recipe remains for ${guest.profileCode}; recipes are never reused.`);
}
