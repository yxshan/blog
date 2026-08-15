import Fuse from "fuse.js";

export function createPostSearcher(posts) {
  const fuse = new Fuse(posts, {
    keys: ["title", "excerpt", "searchText"],
    threshold: 0.3,
  });

  return {
    search(text) {
      const query = text.trim();
      return query ? fuse.search(query).map(({ item }) => item) : posts;
    },
  };
}
