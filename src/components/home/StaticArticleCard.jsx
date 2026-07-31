import { getTagColor } from "../../features/tags/tagColors";
import { formatDate } from "../../features/posts/date";

const difficultyLabels = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const base = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export default function StaticArticleCard({ post }) {
  const { slug, title, date, tags, excerpt, difficulty } = post;
  const formattedDate = formatDate(date);
  const colorClass = difficulty
    ? {
        easy: "border-green-400 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/30",
        medium:
          "border-yellow-400 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:bg-yellow-900/30",
        hard: "border-red-400 text-red-700 bg-red-50 dark:border-red-600 dark:text-red-300 dark:bg-red-900/30",
      }[difficulty]
    : null;

  return (
    <a
      href={`${base}posts/${slug}`}
      className="group relative block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-500"
    >
      {colorClass && (
        <span
          className={`absolute right-3 top-3 rounded-md border px-2 py-0.5 text-xs font-medium ${colorClass}`}
        >
          {difficultyLabels[difficulty] || difficulty}
        </span>
      )}
      <h2 className="pr-20 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
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
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}
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
