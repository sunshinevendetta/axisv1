import {
  ATTENDEES,
  BASE_ID,
  GARNISHES,
  INGREDIENT_IDS,
  MAX_COMPONENTS,
  MIN_DISTANCE,
  SENSORY_DIMENSIONS,
  SHOT_VOLUME_ML,
  UNIT_ML,
  getIngredient,
} from "./velvique-catalog";
import { conflictsWith, denseOf, getCandidates, recipeDistance } from "./velvique-engine";
import { QUESTIONS, profileCode, sensoryTarget, type AnswerLetter, type AnswerSet, ANSWER_PROFILE_COUNT } from "./velvique-questions";
import { assignRecipe, createInitialState, type Guest } from "./velvique-store";

type Check = { name: string; pass: boolean; detail: string };

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];

function allProfiles() {
  let out: AnswerSet[] = [[]];
  for (let q = 0; q < QUESTIONS.length; q += 1) out = out.flatMap((prefix) => LETTERS.map((letter) => [...prefix, letter]));
  return out;
}

function guestFor(id: string, answers: AnswerSet, restrictions: string[] = []): Guest {
  return { guestId: id, answerIds: answers, restrictions, displayName: null, profileCode: profileCode(answers), sensoryTarget: sensoryTarget(answers), createdAt: new Date().toISOString() };
}

/* Greedy pairwise-valid pool size: a lower bound on unique capacity. */
export function pairwiseCapacity(limit = ATTENDEES * 3) {
  const chosen: Float64Array[] = [];
  for (const candidate of getCandidates()) {
    if (!conflictsWith(candidate, chosen)) chosen.push(candidate.dense);
    if (chosen.length >= limit) break;
  }
  return chosen.length;
}

function simulate(answersFor: (i: number) => AnswerSet) {
  const state = createInitialState();
  for (let i = 0; i < ATTENDEES; i += 1) assignRecipe(state, guestFor(`sim-${i}`, answersFor(i)), `sim-key-${i}`);
  const dense = state.assignments.map((a) => denseOf(a.components));
  let violations = 0;
  for (let i = 0; i < dense.length; i += 1) for (let j = i + 1; j < dense.length; j += 1) if (recipeDistance(dense[i], dense[j]) < MIN_DISTANCE) violations += 1;
  const hashes = new Set(state.assignments.map((a) => a.signatureHash));
  const negativeStock = Object.entries(state.stockMl).some(([id, ml]) => ml - state.reservedMl[id] < 0);
  const garnishOver = GARNISHES.some((g) => state.garnishReserved[g.id] > state.garnishStock[g.id]);
  const replay = assignRecipe(state, guestFor("sim-0", answersFor(0)), "sim-key-0");
  return { state, violations, distinct: hashes.size, negativeStock, garnishOver, idempotent: !replay.created && replay.assignment.assignmentId === state.assignments[0].assignmentId };
}

export function runReleaseChecks() {
  const checks: Check[] = [];
  const candidates = getCandidates();

  const profiles = allProfiles();
  const finite = profiles.every((answers) => SENSORY_DIMENSIONS.every((dim) => Number.isFinite(sensoryTarget(answers)[dim])));
  checks.push({ name: `${ANSWER_PROFILE_COUNT.toLocaleString("en-US")} profiles yield finite sensory vectors`, pass: profiles.length === ANSWER_PROFILE_COUNT && finite, detail: `${profiles.length} profiles from ${QUESTIONS.length} questions` });

  const badIds = candidates.filter((c) => c.components.some((x) => !INGREDIENT_IDS.includes(x.ingredientId)) || !c.components.some((x) => x.ingredientId === BASE_ID));
  checks.push({ name: "Only shelf IDs, T01 always included", pass: badIds.length === 0, detail: `${candidates.length} candidates checked` });

  const badShape = candidates.filter((c) => {
    const total = c.components.reduce((sum, x) => sum + x.ml, 0);
    return Math.abs(total - SHOT_VOLUME_ML) > 1e-9 || c.components.length > MAX_COMPONENTS || c.components.some((x) => Math.abs(x.ml / UNIT_ML - Math.round(x.ml / UNIT_ML)) > 1e-9);
  });
  checks.push({ name: "Exactly 45 ml in 2.5 ml units, at most 4 components", pass: badShape.length === 0, detail: `${badShape.length} violations` });

  const badDose = candidates.filter((c) => c.components.some((x) => {
    const item = getIngredient(x.ingredientId)!;
    return x.ml < item.volumeMin || x.ml > item.volumeMax;
  }));
  checks.push({ name: "Component min/max respected", pass: badDose.length === 0, detail: `${badDose.length} violations` });

  const capacity = pairwiseCapacity();
  checks.push({ name: "At least 100 pairwise valid candidates", pass: capacity >= ATTENDEES, detail: `greedy pool reached ${capacity}` });

  const identical = simulate(() => ["B", "C", "B", "D", "C"]);
  checks.push({ name: "100 identical responses produce 100 distinct signatures", pass: identical.distinct === ATTENDEES && identical.violations === 0, detail: `${identical.distinct} distinct, ${identical.violations} distance violations` });
  checks.push({ name: "No negative stock, garnish within stock", pass: !identical.negativeStock && !identical.garnishOver, detail: identical.negativeStock ? "stock went negative" : "stock respected" });
  checks.push({ name: "Idempotent retry returns the same assignment", pass: identical.idempotent, detail: identical.idempotent ? "same assignment returned" : "replay created a new assignment" });

  const mixed = simulate((i) => profiles[(i * 97) % profiles.length]);
  checks.push({ name: "100 mixed profiles assign without repeats", pass: mixed.distinct === ATTENDEES && mixed.violations === 0, detail: `${mixed.distinct} distinct, ${mixed.violations} distance violations` });

  return { pass: checks.every((check) => check.pass), candidates: candidates.length, checks };
}
