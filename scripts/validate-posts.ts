import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DIFFICULTY_MAP, deriveSlug } from "../src/core/content/normalize";
import {
  findMarkdownFiles,
  parsePostFile,
  PROJECT_ROOT,
} from "../src/core/content/source";

const ALLOWED_DIFFICULTY = Object.keys(DIFFICULTY_MAP);

function validatePost(filePath: string, errors: string[]): string {
  const { frontmatter, content } = parsePostFile(filePath);

  if (
    !/^posts\/[^/\s]+\/\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\/index\.md$/.test(
      filePath,
    )
  ) {
    errors.push(`${filePath}: 路径必须符合 posts/<分类>/NNN-slug/index.md`);
  }
  if (
    typeof frontmatter.title !== "string" ||
    frontmatter.title.trim().length === 0
  ) {
    errors.push(`${filePath}: title 必须是非空字符串`);
  }
  if (!frontmatter.date) errors.push(`${filePath}: 缺少必填字段 date`);
  if (
    !Array.isArray(frontmatter.tags) ||
    frontmatter.tags.length === 0 ||
    !frontmatter.tags.every(
      (tag) => typeof tag === "string" && tag.trim().length > 0,
    )
  ) {
    errors.push(`${filePath}: tags 必须是至少包含一个非空字符串的数组`);
  }
  if (
    frontmatter.difficulty &&
    (typeof frontmatter.difficulty !== "string" ||
      !ALLOWED_DIFFICULTY.includes(frontmatter.difficulty))
  ) {
    errors.push(
      `${filePath}: difficulty 必须是 ${ALLOWED_DIFFICULTY.join(" / ")}`,
    );
  }

  const date = frontmatter.date ? new Date(String(frontmatter.date)) : null;
  if (date && Number.isNaN(date.getTime())) {
    errors.push(`${filePath}: date 不是合法日期`);
  }
  if (
    frontmatter.updated &&
    Number.isNaN(new Date(String(frontmatter.updated)).getTime())
  ) {
    errors.push(`${filePath}: updated 不是合法日期`);
  }

  const dir = path.dirname(path.join(PROJECT_ROOT, filePath));
  const imagePattern = /!\[[^\]]*\]\((\.\/[^)]+)\)/g;
  for (const match of content.matchAll(imagePattern)) {
    const reference = match[1];
    if (!reference) continue;
    if (!fs.existsSync(path.resolve(dir, reference))) {
      errors.push(`${filePath}: 引用的图片不存在 ${reference}`);
    }
  }

  return deriveSlug(filePath);
}

interface GeneratedIndex {
  posts: Array<{ slug: string }>;
}

function readGeneratedIndex(indexPath: string): GeneratedIndex | null {
  const value: unknown = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  if (!value || typeof value !== "object" || !("posts" in value)) return null;
  const posts = (value as { posts?: unknown }).posts;
  if (!Array.isArray(posts)) return null;
  const normalized = posts.filter((post): post is { slug: string } =>
    Boolean(
      post &&
      typeof post === "object" &&
      "slug" in post &&
      typeof post.slug === "string",
    ),
  );
  return normalized.length === posts.length ? { posts: normalized } : null;
}

export function validatePosts(): number {
  const postsDir = path.join(PROJECT_ROOT, "posts");
  const mdFiles = findMarkdownFiles(postsDir);
  const errors: string[] = [];
  const seenSlugs = new Set<string>();

  for (const filePath of mdFiles) {
    const slug = validatePost(filePath, errors);
    if (seenSlugs.has(slug)) errors.push(`slug 重复: ${slug}`);
    seenSlugs.add(slug);
  }

  const indexPath = path.join(PROJECT_ROOT, "src/generated/posts-index.json");
  if (!fs.existsSync(indexPath)) {
    errors.push(
      "src/generated/posts-index.json 不存在，请先运行 npm run generate:index",
    );
  } else {
    const index = readGeneratedIndex(indexPath);
    if (!index) {
      errors.push("src/generated/posts-index.json 结构无效");
    } else {
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
