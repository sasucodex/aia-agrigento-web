import { formatDateItalian } from "@/lib/utils/date";
import { getCleanExcerpt } from "@/lib/utils/news";
import type { Article, NewsCategory } from "@/types/news";

export interface ArticleRowProps {
  article: Article;
  onCategorySelect?: (category: NewsCategory) => void;
  onTagSelect?: (tag: string) => void;
}

export default function ArticleRow({
  article,
  onCategorySelect,
  onTagSelect,
}: ArticleRowProps) {
  const formattedDate = formatDateItalian(article.pubDate);
  const excerpt = getCleanExcerpt(article, 30);
  const imageSrc = article.image || "/images/blog/fallback-news.webp";
  const articleUrl = `/blog/${article.slug}`;

  return (
    <article className="group hover:border-referee-gold/60 relative flex flex-col items-stretch overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:shadow-sm md:flex-row">
      <a
        href={articleUrl}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-slate-100 bg-slate-100 md:aspect-auto md:min-h-[220px] md:w-5/12 md:border-r md:border-b-0"
      >
        <img
          src={imageSrc}
          alt={article.title}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </a>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 lg:p-7">
        <div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {onCategorySelect ? (
              <button
                type="button"
                onClick={() => onCategorySelect(article.category)}
                className="font-heading cursor-pointer text-xs font-semibold tracking-wider text-[#004b97] uppercase transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]"
              >
                {article.category}
              </button>
            ) : (
              <span className="font-heading text-xs font-semibold tracking-wider text-[#004b97] uppercase">
                {article.category}
              </span>
            )}
            <time
              dateTime={article.pubDate}
              className="font-sans text-xs text-slate-500 tabular-nums"
            >
              {formattedDate}
            </time>
          </div>

          <h2 className="font-heading mt-2 mb-3 text-lg leading-snug font-bold tracking-tight text-balance text-slate-900 transition-colors group-hover:text-[#004b97] sm:text-xl lg:text-2xl">
            <a
              href={articleUrl}
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]"
            >
              {article.title}
            </a>
          </h2>

          <p className="mb-4 line-clamp-3 font-sans text-sm leading-relaxed text-pretty text-slate-700 sm:text-base">
            {excerpt}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {article.tags.slice(0, 3).map((tag) => {
              const cleanTag = tag.replace(/^#/, "");
              return onTagSelect ? (
                <button
                  key={cleanTag}
                  type="button"
                  onClick={() => onTagSelect(cleanTag)}
                  className="cursor-pointer rounded-sm bg-slate-100 px-2 py-0.5 font-sans text-xs text-slate-600 transition-colors hover:bg-slate-200/80 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]"
                >
                  #{cleanTag}
                </button>
              ) : (
                <span
                  key={cleanTag}
                  className="rounded-sm bg-slate-100 px-2 py-0.5 font-sans text-xs text-slate-600"
                >
                  #{cleanTag}
                </span>
              );
            })}
          </div>

          <a
            href={articleUrl}
            className="font-heading ml-auto inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold tracking-wider text-[#004b97] uppercase transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97] sm:text-sm"
          >
            <span>Leggi l&apos;articolo</span>
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
