import { createHash } from "node:crypto";
import {
  BASE_ID,
  GARNISHES,
  INCOMPATIBLE_PAIRS,
  INGREDIENTS,
  MAX_COMPONENTS,
  MIN_DISTANCE,
  SENSORY_DIMENSIONS,
  SENSORY_WEIGHTS,
  SHOT_UNITS,
  SHOT_VOLUME_ML,
  UNIT_ML,
  type Garnish,
  type Ingredient,
  type IngredientId,
  type SensoryVector,
  VELVIQUE_CATALOG_VERSION,
} from "./velvique-catalog";

export type RecipeComponent = { ingredientId: IngredientId; ml: number };

export type Candidate = {
  /* Sorted by ingredient id; each ml is a multiple of 2.5 and sums to 45. */
  components: RecipeComponent[];
  signature: string;
  signatureHash: string;
  profile: SensoryVector;
  /* Dense ml vector in INGREDIENTS order for distance checks. */
  dense: Float64Array;
};

const INDEX = new Map(INGREDIENTS.map((item, index) => [item.id, index]));
const incompatible = new Set(INCOMPATIBLE_PAIRS.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));

function unitsBounds(item: Ingredient) {
  return [Math.round(item.volumeMin / UNIT_ML), Math.round(item.volumeMax / UNIT_ML)] as const;
}

export function signatureOf(components: RecipeComponent[]) {
  return [...components]
    .sort((a, b) => a.ingredientId.localeCompare(b.ingredientId))
    .map((item) => `${item.ingredientId}:${item.ml.toFixed(1)}`)
    .join("|");
}

function hashSignature(signature: string) {
  return createHash("sha256").update(signature).digest("hex").slice(0, 16);
}

function profileOf(components: RecipeComponent[]): SensoryVector {
  const out = Object.fromEntries(SENSORY_DIMENSIONS.map((dim) => [dim, 0])) as SensoryVector;
  for (const { ingredientId, ml } of components) {
    const sensory = INGREDIENTS[INDEX.get(ingredientId)!].sensory;
    for (const dim of SENSORY_DIMENSIONS) out[dim] += (ml / SHOT_VOLUME_ML) * sensory[dim];
  }
  return out;
}

function compositions(total: number, bounds: Array<readonly [number, number]>): number[][] {
  if (bounds.length === 0) return total === 0 ? [[]] : [];
  const [min, max] = bounds[0];
  const rest = bounds.slice(1);
  const out: number[][] = [];
  for (let units = min; units <= Math.min(max, total); units += 1) {
    for (const tail of compositions(total - units, rest)) out.push([units, ...tail]);
  }
  return out;
}

/* Deterministic enumerator: T01 always present, 2-4 components, exactly 45 ml
   in 2.5 ml units, inside each component's dose bounds and compatibility. */
function enumerate(): Candidate[] {
  const base = INGREDIENTS.find((item) => item.id === BASE_ID)!;
  const supports = INGREDIENTS.filter((item) => item.id !== BASE_ID && item.enabled);
  const out: Candidate[] = [];

  const visit = (start: number, chosen: Ingredient[]) => {
    if (chosen.length > 0) {
      const set = [base, ...chosen];
      for (const units of compositions(SHOT_UNITS, set.map(unitsBounds))) {
        const components = set
          .map((item, i) => ({ ingredientId: item.id, ml: units[i] * UNIT_ML }))
          .sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
        const signature = signatureOf(components);
        const dense = new Float64Array(INGREDIENTS.length);
        for (const c of components) dense[INDEX.get(c.ingredientId)!] = c.ml;
        out.push({ components, signature, signatureHash: hashSignature(signature), profile: profileOf(components), dense });
      }
    }
    if (chosen.length === MAX_COMPONENTS - 1) return;
    for (let i = start; i < supports.length; i += 1) {
      const next = supports[i];
      if (chosen.some((item) => incompatible.has(`${item.id}|${next.id}`))) continue;
      visit(i + 1, [...chosen, next]);
    }
  };

  visit(0, []);
  return out;
}

/* Cached per catalog version so a catalog change never serves a stale pool. */
declare global {
  var velviqueCandidates: { version: string; list: Candidate[] } | undefined;
}

export function getCandidates() {
  if (globalThis.velviqueCandidates?.version !== VELVIQUE_CATALOG_VERSION) {
    globalThis.velviqueCandidates = { version: VELVIQUE_CATALOG_VERSION, list: enumerate() };
  }
  return globalThis.velviqueCandidates.list;
}

/* E(u,r) = sum_j w[j] * (S[r,j] - P[u,j])^2 */
export function sensoryError(profile: SensoryVector, target: SensoryVector) {
  let total = 0;
  for (const dim of SENSORY_DIMENSIONS) {
    const diff = profile[dim] - target[dim];
    total += SENSORY_WEIGHTS[dim] * diff * diff;
  }
  return total;
}

/* D(a,b) = sum_i |q[a,i] - q[b,i]| / (2*45) */
export function recipeDistance(a: Float64Array, b: Float64Array) {
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += Math.abs(a[i] - b[i]);
  return total / (2 * SHOT_VOLUME_ML);
}

export function denseOf(components: RecipeComponent[]) {
  const dense = new Float64Array(INGREDIENTS.length);
  for (const c of components) dense[INDEX.get(c.ingredientId)!] = c.ml;
  return dense;
}

export function excludesCandidate(candidate: Candidate, restrictions: string[]) {
  if (restrictions.length === 0) return false;
  return candidate.components.some(({ ingredientId }) => {
    if (restrictions.includes(ingredientId)) return true;
    const item = INGREDIENTS[INDEX.get(ingredientId)!];
    return item.allergens.some((tag) => restrictions.includes(tag));
  });
}

export function rankCandidates(target: SensoryVector) {
  return getCandidates()
    .map((candidate) => ({ candidate, error: sensoryError(candidate.profile, target) }))
    .sort((a, b) => a.error - b.error || a.candidate.signature.localeCompare(b.candidate.signature));
}

export function conflictsWith(candidate: Candidate, used: Float64Array[]) {
  return used.some((dense) => recipeDistance(candidate.dense, dense) < MIN_DISTANCE);
}

/* Garnish pairing: favour tags matching the recipe's strongest dimensions,
   skip contraindicated or out-of-stock materials. Garnish never affects
   liquid uniqueness. */
export function rankGarnishes(profile: SensoryVector, restrictions: string[]): Garnish[] {
  return GARNISHES.filter((item) => !item.contraindications.some((tag) => restrictions.includes(tag)))
    .map((item) => ({ item, score: item.sensoryTags.reduce((sum, dim) => sum + profile[dim], 0) / item.sensoryTags.length }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .map(({ item }) => item);
}

export function dominantNotes(profile: SensoryVector, count = 3) {
  return SENSORY_DIMENSIONS.filter((dim) => dim !== "body")
    .map((dim) => ({ dim, value: profile[dim] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map((item) => item.dim);
}

export function intensityLabel(profile: SensoryVector) {
  if (profile.body >= 0.62) return "bold";
  if (profile.body >= 0.48) return "balanced";
  return "light";
}
