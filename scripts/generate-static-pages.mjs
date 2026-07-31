import fs from "node:fs";
import path from "node:path";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateStaticPages(outputDir = "dist") {
  const indexPath = path.join(outputDir, "index.html");
  const template = fs.readFileSync(indexPath, "utf-8");
  const indexData = JSON.parse(
    fs.readFileSync(path.resolve("src/generated/posts-index.json"), "utf-8"),
  );

  const publishedPosts = indexData.posts.filter((post) => !post.draft);
  for (const post of publishedPosts) {
    const pageDir = path.join(outputDir, "posts", post.slug);
    fs.mkdirSync(pageDir, { recursive: true });

    const title = escapeHtml(post.title);
    const description = escapeHtml(post.excerpt || "");
    const canonical = `https://yxshan.github.io/blog/posts/${encodeURI(post.slug)}`;
    const meta = [
      `<title>${title} — yxshan&apos;s Blog</title>`,
      `<meta name="description" content="${description}" />`,
      `<link rel="canonical" href="${canonical}" />`,
    ].join("\n    ");

    const html = template
      .replace(/<title>.*?<\/title>/s, "")
      .replace(/<meta\s+name="description"[^>]*>/i, "")
      .replace(/<link\s+rel="canonical"[^>]*>/i, "")
      .replace("</head>", `    ${meta}\n  </head>`);

    fs.writeFileSync(path.join(pageDir, "index.html"), html, "utf-8");
  }

  console.log(`[static-pages] 已生成 ${publishedPosts.length} 个文章静态入口`);
  return publishedPosts.length;
}
