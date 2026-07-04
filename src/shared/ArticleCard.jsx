import { Link } from "react-router";

/**
 * 占位版标签颜色映射
 *
 * 在 src/features/tags/tagColors.js 创建后，应替换为：
 *   import { getTagColor } from "../features/tags/tagColors"
 *
 * 当前为硬编码预设，覆盖中英文标签名：
 *   简单 / easy   → 绿色
 *   中等 / medium → 黄色
 *   困难 / hard   → 红色
 *   未知标签      → 灰色
 */
function getTagColor(tag) {
  const colorMap = {
    简单: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40",
    easy: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40",
    中等: "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40",
    medium:
      "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40",
    困难: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40",
    hard: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40",
  };

  return (
    colorMap[tag] ||
    "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800"
  );
}

/**
 * 难度映射：中文显示名 + 对应的 Tailwind 颜色类
 */
const DIFFICULTY_CONFIG = {
  easy: {
    label: "简单",
    className:
      "border-green-400 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/30",
  },
  medium: {
    label: "中等",
    className:
      "border-yellow-400 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:bg-yellow-900/30",
  },
  hard: {
    label: "困难",
    className:
      "border-red-400 text-red-700 bg-red-50 dark:border-red-600 dark:text-red-300 dark:bg-red-900/30",
  },
};

/**
 * ArticleCard — 文章列表卡片
 *
 * 用法：
 *   <ArticleCard post={post} />
 *
 * @param {{ post: import("../features/posts/api").Post }} props
 *   post.slug        — 文章唯一标识，用于构造链接
 *   post.title       — 文章标题
 *   post.date        — Date 对象
 *   post.tags        — 标签名数组
 *   post.excerpt     — 摘要文本（前 150 字符）
 *   post.difficulty  — 难度等级（easy / medium / hard / null）
 */
function ArticleCard({ post }) {
  const { slug, title, date, tags, excerpt, difficulty } = post;

  // 格式化日期：YYYY-MM-DD
  const formattedDate = date ? date.toISOString().split("T")[0] : "";

  // 难度配置（不存在时返回 null，跳过渲染）
  const diffConfig = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

  return (
    <Link
      to={`/posts/${slug}`}
      className="group relative block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-500"
    >
      {/* 右上角：难度标签 */}
      {diffConfig && (
        <span
          className={`absolute right-3 top-3 rounded-md border px-2 py-0.5 text-xs font-medium ${diffConfig.className}`}
        >
          {diffConfig.label}
        </span>
      )}

      {/* 标题 */}
      <h2 className="pr-20 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
        {title}
      </h2>

      {/* 日期 */}
      {formattedDate && (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          {formattedDate}
        </p>
      )}

      {/* 摘要 */}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {excerpt}
      </p>

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tags.map((tag) => {
            const colorClass = getTagColor(tag);
            return (
              <span
                key={tag}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${colorClass}`}
              >
                {/* 彩色小圆点 */}
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
                  aria-hidden="true"
                />
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </Link>
  );
}

export { ArticleCard };
