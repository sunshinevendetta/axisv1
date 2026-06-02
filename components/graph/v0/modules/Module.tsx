"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useModule } from "./ModuleContext";

interface Props {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** If true, render no padding wrapper (graph canvas uses this) */
  bare?: boolean;
  /** Optional richer renderer shown when the module is expanded to the modal. */
  expandedView?: ReactNode;
  /** Which column / region this module belongs to. Enables drag-to-reorder. */
  columnId?: string;
}

const MIN_H = 24;
const MIN_W = 80;

type Edge = "n" | "s" | "e" | "w";
type ResizeDir = Edge | "ne" | "nw" | "se" | "sw";

interface ResizeState {
  dir: ResizeDir;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
}

const CURSOR: Record<ResizeDir, string> = {
  n: "ns-resize", s: "ns-resize",
  e: "ew-resize", w: "ew-resize",
  ne: "nesw-resize", sw: "nesw-resize",
  nw: "nwse-resize", se: "nwse-resize",
};

export default function Module({ id, title, children, className, style, bare, expandedView, columnId }: Props) {
  const {
    isOpen,
    toggleOpen,
    isExpanded,
    expand,
    close,
    setExpandedRenderer,
    getSize,
    setSize,
    moveBefore,
    hydrated,
  } = useModule();
  const open = isOpen(id);
  const expanded = isExpanded(id);

  const renderRef = useRef<() => ReactNode>(() => children);
  renderRef.current = () => children;
  const expandedRef = useRef<ReactNode | undefined>(expandedView);
  expandedRef.current = expandedView;
  const hasExpandedView = expandedView !== undefined;

  useEffect(() => {
    setExpandedRenderer(
      id,
      () => renderRef.current(),
      hasExpandedView ? () => expandedRef.current : undefined,
    );
  }, [id, setExpandedRenderer, hasExpandedView]);

  // — Resize (any edge / corner) —
  const storedSize = hydrated ? getSize(id) : undefined;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);

  const onResizePointerMove = useCallback(
    (e: PointerEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;
      const dir = r.dir;

      let nextW = r.startW;
      let nextH = r.startH;

      if (dir.includes("e")) nextW = r.startW + dx;
      if (dir.includes("w")) nextW = r.startW - dx;
      if (dir.includes("s")) nextH = r.startH + dy;
      if (dir.includes("n")) nextH = r.startH - dy;

      nextW = Math.max(MIN_W, Math.round(nextW));
      nextH = Math.max(MIN_H, Math.round(nextH));

      const patch: { h?: number; w?: number } = {};
      if (dir.includes("n") || dir.includes("s")) patch.h = nextH;
      if (dir.includes("e") || dir.includes("w")) patch.w = nextW;
      setSize(id, patch);
    },
    [id, setSize],
  );

  const onResizePointerUp = useCallback(() => {
    resizeRef.current = null;
    window.removeEventListener("pointermove", onResizePointerMove);
    window.removeEventListener("pointerup", onResizePointerUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [onResizePointerMove]);

  const startResize = useCallback(
    (dir: ResizeDir) => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      resizeRef.current = {
        dir,
        startX: e.clientX,
        startY: e.clientY,
        startW: rect.width,
        startH: rect.height,
      };
      document.body.style.cursor = CURSOR[dir];
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onResizePointerMove);
      window.addEventListener("pointerup", onResizePointerUp);
    },
    [onResizePointerMove, onResizePointerUp],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onResizePointerMove);
      window.removeEventListener("pointerup", onResizePointerUp);
    };
  }, [onResizePointerMove, onResizePointerUp]);

  // — Drag-to-reorder —
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const draggable = !!columnId;

  const onDragStart = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!columnId) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/x-axis-module", id);
    e.dataTransfer.setData("text/x-axis-column", columnId);
    setIsDragging(true);
  };
  const onDragEnd = () => { setIsDragging(false); setIsDragOver(false); };
  const onDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!columnId) return;
    const fromCol = e.dataTransfer.types.includes("text/x-axis-column");
    if (!fromCol) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!columnId) return;
    e.preventDefault();
    setIsDragOver(false);
    const sourceId = e.dataTransfer.getData("text/x-axis-module");
    const sourceCol = e.dataTransfer.getData("text/x-axis-column");
    if (!sourceId || !sourceCol || sourceCol !== columnId || sourceId === id) return;
    moveBefore(columnId, sourceId, id);
  };

  const rootStyle: CSSProperties = { ...style };
  if (open && storedSize?.h) rootStyle.height = storedSize.h;
  if (open && storedSize?.w) rootStyle.width = storedSize.w;

  return (
    <div
      ref={rootRef}
      className={`mod ${className ?? ""} ${isDragging ? "mod-dragging" : ""} ${isDragOver ? "mod-dragover" : ""}`}
      style={rootStyle}
      data-module-id={id}
      onDragOver={draggable ? onDragOver : undefined}
      onDragLeave={draggable ? onDragLeave : undefined}
      onDrop={draggable ? onDrop : undefined}
    >
      <div
        className="mod-hd"
        draggable={draggable}
        onDragStart={draggable ? onDragStart : undefined}
        onDragEnd={draggable ? onDragEnd : undefined}
      >
        {draggable && <span className="mod-grip" aria-hidden="true">⋮⋮</span>}
        <button
          className="mod-toggle"
          onClick={() => toggleOpen(id)}
          title={open ? "Close module" : "Open module"}
        >
          <span className="mod-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
          <span className="mod-title">{title}</span>
        </button>
        <div className="mod-actions">
          <button
            className="mod-btn"
            onClick={() => (expanded ? close() : expand(id))}
            title={expanded ? "Close modal" : "Maximize"}
          >
            {expanded ? "⊟" : "⊞"}
          </button>
        </div>
      </div>
      {open && (
        <div className={bare ? "mod-body-bare" : "mod-body"}>
          {expanded ? (
            <div className="mod-placeholder">Open in modal — click ⊟ above to return.</div>
          ) : children}
        </div>
      )}
      {open && !expanded && (
        <>
          <div className="mod-rz mod-rz-n" onPointerDown={startResize("n")} />
          <div className="mod-rz mod-rz-s" onPointerDown={startResize("s")} />
          <div className="mod-rz mod-rz-e" onPointerDown={startResize("e")} />
          <div className="mod-rz mod-rz-w" onPointerDown={startResize("w")} />
          <div className="mod-rz mod-rz-ne" onPointerDown={startResize("ne")} />
          <div className="mod-rz mod-rz-nw" onPointerDown={startResize("nw")} />
          <div className="mod-rz mod-rz-se" onPointerDown={startResize("se")} />
          <div className="mod-rz mod-rz-sw" onPointerDown={startResize("sw")} />
        </>
      )}
    </div>
  );
}
