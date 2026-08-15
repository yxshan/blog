import Fuse from "fuse.js";

export interface SearchablePost {
  title: string;
  excerpt: string;
  searchText: string;
}

export interface PostSearcher<T extends SearchablePost> {
  search(text: string): T[];
}

export function createPostSearcher<T extends SearchablePost>(
  posts: readonly T[],
): PostSearcher<T> {
  const source = [...posts];
  const fuse = new Fuse(source, {
    keys: ["title", "excerpt", "searchText"],
    threshold: 0.3,
  });

  return {
    search(text: string): T[] {
      const query = text.trim();
      return query ? fuse.search(query).map(({ item }) => item) : source;
    },
  };
}
