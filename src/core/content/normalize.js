export const DIFFICULTY_MAP = {
  简单: "easy",
  中等: "medium",
  困难: "hard",
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

export function normalizeDifficulty(value) {
  return value ? (DIFFICULTY_MAP[value] ?? null) : null;
}

export function deriveSlug(filePath) {
  const slug = filePath
    .replace(/^posts[\\/]/, "")
    .replace(/[\\/]index\.md$/, "");
  return slug
    .split(/[\\/]/)
    .map((segment) => segment.replace(/^\d+-/, ""))
    .join("/");
}

export function deriveCategory(slug) {
  return slug.split("/")[0];
}

export function toDateString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

export function normalizePost({ filePath, data, excerpt = "" }) {
  const slug = deriveSlug(filePath);
  return {
    slug,
    category: deriveCategory(slug),
    modulePath: `/${filePath.split(/[\\/]/).join("/")}`,
    title: data.title || "",
    date: toDateString(data.date),
    updated: toDateString(data.updated),
    tags: Array.isArray(data.tags) ? data.tags : [],
    difficulty: normalizeDifficulty(data.difficulty),
    leetcode: data.leetcode || null,
    draft: data.draft === true,
    excerpt,
  };
}

export function sortPosts(posts, direction = "date-desc") {
  return [...posts].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    const result =
      a.date instanceof Date && b.date instanceof Date
        ? a.date.getTime() - b.date.getTime()
        : String(a.date).localeCompare(String(b.date));
    return direction === "date-asc" ? result : -result;
  });
}

export function publishedPosts(posts) {
  return posts.filter((post) => !post.draft);
}
