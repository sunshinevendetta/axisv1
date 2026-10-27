import { SENSORY_DIMENSIONS, type SensoryVector } from "./velvique-catalog";

/* Five-question model from the Velvique client experience brief (latest
   product scope, superseding the guide's three-question proposal). Each
   option carries a recipe-space sensory target (volume-weighted average
   scale); the five are blended into one reproducible guest vector.
   PROPOSED: the targets and blend weights need mixologist calibration. */

export type AnswerLetter = "A" | "B" | "C" | "D";
export type AnswerSet = AnswerLetter[];

export type QuestionOption = {
  id: AnswerLetter;
  label: string;
  detail: string;
  /* Visual motif for the answer object inside the question's portal world. */
  world: "orbs" | "silk" | "monolith" | "leaves" | "prism" | "strata" | "shards" | "ripple" | "bloom" | "dunes" | "embers" | "lattice";
  target: SensoryVector;
};

export type Question = {
  id: "q1" | "q2" | "q3" | "q4" | "q5";
  dimension: string;
  prompt: string;
  influence: string;
  options: QuestionOption[];
};

function t(values: Partial<SensoryVector>): SensoryVector {
  const out = {} as SensoryVector;
  for (const dim of SENSORY_DIMENSIONS) out[dim] = values[dim] ?? 0;
  return out;
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    dimension: "Personality",
    prompt: "How would you describe your personality?",
    influence: "Primary sensory character and aroma direction.",
    options: [
      { id: "A", label: "Magnetic", detail: "Expressive, surprising, drawn to contrast.", world: "ripple", target: t({ sweet: 0.3, acid: 0.3, fruit: 0.3, floral: 0.1, spice: 0.12, body: 0.55 }) },
      { id: "B", label: "Mysterious", detail: "Layered, earthy, quietly intense.", world: "strata", target: t({ sweet: 0.12, earthy: 0.35, roast: 0.3, herbal: 0.08, body: 0.6 }) },
      { id: "C", label: "Fearless", detail: "Sharp, adventurous, uncommon combinations.", world: "shards", target: t({ acid: 0.35, spice: 0.3, herbal: 0.15, saline: 0.12, body: 0.62 }) },
      { id: "D", label: "Serene", detail: "Minimal, floral, herbal, balanced.", world: "bloom", target: t({ sweet: 0.15, floral: 0.32, herbal: 0.3, acid: 0.1, body: 0.42 }) },
    ],
  },
  {
    id: "q2",
    dimension: "The unknown",
    prompt: "What attracts you to the unknown?",
    influence: "Experimental pairings versus subtle compositions.",
    options: [
      { id: "A", label: "Discovery", detail: "New paths, fresh aromas, the first time.", world: "prism", target: t({ acid: 0.25, herbal: 0.25, fruit: 0.15, spice: 0.15, saline: 0.08, body: 0.5 }) },
      { id: "B", label: "Intensity", detail: "The rush, the edge, the strong pull.", world: "embers", target: t({ spice: 0.3, roast: 0.25, acid: 0.15, body: 0.7 }) },
      { id: "C", label: "Complexity", detail: "Many layers, slowly revealed.", world: "silk", target: t({ earthy: 0.28, herbal: 0.2, roast: 0.18, sweet: 0.15, body: 0.58 }) },
      { id: "D", label: "Emotion", detail: "How it makes you feel, more than what it is.", world: "orbs", target: t({ sweet: 0.35, floral: 0.3, fruit: 0.3, body: 0.48 }) },
    ],
  },
  {
    id: "q3",
    dimension: "Atmosphere",
    prompt: "Which atmosphere feels most like you?",
    influence: "Green, dark, tropical or sharply contrasting emphasis.",
    options: [
      { id: "A", label: "After the rain", detail: "Green, cool, clean air.", world: "leaves", target: t({ herbal: 0.45, acid: 0.18, floral: 0.12, sweet: 0.1, body: 0.42 }) },
      { id: "B", label: "Midnight", detail: "Dark, deep, roasted.", world: "monolith", target: t({ roast: 0.42, earthy: 0.38, sweet: 0.12, spice: 0.1, body: 0.65 }) },
      { id: "C", label: "Golden hour", detail: "Warm light, ripe tropical fruit.", world: "dunes", target: t({ fruit: 0.45, sweet: 0.38, floral: 0.12, acid: 0.15, body: 0.5 }) },
      { id: "D", label: "Electric city", detail: "Neon contrast, sharp and bright.", world: "lattice", target: t({ acid: 0.38, saline: 0.2, sweet: 0.25, fruit: 0.15, spice: 0.15, body: 0.55 }) },
    ],
  },
  {
    id: "q4",
    dimension: "Expression",
    prompt: "How do you express yourself?",
    influence: "Flavor contrast, strength and ingredient proportions.",
    options: [
      { id: "A", label: "Subtle and precise", detail: "Quiet details, nothing out of place.", world: "ripple", target: t({ floral: 0.2, herbal: 0.2, sweet: 0.15, acid: 0.1, body: 0.38 }) },
      { id: "B", label: "Bold and direct", detail: "Clear, strong, unmistakable.", world: "monolith", target: t({ acid: 0.2, spice: 0.2, roast: 0.15, body: 0.72 }) },
      { id: "C", label: "Unexpected", detail: "The turn nobody saw coming.", world: "shards", target: t({ saline: 0.22, acid: 0.3, spice: 0.2, earthy: 0.12, body: 0.55 }) },
      { id: "D", label: "Layered", detail: "One thing, then another, then another.", world: "strata", target: t({ earthy: 0.22, herbal: 0.18, sweet: 0.2, fruit: 0.15, roast: 0.12, body: 0.56 }) },
    ],
  },
  {
    id: "q5",
    dimension: "Sensation",
    prompt: "Which sensation would you rather experience?",
    influence: "Acidity, texture, finish and garnish selection.",
    options: [
      { id: "A", label: "Refreshing", detail: "Bright, cooling, clean finish.", world: "leaves", target: t({ acid: 0.35, herbal: 0.3, fruit: 0.15, body: 0.38 }) },
      { id: "B", label: "Warm", detail: "Spice, roast, a long glow.", world: "embers", target: t({ spice: 0.32, roast: 0.28, sweet: 0.22, earthy: 0.15, body: 0.6 }) },
      { id: "C", label: "Intriguing", detail: "Floral, earthy, a hint of salt.", world: "silk", target: t({ floral: 0.25, earthy: 0.22, saline: 0.15, herbal: 0.12, body: 0.52 }) },
      { id: "D", label: "Intense", detail: "Full strength, sharp edges.", world: "prism", target: t({ acid: 0.3, spice: 0.25, body: 0.72 }) },
    ],
  },
];

/* Personality and atmosphere carry the most weight, sensation shapes the finish. */
const BLEND = [0.25, 0.15, 0.25, 0.15, 0.2] as const;

export const ANSWER_PROFILE_COUNT = 4 ** QUESTIONS.length; // 1,024

export function isAnswerSet(value: unknown): value is AnswerSet {
  return Array.isArray(value) && value.length === QUESTIONS.length && value.every((item) => item === "A" || item === "B" || item === "C" || item === "D");
}

/* P[u] = sensory_target(q1..q5) */
export function sensoryTarget(answers: AnswerSet): SensoryVector {
  const out = t({});
  answers.forEach((answer, index) => {
    const option = QUESTIONS[index].options.find((item) => item.id === answer);
    if (!option) throw new Error(`Unknown answer ${answer} for ${QUESTIONS[index].id}`);
    for (const dim of SENSORY_DIMENSIONS) out[dim] += BLEND[index] * option.target[dim];
  });
  return out;
}

/* One of 1,024 profile codes. A preference target, never a recipe identifier. */
export function profileCode(answers: AnswerSet) {
  return `P-${answers.join("")}`;
}

export function describeAnswers(answers: AnswerSet) {
  return answers.map((answer, index) => {
    const question = QUESTIONS[index];
    const option = question.options.find((item) => item.id === answer)!;
    return { question: question.dimension, answer: option.label, detail: option.detail };
  });
}

export function publicQuestions() {
  return QUESTIONS.map((question) => ({
    id: question.id,
    dimension: question.dimension,
    prompt: question.prompt,
    influence: question.influence,
    options: question.options.map(({ id, label, detail, world }) => ({ id, label, detail, world })),
  }));
}
