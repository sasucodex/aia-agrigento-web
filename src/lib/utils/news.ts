import rawNews from "@/data/news.json";
import type {
  Article,
  ArticleFilterOptions,
  NewsCategory,
  YearArchiveCount,
} from "@/types/news";

export const NEWS_CATEGORIES: readonly NewsCategory[] = [
  "Riunioni Tecniche",
  "Raduni & Stage",
  "Premio Livatino",
  "Esordi & Traguardi",
  "Corsi Arbitri",
  "Vita Sezionale",
  "Calcio a 5",
  "Comunicazioni",
] as const;

const articles: Article[] = rawNews as Article[];

export function getAllArticles(): Article[] {
  return [...articles].sort((a, b) => {
    const dateDiff =
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id;
  });
}

export function getLatestArticles(limit = 3): Article[] {
  return getAllArticles().slice(0, limit);
}

export function getFeaturedArticles(limit = 3): Article[] {
  const all = getAllArticles();
  const featured = all.filter((a) => a.featured);
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }
  const remaining = all.filter((a) => !a.featured);
  return [...featured, ...remaining].slice(0, limit);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleById(id: number): Article | undefined {
  return articles.find((a) => a.id === id);
}

export function getAdjacentArticles(slug: string): {
  prev: Article | null;
  next: Article | null;
} {
  const ordered = getAllArticles();
  const index = ordered.findIndex((a) => a.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index < ordered.length - 1 ? ordered[index + 1] : null,
    next: index > 0 ? ordered[index - 1] : null,
  };
}

export function getRelatedArticles(
  currentArticleOrSlug: Article | string,
  count = 3,
): Article[] {
  const current =
    typeof currentArticleOrSlug === "string"
      ? getArticleBySlug(currentArticleOrSlug)
      : currentArticleOrSlug;

  if (!current) {
    return getLatestArticles(count);
  }

  const candidates = getAllArticles().filter((a) => a.slug !== current.slug);

  const scored = candidates.map((candidate) => {
    let score = 0;
    if (candidate.category === current.category) {
      score += 3;
    }
    const sharedTags = candidate.tags.filter((t) =>
      current.tags.includes(t),
    ).length;
    score += sharedTags * 2;
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map((item) => item.candidate);
}

export function getCleanExcerpt(article: Article, wordLimit = 25): string {
  if (article.excerpt && article.excerpt.trim().length > 0) {
    return article.excerpt.trim();
  }
  const stripped = article.content
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = stripped.split(" ");
  if (words.length <= wordLimit) {
    return stripped;
  }
  return `${words.slice(0, wordLimit).join(" ")}…`;
}

export function filterArticles(options: ArticleFilterOptions = {}): Article[] {
  const { query, category, years, tag } = options;
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const normalizedTag = tag?.trim().toLowerCase().replace(/^#/, "") ?? "";
  const normalizedYears =
    years && years.length > 0 ? new Set(years.map((y) => String(y))) : null;

  return getAllArticles().filter((article) => {
    if (category && category !== "Tutti" && article.category !== category) {
      return false;
    }

    if (normalizedYears) {
      const articleYear = article.pubDate.slice(0, 4);
      if (!normalizedYears.has(articleYear)) {
        return false;
      }
    }

    if (normalizedTag) {
      const hasTag = article.tags.some(
        (t) => t.toLowerCase().replace(/^#/, "") === normalizedTag,
      );
      if (!hasTag) {
        return false;
      }
    }

    if (normalizedQuery) {
      const haystack = [
        article.title,
        article.excerpt,
        article.author,
        article.category,
        ...article.tags,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

export function getAvailableYears(): YearArchiveCount[] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    const year = article.pubDate.slice(0, 4);
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, count]) => ({ year, count }));
}

export function getCategoryCounts(): Record<NewsCategory | "Tutti", number> {
  const counts: Record<NewsCategory | "Tutti", number> = {
    Tutti: articles.length,
    "Riunioni Tecniche": 0,
    "Raduni & Stage": 0,
    "Premio Livatino": 0,
    "Esordi & Traguardi": 0,
    "Corsi Arbitri": 0,
    "Vita Sezionale": 0,
    "Calcio a 5": 0,
    Comunicazioni: 0,
  };

  for (const article of articles) {
    counts[article.category] = (counts[article.category] ?? 0) + 1;
  }

  return counts;
}
