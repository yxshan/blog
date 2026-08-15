import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const requiredFiles = [
  "index.html",
  "404.html",
  "feed.xml",
  "robots.txt",
  "sitemap.xml",
  "posts/algorithm/reverse-list/index.html",
];

for (const relativePath of requiredFiles) {
  const filePath = path.join(distDir, relativePath);
  if (!fs.existsSync(filePath)) {
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
if (!postHtml.includes("反转链表") || postHtml.includes("#/posts/")) {
  throw new Error("文章静态入口或 canonical 路径异常");
}

const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
if (!sitemap.includes("/blog/posts/algorithm/reverse-list")) {
  throw new Error("sitemap 未包含文章 URL");
}

console.log("[smoke] 静态入口、基础路径、文章入口和 sitemap 校验通过");
