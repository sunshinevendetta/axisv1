"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    setIsMenuOpen(false);
    setExpandedGroupHref(activeGroupHref);
  }, [activeGroupHref, activeHref]);

  const toggleMenu = () => {
    setIsMenuOpen((current) => {
      const next = !current;
      if (next) onMobileMenuClick?.();
      return next;
    });
  };

  return (
    <div className={`relative w-full max-w-7xl ${className}`}>
      <nav aria-label="Primary" className="flex items-center justify-end gap-4 text-white">
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
          className={`group inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-all duration-200 ${
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
        className={`absolute right-0 top-full z-50 mt-3 w-72 origin-top rounded-2xl border border-white/10 bg-[#080808]/98 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-200 ${
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
                          {item.children?.map((child: PillNavItem) => {
                            const isChildActive = child.href === activeHref;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                aria-label={child.ariaLabel || child.label}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block truncate rounded-lg px-2 py-1.5 text-[11px] tracking-[0.08em] transition-colors duration-150 ${
                                  isChildActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
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
                  onClick={() => setIsMenuOpen(false)}
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
