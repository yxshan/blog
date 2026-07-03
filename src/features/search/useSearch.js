import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { getAllPosts } from "../posts/api";

/**
 * 搜索 hook — 基于 Fuse.js 的客户端全文搜索
 *
 * - query 为空字符串时 results 返回 null（由外部组件决定展示全部或空态）
 * - query 非空时执行模糊搜索，返回匹配的文章列表
 * - 输入防抖 300ms，避免高频重建索引
 */
export default function useSearch() {
  const [query, setQuery] = useState("");

  // 获取所有文章数据
  const posts = getAllPosts();

  // 创建 Fuse 实例，仅在 posts 变化时重建
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "excerpt"],
        threshold: 0.3,
      }),
    [posts],
  );

  // 防抖后的搜索结果
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    // 300ms 防抖
    const timer = setTimeout(() => {
      const hits = fuse.search(query.trim()).map((r) => r.item);
      setResults(hits);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fuse]);

  return { query, setQuery, results };
}
