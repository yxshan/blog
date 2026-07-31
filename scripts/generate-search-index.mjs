import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";

export function extractSearchText(content) {
  return content
    .replace(/^---\s*$/gm, " ")
    .replace(/```[\s\S]*?```/g, (match) =>
      match
        .replace(/^```[^\n]*\n?/, "")
        .replace(/\n```$/, "")
        .trim(),
    )
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[$`*_~>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateSearchIndex() {
  const indexData = JSON.parse(
    fs.readFileSync(path.resolve("src/generated/posts-index.json"), "utf-8"),
  );
  const posts = indexData.posts.map((post) => {
    const raw = fs.readFileSync(path.resolve(`.${post.modulePath}`), "utf-8");
    const { content } = matter(raw);
    return {
      ...post,
      content: extractSearchText(content),
    };
  });

  const outputPath = path.resolve("src/generated/search-index.json");
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ posts }, null, 2)}\n`,
    "utf-8",
  );
  console.log(`[search-index] 已生成: ${outputPath}（${posts.length} 篇）`);
  return posts.length;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  generateSearchIndex();
}
