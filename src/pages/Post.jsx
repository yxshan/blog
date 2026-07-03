import { useMemo } from "react";
import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { getPostBySlug, getAllPosts } from "../features/posts/api";
import MarkdownRenderer from "../features/posts/MarkdownRenderer";
import TOC from "../features/posts/TOC";
import ReadingProgress from "../features/posts/ReadingProgress";
import BackToTop from "../features/posts/BackToTop";
import { getReadingTime } from "../features/posts/ReadingTime";
import { getTagColor } from "../features/tags/tagColors";

// ============================================================
// 难度映射配置
// ============================================================
const DIFFICULTY_CONFIG = {
  easy: {
    label: "简单",
    className:
      "border-green-300 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/30",
  },
  medium: {
    label: "中等",
    className:
      "border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:bg-yellow-900/30",
  },
  hard: {
    label: "困难",
    className:
      "border-red-300 text-red-700 bg-red-50 dark:border-red-600 dark:text-red-300 dark:bg-red-900/30",
  },
};

// ============================================================
// 日期格式化工具
// ============================================================

/**
 * 将 Date 对象格式化为 YYYY-MM-DD 字符串
 */
function formatDate(date) {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

/**
 * 计算日期距今的天数
 *
 * @param {Date} date
 * @returns {number} 天数
 */
function daysSince(date) {
  if (!date) return 0;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ============================================================
// Post 页面组件
// ============================================================

/**
 * Post — 文章详情页
 *
 * 布局（桌面端双栏）：
 *   左侧（flex-1）：文章内容
 *   右侧（w-64, lg:block）：TOC 侧边栏
 */
export default function Post() {
  // —— 从 URL 获取 slug ——
  const { slug } = useParams();

  // —— 获取当前文章 ——
  const post = getPostBySlug(slug);

  // —— 获取全部文章（同一次渲染中的依赖数据） ——
  const allPosts = useMemo(() => getAllPosts(), []);

  // ============================================================
  // 派生数据（仅在 post 存在时计算）
  // ============================================================

  // 阅读时间
  const readingTime = useMemo(() => {
    return post ? getReadingTime(post.content) : null;
  }, [post]);

  // 难度配置
  const diffConfig = useMemo(() => {
    return post?.difficulty ? DIFFICULTY_CONFIG[post.difficulty] : null;
  }, [post]);

  // 上/下一篇文章：在全部文章中找相邻位置
  const prevPost = useMemo(() => {
    if (!post) return null;
    const idx = allPosts.findIndex((p) => p.slug === post.slug);
    return idx > 0 ? allPosts[idx - 1] : null;
  }, [post, allPosts]);

  const nextPost = useMemo(() => {
    if (!post) return null;
    const idx = allPosts.findIndex((p) => p.slug === post.slug);
    return idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  }, [post, allPosts]);

  // 相关文章：取标签交集最多的前 5 篇（排除当前文章）
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter((p) => p.slug !== post.slug)
      .map((p) => ({
        ...p,
        overlap: p.tags.filter((t) => post.tags.includes(t)).length,
      }))
      .filter((p) => p.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 5);
  }, [post, allPosts]);

  // 最后更新日期：优先使用 updated 字段，否则使用 date
  const lastUpdated = post?.updated || post?.date;
  const daysAgo = lastUpdated ? daysSince(lastUpdated) : 0;

  // ============================================================
  // 文章不存在时的渲染
  // ============================================================
  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          文章未找到
        </h1>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          你访问的页面不存在，或已被移除。
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    );
  }

  // ============================================================
  // 正常文章页面渲染
  // ============================================================
  return (
    <>
      {/* —— SEO 元信息 —— */}
      <Helmet>
        <title>{post.title} — yxshan&apos;s Blog</title>
        <meta name="description" content={post.excerpt} />
        <link
          rel="canonical"
          href={`https://yxshan.github.io/blog/#/posts/${post.slug}`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.date ? formatDate(post.date) : undefined,
            author: { "@type": "Person", name: "yxshan" },
            description: post.excerpt,
          })}
        </script>
      </Helmet>

      {/* —— 顶部阅读进度条 —— */}
      <ReadingProgress />

      {/* —— 页面主体：桌面双栏布局 —— */}
      <div className="mx-auto max-w-6xl px-4 py-8 lg:flex lg:gap-8">
        {/* ============================================================
            左侧：文章内容区
            ============================================================ */}
        <article className="min-w-0 flex-1">
          {/* —— 文章头 —— */}
          <header className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-700">
            {/* 标题 */}
            <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>

            {/* 元信息行：日期 + 阅读时间 + 难度 */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {/* 日期 */}
              {post.date && (
                <time dateTime={formatDate(post.date)}>
                  {formatDate(post.date)}
                </time>
              )}

              {/* 分隔符 */}
              {post.date && readingTime && <span aria-hidden="true">·</span>}

              {/* 阅读时间 */}
              {readingTime && <span>{readingTime.text}</span>}

              {/* 难度标签 */}
              {diffConfig && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-medium ${diffConfig.className}`}
                  >
                    {diffConfig.label}
                  </span>
                </>
              )}
            </div>

            {/* 标签行 */}
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <Link
                      key={tag}
                      to={`/?tag=${encodeURIComponent(tag)}`}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${color.bg} ${color.text}`}
                    >
                      {tag}
                    </Link>
                  );
                })}
              </div>
            )}
          </header>

          {/* —— 文章正文 —— */}
          <div className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:no-underline prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* —— 最后更新时间 —— */}
          {lastUpdated && (
            <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">
              最后更新于{daysAgo > 0 ? ` ${daysAgo} 天前` : "今天"}
            </p>
          )}

          {/* ============================================================
              底部导航：上/下篇 + 相关文章
              ============================================================ */}
          <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
            {/* 上/下篇导航 */}
            <nav
              aria-label="上下篇文章导航"
              className="flex items-center justify-between gap-4"
            >
              {prevPost ? (
                <Link
                  to={`/posts/${prevPost.slug}`}
                  className="group flex max-w-[45%] items-center gap-2 text-sm text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                >
                  <ChevronLeftIcon className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      上一篇
                    </span>
                    <span className="block truncate">{prevPost.title}</span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextPost && (
                <Link
                  to={`/posts/${nextPost.slug}`}
                  className="group flex max-w-[45%] items-center gap-2 text-right text-sm text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                >
                  <div className="min-w-0">
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      下一篇
                    </span>
                    <span className="block truncate">{nextPost.title}</span>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                </Link>
              )}
            </nav>

            {/* 相关文章 */}
            {relatedPosts.length > 0 && (
              <section className="mt-10">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
                  相关文章
                </h3>
                <ul className="space-y-2">
                  {relatedPosts.map((related) => (
                    <li key={related.slug}>
                      <Link
                        to={`/posts/${related.slug}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="truncate text-gray-700 dark:text-gray-300">
                          {related.title}
                        </span>
                        {related.date && (
                          <time
                            dateTime={formatDate(related.date)}
                            className="ml-4 flex-shrink-0 text-xs text-gray-400 dark:text-gray-500"
                          >
                            {formatDate(related.date)}
                          </time>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </footer>
        </article>

        {/* ============================================================
            右侧：TOC 侧边栏（桌面端可见，移动端隐藏）
            ============================================================ */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <TOC slug={post.slug} />
        </aside>
      </div>

      {/* —— 返回顶部按钮 —— */}
      <BackToTop />
    </>
  );
}
