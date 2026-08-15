import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import type { PostDocument, PostSource } from "../contracts";
import { extractExcerpt } from "./excerpt";
import { normalizePost } from "./normalize";

export const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

export function resolveProjectPath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(PROJECT_ROOT, filePath);
}

export function findMarkdownFiles(
  dir: string,
  baseDir: string = PROJECT_ROOT,
): string[] {
  const results: string[] = [];
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

export function parsePostFile(filePath: string): PostSource {
  const raw = fs.readFileSync(resolveProjectPath(filePath), "utf-8");
  const parsed = matter(raw);
  return {
    filePath,
    frontmatter: parsed.data as Record<string, unknown>,
    content: parsed.content,
  };
}

function readPostSource(filePath: string): PostDocument {
  const source = parsePostFile(filePath);
  return {
    ...normalizePost({
      filePath: source.filePath,
      data: source.frontmatter,
      excerpt: extractExcerpt(source.content),
    }),
    content: source.content,
  };
}

export function loadPostSources(
  postsDir: string = path.join(PROJECT_ROOT, "posts"),
): PostDocument[] {
  return findMarkdownFiles(postsDir).map(readPostSource);
}
