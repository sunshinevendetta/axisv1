"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  children?: PillNavItem[];
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

function dedupeItems(items: PillNavItem[]): PillNavItem[] {
  return items
    .filter((item, index) => items.findIndex((candidate) => candidate.href === item.href) === index)
    .map((item) => ({
      ...item,
      children: item.children ? dedupeItems(item.children) : undefined,
    }));
}

export default function PillNav({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  onMobileMenuClick,
}: PillNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuItems = useMemo(() => dedupeItems(items), [items]);
  const activeGroupHref = useMemo(
    () =>
      menuItems.find(
        (item) =>
          Boolean(item.children?.length) &&
          (item.href === activeHref ||
            Boolean(item.children?.some((child: PillNavItem) => child.href === activeHref))),
      )?.href ?? null,
    [activeHref, menuItems],
  );
  const [expandedGroupHref, setExpandedGroupHref] = useState<string | null>(activeGroupHref);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
    setExpandedGroupHref(activeGroupHref);
  }, [activeGroupHref, activeHref]);

  useEffect(() => {
    const handleHashNavigation = () => {
      closeMenu();
    };

    window.addEventListener("hashchange", handleHashNavigation);
    window.addEventListener("popstate", handleHashNavigation);

    return () => {
      window.removeEventListener("hashchange", handleHashNavigation);
      window.removeEventListener("popstate", handleHashNavigation);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const handleScroll = () => closeMenu();

    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((current) => {
      const next = !current;
      if (next) onMobileMenuClick?.();
      return next;
    });
  };

  const renderNestedChildren = (items: PillNavItem[], level = 0) =>
    items.map((child: PillNavItem) => {
      const isChildActive = child.href === activeHref;
      const hasNestedChildren = Boolean(child.children?.length);

      return (
        <div key={child.href} className={level > 0 ? "mt-1" : ""}>
          <Link
            href={child.href}
            aria-label={child.ariaLabel || child.label}
            onClick={closeMenu}
            className={`block truncate rounded-lg px-2 py-1.5 text-[11px] tracking-[0.08em] transition-colors duration-150 ${
              isChildActive
                ? "bg-white/10 text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white/80"
            } ${level > 0 ? "ml-4" : ""}`}
          >
            {child.label}
          </Link>
          {hasNestedChildren ? (
            <div className="mt-1 space-y-0.5">
              {renderNestedChildren(child.children ?? [], level + 1)}
            </div>
          ) : null}
        </div>
      );
    });

  return (
    <div ref={rootRef} className={`relative w-fit max-w-full ${className}`}>
      <nav aria-label="Primary" className="flex items-center justify-center gap-4 text-white">
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
          style={{ backgroundColor: "#ffffff" }}
          className={`group inline-flex items-center justify-center overflow-hidden rounded-full px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-all duration-200 ${
            isMenuOpen ? "scale-[0.985]" : "hover:scale-[1.015]"
          }`}
        >
          <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
          <span className="relative flex h-7 w-[6.4rem] items-center justify-center sm:w-[7.1rem]">
            <Image
              src={logo}
              alt={logoAlt}
              fill
              sizes="(max-width: 640px) 102px, 114px"
              className={`object-contain transition-transform duration-300 ${
                isMenuOpen ? "scale-[0.98]" : "group-hover:scale-[1.03]"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Dropdown panel */}
      <div
        className={`absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 origin-top rounded-2xl border border-white/10 bg-black/96 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-200 ${
          isMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="p-3">
          {/* Top-level items */}
          <div className="flex flex-col gap-0.5">
            {menuItems.map((item: PillNavItem, index: number) => {
              const hasChildren = Boolean(item.children?.length);
              const isActive =
                item.href === activeHref ||
                Boolean(item.children?.some((child: PillNavItem) => child.href === activeHref));

              if (hasChildren) {
                const isExpanded = expandedGroupHref === item.href;

                return (
                  <div key={item.href}>
                    {/* Group row */}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`submenu-${index}`}
                      onClick={() =>
                        setExpandedGroupHref((current) => (current === item.href ? null : item.href))
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors duration-150 ${
                        isExpanded || isActive
                          ? "bg-white/8 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white/90"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-[0.26em]">{item.label}</span>
                      <span
                        aria-hidden="true"
                        className={`text-[10px] text-white/30 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {/* Submenu */}
                    <div
                      id={`submenu-${index}`}
                      className={`grid transition-all duration-200 ease-out ${
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="mx-3 mb-1 mt-0.5 max-h-[11rem] overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/16 [&::-webkit-scrollbar-track]:bg-transparent">
                          {renderNestedChildren(item.children ?? [])}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  onClick={closeMenu}
                  className={`block rounded-xl px-3 py-2 text-[10px] uppercase tracking-[0.26em] transition-colors duration-150 ${
                    isActive
                      ? "bg-white/8 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white/90"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
