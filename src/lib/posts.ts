import fs from "node:fs";
import fm from "front-matter";
import type { RuntimePost } from "../core/contracts";
import { resolveProjectPath } from "../core/content/source";
import {
  getAllPosts,
  getPostBySlug,
  postCatalog,
} from "../core/content/catalog";

export { getAllPosts, getPostBySlug, postCatalog };

export function readPostMarkdown(post: RuntimePost): string {
  return fs.readFileSync(
    resolveProjectPath(post.modulePath.replace(/^\//, "")),
    "utf-8",
  );
}

export function readPostBody(post: RuntimePost): string {
  return fm<{ [key: string]: unknown }>(readPostMarkdown(post)).body;
}
