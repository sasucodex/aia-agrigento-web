import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import ArticleRow from "@/components/blog/ArticleRow";
import { cn } from "@/lib/utils/cn";
import { NEWS_CATEGORIES } from "@/lib/utils/news";
import type { Article, NewsCategory, YearArchiveCount } from "@/types/news";

export interface BlogExplorerProps {
  articles: Article[];
  initialPage?: number;
  pageSize?: number;
}

type CategoryFilter = NewsCategory | "Tutti";

function buildPaginationRange(
  current: number,
  total: number,
): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1];

  if (current <= 4) {
    for (let i = 2; i <= 5; i++) {
      items.push(i);
    }
    items.push("ellipsis-end");
    items.push(total);
    return items;
  }

  if (current >= total - 3) {
    items.push("ellipsis-start");
    for (let i = total - 4; i <= total; i++) {
      items.push(i);
    }
    return items;
  }

  items.push("ellipsis-start");
  items.push(current - 1);
  items.push(current);
  items.push(current + 1);
  items.push("ellipsis-end");
  items.push(total);

  return items;
}

export default function BlogExplorer({
  articles,
  initialPage = 1,
  pageSize = 8,
}: BlogExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Tutti");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isHydrated, setIsHydrated] = useState(false);

  const explorerTopRef = useRef<HTMLDivElement>(null);

  const availableYears: YearArchiveCount[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of articles) {
      const year = article.pubDate.slice(0, 4);
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([year, count]) => ({ year, count }));
  }, [articles]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    const catParam = params.get("cat");
    const yearsParam = params.get("years");
    const tagParam = params.get("tag");
    const pageParam = params.get("page");

    let hasUrlOverrides = false;

    if (qParam) {
      setSearchQuery(qParam);
      hasUrlOverrides = true;
    }

    if (
      catParam &&
      (catParam === "Tutti" ||
        (NEWS_CATEGORIES as readonly string[]).includes(catParam))
    ) {
      setSelectedCategory(catParam as CategoryFilter);
      hasUrlOverrides = true;
    }

    if (yearsParam) {
      const validYears = new Set(availableYears.map((y) => y.year));
      const parsedYears = yearsParam
        .split(",")
        .map((y) => y.trim())
        .filter((y) => validYears.has(y));
      if (parsedYears.length > 0) {
        setSelectedYears(parsedYears);
        hasUrlOverrides = true;
      }
    }

    if (tagParam) {
      setSelectedTag(tagParam.trim().replace(/^#/, ""));
      hasUrlOverrides = true;
    }

    if (pageParam) {
      const parsedPage = Number.parseInt(pageParam, 10);
      if (!Number.isNaN(parsedPage) && parsedPage >= 1) {
        setCurrentPage(parsedPage);
      }
    } else if (hasUrlOverrides) {
      setCurrentPage(1);
    }

    setIsHydrated(true);
  }, [availableYears]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedTag = selectedTag.trim().toLowerCase().replace(/^#/, "");
    const yearSet = selectedYears.length > 0 ? new Set(selectedYears) : null;

    return articles.filter((article) => {
      if (
        selectedCategory !== "Tutti" &&
        article.category !== selectedCategory
      ) {
        return false;
      }

      if (yearSet) {
        const articleYear = article.pubDate.slice(0, 4);
        if (!yearSet.has(articleYear)) {
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
  }, [articles, searchQuery, selectedCategory, selectedYears, selectedTag]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedArticles = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, safeCurrentPage, pageSize]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "Tutti" ||
    selectedYears.length > 0 ||
    selectedTag.trim().length > 0;

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (selectedCategory !== "Tutti") {
      params.set("cat", selectedCategory);
    }
    if (selectedYears.length > 0) {
      params.set("years", selectedYears.join(","));
    }
    if (selectedTag.trim()) {
      params.set("tag", selectedTag.trim());
    }
    if (safeCurrentPage > 1 && hasActiveFilters) {
      params.set("page", String(safeCurrentPage));
    }

    const basePath = hasActiveFilters
      ? "/blog"
      : safeCurrentPage > 1
        ? `/blog/page/${safeCurrentPage}`
        : "/blog";

    const queryString = params.toString();
    const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;

    const currentFull = `${window.location.pathname}${window.location.search}`;
    if (currentFull !== targetUrl) {
      window.history.replaceState({}, "", targetUrl);
    }
  }, [
    isHydrated,
    searchQuery,
    selectedCategory,
    selectedYears,
    selectedTag,
    safeCurrentPage,
    hasActiveFilters,
  ]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: CategoryFilter) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleToggleYear = (year: string) => {
    setSelectedYears((prev) => {
      const exists = prev.includes(year);
      if (exists) {
        return prev.filter((y) => y !== year);
      }
      return [...prev, year].sort((a, b) => Number(b) - Number(a));
    });
    setCurrentPage(1);
  };

  const handleClearYears = () => {
    setSelectedYears([]);
    setCurrentPage(1);
  };

  const handleTagSelect = (tag: string) => {
    const cleaned = tag.replace(/^#/, "");
    setSelectedTag((prev) => (prev === cleaned ? "" : cleaned));
    setCurrentPage(1);
    explorerTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Tutti");
    setSelectedYears([]);
    setSelectedTag("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    explorerTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const paginationItems = useMemo(
    () => buildPaginationRange(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages],
  );

  return (
    <section
      id="blog-explorer"
      ref={explorerTopRef}
      aria-label="Esplora e filtra le notizie sezionali"
      className="scroll-mt-24 bg-white pt-8 pb-16 sm:pt-10 sm:pb-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-sm border border-slate-200 bg-slate-50/70 p-4 shadow-2xs sm:mb-12 sm:p-6">
          <div className="relative">
            <label htmlFor="blog-search-input" className="sr-only">
              Cerca articoli per titolo, arbitro o parola chiave
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="blog-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cerca per titolo, arbitro o argomento (es. Livatino, raduno, esordio, ...)"
              className="w-full rounded-sm border border-slate-300 bg-white py-3 pr-10 pl-10 font-sans text-sm text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:border-[#004b97] focus:ring-1 focus:ring-[#004b97] focus:outline-none"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Cancella testo di ricerca"
                className="absolute top-1/2 right-2.5 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-[#004b97]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Filtra per categoria"
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            {(["Tutti", ...NEWS_CATEGORIES] as const).map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    "font-heading cursor-pointer rounded-full border px-3.5 py-1.5 text-xs tracking-wider uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]",
                    isActive
                      ? "border-[#004b97] bg-[#004b97] font-semibold text-white shadow-2xs"
                      : "border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Filtra archivio per anno (selezione multipla supportata)"
            className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-200/80 pt-3.5"
          >
            <span className="font-heading mr-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Anno:
            </span>
            <button
              type="button"
              aria-pressed={selectedYears.length === 0}
              onClick={handleClearYears}
              className={cn(
                "font-heading cursor-pointer rounded-sm border px-2.5 py-1 text-xs tracking-wider uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]",
                selectedYears.length === 0
                  ? "border-[#004b97] bg-[#004b97] font-semibold text-white shadow-2xs"
                  : "border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900",
              )}
            >
              Tutti gli anni
            </button>

            {availableYears.map(({ year, count }) => {
              const isYearSelected = selectedYears.includes(year);
              return (
                <button
                  key={year}
                  type="button"
                  aria-pressed={isYearSelected}
                  onClick={() => handleToggleYear(year)}
                  className={cn(
                    "font-heading cursor-pointer rounded-sm border px-2.5 py-1 text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]",
                    isYearSelected
                      ? "border-[#004b97] bg-[#004b97] font-semibold text-white shadow-2xs"
                      : "border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900",
                  )}
                >
                  {year}{" "}
                  <span
                    className={cn(
                      "text-[11px]",
                      isYearSelected ? "text-blue-100" : "text-slate-400",
                    )}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div
            aria-live="polite"
            className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3 font-sans text-xs text-slate-600"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span>
                Visualizzati{" "}
                <strong className="font-semibold text-slate-900 tabular-nums">
                  {paginatedArticles.length}
                </strong>{" "}
                di{" "}
                <strong className="font-semibold text-slate-900 tabular-nums">
                  {filteredArticles.length}
                </strong>{" "}
                articoli
                {selectedYears.length > 0 && (
                  <span className="ml-1 font-medium text-slate-700">
                    (Anni: {selectedYears.join(", ")})
                  </span>
                )}
              </span>

              {selectedTag && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#004b97]">
                  #{selectedTag}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag("");
                      setCurrentPage(1);
                    }}
                    aria-label={`Rimuovi filtro tag ${selectedTag}`}
                    className="cursor-pointer text-[#004b97] hover:text-slate-900"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer font-medium text-[#004b97] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]"
              >
                Azzera filtri
              </button>
            )}
          </div>
        </div>

        {paginatedArticles.length > 0 ? (
          <div className="flex flex-col gap-6 sm:gap-8">
            {paginatedArticles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onCategorySelect={(cat) => handleCategoryChange(cat)}
                onTagSelect={handleTagSelect}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
            <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Nessun articolo trovato per i filtri selezionati
            </h2>
            <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-slate-700 sm:text-base">
              Prova a verificare i criteri di ricerca, rimuovere un filtro anno
              o azzerare i filtri per tornare all&apos;archivio completo.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={resetFilters}
                className="bg-referee-gold font-heading inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-sm px-6 py-2.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-xs transition-all duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97] active:scale-[0.98]"
              >
                Mostra tutti gli articoli
              </button>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Paginazione notizie"
            className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-8"
          >
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              aria-label="Pagina precedente"
              className="font-heading cursor-pointer rounded-sm border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:border-slate-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Precedente
            </button>

            <div className="flex flex-wrap items-center gap-1">
              {paginationItems.map((item) => {
                if (item === "ellipsis-start" || item === "ellipsis-end") {
                  return (
                    <span
                      key={item}
                      className="px-1.5 font-sans text-xs text-slate-400 select-none"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  );
                }

                const isCurrent = item === safeCurrentPage;
                const pageHref = item === 1 ? "/blog" : `/blog/page/${item}`;

                return (
                  <a
                    key={item}
                    href={pageHref}
                    aria-current={isCurrent ? "page" : undefined}
                    aria-label={`Pagina ${item}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(item);
                    }}
                    className={cn(
                      "font-heading inline-flex h-9 w-9 items-center justify-center rounded-sm border text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]",
                      isCurrent
                        ? "border-[#004b97] bg-[#004b97] font-bold text-white shadow-2xs"
                        : "border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900",
                    )}
                  >
                    {item}
                  </a>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              aria-label="Pagina successiva"
              className="font-heading cursor-pointer rounded-sm border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold tracking-wider text-slate-700 uppercase transition-colors hover:border-slate-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Successiva →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
