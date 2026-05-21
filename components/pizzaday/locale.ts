import type { SiteLanguage } from "@/components/site-language";

export function localizedText(text: string, language: SiteLanguage) {
  const separator = " / ";
  const index = text.indexOf(separator);
  if (index === -1) return text;

  const left = text.slice(0, index).trim();
  const right = text.slice(index + separator.length).trim();
  return language === "es" ? right : left;
}

export function localizedList(items: string[], language: SiteLanguage) {
  return items.map((item) => localizedText(item, language));
}
