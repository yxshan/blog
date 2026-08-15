import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { findMarkdownImages } from "../src/core/content/markdownImages";
import { findPostFrontmatterErrors } from "../src/core/content/validate";

const CATEGORY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ARTICLE_DIRECTORY_PATTERN = /^\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

export interface ResolvedObsidianPost {
  sourceFilePath: string;
  sourceArticleDirectory: string;
  sourcePostsRoot: string;
  vaultRoot: string;
  category: string;
  articleDirectory: string;
  destinationRelativePath: string;
}

export interface PublishedFile {
  relativePath: string;
  contents: Buffer;
}

export interface PreparedPublishedPost {
  source: ResolvedObsidianPost;
  title: string;
  markdown: string;
  files: PublishedFile[];
  transformations: Array<{ from: string; to: string }>;
}

function findSourcePostsRoot(filePath: string): string | null {
  let current = path.dirname(filePath);
  const root = path.parse(current).root;
  while (current !== root) {
    if (
      path.basename(current) === "posts" &&
      fs.existsSync(path.join(path.dirname(current), ".obsidian"))
    ) {
      return fs.realpathSync(current);
    }
    current = path.dirname(current);
  }
  return null;
}

export function resolveObsidianPost(
  inputFilePath: string,
): ResolvedObsidianPost {
  if (!inputFilePath.trim()) throw new Error("必须提供 Obsidian 文章路径");
  const absolutePath = path.resolve(inputFilePath);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    throw new Error(`Obsidian 文章不存在: ${absolutePath}`);
  }

  const sourceFilePath = fs.realpathSync(absolutePath);
  if (path.basename(sourceFilePath) !== "index.md") {
    throw new Error("Obsidian 文章文件名必须是 index.md");
  }
  const sourcePostsRoot = findSourcePostsRoot(sourceFilePath);
  if (!sourcePostsRoot) {
    throw new Error("文章必须位于 Obsidian Vault 的 posts 目录中");
  }

  const relativePath = path.relative(sourcePostsRoot, sourceFilePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("文章路径不能离开 Obsidian posts 目录");
  }
  const segments = relativePath.split(path.sep);
  const category = segments[0];
  const articleDirectory = segments.at(-2);
  if (!category || !CATEGORY_PATTERN.test(category)) {
    throw new Error(`博客分类必须使用小写英文 slug: ${category ?? ""}`);
  }
  if (!articleDirectory || !ARTICLE_DIRECTORY_PATTERN.test(articleDirectory)) {
    throw new Error(
      `文章目录必须符合 NNN-lowercase-slug: ${articleDirectory ?? ""}`,
    );
  }
  if (segments.length < 3) {
    throw new Error("文章路径必须包含分类和文章目录");
  }

  return {
    sourceFilePath,
    sourceArticleDirectory: path.dirname(sourceFilePath),
    sourcePostsRoot,
    vaultRoot: path.dirname(sourcePostsRoot),
    category,
    articleDirectory,
    destinationRelativePath: path.posix.join(
      "posts",
      category,
      articleDirectory,
      "index.md",
    ),
  };
}

function assertLocalImage(
  source: ResolvedObsidianPost,
  reference: string,
): { sourcePath: string; articleRelativePath: string } {
  const normalizedReference = reference.replace(/^\.\//, "");
  const decodedReference = decodeURIComponent(normalizedReference);
  const referenceBase = decodedReference.startsWith("posts/")
    ? source.vaultRoot
    : source.sourceArticleDirectory;
  const sourcePath = path.resolve(referenceBase, decodedReference);
  const articleRelativePath = path.relative(
    source.sourceArticleDirectory,
    sourcePath,
  );

  if (
    articleRelativePath.startsWith("..") ||
    path.isAbsolute(articleRelativePath)
  ) {
    throw new Error(`图片路径不能离开文章目录: ${reference}`);
  }
  if (!IMAGE_EXTENSIONS.has(path.extname(sourcePath).toLowerCase())) {
    throw new Error(`不支持的图片格式: ${reference}`);
  }
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    throw new Error(`引用的图片不存在: ${reference}`);
  }
  return { sourcePath, articleRelativePath };
}

function isRemoteReference(reference: string): boolean {
  return /^(?:[a-z]+:|\/|#)/i.test(reference);
}

function validateFrontmatter(data: Record<string, unknown>): string {
  const errors = findPostFrontmatterErrors(data);
  if (errors.length > 0) {
    throw new Error(`文章 frontmatter 无效：\n${errors.join("\n")}`);
  }
  return String(data.title).trim();
}

function transformMarkdownImages(
  markdown: string,
  transformTarget: (target: string) => string,
  transformations: Array<{ from: string; to: string }>,
): string {
  let cursor = 0;
  let result = "";
  for (const image of findMarkdownImages(markdown)) {
    if (isRemoteReference(image.target)) {
      result += markdown.slice(cursor, image.end);
      cursor = image.end;
      continue;
    }
    const normalizedTarget = transformTarget(image.target);
    const renderedTarget =
      image.wrapped || normalizedTarget.includes(" ")
        ? `<./${normalizedTarget}>`
        : `./${normalizedTarget}`;
    const replacement = `${markdown.slice(image.start, image.contentStart)}${renderedTarget}${markdown.slice(image.suffixStart, image.end)}`;
    if (replacement !== image.source) {
      transformations.push({ from: image.source, to: replacement });
    }
    result += markdown.slice(cursor, image.start) + replacement;
    cursor = image.end;
  }
  return result + markdown.slice(cursor);
}

export function preparePublishedPost(
  source: ResolvedObsidianPost,
): PreparedPublishedPost {
  const originalMarkdown = fs.readFileSync(source.sourceFilePath, "utf-8");
  const parsed = matter(originalMarkdown);
  const title = validateFrontmatter(parsed.data as Record<string, unknown>);
  const references = new Map<
    string,
    { sourcePath: string; articleRelativePath: string }
  >();
  const transformations: Array<{ from: string; to: string }> = [];
  const addReference = (reference: string) => {
    const image = assertLocalImage(source, reference);
    references.set(image.articleRelativePath, image);
    return image.articleRelativePath.split(path.sep).join("/");
  };

  const obsidianNormalized = originalMarkdown.replace(
    /!\[\[([^\]]+)\]\]/g,
    (match, value: string) => {
      const [rawReference, rawAlias] = value.split("|", 2);
      if (!rawReference) throw new Error("Obsidian 图片引用不能为空");
      const articleRelativePath = addReference(rawReference.trim());
      const fallbackAlt = path.basename(
        articleRelativePath,
        path.extname(articleRelativePath),
      );
      const replacement = `![${rawAlias?.trim() || fallbackAlt}](./${articleRelativePath})`;
      transformations.push({ from: match, to: replacement });
      return replacement;
    },
  );
  const markdown = transformMarkdownImages(
    obsidianNormalized,
    addReference,
    transformations,
  );
  const destinationDirectory = path.posix.dirname(
    source.destinationRelativePath,
  );
  const files: PublishedFile[] = [
    {
      relativePath: source.destinationRelativePath,
      contents: Buffer.from(markdown),
    },
    ...[...references.values()]
      .sort((left, right) =>
        left.articleRelativePath.localeCompare(right.articleRelativePath),
      )
      .map((image) => ({
        relativePath: path.posix.join(
          destinationDirectory,
          image.articleRelativePath.split(path.sep).join("/"),
        ),
        contents: fs.readFileSync(image.sourcePath),
      })),
  ];
  return { source, title, markdown, files, transformations };
}
