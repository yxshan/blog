import fs from "node:fs";
import path from "node:path";
import fm from "front-matter";
import indexData from "../generated/posts-index.json";

export function getAllPosts() {
  return indexData.posts
    .filter((post) => !(import.meta.env.PROD && post.draft))
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
}

export function getPostBySlug(slug) {
  return getAllPosts().find((post) => post.slug === slug) || null;
}

export function readPostMarkdown(post) {
  const filePath = path.resolve(".", post.modulePath.slice(1));
  return fs.readFileSync(filePath, "utf-8");
}

export function readPostBody(post) {
  return fm(readPostMarkdown(post)).body;
}
