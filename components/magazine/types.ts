export type ContentBlock = {
  type: "paragraph" | "heading" | "quote";
  text: string;
};

export type MagazineLang = "en" | "es" | "fr" | "de" | "ja" | "ru" | "zh";

export type MagazineArticle = {
  id: number;
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  excerpt: string;
  featured: boolean;
  tags: string[];
  linkedArtists?: string[];
  content: ContentBlock[];
  /** Optional per-language overrides — keys are MagazineLang codes */
  translations?: Partial<Record<MagazineLang, {
    title?: string;
    subtitle?: string;
    excerpt?: string;
    content?: ContentBlock[];
  }>>;
  /** Slugs of related articles for auto-generated "Related Stories" */
  relatedSlugs?: string[];
};

export const MAGAZINE_CATEGORIES = [
  "ALL",
  "INTERVIEWS",
  "NEWS",
  "ESSAYS",
  "CULTURE",
  "TECHNOLOGY",
  "EVENTS",
  "MUSIC",
  "IDEAS",
  "PRODUCTS",
  "TOKENS",
  "DEFI",
  "FINANCE",
  "BLOCKCHAIN",
  "OSINT",
  "QUANTUM",
  "MIXTAPES",
] as const;

export type MagazineCategory = typeof MAGAZINE_CATEGORIES[number];

export const CATEGORY_MAP: Record<MagazineCategory, string | null> = {
  ALL:        null,
  INTERVIEWS: "INTERVIEW",
  NEWS:       "NEWS",
  ESSAYS:     "ESSAY",
  CULTURE:    "CULTURE",
  TECHNOLOGY: "TECHNOLOGY",
  EVENTS:     "EVENT",
  MUSIC:      "MUSIC",
  IDEAS:      "IDEAS",
  PRODUCTS:   "PRODUCTS",
  TOKENS:     "TOKENS",
  DEFI:       "DEFI",
  FINANCE:    "FINANCE",
  BLOCKCHAIN: "BLOCKCHAIN",
  OSINT:      "OSINT",
  QUANTUM:    "QUANTUM",
  MIXTAPES:   null,
};

export const LANG_FLAGS: Record<MagazineLang, { src: string; label: string; alt: string }> = {
  en: { src: "/flags/us.svg", label: "EN", alt: "United States flag" },
  es: { src: "/flags/mx.svg", label: "ES", alt: "Mexico flag" },
  fr: { src: "/flags/fr.svg", label: "FR", alt: "France flag" },
  de: { src: "/flags/de.svg", label: "DE", alt: "Germany flag" },
  ja: { src: "/flags/jp.svg", label: "JA", alt: "Japan flag" },
  ru: { src: "/flags/ru.svg", label: "RU", alt: "Russia flag" },
  zh: { src: "/flags/cn.svg", label: "ZH", alt: "China flag" },
};
