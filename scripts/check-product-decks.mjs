#!/usr/bin/env node
/**
 * Smoke-tests the generated product decks by actually running their four
 * scripts against a stub DOM, then asserting on the HTML they produce.
 * Catches what `node --check` cannot: a concept id a slide links to but no
 * file defines, a slide that renders zero cards, retired six-night wording.
 *
 *   node scripts/check-product-decks.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const RETIRED = /five houses|tech town|six nights|after hours circuit|circuit partner|complete week|three-house/i;
let failures = 0;

function fail(deck, message) {
  failures += 1;
  console.error("  FAIL  " + deck + ": " + message);
}

function render(dir) {
  const stage = { innerHTML: "" };
  const sandbox = {
    console,
    document: {
      documentElement: { dataset: { orientation: "horizontal" }, lang: "en" },
      getElementById: (id) => (id === "stage" ? stage : null),
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {}, addEventListener() {} }),
      head: { appendChild() {} },
      body: { appendChild() {} },
    },
    window: {},
    addEventListener() {},
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  for (const file of [
    "future-renaissance-data.js",
    "future-renaissance-concepts.js",
    "future-renaissance-content.js",
  ]) {
    vm.runInContext(readFileSync(join(dir, file), "utf8"), context, { filename: file });
  }
  return { html: stage.innerHTML, sandbox };
}

const decks = readdirSync("public")
  .filter((d) => d.startsWith("futurerenaissance-"))
  .filter((d) => d !== "futurerenaissance-bar-oriente" && d !== "futurerenaissance-product-base")
  .filter((d) => existsSync(join("public", d, "future-renaissance-content.js")));

if (!decks.length) {
  console.error("No generated decks found.");
  process.exit(1);
}

for (const deck of decks) {
  const dir = join("public", deck);
  let html;
  let sandbox;
  try {
    ({ html, sandbox } = render(dir));
  } catch (error) {
    fail(deck, "threw while rendering: " + error.message);
    continue;
  }

  const slides = (html.match(/data-slide-id="/g) || []).length;
  if (slides !== 15) fail(deck, "rendered " + slides + " slides, expected 15");

  // Every concept a slide links to must exist, or the popup opens empty.
  const linked = [...html.matchAll(/data-concept-id="([^"]+)"/g)].map((m) => m[1]);
  const defined = new Set(Object.keys(sandbox.FUTURE_RENAISSANCE_CONCEPTS || {}));
  const missing = [...new Set(linked)].filter((id) => !defined.has(id));
  if (missing.length) fail(deck, "slides link concepts that do not exist: " + missing.join(", "));

  const mechanics = (html.match(/data-concept-id="mechanic-/g) || []).length;
  if (mechanics !== 7) fail(deck, "slide 08 rendered " + mechanics + " mechanics, expected 7");
  const steps = (html.match(/data-concept-id="step-/g) || []).length;
  if (steps !== 6) fail(deck, "slide 09 rendered " + steps + " flow steps, expected 6");

  if (RETIRED.test(html)) {
    fail(deck, "still contains retired six-night wording: " + (html.match(RETIRED) || [])[0]);
  }
  if (html.includes("[BRAND]")) fail(deck, "unreplaced [BRAND] placeholder");
  if (!/bar oriente/i.test(html)) fail(deck, "does not name the venue");
  if (!/october 28, 2026/i.test(html)) fail(deck, "does not carry the event date");

  // The ?view=short filter names slide ids explicitly; a renamed slide would
  // silently drop out of the short deck rather than error.
  const runtime = readFileSync(join(dir, "future-renaissance-runtime.js"), "utf8");
  const shortView = runtime.match(/view === "short"\) ids = \[([^\]]+)\]/);
  if (!shortView) {
    fail(deck, "runtime has no short-view slide list");
  } else {
    const rendered = new Set([...html.matchAll(/data-slide-id="([^"]+)"/g)].map((m) => m[1]));
    const dangling = shortView[1]
      .split(",")
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter((id) => id && !rendered.has(id));
    if (dangling.length) fail(deck, "short view names slides that do not exist: " + dangling.join(", "));
  }

  // The i18n bundle must cover every key the rendered slides ask for.
  const i18n = readFileSync(join(dir, "i18n.js"), "utf8");
  const wanted = [...new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]))];
  for (const lang of ["es", "zh"]) {
    const start = i18n.indexOf("\n    " + lang + ": {");
    const close = /\n {4}\},?(?=\r?\n)/g;
    close.lastIndex = start + 1;
    const end = close.exec(i18n).index;
    const keys = new Set([...i18n.slice(start, end).matchAll(/"([^"]+)":/g)].map((m) => m[1]));
    const gaps = wanted.filter((k) => !keys.has(k));
    if (gaps.length) fail(deck, lang + " is missing " + gaps.length + " keys: " + gaps.slice(0, 6).join(", "));
  }

  if (!failures) console.log("  ok    " + deck + "  (" + slides + " slides, " + mechanics + " mechanics, " + steps + " steps)");
}

if (failures) {
  console.error("\n" + failures + " problem(s) found.");
  process.exit(1);
}
console.log("\nAll " + decks.length + " deck(s) passed.");
