import { useEffect, useMemo, useState } from "react";
import { postCatalog } from "../../core/content/catalog";
import SearchBar from "../../features/search/SearchBar";
import TagFilter from "../../features/tags/TagFilter";
import { createPostSearcher } from "../../features/search/postSearch";
import {
  clearTags,
  readQueryState,
  serializeQueryState,
  toggleTag,
  updateQueryState,
} from "../../features/home/queryState";
import { collectTags, filterPosts } from "../../features/home/postFilter";
import PostList from "./PostList";

export default function HomeApp() {
  const [queryState, setQueryState] = useState(() => readQueryState(""));
  const [query, setQuery] = useState(queryState.text);
  const [results, setResults] = useState(null);

  const posts = useMemo(() => postCatalog.listPublished(), []);
  const searcher = useMemo(() => createPostSearcher(posts), [posts]);

  useEffect(() => {
    const next = readQueryState(window.location.search);
    setQueryState(next);
    setQuery(next.text);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      setResults(searcher.search(query));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searcher]);

  const tags = useMemo(() => collectTags(posts), [posts]);

  const filteredPosts = useMemo(
    () =>
      filterPosts(results !== null ? results : posts, {
        tags: queryState.tags,
        category: queryState.category,
      }),
    [posts, queryState.category, queryState.tags, results],
  );

  function syncParams(next) {
    const search = serializeQueryState(next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}`,
    );
    setQueryState(readQueryState(`?${search}`));
  }

  const handleToggleTag = (tag) => {
    syncParams(toggleTag(window.location.search, tag));
  };

  const handleClearTags = () => {
    syncParams(clearTags(window.location.search));
  };

  const handleCategory = (category) => {
    syncParams(updateQueryState(window.location.search, { category }));
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    syncParams(updateQueryState(window.location.search, { q: value }));
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-4">
      <div className="mb-6">
        <SearchBar
          query={query}
          onQueryChange={handleQueryChange}
          autoFocus={queryState.focus}
        />
      </div>

      <div className="mb-6">
        <TagFilter
          selectedTags={queryState.tags}
          onToggleTag={handleToggleTag}
          onClear={handleClearTags}
          tags={tags}
        />
      </div>

      {queryState.category && (
        <button
          type="button"
          onClick={() => handleCategory(null)}
          className="mb-4 inline-flex items-center gap-1 self-start rounded-full px-3 py-1 text-xs text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          分类：{queryState.category} ×
        </button>
      )}

      <p className="mb-4 text-sm text-gray-500">
        {results !== null
          ? `搜索「${query}」找到 ${filteredPosts.length} 篇结果`
          : `共 ${filteredPosts.length} 篇文章`}
      </p>

      <PostList posts={filteredPosts} />
    </div>
  );
}
