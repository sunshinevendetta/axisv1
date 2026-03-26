import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

export interface ChromaItem {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;           // now optional, not used for navigation
  description?: string;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;

  // NEW: callback to parent component
  onItemClick?: (index: number) => void;
}

type SetterFn = (v: number | string) => void;

export const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = '',
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  onItemClick
}) => {

  const rootRef = useRef<HTMLDivElement>(null);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  const toggleDescription = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const [isInteractive, setIsInteractive] = useState(false);

  const data = items || [];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateInteractivity = () => {
      setIsInteractive(!coarsePointer.matches && !reducedMotion.matches);
    };

    updateInteractivity();
    coarsePointer.addEventListener('change', updateInteractivity);
    reducedMotion.addEventListener('change', updateInteractivity);

    return () => {
      coarsePointer.removeEventListener('change', updateInteractivity);
      reducedMotion.removeEventListener('change', updateInteractivity);
    };
  }, []);

  useEffect(() => {
    if (!isInteractive) return;

    const el = rootRef.current;
    if (!el) return;

    setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn;
    setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn;

    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };

    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, [isInteractive]);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleClick = (index: number) => {
    if (onItemClick) onItemClick(index);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${!isInteractive ? 'chroma-grid-static' : ''} ${className}`}
      style={
        {
          '--r': `${radius}px`,
          '--cols': columns,
          '--rows': rows,
        } as React.CSSProperties
      }
      onPointerMove={isInteractive ? handleMove : undefined}
      onPointerLeave={isInteractive ? handleLeave : undefined}
    >
      {data.map((c, i) => (
        <article
          key={i}
          className="chroma-card"
          onMouseMove={isInteractive ? handleCardMove : undefined}
          onClick={() => handleClick(i)}      // FIXED: no more window.open
          style={
            {
              '--card-border': c.borderColor || 'transparent',
              '--card-gradient': c.gradient,
              cursor: 'pointer',
            } as React.CSSProperties
          }
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" decoding="async" />
          </div>

          <footer className="chroma-info">
            <h3 className="name">{c.title}</h3>
            {c.handle && <span className="handle">{c.handle}</span>}
            <p className="role">{c.subtitle}</p>
            {c.location && <span className="location">{c.location}</span>}
          </footer>

          {c.description && (
            <div className="chroma-desc-area">
              <button
                className="chroma-desc-toggle"
                onClick={(e) => toggleDescription(e, i)}
              >
                {expandedSet.has(i) ? 'hide info −' : 'show info +'}
              </button>
              {expandedSet.has(i) && (
                <p className="chroma-desc-text">{c.description}</p>
              )}
            </div>
          )}
        </article>
      ))}

      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;
