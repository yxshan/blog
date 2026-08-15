import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadPostSources } from "../src/core/content/source.mjs";
import { sortPosts } from "../src/core/content/normalize.js";

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
  const posts = sortPosts(loadPostSources()).map((post) => {
    const { content, ...meta } = post;
    return {
      ...meta,
      searchText: extractSearchText(content),
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
