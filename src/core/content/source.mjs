import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { extractExcerpt } from "../../features/posts/excerpt.js";
import { normalizePost } from "./normalize.js";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

function resolveProjectPath(filePath) {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(PROJECT_ROOT, filePath);
}

export function findMarkdownFiles(dir, baseDir = PROJECT_ROOT) {
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
  return results.sort();
}

export function readPostSource(filePath) {
  const { data, content } = parsePostFile(filePath);
  return {
    ...normalizePost({ filePath, data, excerpt: extractExcerpt(content) }),
    content,
  };
}

export function parsePostFile(filePath) {
  const raw = fs.readFileSync(resolveProjectPath(filePath), "utf-8");
  return matter(raw);
}

export function loadPostSources(postsDir = path.join(PROJECT_ROOT, "posts")) {
  return findMarkdownFiles(postsDir).map(readPostSource);
}
