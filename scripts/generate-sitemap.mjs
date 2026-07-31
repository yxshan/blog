import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { deriveSlug } from "../src/features/posts/path-utils.js";

/**
 * 递归扫描指定目录，找到所有 index.md 文件
 */
function findMarkdownFiles(dir, baseDir) {
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
  return results;
}

/**
 * 从所有 Markdown 文件中提取元数据，生成 sitemap.xml
 *
 * 使用 Node.js fs API 直接读取 /posts/ 目录，不依赖 import.meta.glob。
 *
 * @param {string} outputDir - 输出目录（如 "dist"）
 */
export function generateSitemap(outputDir) {
  const postsDir = path.resolve("posts");
  const mdFiles = findMarkdownFiles(postsDir, ".");
  const BASE_URL = "https://yxshan.github.io/blog";

  /** @type {Array<{slug: string, date: string}>} */
  const urls = [];

  for (const filePath of mdFiles) {
    const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
    const { data } = matter(raw);

    if (data.draft === true) continue;
    if (!data.date) continue;

    const slug = deriveSlug(filePath);
    const dateStr =
      data.date instanceof Date
        ? data.date.toISOString().split("T")[0]
        : String(data.date).split("T")[0];

    urls.push({ slug, date: dateStr });
  }

  urls.sort((a, b) => b.date.localeCompare(a.date));

  const urlEntries = [`  <url>\n    <loc>${BASE_URL}/</loc>\n  </url>`, ""];

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
  const BASE_URL = "https://yxshan.github.io/blog";
  return `${BASE_URL}/posts/${encodeURI(slug)}`;
}
