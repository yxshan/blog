import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { sortPosts } from "../src/core/content/normalize";
import { loadPostSources, PROJECT_ROOT } from "../src/core/content/source";
import type { PostMeta } from "../src/core/contracts";

export function generatePostIndex(): number {
  const posts = sortPosts(loadPostSources());
  const indexPosts: PostMeta[] = posts.map((post) => {
    const { content: _content, ...meta } = post;
    return meta;
  });

  const outputPath = path.join(PROJECT_ROOT, "src/generated/posts-index.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ posts: indexPosts }, null, 2)}\n`,
    "utf-8",
  );

  console.log(
    `[posts-index] 已生成: ${outputPath}（${indexPosts.length} 篇文章）`,
  );
  return indexPosts.length;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  generatePostIndex();
}
