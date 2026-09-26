#!/usr/bin/env node
/**
 * Builds the per-product Future Renaissance sales decks.
 *
 * Every deck sells the SAME night — Thursday October 29, 2026 at Casa Luma, a
 * Claude community event operated by AXIS — but is written for one product
 * category. Dates, times and capacities live in the base data file and are the
 * Casa Luma brief's: 100 seated 17:00-21:00, then 120 further guests to 02:00.
 * Slides 01-07 and 10-12 come verbatim from the shared base deck. Slide 08
 * (the product's function on the floor) and slide 09 (the reward flow that
 * turns a product action into a drink and then into a reported number) are
 * generated from that category's spec in scripts/product-deck-specs/.
 *
 * Output is checked in and freely editable afterwards. Rerun when adding a
 * category or when the shared base changes.
 *
 *   node scripts/build-product-decks.mjs [slug ...]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const SPEC_DIR = "scripts/product-deck-specs";
const BASE = "public/futurerenaissance-product-base";
const APP_SRC = "app/futurerenaissanceextended/page.tsx";
const CMP_SRC = "components/futurerenaissanceextended";

// Big identical binaries (posters, brand assets, vendor bundle) are not copied
// per deck; every deck points at the extended deck's single stored copy.
const CODE = [
  "axis-horizontal.html", "axis-vertical.html", "future-renaissance-runtime.js",
  "future-renaissance.css", "future-renaissance-extended.css",
];
const SHARED_BINARIES = [
  "poster-horizontal.png", "poster-vertical.png", "event-crowd.jpg",
  "events.png", "logo.png", "og-circuit.png", "brand-assets", "vendor",
];

const q = (s) => JSON.stringify(String(s));
const esc = (s) => String(s).replace(/'/g, "\\'");

/** Replaces the region between an anchor pair, keeping the anchors. */
function splice(source, anchor, body, file) {
  const open = "/* @generated:" + anchor + " */";
  const close = "/* @end */";
  const a = source.indexOf(open);
  if (a === -1) throw new Error(file + ": missing anchor " + open);
  const b = source.indexOf(close, a);
  if (b === -1) throw new Error(file + ": missing /* @end */ after " + open);
  return source.slice(0, a + open.length) + "\n" + body + "\n    " + source.slice(b);
}

/* ---------------------------------------------------------------- data.js */
function buildData(src, spec, file) {
  if (!src.includes("productFocus: null,")) throw new Error(file + ": productFocus anchor missing");
  const mechanics = spec.mechanics
    .map((m) => "        { id: " + q(m.id) + ", name: " + q(m.name) + ", role: " + q(m.role) + " },")
    .join("\n");
  const flow = spec.flow
    .map((f) => "        { id: " + q(f.id) + ", stage: " + q(f.stage) + ", context: " + q(f.context) + ", action: " + q(f.action) + " },")
    .join("\n");
  return src.replace("productFocus: null,", [
    "productFocus: {",
    "      id: " + q(spec.slug) + ",",
    "      name: " + q(spec.name) + ",",
    "      slot: " + q(spec.slot) + ",",
    "      discipline: " + q(spec.discipline) + ",",
    "      mechanics: [",
    mechanics,
    "      ],",
    "      flow: [",
    flow,
    "      ],",
    "    },",
  ].join("\n"));
}

/* ------------------------------------------------------------- content.js */
function buildContent(src, spec, file) {
  const s8 = spec.slide08;
  const s9 = spec.slide09;
  const slides = [
    "    '<section class=\"fr-slide frx-brand-function\" data-slide-id=\"brand-function\" data-scene=\"structured\" data-label=\"" + esc(s8.label) + "\">' +",
    "      frameTop(\"08\", \"brandFunction\", \"" + esc(s8.navLabel) + "\") +",
    "      '<div class=\"frx-heading\"><span class=\"eyebrow\" data-reveal data-i18n=\"brandFunction.kicker\">" + esc(s8.kicker) + "</span><h2 data-reveal data-i18n=\"brandFunction.title\">" + esc(s8.title) + "</h2><p data-reveal data-i18n=\"brandFunction.copy\">" + esc(s8.copy) + "</p></div>' +",
    "      '<div class=\"frx-function-grid\" data-crystallize>' + focus.mechanics.map(mechanicCard).join(\"\") + '</div>' +",
    "      '<div class=\"frx-brand-rule\" data-reveal><span data-i18n=\"brandFunction.noLogoWall\">" + esc(s8.ruleA) + "</span><strong data-i18n=\"brandFunction.distinctFunctions\">" + esc(s8.ruleB) + "</strong></div>' +",
    "    '</section>',",
    "",
    "    '<section class=\"fr-slide frx-cross-week\" data-slide-id=\"reward-flow\" data-scene=\"structured\" data-label=\"The reward flow\">' +",
    "      frameTop(\"09\", \"crossWeek\", \"" + esc(s9.navLabel) + "\") +",
    "      '<div class=\"frx-heading\"><span class=\"eyebrow\" data-reveal data-i18n=\"crossWeek.kicker\">" + esc(s9.kicker) + "</span><h2 data-reveal data-i18n=\"crossWeek.title\">" + esc(s9.title) + "</h2><p data-reveal data-i18n=\"crossWeek.copy\">" + esc(s9.copy) + "</p></div>' +",
    "      '<div class=\"frx-week-sequence\" data-crystallize>' + focus.flow.map(flowCard).join(\"\") + '</div>' +",
    "      '<div class=\"frx-example-note\" data-reveal data-i18n=\"crossWeek.note\">" + esc(s9.note) + "</div>' +",
    "    '</section>',",
  ].join("\n");

  let out = splice(src, "slides", slides, file);
  // Cards read their own i18n keys once a category owns the slide.
  const cards = [
    "  function mechanicCard(item, index) {",
    "    return conceptNode(",
    '      "frx-function-card",',
    '      "mechanic-" + item.id,',
    "      '<i>' + String(index + 1).padStart(2, \"0\") + '</i><b data-i18n=\"mechanics.' + item.id + '.name\">' + item.name.toUpperCase() + '</b><p data-i18n=\"mechanics.' + item.id + '.role\">' + item.role + '</p>',",
    "      item.name",
    "    );",
    "  }",
    "",
    "  function flowCard(item, index) {",
    "    return conceptNode(",
    '      "frx-week-step",',
    '      "step-" + item.id,',
    "      '<i>' + String(index + 1).padStart(2, \"0\") + '</i><span data-i18n=\"step.' + item.id + '.stage\">' + item.stage.toUpperCase() + '</span><b data-i18n=\"step.' + item.id + '.action\">' + item.action.toUpperCase() + '</b><small>' + item.context.toUpperCase() + '</small>',",
    "      item.action",
    "    );",
    "  }",
  ].join("\n");
  out = splice(out, "cards", cards, file);

  // Name the category inside the empty brand slot on the hero slides.
  return out.split("[BRAND]").join(esc(spec.slot));
}

/* ------------------------------------------------------------ concepts.js */
function buildConcepts(src, spec, file) {
  const loc = spec.conceptLocales;
  const row = (id, title, summary, details, es, zh) =>
    "    [" + [q(id), q(title), q(summary), JSON.stringify(details),
      q(es[0]), q(es[1]), JSON.stringify(es[2]),
      q(zh[0]), q(zh[1]), JSON.stringify(zh[2])].join(", ") + "],";

  const body = [
    "  var mechanics = [",
    spec.mechanics.map((m, i) => row(m.id, m.name, m.summary, m.details, loc.mechanics.es[i], loc.mechanics.zh[i])).join("\n"),
    "  ];",
    "  mechanics.forEach(function (item, index) {",
    '    add("mechanic-" + item[0], "08 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {',
    "      es: { title: item[4], summary: item[5], details: item[6] },",
    "      zh: { title: item[7], summary: item[8], details: item[9] },",
    "    });",
    "  });",
    "",
    "  var rewardFlow = [",
    spec.flow.map((f, i) => row(f.id, f.action, f.summary, f.details, loc.flow.es[i], loc.flow.zh[i])).join("\n"),
    "  ];",
    "  rewardFlow.forEach(function (item, index) {",
    '    add("step-" + item[0], "09 / " + String(index + 1).padStart(2, "0"), item[1], item[2], item[3], {',
    "      es: { title: item[4], summary: item[5], details: item[6] },",
    "      zh: { title: item[7], summary: item[8], details: item[9] },",
    "    });",
    "  });",
  ].join("\n");

  return splice(src, "concepts", body, file);
}

/* ---------------------------------------------------------------- i18n.js */
function buildI18n(src, spec, file) {
  let out = src;
  for (const lang of ["es", "zh"]) {
    const t = spec.i18n[lang];
    const lines = [];
    const push = (k, v) => lines.push("      " + q(k) + ": " + q(v) + ",");
    spec.mechanics.forEach((m, i) => {
      push("mechanics." + m.id + ".name", t.mechanics[i][0]);
      push("mechanics." + m.id + ".role", t.mechanics[i][1]);
    });
    spec.flow.forEach((f, i) => {
      push("step." + f.id + ".stage", t.flowStages[i]);
      push("step." + f.id + ".action", t.flowActions[i]);
    });
    for (const [k, v] of Object.entries(t.keys)) push(k, v);
    out = splice(out, lang, lines.join("\n"), file);
  }
  return out;
}

/* --------------------------------------------------------------- page.tsx */
function buildPage(src, spec) {
  const keywords = [
    "Future Renaissance",
    "Claude community event",
    "Casa Luma",
    "Mexico Tech Week 2026",
    "Mexico City",
    "AXIS",
    spec.name + " partnership",
    spec.name + " activation",
  ];
  // The extended deck's share card advertises the retired six-night circuit;
  // the product decks use the undated campaign poster instead.
  return src
    .replace(/url: "https:\/\/axis\.show\/futurerenaissanceextended\/og-circuit\.png",\s*width: \d+,\s*height: \d+,\s*alt: "[^"]*",/,
      'url: "https://axis.show/futurerenaissanceextended/poster-horizontal.png",\n        width: 1396,\n        height: 1125,\n        alt: "Official Future Renaissance campaign poster",')
    .replace('images: ["https://axis.show/futurerenaissanceextended/og-circuit.png"]',
      'images: ["https://axis.show/futurerenaissanceextended/poster-horizontal.png"]')
    .replace(/^const title =[\s\S]*?;$/m, "const title = " + q(spec.pageTitle) + ";")
    .replace(/^const description =[\s\S]*?;$/m, "const description =\n  " + q(spec.pageDescription) + ";")
    .replace(
      /^ {2}keywords: \[[\s\S]*?^ {2}\],$/m,
      "  keywords: [\n" + keywords.map((k) => "    " + q(k) + ",").join("\n") + "\n  ],"
    );
}

/* -------------------------------------------------------- PlanContent.tsx */
// The hidden, crawlable version of each deck: one MusicEvent in JSON-LD and a
// plain-text article. It is built from the base data, so the date, venue,
// times, capacities and the two agreed packages cannot drift from the slides.
function loadBase(dataSrc) {
  const sandbox = { window: {} };
  vm.runInNewContext(dataSrc, sandbox);
  return sandbox.window.FUTURE_RENAISSANCE;
}

function buildPlanContent(base, spec) {
  const n = base.night;
  const usd = (v) => "$" + Number(v).toLocaleString("en-US") + " USD";
  const jsx = (s) => String(s).replace(/[{}<>]/g, (c) => "{" + JSON.stringify(c) + "}");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: "Future Renaissance · " + n.venue + " · Mexico City | Claude for Music",
    startDate: n.date + "T" + n.eventStart + ":00-06:00",
    endDate: n.endDate + "T" + n.eventEnd + ":00-06:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: spec.pageDescription,
    location: {
      "@type": "Place",
      name: n.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: n.address.replace(/, CDMX$/, ""),
        addressLocality: n.city,
        addressRegion: "CDMX",
        addressCountry: "MX",
      },
    },
    organizer: { "@type": "Organization", name: "AXIS", url: "https://axis.show" },
    image: "https://axis.show/futurerenaissanceextended/poster-horizontal.png",
  };
  const mechanics = spec.mechanics
    .map((m) => "            <li><strong>" + jsx(m.name) + "</strong>: " + jsx(m.summary) + "</li>")
    .join("\n");
  const tiers = base.commercialTiers
    .map((t) => "            <li><strong>" + jsx(t.name) + " — " + usd(t.price) + "</strong>: " + jsx(t.scope + " " + t.deployment + " " + t.restriction) + "</li>")
    .join("\n");

  return [
    "const EVENT_JSON_LD = " + JSON.stringify(jsonLd, null, 2) + ";",
    "",
    "export default function FutureRenaissancePlanContent() {",
    "  return (",
    "    <>",
    "      <script",
    '        type="application/ld+json"',
    "        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSON_LD) }}",
    "      />",
    "",
    "      <style>{`",
    "        .future-extended-a11y-content {",
    "          position: absolute;",
    "          width: 1px;",
    "          height: 1px;",
    "          padding: 0;",
    "          margin: -1px;",
    "          overflow: hidden;",
    "          clip: rect(0, 0, 0, 0);",
    "          white-space: normal;",
    "          border: 0;",
    "        }",
    "      `}</style>",
    "",
    "      <article",
    '        className="future-extended-a11y-content"',
    '        aria-label="Future Renaissance ' + spec.name + ' partnership presentation"',
    "      >",
    "        <header>",
    "          <p>AXIS · " + n.context + " · " + n.status + "</p>",
    "          <h1>Future Renaissance · " + jsx(spec.name) + " partner</h1>",
    "          <p>" + n.day + ", " + n.displayDate + " · " + n.venue + ", " + n.address + " · " + n.city + "</p>",
    "          <p>Event window: " + n.eventStart + " to " + n.eventEnd + "</p>",
    "        </header>",
    "",
    '        <section aria-labelledby="future-product-night">',
    '          <h2 id="future-product-night">The night</h2>',
    "          <p>",
    "            One night. From " + n.workshopStart + " to " + n.workshopEnd + ", a seated, hands-on Claude community",
    "            workshop for " + n.workshopCapacity + " attendees from the music industry. At " + n.afterPartyStart + ", with no",
    "            gap, the same room becomes the Future Renaissance party, running to " + n.afterPartyEnd,
    "            for " + n.afterPartyGuests + " further guests. AXIS hosts and operates the night.",
    "          </p>",
    "        </section>",
    "",
    '        <section aria-labelledby="future-product-function">',
    '          <h2 id="future-product-function">' + jsx(spec.slide08.title) + "</h2>",
    "          <p>" + jsx(spec.slide08.copy) + "</p>",
    "          <ul>",
    mechanics,
    "          </ul>",
    "        </section>",
    "",
    '        <section aria-labelledby="future-product-packages">',
    '          <h2 id="future-product-packages">Partnership packages</h2>',
    "          <ul>",
    tiers,
    "          </ul>",
    "          <p>Both packages are for this single night. Claude retains community-event status.</p>",
    "        </section>",
    "      </article>",
    "    </>",
    "  );",
    "}",
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------- main */
const only = process.argv.slice(2);
const specs = readdirSync(SPEC_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(SPEC_DIR, f), "utf8")))
  .filter((s) => only.length === 0 || only.includes(s.slug));

if (!specs.length) {
  console.error("No specs matched" + (only.length ? ": " + only.join(", ") : "") + ".");
  process.exit(1);
}

const raw = {
  data: readFileSync(join(BASE, "future-renaissance-data.js"), "utf8"),
  content: readFileSync(join(BASE, "future-renaissance-content.js"), "utf8"),
  concepts: readFileSync(join(BASE, "future-renaissance-concepts.js"), "utf8"),
  i18n: readFileSync(join(BASE, "i18n.js"), "utf8"),
  page: readFileSync(APP_SRC, "utf8"),
};

const base = loadBase(raw.data);

for (const spec of specs) {
  const dirName = "futurerenaissance-" + spec.slug;
  const pub = "public/" + dirName;
  mkdirSync(pub, { recursive: true });
  mkdirSync("app/" + dirName, { recursive: true });
  mkdirSync("components/" + dirName, { recursive: true });

  // Code files that need no per-category change, with their asset paths
  // pointed back at this deck for code and at the shared copy for binaries.
  for (const f of CODE) {
    let text = readFileSync(join(BASE, f), "utf8").split("/futurerenaissanceextended/").join("/" + dirName + "/");
    for (const b of SHARED_BINARIES) {
      text = text.split("/" + dirName + "/" + b).join("/futurerenaissanceextended/" + b);
    }
    writeFileSync(join(pub, f), text);
  }

  const retarget = (s) => {
    let text = s.split("/futurerenaissanceextended/").join("/" + dirName + "/");
    for (const b of SHARED_BINARIES) {
      text = text.split("/" + dirName + "/" + b).join("/futurerenaissanceextended/" + b);
    }
    return text;
  };

  writeFileSync(join(pub, "future-renaissance-data.js"), retarget(buildData(raw.data, spec, "data.js")));
  writeFileSync(join(pub, "future-renaissance-content.js"), retarget(buildContent(raw.content, spec, "content.js")));
  writeFileSync(join(pub, "future-renaissance-concepts.js"), retarget(buildConcepts(raw.concepts, spec, "concepts.js")));
  writeFileSync(join(pub, "i18n.js"), retarget(buildI18n(raw.i18n, spec, "i18n.js")));

  writeFileSync(join("components/" + dirName, "FutureRenaissancePlanContent.tsx"), buildPlanContent(base, spec));

  for (const f of ["FutureRenaissanceDeck.tsx"]) {
    let text = readFileSync(join(CMP_SRC, f), "utf8")
      .split("/futurerenaissanceextended/axis-").join("/" + dirName + "/axis-")
      .split("data-future-renaissance-extended-deck").join("data-future-renaissance-" + spec.slug + "-deck");
    writeFileSync(join("components/" + dirName, f), text);
  }

  const page = buildPage(raw.page, spec)
    .split("futurerenaissanceextended").join(dirName)
    .split("axis.show/" + dirName + "/poster-horizontal.png").join("axis.show/futurerenaissanceextended/poster-horizontal.png");
  writeFileSync("app/" + dirName + "/page.tsx", page);

  console.log("built  /" + dirName + "  (" + spec.name + ")");
}
