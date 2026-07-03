import { useEffect, useRef, useState, useCallback } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import "highlight.js/styles/github.css";

// 配置 marked：GFM + 代码高亮
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

/**
 * 给单个代码块添加顶栏（语言标签 + 复制按钮）
 */
function enhanceCodeBlock(block, lang) {
  // 避免重复增强
  if (block.parentElement?.classList.contains("code-block-wrapper")) return;

  const wrapper = document.createElement("div");
  wrapper.className =
    "code-block-wrapper my-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700";

  // 顶栏
  const header = document.createElement("div");
  header.className =
    "flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
  header.innerHTML = `<span>${lang || "text"}</span><button class="copy-btn inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span></button>`;

  // 内容区
  const body = document.createElement("div");
  body.className = "overflow-x-auto bg-[#f6f8fa] dark:bg-[#0d1117]";
  body.appendChild(block.cloneNode(true));

  wrapper.appendChild(header);
  wrapper.appendChild(body);

  // 替换原始 pre 元素
  block.parentElement.replaceChild(wrapper, block);

  // 复制按钮事件
  const copyBtn = header.querySelector(".copy-btn");
  const codeText = wrapper.querySelector("code")?.textContent || "";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(codeText).then(() => {
      copyBtn.querySelector("span").textContent = "已复制";
      setTimeout(() => {
        copyBtn.querySelector("span").textContent = "复制";
      }, 2000);
    });
  });
}

/**
 * 增强所有代码块
 */
function enhanceAllCodeBlocks(container) {
  const pres = container.querySelectorAll("pre");
  pres.forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;
    // 提取语言
    const langMatch = code.className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1].toUpperCase() : "";
    enhanceCodeBlock(pre, lang);
  });
}

export default function MarkdownRenderer({ content }) {
  const containerRef = useRef(null);
  const html = marked.parse(content);

  useEffect(() => {
    if (containerRef.current) {
      enhanceAllCodeBlocks(containerRef.current);
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 dark:prose-th:border-gray-600 dark:prose-th:bg-gray-800 dark:prose-td:border-gray-600 prose-img:rounded-lg prose-video:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
