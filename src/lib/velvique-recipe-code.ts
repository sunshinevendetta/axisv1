/* A recipe packed into a short code: up to four (ingredient, units) byte
   pairs, hex encoded. Two cards carry the same recipe exactly when their
   codes match, so the code is what the guest list stores per guest. */

export type RecipeCode = `0x${string}`;

/* Catalog order defines the ingredient index (T01 = 1 ... M02 = 12). */
export const INGREDIENT_ORDER = ["T01", "F01", "F02", "F03", "F04", "B01", "B02", "B03", "E01", "E02", "M01", "M02"] as const;
const UNIT_ML = 2.5;

export type CodeComponent = { ingredientId: string; ml: number };

export function encodeRecipe(components: CodeComponent[]): RecipeCode {
  const pairs = components
    .map((c) => [INGREDIENT_ORDER.indexOf(c.ingredientId as (typeof INGREDIENT_ORDER)[number]) + 1, Math.round(c.ml / UNIT_ML)] as const)
    .sort((a, b) => a[0] - b[0]);
  if (pairs.length === 0 || pairs.length > 4 || pairs.some(([index, units]) => index < 1 || units < 1 || units > 255)) {
    throw new Error("Recipe cannot be encoded");
  }
  const bytes = pairs.flatMap(([index, units]) => [index, units]);
  while (bytes.length < 8) bytes.push(0);
  return `0x${bytes.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function isRecipeCode(value: unknown): value is RecipeCode {
  return typeof value === "string" && /^0x[0-9a-f]{16}$/i.test(value);
}

export function decodeRecipe(code: RecipeCode): CodeComponent[] {
  const hex = code.slice(2).padEnd(16, "0");
  const out: CodeComponent[] = [];
  for (let i = 0; i < 16; i += 4) {
    const index = parseInt(hex.slice(i, i + 2), 16);
    const units = parseInt(hex.slice(i + 2, i + 4), 16);
    if (index > 0 && units > 0) out.push({ ingredientId: INGREDIENT_ORDER[index - 1], ml: units * UNIT_ML });
  }
  return out.sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
}
