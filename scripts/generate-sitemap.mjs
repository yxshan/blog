import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadPostSources } from "../src/core/content/source.mjs";
import { publishedPosts } from "../src/core/content/normalize.js";
import { siteConfig } from "../src/core/config/siteConfig.js";

const SITE_URL = `${siteConfig.siteUrl}${siteConfig.basePath}`;

/**
 * 从所有 Markdown 文件中提取元数据，生成 sitemap.xml
 *
 * 使用 Node.js fs API 直接读取 /posts/ 目录，不依赖 import.meta.glob。
 *
 * @param {string} outputDir - 输出目录（如 "dist"）
 */
export function generateSitemap(outputDir) {
  /** @type {Array<{slug: string, date: string}>} */
  const urls = [];

  for (const post of publishedPosts(loadPostSources())) {
    if (!post.date) continue;
    urls.push({ slug: post.slug, date: post.date });
  }

  urls.sort((a, b) => b.date.localeCompare(a.date));

  const urlEntries = [`  <url>\n    <loc>${SITE_URL}/</loc>\n  </url>`, ""];

  for (const { slug, date } of urls) {
    urlEntries.push(
      `  <url>\n    <loc>${buildSitemapUrl(slug)}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`,
    );
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlEntries,
    "</urlset>",
  ].join("\n");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "sitemap.xml");
  fs.writeFileSync(outputPath, xml, "utf-8");
  console.log(`[sitemap] 已生成: ${outputPath}（${urls.length} 篇文章）`);
}

export function buildSitemapUrl(slug) {
  return `${SITE_URL}/posts/${encodeURI(slug)}`;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  generateSitemap("dist");
}
