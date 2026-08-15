import hljs from "highlight.js/lib/common";
import { marked, type MarkedOptions } from "marked";
import markedKatex from "marked-katex-extension";
import sanitizeHtml from "sanitize-html";

type HighlightOptions = MarkedOptions & {
  highlight(code: string, lang: string): string;
};

marked.setOptions({
  gfm: true,
  breaks: false,
  highlight(code: string, lang: string): string {
    return lang && hljs.getLanguage(lang)
      ? hljs.highlight(code, { language: lang }).value
      : hljs.highlightAuto(code).value;
  },
} as HighlightOptions);
marked.use(markedKatex({ throwOnError: false, nonStandard: true }));

const imageModules = import.meta.glob<string>(
  "/posts/**/*.{png,jpg,jpeg,gif,svg,webp}",
  { query: "?url", import: "default", eager: true },
);

function buildImageMap(modulePath: string): Record<string, string> {
  const postDir = modulePath.replace(/\/index\.md$/, "/");
  const map: Record<string, string> = {};
  for (const [filePath, url] of Object.entries(imageModules)) {
    if (filePath.startsWith(postDir)) {
      map[`./${filePath.slice(postDir.length)}`] = url;
    }
  }
  return map;
}

export function renderMarkdown(content: string, modulePath?: string): string {
  const imageMap = modulePath ? buildImageMap(modulePath) : {};
  const parsed = marked.parse(content);
  const html = sanitizeHtml(typeof parsed === "string" ? parsed : "", {
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

  return html.replace(/src="(\.\/[^\"]+)"/g, (match, source: string) => {
    const resolved = imageMap[source];
    return resolved ? `src="${resolved}"` : match;
  });
}
