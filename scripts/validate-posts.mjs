import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DIFFICULTY_MAP, deriveSlug } from "../src/core/content/normalize.js";
import {
  findMarkdownFiles,
  parsePostFile,
} from "../src/core/content/source.mjs";

const ALLOWED_DIFFICULTY = Object.keys(DIFFICULTY_MAP);

function validatePost(filePath, errors) {
  const { data, content } = parsePostFile(filePath);

  if (
    !/^posts\/[^/\s]+\/\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\/index\.md$/.test(
      filePath,
    )
  ) {
    errors.push(`${filePath}: 路径必须符合 posts/<分类>/NNN-slug/index.md`);
  }
  if (!data.title) errors.push(`${filePath}: 缺少必填字段 title`);
  if (!data.date) errors.push(`${filePath}: 缺少必填字段 date`);
  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push(`${filePath}: tags 必须是至少包含一项的数组`);
  }
  if (data.difficulty && !ALLOWED_DIFFICULTY.includes(data.difficulty)) {
    errors.push(
      `${filePath}: difficulty 必须是 ${ALLOWED_DIFFICULTY.join(" / ")}`,
    );
  }

  const date = data.date ? new Date(data.date) : null;
  if (date && Number.isNaN(date.getTime())) {
    errors.push(`${filePath}: date 不是合法日期`);
  }
  if (data.updated && Number.isNaN(new Date(data.updated).getTime())) {
    errors.push(`${filePath}: updated 不是合法日期`);
  }

  const dir = path.dirname(path.resolve(filePath));
  const imagePattern = /!\[[^\]]*\]\((\.\/[^)]+)\)/g;
  let match;
  while ((match = imagePattern.exec(content)) !== null) {
    const imagePath = path.resolve(dir, match[1]);
    if (!fs.existsSync(imagePath)) {
      errors.push(`${filePath}: 引用的图片不存在 ${match[1]}`);
    }
  }

  return deriveSlug(filePath);
}

export function validatePosts() {
  const postsDir = path.resolve("posts");
  const mdFiles = findMarkdownFiles(postsDir);
  const errors = [];
  const seenSlugs = new Set();

  for (const filePath of mdFiles) {
    const slug = validatePost(filePath, errors);
    if (seenSlugs.has(slug)) {
      errors.push(`slug 重复: ${slug}`);
    }
    seenSlugs.add(slug);
  }

  const indexPath = path.resolve("src/generated/posts-index.json");
  if (!fs.existsSync(indexPath)) {
    errors.push(
      "src/generated/posts-index.json 不存在，请先运行 npm run generate:index",
    );
  } else {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    const indexSlugs = new Set(index.posts.map((post) => post.slug));
    for (const slug of seenSlugs) {
      if (!indexSlugs.has(slug)) {
        errors.push(`posts-index.json 缺少文章: ${slug}`);
      }
    }
    for (const slug of indexSlugs) {
      if (!seenSlugs.has(slug)) {
        errors.push(`posts-index.json 包含不存在的文章: ${slug}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`文章校验失败:\n${errors.join("\n")}`);
  }

  console.log(`[validate] 文章校验通过（${mdFiles.length} 篇）`);
  return mdFiles.length;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  validatePosts();
}
