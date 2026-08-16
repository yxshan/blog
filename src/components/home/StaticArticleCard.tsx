import type { Difficulty, RuntimePost } from "../../core/contracts";
import { postPath } from "../../core/navigation/siteUrl";
import { formatDate } from "../../features/posts/date";
import { getTagColor } from "../../features/tags/tagColors";

const difficultyLabels: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const difficultyColors: Record<Difficulty, string> = {
  easy: "border-green-400 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/30",
  medium:
    "border-yellow-400 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:bg-yellow-900/30",
  hard: "border-red-400 text-red-700 bg-red-50 dark:border-red-600 dark:text-red-300 dark:bg-red-900/30",
};

interface StaticArticleCardProps {
  post: RuntimePost;
}

export default function StaticArticleCard({ post }: StaticArticleCardProps) {
  const { slug, title, date, tags, excerpt, difficulty } = post;
  const formattedDate = formatDate(date);
  const colorClass = difficulty ? difficultyColors[difficulty] : null;

  return (
    <a
      href={postPath(slug)}
      className="article-card theme-surface group relative block rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      {difficulty && colorClass && (
        <span
          className={`absolute right-3 top-3 rounded-md border px-2 py-0.5 text-xs font-medium ${colorClass}`}
        >
          {difficultyLabels[difficulty]}
        </span>
      )}
      <h2 className="article-card-title pr-20 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {formattedDate && (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          {formattedDate}
        </p>
      )}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {excerpt}
      </p>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tags.map((tag) => {
            const color = getTagColor(tag);
            return (
              <span
                key={tag}
                className={`article-card-tag inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </a>
  );
}
