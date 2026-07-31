import fm from "front-matter";
import postIndexData from "../../generated/posts-index.json";
import { normalizeDifficulty } from "./difficulty.js";

// 元数据来自构建期生成的索引，正文和图片按 slug 动态加载。
const postLoaders = import.meta.glob("/posts/**/index.md", {
  query: "?raw",
  import: "default",
  eager: false,
});

const imageLoaders = import.meta.glob(
  "/posts/**/*.{png,jpg,jpeg,gif,svg,webp}",
  {
    query: "?url",
    import: "default",
    eager: false,
  },
);

let postsCache = null;
let postsBySlugCache = null;
const contentCache = new Map();

function toDate(value) {
  return value ? new Date(value) : null;
}

function normalizeIndexPost(meta) {
  return {
    slug: meta.slug,
    category: meta.category,
    modulePath: meta.modulePath,
    title: meta.title || "",
    date: toDate(meta.date),
    updated: toDate(meta.updated),
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    difficulty: normalizeDifficulty(meta.difficulty),
    leetcode: meta.leetcode || null,
    draft: meta.draft === true,
    excerpt: meta.excerpt || "",
  };
}

function buildAllPosts() {
  return postIndexData.posts
    .map(normalizeIndexPost)
    .filter((post) => !(import.meta.env.PROD && post.draft))
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date - a.date;
    });
}

/**
 * 获取所有已发布文章（元数据），结果在模块内缓存。
 */
export function getAllPosts() {
  if (!postsCache) postsCache = buildAllPosts();
  return postsCache;
}

/**
 * 根据 slug 查找文章元数据。
 */
export function getPostBySlug(slug) {
  if (!postsBySlugCache) {
    postsBySlugCache = new Map(getAllPosts().map((post) => [post.slug, post]));
  }
  return postsBySlugCache.get(slug) ?? null;
}

async function buildImageMap(modulePath) {
  const postDir = modulePath.replace(/\/index\.md$/, "/");
  const entries = Object.entries(imageLoaders).filter(([filePath]) =>
    filePath.startsWith(postDir),
  );

  const map = {};
  await Promise.all(
    entries.map(async ([filePath, loader]) => {
      const url = await loader();
      map[`./${filePath.slice(postDir.length)}`] = url;
    }),
  );
  return map;
}

/**
 * 加载单篇文章的完整正文和图片映射。
 */
export async function loadPostContent(slug) {
  const meta = getPostBySlug(slug);
  if (!meta) return null;
  if (contentCache.has(slug)) return contentCache.get(slug);

  const loader = postLoaders[meta.modulePath];
  if (!loader) return null;

  try {
    const raw = await loader();
    const { body } = fm(raw);
    const imageMap = await buildImageMap(meta.modulePath);
    const post = { ...meta, content: body, imageMap };
    contentCache.set(slug, post);
    return post;
  } catch (error) {
    console.error("[posts] 加载失败:", slug, error);
    return null;
  }
}

/**
 * 根据标签名筛选文章。
 */
export function getPostsByTag(tag) {
  const lowerTag = tag.toLowerCase();
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === lowerTag),
  );
}

/**
 * 搜索文章标题和摘要。
 */
export function searchPosts(query) {
  const lowerQuery = query.toLowerCase();
  return getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery),
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    postsCache = null;
    postsBySlugCache = null;
    contentCache.clear();
  });
}
