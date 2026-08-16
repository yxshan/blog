import fs from "node:fs";
import fm from "front-matter";
import type { RuntimePost } from "../core/contracts";
import { normalizePostBody } from "../core/content/body";
import { resolveProjectPath } from "../core/content/source";
import { getAllPosts } from "../core/content/catalog";

export { getAllPosts };

function readPostMarkdown(post: RuntimePost): string {
  return fs.readFileSync(
    resolveProjectPath(post.modulePath.replace(/^\//, "")),
    "utf-8",
  );
}

export function readPostBody(post: RuntimePost): string {
  const body = fm<{ [key: string]: unknown }>(readPostMarkdown(post)).body;
  return normalizePostBody(body, { title: post.title, tags: post.tags });
}
