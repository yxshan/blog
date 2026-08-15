import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { deriveSlug } from "../src/core/content/normalize";
import { findMarkdownImages } from "../src/core/content/markdownImages";
import {
  findMarkdownFiles,
  parsePostFile,
  PROJECT_ROOT,
} from "../src/core/content/source";
import { findPostFrontmatterErrors } from "../src/core/content/validate";

function validatePost(filePath: string, errors: string[]): string {
  const { frontmatter, content } = parsePostFile(filePath);

  if (
    !/^posts\/[^/\s]+\/\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*\/index\.md$/.test(
      filePath,
    )
  ) {
    errors.push(`${filePath}: 路径必须符合 posts/<分类>/NNN-slug/index.md`);
  }
  for (const error of findPostFrontmatterErrors(frontmatter)) {
    errors.push(`${filePath}: ${error}`);
  }

  const dir = path.dirname(path.join(PROJECT_ROOT, filePath));
  for (const image of findMarkdownImages(content)) {
    if (!image.target.startsWith("./")) continue;
    const reference = decodeURIComponent(image.target);
    if (!fs.existsSync(path.resolve(dir, reference))) {
      errors.push(`${filePath}: 引用的图片不存在 ${image.target}`);
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
