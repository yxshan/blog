import { marked } from "marked";
import hljs from "highlight.js/lib/common";
import markedKatex from "marked-katex-extension";
import sanitizeHtml from "sanitize-html";

marked.setOptions({
  gfm: true,
  breaks: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

marked.use(markedKatex({ throwOnError: false, nonStandard: true }));

const imageModules = import.meta.glob(
  "/posts/**/*.{png,jpg,jpeg,gif,svg,webp}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

function buildImageMap(modulePath) {
  const postDir = modulePath.replace(/\/index\.md$/, "/");
  const map = {};
  for (const [filePath, url] of Object.entries(imageModules)) {
    if (filePath.startsWith(postDir)) {
      map[`./${filePath.slice(postDir.length)}`] = url;
    }
  }
  return map;
}

export function renderMarkdown(content, modulePath) {
  const imageMap = modulePath ? buildImageMap(modulePath) : {};
  let html = marked.parse(content);
  html = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "del",
      "details",
      "summary",
      "span",
    ]),
    allowedAttributes: {
      "*": ["class", "id"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      span: ["class", "style"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });

  return html.replace(/src="(\.\/[^"]+)"/g, (match, src) => {
    const resolved = imageMap[src];
    return resolved ? `src="${resolved}"` : match;
  });
}
