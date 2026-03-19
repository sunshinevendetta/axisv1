export type ContentBlock = {
  type: "paragraph" | "heading" | "quote";
  text: string;
};

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
  content: ContentBlock[];
};
