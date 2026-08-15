export function filterPosts(posts, { tags = [], category = null } = {}) {
  return posts.filter((post) => {
    const matchesTags = tags.every((tag) => post.tags.includes(tag));
    return matchesTags && (!category || post.category === category);
  });
}

export function collectTags(posts) {
  const counts = new Map();
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}
