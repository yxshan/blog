import { useEffect, useRef } from "react";
import { marked } from "marked";
import hljs from "highlight.js/lib/common";
import markedKatex from "marked-katex-extension";
import DOMPurify from "dompurify";
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

// 数学公式：$...$ 内联，$$...$$ 块级
marked.use(markedKatex({ throwOnError: false, nonStandard: true }));

/**
 * 给单个代码块添加顶栏（语言标签 + 复制按钮）
 */
function enhanceCodeBlock(block, lang) {
  // 避免重复增强（StrictMode 下 effect 执行两次，包装器内部的 pre 也要跳过）
  if (block.closest(".code-block-wrapper")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper";

  // 顶栏
  const header = document.createElement("div");
  header.className = "code-block-header";
  header.innerHTML = `<span>${lang || "text"}</span><button class="copy-btn code-copy-btn"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span></button>`;

  // 内容区
  const body = document.createElement("div");
  body.className = "code-block-body";
  body.appendChild(block.cloneNode(true));

  const codeEl = body.querySelector("code");
  if (codeEl) {
    codeEl.classList.add("hljs");
    const lines = codeEl.innerHTML.split("\n");
    codeEl.innerHTML = lines
      .map((line) => `<span class="hljs-line">${line || " "}</span>`)
      .join("\n");
  }

  wrapper.appendChild(header);
  wrapper.appendChild(body);

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
    const langMatch = code.className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1].toUpperCase() : "";
    enhanceCodeBlock(pre, lang);
  });
}

/**
 * 增强外部链接：新窗口打开 + 外链图标 + 独特样式
 */
function enhanceLinks(container) {
  const links = container.querySelectorAll("a");
  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    // 只处理外部链接（http/https 开头）
    if (/^https?:\/\//.test(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.classList.add("external-link");
      // 添加外链图标（避免重复添加）
      if (!link.querySelector(".external-icon")) {
        const icon = document.createElement("span");
        icon.className = "external-icon";
        icon.innerHTML = "↗";
        link.appendChild(icon);
      }
    }
  });
}

/**
 * 给所有标题添加 id 属性（供 TOC 提取）
 */
function enhanceHeadings(container) {
  const headings = container.querySelectorAll("h1, h2, h3, h4");
  const seen = {};
  headings.forEach((h) => {
    if (h.id) return;
    const text = h.textContent || "";
    let id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (seen[id] !== undefined) {
      seen[id]++;
      id = id + "-" + seen[id];
    } else {
      seen[id] = 0;
    }
    h.id = id;
  });
}

/**
 * 解析图片相对路径为 Vite 构建后的实际 URL
 *
 * Markdown 中引用的 `./xxx.png` 在构建后路径会变化（含哈希），
 * 通过 imageMap 将相对路径替换为实际 URL。
 *
 * @param {HTMLElement} container - 渲染后的文章 DOM 容器
 * @param {Record<string, string>} imageMap - { "./010-converse.png": "/assets/xxx-abc123.png" }
 */
function enhanceImages(container, imageMap) {
  if (!imageMap || Object.keys(imageMap).length === 0) return;
  const imgs = container.querySelectorAll("img");
  imgs.forEach((img) => {
    const src = img.getAttribute("src") || "";
    if (imageMap[src]) {
      img.setAttribute("src", imageMap[src]);
    }
  });
}

/**
 * 将正文中的 #标签 包装成徽章，跳过代码、链接和标题区域
 */
function enhanceHashTags(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (
        parent &&
        parent.closest("pre, code, a, h1, h2, h3, h4, h5, h6, .hash-tag")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    const original = node.nodeValue || "";
    if (!original.includes("#")) continue;

    const regex = /(^|[^\w\u4e00-\u9fff])#([\u4e00-\u9fff\w]+)/g;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let changed = false;
    let match;

    while ((match = regex.exec(original)) !== null) {
      const prefix = match[1];
      const tag = match[2];
      fragment.append(
        document.createTextNode(
          original.slice(lastIndex, match.index + prefix.length),
        ),
      );

      const span = document.createElement("span");
      span.className = "hash-tag";
      span.textContent = `#${tag}`;
      fragment.appendChild(span);

      lastIndex = match.index + prefix.length + tag.length + 1;
      changed = true;
    }

    if (!changed) continue;
    fragment.append(document.createTextNode(original.slice(lastIndex)));
    node.parentNode.replaceChild(fragment, node);
  }
}

export default function MarkdownRenderer({ content, imageMap }) {
  const containerRef = useRef(null);
  const html = DOMPurify.sanitize(marked.parse(content));

  useEffect(() => {
    if (containerRef.current) {
      enhanceAllCodeBlocks(containerRef.current);
      enhanceLinks(containerRef.current);
      enhanceHeadings(containerRef.current);
      enhanceImages(containerRef.current, imageMap);
      enhanceHashTags(containerRef.current);
    }
  }, [content, imageMap]);

  return (
    <div
      ref={containerRef}
      className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 dark:prose-th:border-gray-600 dark:prose-th:bg-gray-800 dark:prose-td:border-gray-600 prose-img:rounded-lg prose-video:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
