import { EN_NAMES, VELVIQUE_COPY, localName } from "@/components/velvique/velvique-i18n";
import { getGarnish, getIngredient } from "./velvique-catalog";
import type { CodeComponent } from "./velvique-recipe-code";

/* Each guest's card as its own immutable page on Grove: the live 3D card
   (same box, faces, gloss, sway, drag and flip as the app), the recipe and
   the 10:30 pm draw. Everything it loads is immutable and on Grove next to
   it: fonts, logos and three.js 0.182.0 (core and module, the module's
   import pointed at the core's Grove URL). The flat card shows first and
   the 3D card replaces it once ready, so the page never sits empty. */

/* Brand assets uploaded once to Grove (same origin as every card page). */
export const GROVE_ASSETS = {
  axisLogo: "https://api.grove.storage/923ded02f7a15e824c1d256fb4382f1e4a4bda1769cb7b3b844c5fb236d254cb",
  velviqueLogo: "https://api.grove.storage/309a92d0cad21c0a3b6e32076b7fb9ad77ea41dc0e408571514cf7b44047cad4",
  bottle: "https://api.grove.storage/156965a891defff6d2f60c45313711a8331956940437fe4b39cc828437503a05",
  agura: "https://api.grove.storage/e87feeea0d936ec66ee9744e7e20f880d2a4d966b76a644d653b70954c8d93ae",
  bingo: "https://api.grove.storage/ac8fb627c56297e5b327ef83ab5581e5fdffb5ef225c57eff9348352bfbb561c",
};

const THREE_URL = "https://api.grove.storage/7a21595bb78a7ecf84743bb035ab1afe0dd32ffc74848f78d90ff825e05e09c5";

export type PageLang = "en" | "es" | "zh" | "zh-Hant";

export function pageLang(lang: string): PageLang {
  return lang === "es" || lang === "zh" || lang === "zh-Hant" ? lang : "en";
}

/* The full pour, named exactly as the page and the card name it, in the guest's language. */
export function recipeRows(lang: PageLang, components: CodeComponent[], garnishId: string | null) {
  const copy = VELVIQUE_COPY[lang];
  const rows = components.map((c): [string, string] => [
    localName(lang, c.ingredientId, EN_NAMES[c.ingredientId] ?? getIngredient(c.ingredientId)?.name ?? c.ingredientId),
    `${c.ml.toFixed(1)} ml`,
  ]);
  const garnish = garnishId ? localName(lang, garnishId, EN_NAMES[garnishId] ?? getGarnish(garnishId)?.name ?? garnishId) : null;
  return { title: copy.yourRecipe, rows, garnish: garnish ? copy.finishWith(garnish) : null };
}

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const LINKS: Record<PageLang, { recipe: string; data: string; site: string }> = {
  en: { recipe: "Recipe file", data: "Card data", site: "Velvique at AXIS" },
  es: { recipe: "Archivo de receta", data: "Datos de la carta", site: "Velvique en AXIS" },
  zh: { recipe: "配方文件", data: "卡片数据", site: "AXIS × Velvique" },
  "zh-Hant": { recipe: "配方檔案", data: "卡片資料", site: "AXIS × Velvique" },
};

export type CardPage = {
  lang: string;
  number: number;
  guestName: string | null;
  name: string;
  description: string;
  reading: string;
  components: CodeComponent[];
  garnishId: string | null;
  signatureHash: string;
  frontUrl: string;
  backUrl: string | null;
  recipeUrl: string;
};

export function buildCardPage(card: CardPage) {
  const lang = pageLang(card.lang);
  const copy = VELVIQUE_COPY[lang];
  const links = LINKS[lang];
  const recipe = recipeRows(lang, card.components, card.garnishId);
  const kicker = [copy.cardOf(card.number), card.guestName ? copy.madeFor(card.guestName) : ""].filter(Boolean).join(" · ");
  const faces = JSON.stringify({ front: card.frontUrl, back: card.backUrl ?? card.frontUrl });

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<meta name="theme-color" content="#000000"/>
<title>${esc(card.name)} · Velvique × AXIS</title>
<meta name="description" content="${esc(card.description)}"/>
<meta property="og:title" content="${esc(card.name)} · Velvique × AXIS"/>
<meta property="og:description" content="${esc(card.description)}"/>
<meta property="og:image" content="${esc(card.frontUrl)}"/>
<style>
  @font-face { font-family: "Agura"; src: url("${GROVE_ASSETS.agura}") format("woff2"); font-display: swap; }
  @font-face { font-family: "Bingo"; src: url("${GROVE_ASSETS.bingo}") format("woff2"); font-display: swap; }
  :root { --ink: #fff; --ink-2: rgba(255,255,255,.74); --ink-3: rgba(255,255,255,.5); --line: rgba(255,255,255,.14); --glass: rgba(255,255,255,.045); }
  * { box-sizing: border-box; min-width: 0; }
  html, body { margin: 0; background: #000; color: var(--ink); font-family: "Bingo", Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; }
  body::before { content: ""; position: fixed; inset: 0; z-index: -1; background: radial-gradient(circle at 70% 0%, rgba(255,255,255,.12), transparent 32%), radial-gradient(circle at 15% 22%, rgba(255,255,255,.06), transparent 30%), #000; }
  .top { position: sticky; top: 0; z-index: 3; display: flex; align-items: center; justify-content: center; gap: 12px; padding: calc(12px + env(safe-area-inset-top)) 16px 12px; border-bottom: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.6); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
  .top img { display: block; height: auto; }
  .top span { color: var(--ink-3); font-size: 14px; }
  .stage { position: relative; height: min(72svh, 680px); touch-action: none; cursor: grab; }
  .stage:active { cursor: grabbing; }
  .stage canvas { display: block; width: 100%; height: 100%; }
  .flat { display: flex; height: 100%; align-items: center; justify-content: center; perspective: 900px; }
  .flat img { height: 88%; width: auto; max-width: 88%; object-fit: contain; border: 1px solid var(--line); border-radius: 18px; transition: transform .3s; }
  .gl .flat { display: none; }
  .hint { margin: 4px 16px 0; text-align: center; color: var(--ink-3); font-size: 12px; }
  main { width: 100%; max-width: 560px; margin: 0 auto; padding: 28px 16px calc(48px + env(safe-area-inset-bottom)); }
  .meta { margin: 0; color: var(--ink-3); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 14px 0 18px; font-family: "Agura", "Bingo", Arial, sans-serif; font-weight: 400; font-size: clamp(26px, 7vw, 44px); line-height: 1.04; text-transform: uppercase; overflow-wrap: anywhere; }
  p { margin: 0 0 14px; color: var(--ink-2); font-size: 15px; line-height: 1.55; }
  .panel { margin: 20px 0 0; padding: 18px 20px; border: 1px solid var(--line); border-radius: 18px; background: var(--glass); }
  .panel .meta { color: var(--ink); }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 15px; }
  .row span:last-child { color: var(--ink-2); white-space: nowrap; }
  .panel p:last-child { margin: 12px 0 0; font-size: 14px; }
  .draw { text-align: center; }
  .draw p { margin: 8px 0 0; }
  .sig { margin-top: 22px; letter-spacing: .08em; overflow-wrap: anywhere; }
  .links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 26px; }
  .links a { display: inline-flex; align-items: center; min-height: 40px; padding: 0 18px; border: 1px solid var(--line); border-radius: 999px; background: var(--glass); color: var(--ink); font-size: 13px; text-decoration: none; }
  .links a.solid { border-color: var(--ink); background: var(--ink); color: #000; }
  footer { margin-top: 40px; padding-top: 22px; border-top: 1px solid rgba(255,255,255,.08); text-align: center; color: var(--ink-3); font-size: 12px; }
</style>
</head>
<body>
  <header class="top">
    <img src="${GROVE_ASSETS.axisLogo}" alt="AXIS" width="64"/>
    <span aria-hidden="true">×</span>
    <img src="${GROVE_ASSETS.velviqueLogo}" alt="Velvique" width="140"/>
  </header>

  <div class="stage" id="stage" aria-label="${esc(card.name)}">
    <div class="flat"><img id="flat" src="${esc(card.frontUrl)}" alt="${esc(card.name)}"/></div>
  </div>
  <p class="hint">${esc(copy.dragHint)}</p>

  <main>
    <p class="meta">${esc(kicker)}</p>
    <h1>${esc(card.name)}</h1>
    <p>${esc(card.description)}</p>
    ${card.reading ? `<p>${esc(card.reading)}</p>` : ""}

    <section class="panel">
      <p class="meta">${esc(recipe.title)}</p>
      ${recipe.rows.map(([name, amount]) => `<div class="row"><span>${esc(name)}</span><span>${esc(amount)}</span></div>`).join("")}
      ${recipe.garnish ? `<p>${esc(recipe.garnish)}</p>` : ""}
    </section>

    <section class="panel draw">
      <p class="meta">10:30 pm</p>
      <p>${esc(copy.savedDraw)}</p>
    </section>

    <p class="meta sig">${esc(copy.signature(card.signatureHash.slice(0, 8)))}</p>

    <nav class="links">
      <a class="solid" href="https://axis.show/velvique">${esc(links.site)}</a>
      <a href="${esc(card.recipeUrl)}">${esc(links.recipe)}</a>
    </nav>

    <footer>AXIS × Velvique</footer>
  </main>

<script type="module">
  const faces = ${faces};
  const stage = document.getElementById("stage");
  const W = 1024, H = 1656, CARD_W = 1, CARD_H = H / W;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The flat card works from the first paint: tap flips front and back. */
  let turned = false;
  stage.addEventListener("click", () => {
    if (document.body.classList.contains("gl")) return;
    turned = !turned;
    const img = document.getElementById("flat");
    img.style.transform = "rotateY(90deg)";
    setTimeout(() => { img.src = turned ? faces.back : faces.front; img.style.transform = "none"; }, 300);
  });

  try {
    const THREE = await import("${THREE_URL}");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(-2, 3, 4);
    scene.add(sun);
    const glint = new THREE.PointLight(0xffffff, 1.1, 5, 2);
    glint.position.set(0, 0, 2.2);
    scene.add(glint);

    const loader = new THREE.TextureLoader();
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const texture = (url) => new Promise((resolve, reject) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; resolve(t); }, undefined, reject));
    const [front, back] = await Promise.all([texture(faces.front), texture(faces.back)]);

    const edge = new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 0.85, roughness: 0.3 });
    const face = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.5, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.35 });
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.BoxGeometry(CARD_W, CARD_H, 0.014), [edge, edge, edge, edge, face(front), face(back)]));
    scene.add(group);

    /* Swap the flat card for the 3D one only now that both faces are loaded. */
    stage.appendChild(renderer.domElement);
    document.body.classList.add("gl");

    /* Fit the card to the stage with a little air on every side. */
    const fit = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      camera.position.z = Math.max((CARD_H * 1.18) / (2 * halfFov), (CARD_W * 1.4) / (2 * halfFov * camera.aspect));
      camera.updateProjectionMatrix();
    };
    fit();
    addEventListener("resize", fit);

    /* Drag to turn, tap (or a long swipe) to flip; the highlight follows the finger. */
    let flipped = false;
    const drag = { active: false, x: 0, y: 0, moved: 0, dx: 0, dy: 0 };
    const pointer = { x: 0, y: 0 };
    stage.addEventListener("pointerdown", (e) => Object.assign(drag, { active: true, x: e.clientX, y: e.clientY, moved: 0, dx: 0, dy: 0 }));
    addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      if (!drag.active) return;
      drag.dx = (e.clientX - drag.x) / r.width;
      drag.dy = (e.clientY - drag.y) / r.height;
      drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y));
    });
    const release = () => {
      if (!drag.active) return;
      drag.active = false;
      if (drag.moved < 8 || Math.abs(drag.dx) > 0.28) flipped = !flipped;
      drag.dx = 0;
      drag.dy = 0;
    };
    addEventListener("pointerup", release);
    addEventListener("pointercancel", release);

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      const sway = reduced || drag.active ? 0 : Math.sin(t * 0.6) * 0.14;
      const targetY = (flipped ? Math.PI : 0) + drag.dx * Math.PI * 1.2 + sway;
      const targetX = -drag.dy * 0.8 + (reduced ? 0 : Math.sin(t * 0.4) * 0.04);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 6, delta);
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 6, delta);
      glint.position.set(pointer.x * 1.4, pointer.y * 1.4, 2.2);
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.warn("3D card unavailable, keeping the flat card", error);
    document.body.classList.remove("gl");
    stage.querySelector("canvas")?.remove();
  }
</script>
</body>
</html>`;
}
