import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { extractExcerpt } from "../src/features/posts/excerpt.js";
import { normalizeDifficulty } from "../src/features/posts/difficulty.js";
import { deriveSlug } from "../src/features/posts/path-utils.js";

function findMarkdownFiles(dir, baseDir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath, baseDir));
    } else if (entry.name === "index.md") {
      results.push(path.relative(baseDir, fullPath));
    }
  }
  return results;
}

function toDateString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

export function generatePostIndex() {
  const postsDir = path.resolve("posts");
  const mdFiles = findMarkdownFiles(postsDir, ".");
  const posts = [];

  for (const filePath of mdFiles) {
    const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
    const { data, content } = matter(raw);
    const slug = deriveSlug(filePath);
    const modulePath = `/${filePath.split(/[\\/]/).join("/")}`;

    posts.push({
      slug,
      category: slug.split("/")[0],
      modulePath,
      title: data.title || "",
      date: toDateString(data.date),
      updated: toDateString(data.updated),
      tags: Array.isArray(data.tags) ? data.tags : [],
      difficulty: normalizeDifficulty(data.difficulty),
      leetcode: data.leetcode || null,
      draft: data.draft === true,
      excerpt: extractExcerpt(content),
    });
  }

  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  const outputPath = path.resolve("src/generated/posts-index.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ posts }, null, 2)}\n`,
    "utf-8",
  );

  console.log(`[posts-index] 已生成: ${outputPath}（${posts.length} 篇文章）`);
  return posts.length;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  generatePostIndex();
}
