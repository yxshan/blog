import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import searchIndexData from "../../generated/search-index.json";
import SearchBar from "../../features/search/SearchBar";
import TagFilter from "../../features/tags/TagFilter";
import { clearTagParams, toggleTagParam } from "../../features/tags/tagParams";
import StaticArticleCard from "./StaticArticleCard";

function toPost(meta) {
  return {
    ...meta,
    date: meta.date ? new Date(meta.date) : null,
    updated: meta.updated ? new Date(meta.updated) : null,
  };
}

export default function HomeApp() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const posts = useMemo(() => searchIndexData.posts.map(toPost), []);
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "excerpt", "content"],
        threshold: 0.3,
      }),
    [posts],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedTags(params.getAll("tag"));
    setSelectedCategory(params.get("category"));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      setResults(fuse.search(query.trim()).map((item) => item.item));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fuse]);

  const tags = useMemo(() => {
    const counts = new Map();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let base = results !== null ? results : posts;
    if (selectedTags.length > 0) {
      base = base.filter((post) =>
        selectedTags.every((tag) => post.tags.includes(tag)),
      );
    }
    if (selectedCategory) {
      base = base.filter((post) => post.category === selectedCategory);
    }
    return base;
  }, [posts, results, selectedTags, selectedCategory]);

  function syncParams(mutator) {
    const params = new URLSearchParams(window.location.search);
    const next = mutator(params) || params;
    const search = next.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}`,
    );
    setSelectedTags(next.getAll("tag"));
    setSelectedCategory(next.get("category"));
  }

  const handleToggleTag = (tag) => {
    syncParams((params) => toggleTagParam(params, tag));
  };

  const clearTags = () => {
    syncParams(clearTagParams);
  };

  const handleCategory = (category) => {
    syncParams((params) => {
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
    });
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-4">
      <div className="mb-6">
        <SearchBar query={query} onQueryChange={setQuery} autoFocus={false} />
      </div>

      <div className="mb-6">
        <TagFilter
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onClear={clearTags}
          tags={tags}
        />
      </div>

      {selectedCategory && (
        <button
          type="button"
          onClick={() => handleCategory(null)}
          className="mb-4 inline-flex items-center gap-1 self-start rounded-full px-3 py-1 text-xs text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          分类：{selectedCategory} ×
        </button>
      )}

      <p className="mb-4 text-sm text-gray-500">
        {results !== null
          ? `搜索「${query}」找到 ${filteredPosts.length} 篇结果`
          : `共 ${filteredPosts.length} 篇文章`}
      </p>

      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <StaticArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-gray-400">没有找到匹配的文章</p>
      )}
    </div>
  );
}
