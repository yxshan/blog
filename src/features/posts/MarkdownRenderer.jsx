import { useState, useCallback } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

// 配置 marked 使用 highlight.js 做代码高亮
marked.setOptions({
  gfm: true,
  breaks: false,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

function CodeBlock({ children, lang }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
      <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <span>{lang || "text"}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ClipboardIcon className="h-3.5 w-3.5" />
          <span>{copied ? "已复制" : "复制"}</span>
        </button>
      </div>
      <div className="overflow-x-auto bg-[#f6f8fa] dark:bg-[#0d1117]">
        <pre className="!m-0 !rounded-t-none">
          <code
            className={`hljs${lang ? ` language-${lang}` : ""}`}
            dangerouslySetInnerHTML={{ __html: children }}
          />
        </pre>
      </div>
    </div>
  );
}

/**
 * 将 marked 生成的 HTML 转换为带代码块增强的 React 元素
 */
function enhanceHTML(html) {
  // 解析 HTML 字符串，为每个 <pre><code> 块包裹 CodeBlock 组件
  const parts = [];
  let lastIndex = 0;
  const regex =
    /<pre><code(?: class="hljs language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    // 前置文本段：用 dangerouslySetInnerHTML 渲染为 DOM
    if (match.index > lastIndex) {
      const segment = html.slice(lastIndex, match.index);
      parts.push(
        <span key={lastIndex} dangerouslySetInnerHTML={{ __html: segment }} />,
      );
    }
    // 代码块
    parts.push(
      <CodeBlock key={match.index} lang={match[1] || ""}>
        {match[2]}
      </CodeBlock>,
    );
    lastIndex = match.index + match[0].length;
  }
  // 尾部文本段
  if (lastIndex < html.length) {
    parts.push(
      <span
        key={lastIndex}
        dangerouslySetInnerHTML={{ __html: html.slice(lastIndex) }}
      />,
    );
  }
  return parts;
}

export default function MarkdownRenderer({ content }) {
  const html = marked.parse(content);
  const elements = enhanceHTML(html);

  return (
    <div className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-blue-600">
      {elements}
    </div>
  );
}
