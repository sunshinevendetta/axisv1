export type ContentBlock = {
  type: "paragraph" | "heading" | "quote";
  text: string;
};

export type MagazineLang = "en" | "es" | "fr" | "de" | "ja" | "ru" | "zh" | "pt" | "ko" | "it" | "nl";

export type MagazineArticleTranslation = {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  content?: ContentBlock[];
};

export type MagazineArticle = {
  id: number;
  slug: string;
  axis?: "capital" | "culture" | "systems" | "markets" | "experiments" | "geography" | "music" | "art" | "fashion" | "tools";
  category: string;
  contentType?: "SIGNAL" | "ARTICLE" | "REVIEW" | "MARKET" | "ADVANCED" | "DATA";
  mode?: "ENTRY" | "NATIVE" | "EXPERT";
  frame?: "OBSERVE" | "TEST" | "BREAKDOWN" | "POSITION" | "OPPORTUNITY";
  persona?: "OPERATOR" | "INSIDER" | "ANALYST" | "EXPERIMENTER" | "STRATEGIST";
  title: string;
  subtitle: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  excerpt: string;
  featured: boolean;
  image_url?: string;
  tags: string[];
  linkedArtists?: string[];
  content: ContentBlock[];
  monetization?: Array<
    "sponsorship" | "paid_review" | "affiliate" | "data_product" | "financial_integration" | "attention_funnel"
  >;
  translations?: Partial<Record<MagazineLang, MagazineArticleTranslation>>;
  relatedSlugs?: string[];
};

export const MAGAZINE_CATEGORIES = [
  "ALL",
  "PROFILES",
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
  ALL: null,
  PROFILES: "PROFILE",
  INTERVIEWS: "INTERVIEW",
  NEWS: "NEWS",
  ESSAYS: "ESSAY",
  CULTURE: "CULTURE",
  TECHNOLOGY: "TECHNOLOGY",
  EVENTS: "EVENT",
  MUSIC: "MUSIC",
  IDEAS: "IDEAS",
  PRODUCTS: "PRODUCTS",
  TOKENS: "TOKENS",
  DEFI: "DEFI",
  FINANCE: "FINANCE",
  BLOCKCHAIN: "BLOCKCHAIN",
  OSINT: "OSINT",
  QUANTUM: "QUANTUM",
  MIXTAPES: null,
};

export const LANG_FLAGS: Record<MagazineLang, { src: string; label: string; alt: string }> = {
  en: { src: "/flags/us.svg", label: "EN", alt: "United States flag" },
  es: { src: "/flags/mx.svg", label: "ES", alt: "Mexico flag" },
  fr: { src: "/flags/fr.svg", label: "FR", alt: "France flag" },
  de: { src: "/flags/de.svg", label: "DE", alt: "Germany flag" },
  ja: { src: "/flags/jp.svg", label: "JA", alt: "Japan flag" },
  ru: { src: "/flags/ru.svg", label: "RU", alt: "Russia flag" },
  zh: { src: "/flags/cn.svg", label: "ZH", alt: "China flag" },
  pt: { src: "/flags/br.svg", label: "PT", alt: "Brazil flag" },
  ko: { src: "/flags/kr.svg", label: "KO", alt: "South Korea flag" },
  it: { src: "/flags/it.svg", label: "IT", alt: "Italy flag" },
  nl: { src: "/flags/nl.svg", label: "NL", alt: "Netherlands flag" },
};
