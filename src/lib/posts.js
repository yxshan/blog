import fs from "node:fs";
import path from "node:path";
import fm from "front-matter";
import {
  getAllPosts,
  getPostBySlug,
  postCatalog,
} from "../core/content/catalog.js";

export { getAllPosts, getPostBySlug, postCatalog };

export function readPostMarkdown(post) {
  const filePath = path.resolve(".", post.modulePath.slice(1));
  return fs.readFileSync(filePath, "utf-8");
}

export function readPostBody(post) {
  return fm(readPostMarkdown(post)).body;
}
