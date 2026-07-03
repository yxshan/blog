import { useState, useMemo } from "react";
import SearchBar from "../features/search/SearchBar";
import TagFilter from "../features/tags/TagFilter";
import VirtualList from "../shared/VirtualList";
import { ArticleCard } from "../shared/ArticleCard";
import useSearch from "../features/search/useSearch";
import { getAllPosts } from "../features/posts/api";

/**
 * 首页 — 搜索、标签筛选与虚拟滚动文章列表的组合页面
 *
 * 数据流：
 *   getAllPosts() → 全部文章（基准数据）
 *   useSearch()   → 搜索词 + 搜索结果（模糊匹配，Fuse.js）
 *   TagFilter     → 用户选择的标签列表（组件内部调用 useTags）
 *
 * 筛选逻辑（取交集）：
 *   1. 搜索有结果 → 以搜索结果为基准；搜索为空 → 以全部文章为基准
 *   2. 有已选标签 → 进一步筛选包含至少一个已选标签的文章
 *   3. 按日期降序排列（getAllPosts 已保证）
 */
export default function Home() {
  // ============================================================
  // 搜索状态 — useSearch 内部管理 query 与 results
  // results 为 null 表示未搜索；非 null 时为匹配文章数组
  // ============================================================
  const { query, setQuery, results } = useSearch();

  // ============================================================
  // 标签筛选状态 — 由 TagFilter 组件驱动的已选标签数组
  // ============================================================
  const [selectedTags, setSelectedTags] = useState([]);

  // ============================================================
  // 获取全部文章（仅在组件挂载时计算一次）
  // ============================================================
  const allPosts = useMemo(() => getAllPosts(), []);

  // ============================================================
  // 标签切换处理：已选则移除，未选则添加
  // ============================================================
  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // ============================================================
  // 计算最终展示的文章列表 — 搜索 + 标签取交集
  // ============================================================
  const filteredPosts = useMemo(() => {
    // 第一步：确定搜索基准
    //   results !== null → 用户正在搜索，以搜索结果为基准
    //   results === null → 搜索词为空，以全部文章为基准
    const basePosts = results !== null ? results : allPosts;

    // 第二步：标签筛选
    //   有已选标签时，仅保留包含至少一个已选标签的文章
    //   无已选标签时，跳过此步
    if (selectedTags.length === 0) return basePosts;

    return basePosts.filter((post) =>
      post.tags.some((tag) => selectedTags.includes(tag)),
    );
  }, [allPosts, results, selectedTags]);

  // ============================================================
  // 单篇文章的渲染函数，传递给 VirtualList
  // ============================================================
  const renderItem = (post) => (
    <div className="px-1 py-2">
      <ArticleCard post={post} />
    </div>
  );

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-4">
      {/* 搜索栏 */}
      <div className="mb-6">
        <SearchBar query={query} onQueryChange={setQuery} />
      </div>

      {/* 标签筛选按钮组 */}
      <div className="mb-6">
        <TagFilter selectedTags={selectedTags} onToggleTag={handleToggleTag} />
      </div>

      {/* 结果计数提示 */}
      {results !== null ? (
        <p className="mb-4 text-sm text-gray-500">
          搜索「{query}」找到 {filteredPosts.length} 篇结果
        </p>
      ) : (
        <p className="mb-4 text-sm text-gray-500">
          共 {filteredPosts.length} 篇文章
        </p>
      )}

      {/* 文章列表（虚拟滚动）或空状态 */}
      {filteredPosts.length > 0 ? (
        <div className="flex-1">
          <VirtualList items={filteredPosts} renderItem={renderItem} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-400">没有找到匹配的文章</p>
        </div>
      )}
    </div>
  );
}
