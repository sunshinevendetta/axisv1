"use client";

/**
 * Liquid-glass lens — one crystal pane rendered with three.js.
 *
 * The shader is ported from the fullscreen post-process in
 * github.com/Yousuf-developer/liquid-glass-carousel (lib/carousel/engine.js).
 * Only the lens came across, none of the carousel: instead of a framebuffer
 * holding a 3D row, the source texture is a plain 2D canvas the caller paints
 * into, and the pass writes straight RGBA so the pane can float over the page
 * instead of covering it. Rotation, the ellipse shape and the screen vignette
 * were dropped — a UI pane is always an upright rounded rect.
 *
 * three is pulled in dynamically so it never lands in the shared bundle.
 */

import type * as THREE_NS from "three";

export type LiquidGlassOptions = {
  zoom: number; // inward refraction pull
  dispersion: number; // chromatic dispersion
  blur: number; // blur near the rim (px)
  glow: number; // overall glow multiplier
  whiteGlow: number; // central white nova intensity
  novaSize: number; // nova size
  ring: number; // shimmer ring intensity
  ringColor: string; // ring / aura tint
  ringRadius: number; // ring radius (0..0.5)
  ringWidth: number; // ring width
  shimmer: boolean; // animate the ring
  shimmerFreq: number; // wave count around the ring
  shimmerSpeed: number;
  shimmerDepth: number;
  rimStart: number; // where the rim fluid wave begins
  rimTangential: number; // tangential fluid-wave displacement
  rimInward: number; // extra inward pull at the rim
  rimFreq1: number;
  rimFreq2: number;
  rimLine: number; // bright border line intensity
  rimLinePos: number; // where the border sits (0..0.5)
  rimLineWidth: number;
  round: number; // corner rounding, 0 sharp .. 1 full pill
  alpha: number; // base opacity of the glass body
  samples: number; // dispersion samples
};

export type LiquidGlassPane = {
  /** The GL canvas. Caller mounts it; sized in CSS px. */
  canvas: HTMLCanvasElement;
  /** Paint the refracted content here, in CSS px. */
  ctx: CanvasRenderingContext2D;
  /** Re-upload the source canvas on the next frame. */
  markDirty(): void;
  /** Place the pane, in CSS px from the canvas top-left. */
  setShape(cx: number, cy: number, halfWidth: number, halfHeight: number): void;
  /** Keep the shimmer / rim wave running (off = redraw only when dirty). */
  setAnimated(animated: boolean): void;
  dispose(): void;
};

export const LIQUID_GLASS_DEFAULTS: LiquidGlassOptions = {
  zoom: 0.3,
  dispersion: 9,
  blur: 0,
  glow: 4.2,
  whiteGlow: 0.24,
  novaSize: 12,
  ring: 3.2,
  ringColor: "#bcd8ee",
  ringRadius: 0.49,
  ringWidth: 0.014,
  shimmer: true,
  shimmerFreq: 12,
  shimmerSpeed: 3.5,
  shimmerDepth: 0.12,
  rimStart: 0.8,
  rimTangential: 0.25,
  rimInward: 0,
  rimFreq1: 2,
  rimFreq2: 1,
  rimLine: 1.4,
  rimLinePos: 0.488,
  rimLineWidth: 0.003,
  round: 1,
  alpha: 0.72,
  samples: 16,
};

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = /* glsl */ `
  #define PI 3.14159265
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2  uRes;
  uniform vec2  uCenter;
  uniform float uSizeX;         // half-width (height-fraction units)
  uniform float uSizeY;         // half-height (height-fraction units)
  uniform float uAspect;        // W/H
  uniform float uRound;         // corner rounding (0..1)
  uniform float uZoom;
  uniform float uDispersion;
  uniform float uBlur;
  uniform float uGlow;
  uniform float uWhiteGlow;
  uniform float uNovaSize;
  uniform float uRing;
  uniform float uRingRadius;
  uniform float uRingWidth;
  uniform float uShimmer;
  uniform float uShimmerFreq;
  uniform float uShimmerSpeed;
  uniform float uShimmerDepth;
  uniform float uTime;
  uniform float uRimStart;
  uniform float uRimTangential;
  uniform float uRimInward;
  uniform float uRimFreq1;
  uniform float uRimFreq2;
  uniform vec3  uRingColor;
  uniform float uRimLine;
  uniform float uRimLinePos;
  uniform float uRimLineWidth;
  uniform float uAlpha;
  uniform int   uSamples;

  const int MAX_SAMPLES = 16;

  // rounded-box signed distance (negative inside)
  float sdRoundBox(vec2 p, vec2 b, float r){
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  // Evaluate the pane centered at 'center' (canvas-UV). Returns the lensed
  // colour; 'outA' = how opaque the glass is here (0 outside the shape),
  // 'outGlow' = the additive light on top, which also lifts the alpha.
  vec3 pane(vec2 center, out float outA, out float outGlow) {
    // local coords, aspect-corrected so x/y are in the same screen units
    vec2 p = (vUv - center);
    p.x *= uAspect;
    vec2 halfSize = vec2(uSizeX, uSizeY);
    // elliptical distance: 0 center .. 1 boundary
    float dist = length(p / halfSize);
    outA = 0.0;
    outGlow = 0.0;

    // maskND: 0 inside .. 1 at the rounded-rect boundary (>1 outside)
    float minHalf = min(uSizeX, uSizeY);
    float sd = sdRoundBox(p, halfSize, minHalf * clamp(uRound, 0.0, 1.0));
    float maskND = 1.0 + sd / minHalf;
    if (maskND > 1.0) return vec3(0.0);

    // shapeND: 0 center .. 1 boundary, following the rounded rect. Used by
    // nova / ring / border so they take the SAME shape.
    float shapeND = clamp(maskND, 0.0, 1.0);

    // deflection uses the elliptical radial nd so it bends smoothly from the
    // center even though the boundary is rectangular
    float nd = clamp(dist, 0.0, 1.0);
    vec2  offset = vUv - center;
    vec2  radialDir = normalize(offset + 1e-6);
    vec2  tangentDir = vec2(-radialDir.y, radialDir.x);
    float angle = atan(p.y, p.x);

    // inward pull + fluid rim waves
    float pull = uZoom * 0.30 * (nd * nd);
    float rimStrength = smoothstep(uRimStart, 1.0, nd);
    float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
    float rScreen = (uSizeX + uSizeY) * 0.5;
    vec2  rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
    vec2  rimPull = -radialDir * rimStrength * rScreen * uRimInward;

    vec2 baseUV = center + offset * (1.0 - pull) + rimOff + rimPull;

    // chromatic dispersion (weighted multi-sample, per-channel normalized)
    float rimMask = smoothstep(0.55, 1.0, nd);
    vec2  dispDir = offset * uDispersion * 0.004 * rimMask;
    int N = uSamples;
    if (N < 2) N = 2;
    if (N > MAX_SAMPLES) N = MAX_SAMPLES;
    vec3 col = vec3(0.0);
    vec3 caW = vec3(0.0);
    for (int i = 0; i < MAX_SAMPLES; i++) {
      if (i >= N) break;
      float t = float(i) / float(N - 1);
      vec2 sUV = baseUV + dispDir * (t - 0.5);
      vec3 s = texture2D(uTex, sUV).rgb;
      vec3 w = vec3(
        exp(-pow((t - 0.00) / 0.38, 2.0)),
        exp(-pow((t - 0.50) / 0.38, 2.0)),
        exp(-pow((t - 1.00) / 0.38, 2.0))
      );
      col += s * w;
      caW += w;
    }
    col /= max(caW, vec3(0.001));

    // optional blur near the rim
    float blurFade = 1.0 - smoothstep(0.72, 0.98, nd);
    if (uBlur > 0.01 && blurFade > 0.01) {
      vec2 blurRad = vec2(uBlur) / uRes * blurFade;
      vec3 bcol = vec3(0.0);
      float btw = 0.0;
      for (float a = 0.0; a < PI * 2.0; a += PI * 2.0 / 6.0) {
        for (float rr = 0.4; rr <= 1.001; rr += 0.3) {
          vec2 o = vec2(cos(a), sin(a)) * blurRad * rr;
          float w = 1.0 - rr * 0.38;
          bcol += texture2D(uTex, baseUV + o).rgb * w;
          btw += w;
        }
      }
      col = mix(bcol / btw, col, rimMask);
    }

    // glassy darkening toward center
    col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, shapeND));

    // white nova glow at center
    float r2 = shapeND * shapeND * 0.25;
    float gs = max(uNovaSize * uGlow * 0.003, 0.004);
    float nova = exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18;
    nova *= uWhiteGlow * (uGlow / 17.0) * 1.15;
    col += vec3(nova);
    outGlow += nova;

    // shimmer ring + aura
    float dC = shapeND * 0.5;
    float tR = clamp(uRingRadius, 0.1, 0.49);
    float rW = max(uRingWidth, 0.003);
    float ring = exp(-pow((dC - tR) / rW, 2.0));
    ring *= uRing * (uGlow / 17.0) * 1.8;
    if (uShimmer > 0.5) ring *= sin(angle * uShimmerFreq + uTime * uShimmerSpeed) * uShimmerDepth + (1.0 - uShimmerDepth);
    float ringAura = exp(-pow((dC - tR) / (rW * 6.0), 2.0)) * 0.28 * uRing * (uGlow / 17.0);
    col += uRingColor * (ring + ringAura);
    outGlow += ring + ringAura;

    // bright border line
    float rimLine = exp(-pow((dC - uRimLinePos) / max(uRimLineWidth, 0.0001), 2.0)) * uRimLine;
    col += vec3(rimLine);
    outGlow += rimLine;

    // solid inside, soft falloff at the very edge
    outA = smoothstep(1.0, 0.93, maskND);
    return col;
  }

  void main(){
    float a = 0.0;
    float glow = 0.0;
    vec3 col = pane(uCenter, a, glow);
    // the glass body is translucent; the nova / ring / border burn through it
    float alpha = a * clamp(uAlpha + glow, 0.0, 1.0);
    if (alpha <= 0.002) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export async function createLiquidGlassPane({
  width,
  height,
  options,
}: {
  width: number;
  height: number;
  options?: Partial<LiquidGlassOptions>;
}): Promise<LiquidGlassPane | null> {
  const opts = { ...LIQUID_GLASS_DEFAULTS, ...options };
  const THREE = (await import("three")) as typeof THREE_NS;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const source = document.createElement("canvas");
  source.width = Math.round(width * dpr);
  source.height = Math.round(height * dpr);
  const ctx = source.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  const canvas = document.createElement("canvas");
  let renderer: THREE_NS.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
  } catch {
    return null;
  }
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const texture = new THREE.CanvasTexture(source);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const uniforms = {
    uTex: { value: texture },
    uRes: { value: new THREE.Vector2(width * dpr, height * dpr) },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uSizeX: { value: 0.3 },
    uSizeY: { value: 0.3 },
    uAspect: { value: width / height },
    uRound: { value: opts.round },
    uZoom: { value: opts.zoom },
    uDispersion: { value: opts.dispersion },
    uBlur: { value: opts.blur },
    uGlow: { value: opts.glow },
    uWhiteGlow: { value: opts.whiteGlow },
    uNovaSize: { value: opts.novaSize },
    uRing: { value: opts.ring },
    uRingRadius: { value: opts.ringRadius },
    uRingWidth: { value: opts.ringWidth },
    uShimmer: { value: opts.shimmer ? 1 : 0 },
    uShimmerFreq: { value: opts.shimmerFreq },
    uShimmerSpeed: { value: opts.shimmerSpeed },
    uShimmerDepth: { value: opts.shimmerDepth },
    uTime: { value: 0 },
    uRimStart: { value: opts.rimStart },
    uRimTangential: { value: opts.rimTangential },
    uRimInward: { value: opts.rimInward },
    uRimFreq1: { value: opts.rimFreq1 },
    uRimFreq2: { value: opts.rimFreq2 },
    uRingColor: { value: new THREE.Color(opts.ringColor) },
    uRimLine: { value: opts.rimLine },
    uRimLinePos: { value: opts.rimLinePos },
    uRimLineWidth: { value: opts.rimLineWidth },
    uAlpha: { value: opts.alpha },
    uSamples: { value: opts.samples },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Mesh(geometry, material);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let dirty = true;
  let animated = true;
  let disposed = false;
  let frame = 0;
  const start = performance.now();

  const tick = () => {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const running = animated && !document.hidden;
    if (!running && !dirty) return;
    if (dirty) {
      texture.needsUpdate = true;
      dirty = false;
    }
    uniforms.uTime.value = (performance.now() - start) / 1000;
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);

  return {
    canvas,
    ctx,
    markDirty() {
      dirty = true;
    },
    setShape(cx, cy, halfWidth, halfHeight) {
      // the shader measures x and y in fractions of the canvas height
      uniforms.uCenter.value.set(cx / width, 1 - cy / height);
      uniforms.uSizeX.value = halfWidth / height;
      uniforms.uSizeY.value = halfHeight / height;
      dirty = true;
    },
    setAnimated(next) {
      animated = next;
      dirty = true;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      texture.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    },
  };
}
