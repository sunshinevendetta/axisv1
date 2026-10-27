/* Velvique guest-to-bar catalog.
   Pitch constraints (fixed): 12 pourables including the tequila, max 4 per
   45 ml shot, 2.5 ml increments, 100 unique recipes, 15% purchase reserve.
   PROPOSED IMPLEMENTATION (needs mixologist sign-off): the 12 names, sensory
   vectors, dose bounds, incompatibilities, garnishes and stock placeholders. */

export const VELVIQUE_CATALOG_VERSION = "velvique-catalog-2026-10-26.2";
export const VELVIQUE_SENSORY_MODEL_VERSION = "velvique-sensory-0.1-uncalibrated";

export const SHOT_VOLUME_ML = 45;
export const UNIT_ML = 2.5;
export const SHOT_UNITS = SHOT_VOLUME_ML / UNIT_ML; // 18
export const MAX_COMPONENTS = 4;
export const MIN_DISTANCE = 0.1;
export const ATTENDEES = 100;
export const PURCHASE_RESERVE = 0.15;
export const INGREDIENT_BUDGET_MXN = 9200;
export const BASE_ID = "T01";

export const SENSORY_DIMENSIONS = [
  "sweet",
  "acid",
  "fruit",
  "floral",
  "herbal",
  "earthy",
  "roast",
  "spice",
  "body",
  "saline",
] as const;

export type SensoryDimension = (typeof SENSORY_DIMENSIONS)[number];
export type SensoryVector = Record<SensoryDimension, number>;

/* Weighted squared error weights, E(u,r) = sum_j w[j] * (S[r,j] - P[u,j])^2 */
export const SENSORY_WEIGHTS: SensoryVector = {
  sweet: 1,
  acid: 1,
  fruit: 1.2,
  floral: 1,
  herbal: 1.2,
  earthy: 1,
  roast: 1.2,
  spice: 0.8,
  body: 1.4,
  saline: 0.6,
};

export type IngredientId = "T01" | "F01" | "F02" | "F03" | "F04" | "B01" | "B02" | "B03" | "E01" | "E02" | "M01" | "M02";

export type Ingredient = {
  id: IngredientId;
  name: string;
  profile: string;
  enabled: boolean;
  sensory: SensoryVector;
  volumeMin: number;
  volumeMax: number;
  volumeStep: number;
  allergens: string[];
  prepVersion: string;
  batchId: string;
  /* Planning placeholder until confirmed stock data is entered through /api/velvique/ops/batches. */
  initialStockMl: number;
  confirmedPackageMl: number | null;
  supplierPriceMxn: number | null;
};

function v(
  sweet: number,
  acid: number,
  fruit: number,
  floral: number,
  herbal: number,
  earthy: number,
  roast: number,
  spice: number,
  body: number,
  saline: number,
): SensoryVector {
  return { sweet, acid, fruit, floral, herbal, earthy, roast, spice, body, saline };
}

function ingredient(
  id: IngredientId,
  name: string,
  profile: string,
  sensory: SensoryVector,
  volumeMin: number,
  volumeMax: number,
  allergens: string[] = [],
  initialStockMl = 700,
): Ingredient {
  return {
    id,
    name,
    profile,
    enabled: true,
    sensory,
    volumeMin,
    volumeMax,
    volumeStep: UNIT_ML,
    allergens,
    prepVersion: "prep-0",
    batchId: `${id}-planning`,
    initialStockMl,
    confirmedPackageMl: null,
    supplierPriceMxn: null,
  };
}

export const INGREDIENTS: Ingredient[] = [
  ingredient("T01", "Velvique Añejo Cristalino", "Mandatory tequila base", v(0.2, 0, 0.1, 0.1, 0.1, 0.2, 0.15, 0.2, 1, 0), 15, 30, ["alcohol"], 2800),
  ingredient("F01", "Clarified pink guava cordial", "Soft floral fruit", v(0.6, 0.3, 0.9, 0.5, 0, 0, 0, 0, 0.3, 0), 2.5, 17.5),
  ingredient("F02", "Roasted pineapple cordial", "Roasted tropical fruit", v(0.7, 0.3, 0.9, 0, 0, 0.1, 0.4, 0.1, 0.4, 0), 2.5, 17.5),
  ingredient("F03", "Tamarind cordial", "Earthy tart fruit", v(0.5, 0.8, 0.6, 0, 0, 0.5, 0.1, 0.1, 0.4, 0.1), 2.5, 15),
  ingredient("F04", "Hibiscus cordial", "Tart floral", v(0.4, 0.8, 0.4, 0.9, 0.1, 0, 0, 0, 0.2, 0), 2.5, 15),
  ingredient("B01", "Cucumber-shiso cordial", "Green botanical", v(0.3, 0.3, 0.2, 0.2, 0.9, 0, 0, 0, 0.1, 0.1), 2.5, 17.5),
  ingredient("B02", "Hoja santa infusion", "Herbal, aromatic", v(0.1, 0, 0, 0.2, 0.9, 0.3, 0, 0.3, 0.2, 0), 2.5, 12.5),
  ingredient("B03", "Lemongrass-ginger cordial", "Citrus herb, warmth", v(0.4, 0.5, 0.2, 0.2, 0.6, 0, 0, 0.8, 0.2, 0), 2.5, 12.5, ["ginger"]),
  ingredient("E01", "Roasted blue corn infusion", "Cereal, earthy", v(0.2, 0, 0, 0, 0, 0.9, 0.5, 0.1, 0.5, 0.1), 2.5, 15, ["corn"]),
  ingredient("E02", "Cacao husk infusion", "Roasted, dry", v(0.1, 0, 0, 0, 0, 0.5, 1, 0.2, 0.4, 0), 2.5, 15, ["cacao"]),
  ingredient("M01", "Diluted agave syrup", "Sweetness and texture", v(1, 0, 0, 0, 0, 0.1, 0, 0, 0.6, 0), 2.5, 7.5),
  ingredient("M02", "Standardized acid-saline mixer", "Acidity / salt balance", v(0, 1, 0, 0, 0, 0, 0, 0, 0, 0.9), 2.5, 5),
];

export const INGREDIENT_IDS = INGREDIENTS.map((item) => item.id);

export function getIngredient(id: string) {
  return INGREDIENTS.find((item) => item.id === id);
}

/* PROPOSED: pairs the generator never combines, pending tasting. */
export const INCOMPATIBLE_PAIRS: Array<[IngredientId, IngredientId]> = [
  ["B01", "E02"],
  ["B01", "E01"],
  ["F04", "E01"],
];

export type GarnishId = "G01" | "G02" | "G03" | "G04" | "G05" | "G06" | "G07" | "G08";

export type Garnish = {
  id: GarnishId;
  name: string;
  purpose: string;
  sensoryTags: SensoryDimension[];
  contraindications: string[];
  initialStockUnits: number;
  preparationInstruction: string;
};

export const GARNISHES: Garnish[] = [
  { id: "G01", name: "Dehydrated guava", purpose: "Fruit aroma / chew", sensoryTags: ["fruit", "floral"], contraindications: [], initialStockUnits: 20, preparationInstruction: "Rest one slice on the rim." },
  { id: "G02", name: "Blue corn crisp", purpose: "Toasted crunch", sensoryTags: ["earthy", "roast"], contraindications: ["corn"], initialStockUnits: 20, preparationInstruction: "Serve the crisp beside the cup." },
  { id: "G03", name: "Hibiscus crystal", purpose: "Floral-tart texture", sensoryTags: ["floral", "acid"], contraindications: [], initialStockUnits: 20, preparationInstruction: "Drop one crystal on the surface just before serving." },
  { id: "G04", name: "Cacao shard", purpose: "Roasted bitterness", sensoryTags: ["roast", "earthy"], contraindications: ["cacao"], initialStockUnits: 20, preparationInstruction: "Lean one shard against the rim." },
  { id: "G05", name: "Dehydrated pineapple", purpose: "Fruit aroma / crunch", sensoryTags: ["fruit", "sweet"], contraindications: [], initialStockUnits: 20, preparationInstruction: "Rest one wedge on the rim." },
  { id: "G06", name: "Food-grade hoja santa leaf", purpose: "Herbal aroma", sensoryTags: ["herbal"], contraindications: [], initialStockUnits: 20, preparationInstruction: "Slap the leaf once and float it." },
  { id: "G07", name: "Tamarind gel", purpose: "Tart texture", sensoryTags: ["acid", "earthy"], contraindications: [], initialStockUnits: 20, preparationInstruction: "Dot the gel on a spoon beside the cup." },
  { id: "G08", name: "Candied ginger fragment", purpose: "Warm spice", sensoryTags: ["spice", "sweet"], contraindications: ["ginger"], initialStockUnits: 20, preparationInstruction: "Pin one fragment to the rim." },
];

export function getGarnish(id: string) {
  return GARNISHES.find((item) => item.id === id);
}

/* Guests may decline components; this is an operational exclusion, never inferred from personality. */
export const EXCLUSION_OPTIONS: Array<{ id: string; label: string }> = [
  { id: "corn", label: "Corn" },
  { id: "cacao", label: "Cacao" },
  { id: "ginger", label: "Ginger" },
  ...INGREDIENTS.filter((item) => item.id !== BASE_ID).map((item) => ({ id: item.id, label: item.name })),
];

export const PRODUCTION_BUDGET_MXN: Array<{ category: string; mxn: number }> = [
  { category: "Mixologist", mxn: 2500 },
  { category: "Barback", mxn: 800 },
  { category: "Mini shot cups / 100", mxn: 700 },
  { category: "Ingredient inventory", mxn: 9200 },
  { category: "Ice / water / chilling", mxn: 900 },
  { category: "Garnish / consumables", mxn: 1200 },
  { category: "Bar tools / equipment", mxn: 1300 },
  { category: "Logistics / transport", mxn: 1400 },
  { category: "Models / host", mxn: 2000 },
];
