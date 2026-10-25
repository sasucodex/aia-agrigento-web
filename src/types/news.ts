export type NewsCategory =
  | "Riunioni Tecniche"
  | "Raduni & Stage"
  | "Premio Livatino"
  | "Esordi & Traguardi"
  | "Corsi Arbitri"
  | "Vita Sezionale"
  | "Calcio a 5"
  | "Comunicazioni";

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  pubDate: string;
  category: NewsCategory;
  tags: string[];
  image: string;
  author: string;
  content: string;
  featured?: boolean;
}

export interface ArticleFilterOptions {
  query?: string;
  category?: NewsCategory | "Tutti";
  years?: (string | number)[];
  tag?: string;
}

export interface YearArchiveCount {
  year: string;
  count: number;
}
