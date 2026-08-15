interface FilterablePost {
  category: string;
  tags: string[];
}

interface PostFilter {
  tags?: string[];
  category?: string | null;
}

export interface TagCount {
  name: string;
  count: number;
}

function compareText(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function filterPosts<T extends FilterablePost>(
  posts: readonly T[],
  { tags = [], category = null }: PostFilter = {},
): T[] {
  return posts.filter((post) => {
    const matchesTags = tags.every((tag) => post.tags.includes(tag));
    return matchesTags && (!category || post.category === category);
  });
}

export function collectTags(posts: readonly FilterablePost[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || compareText(a[0], b[0]))
    .map(([name, count]) => ({ name, count }));
}
