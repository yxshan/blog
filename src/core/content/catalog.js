import postsIndexData from "../../generated/posts-index.json";
import searchIndexData from "../../generated/search-index.json";
import { publishedPosts, sortPosts } from "./normalize.js";

function toPost(post) {
  return {
    ...post,
    date: post.date ? new Date(`${post.date}T00:00:00`) : null,
    updated: post.updated ? new Date(`${post.updated}T00:00:00`) : null,
  };
}

const searchTextBySlug = new Map(
  searchIndexData.posts.map((post) => [post.slug, post.searchText || ""]),
);
const allPosts = postsIndexData.posts.map((post) => ({
  ...toPost(post),
  searchText: searchTextBySlug.get(post.slug) || "",
}));

function getAvailablePosts({ includeDrafts = import.meta.env.DEV } = {}) {
  return includeDrafts ? allPosts : publishedPosts(allPosts);
}

export const postCatalog = Object.freeze({
  listAll({ includeDrafts = import.meta.env.DEV } = {}) {
    return sortPosts(getAvailablePosts({ includeDrafts }));
  },

  listPublished() {
    return sortPosts(getAvailablePosts({ includeDrafts: false }));
  },

  findBySlug(slug, { includeDrafts = import.meta.env.DEV } = {}) {
    return (
      getAvailablePosts({ includeDrafts }).find((post) => post.slug === slug) ||
      null
    );
  },

  query(
    { text = "", tags = [], category = null, sort = "date-desc" } = {},
    options = {},
  ) {
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
    return sortPosts(posts, sort);
  },
});

export const getAllPosts = (...args) => postCatalog.listAll(...args);
export const getPostBySlug = (...args) => postCatalog.findBySlug(...args);
