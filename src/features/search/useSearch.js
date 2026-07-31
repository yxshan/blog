import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import searchIndexData from "../../generated/search-index.json";

/**
 * 搜索 hook — 基于 Fuse.js 的客户端全文搜索
 *
 * - query 为空字符串时 results 返回 null（由外部组件决定展示全部或空态）
 * - query 非空时执行模糊搜索，返回匹配的文章列表
 * - 输入防抖 300ms，避免高频重建索引
 */
export default function useSearch() {
  const [query, setQueryValue] = useState("");
  const [results, setResults] = useState(null);

  // 获取全文搜索索引
  const posts = useMemo(
    () =>
      searchIndexData.posts.map((post) => ({
        ...post,
        date: post.date ? new Date(post.date) : null,
        updated: post.updated ? new Date(post.updated) : null,
      })),
    [],
  );

  // 创建 Fuse 实例，仅在 posts 变化时重建
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "excerpt", "content"],
        threshold: 0.3,
      }),
    [posts],
  );

  const setQuery = (next) => {
    if (!next.trim()) setResults(null);
    setQueryValue(next);
  };

  useEffect(() => {
    if (!query.trim()) return;

    // 300ms 防抖
    const timer = setTimeout(() => {
      const hits = fuse.search(query.trim()).map((r) => r.item);
      setResults(hits);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fuse]);

  return { query, setQuery, results };
}
