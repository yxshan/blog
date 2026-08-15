import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { siteConfig } from "../src/core/config/siteConfig";
import { publishedPosts } from "../src/core/content/normalize";
import { loadPostSources, PROJECT_ROOT } from "../src/core/content/source";

function escapeXml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateRss(outputDir = path.join(PROJECT_ROOT, "dist")): void {
  const baseUrl = `${siteConfig.siteUrl}${siteConfig.basePath}`;
  const posts = publishedPosts(loadPostSources());
  const items = posts
    .map((post) => {
      const link = `${baseUrl}/posts/${encodeURI(post.slug)}`;
      const pubDate = post.date
        ? new Date(`${post.date}T00:00:00Z`).toUTCString()
        : new Date(0).toUTCString();
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid>${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>yxshan's Blog</title>",
    `    <link>${baseUrl}/</link>`,
    "    <description>算法题解、数据结构与考研笔记</description>",
    `    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "feed.xml");
  fs.writeFileSync(outputPath, `${xml}\n`, "utf-8");
  console.log(`[rss] 已生成: ${outputPath}（${posts.length} 篇）`);
}

export function generateRobots(
  outputDir = path.join(PROJECT_ROOT, "dist"),
): void {
  const baseUrl = `${siteConfig.siteUrl}${siteConfig.basePath}`;
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "robots.txt");
  const content = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join("\n");
  fs.writeFileSync(outputPath, `${content}\n`, "utf-8");
  console.log(`[robots] 已生成: ${outputPath}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  generateRss();
  generateRobots();
}
