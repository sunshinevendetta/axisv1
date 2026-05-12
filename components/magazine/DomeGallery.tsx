"use client";

import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useGesture } from "@use-gesture/react";
import styles from "./DomeGallery.module.css";

type ImageItem =
  | string
  | {
      src: string;
      alt?: string;
      title?: string;
      subtitle?: string;
      href?: string;
      ctaLabel?: string;
    };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
  { src: "https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop", alt: "Abstract art" },
  { src: "https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop", alt: "Modern sculpture" },
  { src: "https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop", alt: "Digital artwork" },
  { src: "https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop", alt: "Contemporary art" },
  { src: "https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop", alt: "Geometric pattern" },
  { src: "https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop", alt: "Textured surface" },
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};

const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? Number.NaN : Number.parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  if (pool.length === 0) {
    return coords.map((c) => ({ ...c, src: "", alt: "", title: "", subtitle: "", href: "", ctaLabel: "" }));
  }

  const normalizedImages = pool.map((image) => {
    if (typeof image === "string") {
      return { src: image, alt: "", title: "", subtitle: "", href: "", ctaLabel: "" };
    }
    return {
      src: image.src || "",
      alt: image.alt || "",
      title: image.title || "",
      subtitle: image.subtitle || "",
      href: image.href || "",
      ctaLabel: image.ctaLabel || "Read More",
    };
  });

  const usedImages = Array.from({ length: coords.length }, (_, i) => normalizedImages[i % normalizedImages.length]);

  for (let i = 1; i < usedImages.length; i += 1) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j += 1) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
    title: usedImages[i].title,
    subtitle: usedImages[i].subtitle,
    href: usedImages[i].href,
    ctaLabel: usedImages[i].ctaLabel,
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  return {
    rotateY: unit * (offsetX + (sizeX - 1) / 2),
    rotateX: unit * (offsetY - (sizeY - 1) / 2),
  };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Number.POSITIVE_INFINITY,
  padFactor = 0.25,
  overlayBlurColor = "#120F17",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = "400px",
  openedImageHeight = "400px",
  imageBorderRadius = "30px",
  openedImageBorderRadius = "30px",
  grayscale = true,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const scrollLockedRef = useRef(false);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add(styles.scrollLock);
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove(styles.scrollLock);
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = useCallback((xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;

      let basis: number;
      switch (fitBasis) {
        case "min":
          basis = minDim;
          break;
        case "max":
          basis = maxDim;
          break;
        case "width":
          basis = w;
          break;
        case "height":
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }

      let radius = basis * fit;
      radius = Math.min(radius, h * 1.35);
      radius = clamp(radius, minRadius, maxRadius);

      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${Math.max(8, Math.round(minDim * padFactor))}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });

    ro.observe(root);
    return () => ro.disconnect();
  }, [
    applyTransform,
    fit,
    fitBasis,
    grayscale,
    imageBorderRadius,
    maxRadius,
    minRadius,
    openedImageBorderRadius,
    overlayBlurColor,
    padFactor,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, [applyTransform]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback((vx: number, vy: number) => {
    const maxV = 1.4;
    let vX = clamp(vx, -maxV, maxV) * 80;
    let vY = clamp(vy, -maxV, maxV) * 80;
    let frames = 0;
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames = Math.round(90 + 270 * d);

    const step = () => {
      vX *= frictionMul;
      vY *= frictionMul;

      if ((Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) || frames > maxFrames) {
        inertiaRAF.current = null;
        return;
      }

      frames += 1;
      const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };

    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [applyTransform, dragDampening, maxVerticalRotationDeg, stopInertia]);

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        const evt = event as PointerEvent;
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;

        const evt = event as PointerEvent;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;

        if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) {
          movedRef.current = true;
        }

        const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);

        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);

        if (!last) return;

        draggingRef.current = false;
        const [vMagX, vMagY] = velocity;
        const [dirX, dirY] = direction;
        let vx = vMagX * dirX;
        let vy = vMagY * dirY;

        if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
          const [mx, my] = movement;
          vx = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2);
          vy = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2);
        }

        if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
          startInertia(vx, vy);
        }

        if (movedRef.current) {
          lastDragEndAt.current = performance.now();
        }

        movedRef.current = false;
      },
    },
    { target: mainRef, eventOptions: { passive: true } },
  );

  const openItemFromElement = useCallback((el: HTMLElement) => {
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    lockScroll();

    const parent = el.parentElement as HTMLElement;
    focusedElRef.current = el;
    el.dataset.focused = "true";

    const offsetX = getDataNumber(parent, "offsetX", 0);
    const offsetY = getDataNumber(parent, "offsetY", 0);
    const sizeX = getDataNumber(parent, "sizeX", 2);
    const sizeY = getDataNumber(parent, "sizeY", 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
    const rotY = wrapAngleSigned(-(normalizeAngle(parentRot.rotateY) + normalizeAngle(rotationRef.current.y)));
    const rotX = -parentRot.rotateX - rotationRef.current.x;
    parent.style.setProperty("--rot-y-delta", `${rotY}deg`);
    parent.style.setProperty("--rot-x-delta", `${rotX}deg`);

    const refDiv = document.createElement("div");
    refDiv.className = `${styles.itemImage} ${styles.itemImageReference ?? ""}`.trim();
    refDiv.style.opacity = "0";
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current?.getBoundingClientRect();
    const frameR = frameRef.current?.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef.current = false;
      focusedElRef.current = null;
      parent.removeChild(refDiv);
      unlockScroll();
      return;
    }

    originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = "hidden";
    el.style.zIndex = "0";

    const overlay = document.createElement("div");
    overlay.className = styles.enlarge;
    overlay.style.left = `${frameR.left - mainR.left}px`;
    overlay.style.top = `${frameR.top - mainR.top}px`;
    overlay.style.width = `${frameR.width}px`;
    overlay.style.height = `${frameR.height}px`;
    overlay.style.opacity = "0";

    const rawSrc = parent.dataset.src || (el.querySelector("img") as HTMLImageElement | null)?.src || "";
    const title = parent.dataset.title || "";
    const subtitle = parent.dataset.subtitle || "";
    const href = parent.dataset.href || "";
    const ctaLabel = parent.dataset.ctaLabel || "Read More";
    const img = document.createElement("img");
    img.src = rawSrc;
    img.alt = parent.dataset.alt || title || "Gallery image";
    overlay.appendChild(img);

    if (title || subtitle || href) {
      const caption = document.createElement("div");
      caption.className = styles.enlargeCaption;

      if (title) {
        const titleEl = document.createElement("h3");
        titleEl.className = styles.enlargeTitle;
        titleEl.textContent = title;
        caption.appendChild(titleEl);
      }

      if (subtitle) {
        const subtitleEl = document.createElement("p");
        subtitleEl.className = styles.enlargeSubtitle;
        subtitleEl.textContent = subtitle;
        caption.appendChild(subtitleEl);
      }

      if (href) {
        const link = document.createElement("a");
        link.className = styles.enlargeLink;
        link.href = href;
        link.textContent = ctaLabel;
        caption.appendChild(link);
      }

      overlay.appendChild(caption);
    }

    viewerRef.current?.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${Number.isFinite(sx0) && sx0 > 0 ? sx0 : 1}, ${Number.isFinite(sy0) && sy0 > 0 ? sy0 : 1})`;

    window.setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = "1";
      overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
      rootRef.current?.setAttribute("data-enlarging", "true");
    }, 16);

    if (openedImageWidth || openedImageHeight) {
      const onFirstEnd = (ev: TransitionEvent) => {
        if (ev.propertyName !== "transform") return;
        overlay.removeEventListener("transitionend", onFirstEnd);
        overlay.style.transition = "none";
        const tempWidth = openedImageWidth || `${frameR.width}px`;
        const tempHeight = openedImageHeight || `${frameR.height}px`;
        overlay.style.width = tempWidth;
        overlay.style.height = tempHeight;
        const newRect = overlay.getBoundingClientRect();
        overlay.style.width = `${frameR.width}px`;
        overlay.style.height = `${frameR.height}px`;
        void overlay.offsetWidth;
        overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
        overlay.style.left = `${frameR.left - mainR.left + (frameR.width - newRect.width) / 2}px`;
        overlay.style.top = `${frameR.top - mainR.top + (frameR.height - newRect.height) / 2}px`;
        overlay.style.width = tempWidth;
        overlay.style.height = tempHeight;
      };
      overlay.addEventListener("transitionend", onFirstEnd);
    }
  }, [
    enlargeTransitionMs,
    lockScroll,
    openedImageHeight,
    openedImageWidth,
    segments,
    unlockScroll,
  ]);

  const onTileClick = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (draggingRef.current || movedRef.current || performance.now() - lastDragEndAt.current < 80 || openingRef.current) return;
    openItemFromElement(e.currentTarget);
  }, [openItemFromElement]);

  const onTilePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    if (draggingRef.current || movedRef.current || performance.now() - lastDragEndAt.current < 80 || openingRef.current) return;
    openItemFromElement(e.currentTarget);
  }, [openItemFromElement]);

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      const overlay = viewerRef.current?.querySelector(`.${styles.enlarge}`) as HTMLElement | null;
      if (!el || !overlay) return;

      const parent = el.parentElement as HTMLElement;
      const refDiv = parent.querySelector(`.${styles.itemImageReference ?? styles.itemImage}`) as HTMLElement | null;
      const originalPos = originalTilePositionRef.current;

      if (!originalPos || !rootRef.current) {
        overlay.remove();
        refDiv?.remove();
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        el.style.visibility = "";
        focusedElRef.current = null;
        rootRef.current?.removeAttribute("data-enlarging");
        openingRef.current = false;
        unlockScroll();
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      const animatingOverlay = document.createElement("div");
      animatingOverlay.className = styles.enlargeClosing;
      animatingOverlay.style.cssText = `
        position:absolute;
        left:${currentRect.left - rootRect.left}px;
        top:${currentRect.top - rootRect.top}px;
        width:${currentRect.width}px;
        height:${currentRect.height}px;
        z-index:9999;
        border-radius:var(--enlarge-radius, 32px);
        overflow:hidden;
        transition:all ${enlargeTransitionMs}ms ease-out;
        pointer-events:none;
      `;

      const originalImg = overlay.querySelector("img");
      if (originalImg) {
        const img = originalImg.cloneNode() as HTMLImageElement;
        img.style.cssText = "width:100%;height:100%;object-fit:cover;";
        animatingOverlay.appendChild(img);
      }

      overlay.remove();
      rootRef.current.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = `${originalPos.left - rootRect.left}px`;
        animatingOverlay.style.top = `${originalPos.top - rootRect.top}px`;
        animatingOverlay.style.width = `${originalPos.width}px`;
        animatingOverlay.style.height = `${originalPos.height}px`;
        animatingOverlay.style.opacity = "0";
      });

      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;
        refDiv?.remove();
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        el.style.visibility = "";
        el.style.opacity = "";
        focusedElRef.current = null;
        rootRef.current?.removeAttribute("data-enlarging");
        openingRef.current = false;
        unlockScroll();
      };

      animatingOverlay.addEventListener("transitionend", cleanup, { once: true });
    };

    scrim.addEventListener("click", close);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      scrim.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [enlargeTransitionMs, unlockScroll]);

  useEffect(() => () => document.body.classList.remove(styles.scrollLock), []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={
        {
          ["--segments-x" as never]: segments,
          ["--segments-y" as never]: segments,
          ["--overlay-blur-color" as never]: overlayBlurColor,
          ["--tile-radius" as never]: imageBorderRadius,
          ["--enlarge-radius" as never]: openedImageBorderRadius,
          ["--image-filter" as never]: grayscale ? "grayscale(1)" : "none",
        } as CSSProperties
      }
    >
      <main ref={mainRef} className={styles.main}>
        <div className={styles.stage}>
          <div ref={sphereRef} className={styles.sphere}>
            {items.map((it, i) => (
              <div
                key={`${it.x},${it.y},${i}`}
                className={styles.item}
                data-src={it.src}
                data-alt={it.alt}
                data-title={it.title}
                data-subtitle={it.subtitle}
                data-href={it.href}
                data-cta-label={it.ctaLabel}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={
                  {
                    ["--offset-x" as never]: it.x,
                    ["--offset-y" as never]: it.y,
                    ["--item-size-x" as never]: it.sizeX,
                    ["--item-size-y" as never]: it.sizeY,
                  } as CSSProperties
                }
              >
                <div
                  className={styles.itemImage}
                  role="button"
                  tabIndex={0}
                  aria-label={it.alt || "Open image"}
                  onClick={onTileClick}
                  onPointerUp={onTilePointerUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.src} draggable={false} alt={it.alt} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.overlay} />
        <div className={styles.overlayBlur} />
        <div className={`${styles.edgeFade} ${styles.edgeFadeTop}`} />
        <div className={`${styles.edgeFade} ${styles.edgeFadeBottom}`} />

        <div ref={viewerRef} className={styles.viewer}>
          <div ref={scrimRef} className={styles.scrim} />
          <div ref={frameRef} className={styles.frame} />
        </div>
      </main>
    </div>
  );
}
