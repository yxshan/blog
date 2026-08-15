import fs from "node:fs";
import path from "node:path";
import { publishedPosts } from "../src/core/content/normalize";
import { loadPostSources, PROJECT_ROOT } from "../src/core/content/source";

const distDir = path.join(PROJECT_ROOT, "dist");
const requiredFiles = [
  "index.html",
  "404.html",
  "feed.xml",
  "robots.txt",
  "sitemap.xml",
  "posts/algorithm/reverse-list/index.html",
];
const expectedPostCount = publishedPosts(loadPostSources()).length;
const publicSourceMaps = fs
  .readdirSync(distDir, { recursive: true, encoding: "utf-8" })
  .filter((filePath) => filePath.endsWith(".map"));

if (publicSourceMaps.length > 0) {
  throw new Error(
    `公开构建产物包含 source map: ${publicSourceMaps.join(", ")}`,
  );
}

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(distDir, relativePath))) {
    throw new Error(`构建产物缺失: ${relativePath}`);
  }
}

const indexHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
if (!indexHtml.includes("/blog/")) {
  throw new Error("首页未包含 /blog/ 基础路径");
}

const postHtml = fs.readFileSync(
  path.join(distDir, "posts/algorithm/reverse-list/index.html"),
  "utf-8",
);
if (
  !postHtml.includes("反转链表") ||
  postHtml.includes("#/posts/") ||
  postHtml.includes("NaN") ||
  (postHtml.match(/<h1\b/g) ?? []).length !== 1 ||
  !postHtml.includes("文章信息") ||
  !postHtml.includes(">正文<") ||
  !postHtml.includes('id="toc"')
) {
  throw new Error("文章静态入口或 canonical 路径异常");
}

const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
const sitemapPostCount = (sitemap.match(/<loc>[^<]+\/posts\//g) ?? []).length;
if (
  !sitemap.includes("/blog/posts/algorithm/reverse-list") ||
  sitemapPostCount !== expectedPostCount
) {
  throw new Error("sitemap 未包含文章 URL");
}

const feed = fs.readFileSync(path.join(distDir, "feed.xml"), "utf-8");
const feedPostCount = (feed.match(/<item>/g) ?? []).length;
if (feedPostCount !== expectedPostCount) {
  throw new Error(`RSS 文章数异常: ${feedPostCount}`);
}

const generatedPostFiles = fs
  .readdirSync(path.join(distDir, "posts"), {
    recursive: true,
    encoding: "utf-8",
  })
  .filter((filePath) => filePath.endsWith("index.html"));
if (generatedPostFiles.length !== expectedPostCount) {
  throw new Error(`静态文章路由数异常: ${generatedPostFiles.length}`);
}

console.log(
  `[smoke] ${expectedPostCount} 篇文章的静态入口、RSS、sitemap 和基础路径校验通过`,
);
