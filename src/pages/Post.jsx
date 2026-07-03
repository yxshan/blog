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

function formatDate(date) {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

function daysSince(date) {
  if (!date) return 0;
  return Math.floor(
    (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default function Post() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const allPosts = useMemo(() => getAllPosts(), []);

  const readingTime = useMemo(
    () => (post ? getReadingTime(post.content) : null),
    [post],
  );
  const diffConfig = useMemo(
    () => (post?.difficulty ? DIFFICULTY_CONFIG[post.difficulty] : null),
    [post],
  );

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

  const lastUpdated = post?.updated || post?.date;
  const daysAgo = lastUpdated ? daysSince(lastUpdated) : 0;

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
          className="mt-8 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <>
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

      <ReadingProgress />

      <div className="mx-auto max-w-6xl px-4 py-8 lg:flex lg:gap-8">
        <article className="min-w-0 flex-1">
          <header className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-700">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {post.date && (
                <time dateTime={formatDate(post.date)}>
                  {formatDate(post.date)}
                </time>
              )}
              {post.date && readingTime && <span>·</span>}
              {readingTime && <span>{readingTime.text}</span>}
              {diffConfig && (
                <>
                  <span>·</span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-medium ${diffConfig.className}`}
                  >
                    {diffConfig.label}
                  </span>
                </>
              )}
            </div>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => {
                  const c = getTagColor(tag);
                  return (
                    <Link
                      key={tag}
                      to={`/?tag=${encodeURIComponent(tag)}`}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${c.bg} ${c.text}`}
                    >
                      {tag}
                    </Link>
                  );
                })}
              </div>
            )}
          </header>

          <div className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-code:before:content-none prose-code:after:content-none">
            <MarkdownRenderer content={post.content} />
          </div>

          {lastUpdated && (
            <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">
              最后更新于{daysAgo > 0 ? ` ${daysAgo} 天前` : "今天"}
            </p>
          )}

          <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
            <nav className="flex items-center justify-between gap-4">
              {prevPost ? (
                <Link
                  to={`/posts/${prevPost.slug}`}
                  className="group flex max-w-[45%] items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400"
                >
                  <ChevronLeftIcon className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs text-gray-400">上一篇</span>
                    <span className="block truncate">{prevPost.title}</span>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextPost && (
                <Link
                  to={`/posts/${nextPost.slug}`}
                  className="group flex max-w-[45%] items-center gap-2 text-right text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400"
                >
                  <div className="min-w-0">
                    <span className="block text-xs text-gray-400">下一篇</span>
                    <span className="block truncate">{nextPost.title}</span>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                </Link>
              )}
            </nav>
            {relatedPosts.length > 0 && (
              <section className="mt-10">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
                  相关文章
                </h3>
                <ul className="space-y-2">
                  {relatedPosts.map((r) => (
                    <li key={r.slug}>
                      <Link
                        to={`/posts/${r.slug}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="truncate text-gray-700 dark:text-gray-300">
                          {r.title}
                        </span>
                        {r.date && (
                          <time className="ml-4 flex-shrink-0 text-xs text-gray-400">
                            {formatDate(r.date)}
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
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <TOC slug={post.slug} />
        </aside>
      </div>
      <BackToTop />
    </>
  );
}
