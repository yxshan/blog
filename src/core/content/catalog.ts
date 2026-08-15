import postsIndexData from "../../generated/posts-index.json";
import searchIndexData from "../../generated/search-index.json";
import type {
  PostCatalog,
  PostMeta,
  PostQuery,
  RuntimePost,
  SearchDocument,
} from "../contracts";
import { publishedPosts, sortPosts } from "./normalize";

type CatalogOptions = { includeDrafts?: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isDateOnly(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function parsePostMeta(value: unknown): PostMeta {
  if (!isRecord(value)) throw new TypeError("文章索引项必须是对象");
  const difficulty = value.difficulty;
  const validDifficulty =
    difficulty === null ||
    difficulty === "easy" ||
    difficulty === "medium" ||
    difficulty === "hard";
  if (
    typeof value.slug !== "string" ||
    typeof value.category !== "string" ||
    typeof value.title !== "string" ||
    !isDateOnly(value.date) ||
    !isDateOnly(value.updated) ||
    !Array.isArray(value.tags) ||
    !value.tags.every((tag) => typeof tag === "string") ||
    !validDifficulty ||
    !isNullableString(value.leetcode) ||
    typeof value.draft !== "boolean" ||
    typeof value.excerpt !== "string" ||
    typeof value.modulePath !== "string"
  ) {
    throw new TypeError(
      `文章索引项结构无效: ${String(value.slug ?? "unknown")}`,
    );
  }
  return {
    slug: value.slug,
    category: value.category,
    title: value.title,
    date: value.date,
    updated: value.updated,
    tags: value.tags,
    difficulty,
    leetcode: value.leetcode,
    draft: value.draft,
    excerpt: value.excerpt,
    modulePath: value.modulePath,
  };
}

function parseGeneratedPosts(value: unknown): PostMeta[] {
  if (!isRecord(value) || !Array.isArray(value.posts)) {
    throw new TypeError("文章索引必须包含 posts 数组");
  }
  const posts = value.posts.map(parsePostMeta);
  const slugs = new Set(posts.map((post) => post.slug));
  if (slugs.size !== posts.length) {
    throw new TypeError("文章索引包含重复 slug");
  }
  return posts;
}

function parseSearchDocuments(value: unknown): SearchDocument[] {
  if (!isRecord(value) || !Array.isArray(value.posts)) {
    throw new TypeError("搜索索引必须包含 posts 数组");
  }
  return value.posts.map((item) => {
    const meta = parsePostMeta(item);
    if (!isRecord(item) || typeof item.searchText !== "string") {
      throw new TypeError(`搜索索引项缺少 searchText: ${meta.slug}`);
    }
    return { ...meta, searchText: item.searchText };
  });
}

function toRuntimePost(post: PostMeta, searchText: string): RuntimePost {
  return {
    ...post,
    date: post.date ? new Date(`${post.date}T00:00:00Z`) : null,
    updated: post.updated ? new Date(`${post.updated}T00:00:00Z`) : null,
    searchText,
  };
}

const indexedPosts = parseGeneratedPosts(postsIndexData);
const searchablePosts = parseSearchDocuments(searchIndexData);
const indexedSlugs = new Set(indexedPosts.map((post) => post.slug));
const searchableSlugs = new Set(searchablePosts.map((post) => post.slug));
if (
  indexedSlugs.size !== searchablePosts.length ||
  [...indexedSlugs].some((slug) => !searchableSlugs.has(slug))
) {
  throw new TypeError("文章索引与搜索索引的 slug 集合不一致");
}
const searchTextBySlug = new Map(
  searchablePosts.map((post) => [post.slug, post.searchText]),
);
const allPosts = indexedPosts.map((post) =>
  toRuntimePost(post, searchTextBySlug.get(post.slug) ?? ""),
);

function getAvailablePosts({
  includeDrafts = import.meta.env.DEV,
}: CatalogOptions = {}): RuntimePost[] {
  return includeDrafts ? [...allPosts] : publishedPosts(allPosts);
}

function paginate(posts: RuntimePost[], query: PostQuery): RuntimePost[] {
  const { page, pageSize } = query;
  if (!page || !pageSize || page < 1 || pageSize < 1) return posts;
  const start = (page - 1) * pageSize;
  return posts.slice(start, start + pageSize);
}

export const postCatalog: PostCatalog = Object.freeze({
  listAll(options: CatalogOptions = {}) {
    return sortPosts(getAvailablePosts(options));
  },

  listPublished() {
    return sortPosts(getAvailablePosts({ includeDrafts: false }));
  },

  findBySlug(slug: string, options: CatalogOptions = {}) {
    if (!slug) return null;
    return (
      getAvailablePosts(options).find((post) => post.slug === slug) ?? null
    );
  },

  query(query: PostQuery = {}, options: CatalogOptions = {}) {
    const { text = "", tags = [], category = null, sort = "date-desc" } = query;
    const normalizedText = text.trim().toLocaleLowerCase();
    const selectedTags = tags.filter(Boolean);
    const posts = getAvailablePosts(options).filter((post) => {
      const matchesText =
        !normalizedText ||
        [post.title, post.excerpt, post.searchText].some((value) =>
          value.toLocaleLowerCase().includes(normalizedText),
        );
      const matchesTags = selectedTags.every((tag) => post.tags.includes(tag));
      const matchesCategory = !category || post.category === category;
      return matchesText && matchesTags && matchesCategory;
    });
    return paginate(sortPosts(posts, sort), query);
  },
});

export function getAllPosts(options?: CatalogOptions): RuntimePost[] {
  return postCatalog.listAll(options);
}
