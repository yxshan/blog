import type { Difficulty, PostMeta, PostSort } from "../contracts";

export const DIFFICULTY_MAP = {
  简单: "easy",
  中等: "medium",
  困难: "hard",
  easy: "easy",
  medium: "medium",
  hard: "hard",
} as const satisfies Record<string, Difficulty>;

export function normalizeDifficulty(value?: unknown): Difficulty | null {
  if (typeof value !== "string") return null;
  return DIFFICULTY_MAP[value as keyof typeof DIFFICULTY_MAP] ?? null;
}

export function deriveSlug(filePath: string): string {
  const slug = filePath
    .replace(/^posts[\\/]/, "")
    .replace(/[\\/]index\.md$/, "");
  return slug
    .split(/[\\/]/)
    .map((segment) => segment.replace(/^\d+-/, ""))
    .join("/");
}

function deriveCategory(slug: string): string {
  return slug.split("/")[0] ?? "";
}

function toDateString(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0] ?? null;
}

interface NormalizePostInput {
  filePath: string;
  data: Record<string, unknown>;
  excerpt?: string;
}

export function normalizePost({
  filePath,
  data,
  excerpt = "",
}: NormalizePostInput): PostMeta {
  const slug = deriveSlug(filePath);
  return {
    slug,
    category: deriveCategory(slug),
    modulePath: `/${filePath.split(/[\\/]/).join("/")}`,
    title: typeof data.title === "string" ? data.title : "",
    date: toDateString(data.date),
    updated: toDateString(data.updated),
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    difficulty: normalizeDifficulty(data.difficulty),
    leetcode: typeof data.leetcode === "string" ? data.leetcode : null,
    draft: data.draft === true,
    excerpt,
  };
}

type DatedPost = { date: string | Date | null };

export function sortPosts<T extends DatedPost>(
  posts: readonly T[],
  direction: PostSort = "date-desc",
): T[] {
  if (direction === "relevance") return [...posts];
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

export function publishedPosts<T extends { draft: boolean }>(
  posts: readonly T[],
): T[] {
  return posts.filter((post) => !post.draft);
}
