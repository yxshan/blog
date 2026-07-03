import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import { visit } from "unist-util-visit";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import "katex/dist/katex.min.css";

// ============================================================
// 自定义 remark 插件：将 :::tip / :::warning / :::danger 语法
// 转换为 HTML 注释包裹的 div 结构
//
// 采用简单方案：在 directive 前后插入 HTML bracket 节点，
// 子节点由 remark 正常处理，不需要 mdast→hast 转换，避免
// Node.js 专有依赖（Buffer、fs 等）在浏览器端不可用的问题。
// ============================================================
function remarkAdmonitions() {
  return (tree) => {
    visit(tree, "containerDirective", (node, index, parent) => {
      if (!["tip", "warning", "danger"].includes(node.name)) return;

      const titleMap = { tip: "提示", warning: "警告", danger: "危险" };
      const title = titleMap[node.name];

      // 替换 directive 节点为 HTML bracket + 子节点 + 闭合 bracket
      parent.children.splice(
        index,
        1,
        {
          type: "html",
          value: `<div class="admonition admonition-${node.name}" data-admonition="${node.name}"><div class="admonition-title">${title}</div>`,
        },
        ...node.children,
        { type: "html", value: "</div>" },
      );

      // 返回 SKIP 索引
      return index + node.children.length + 2;
    });
  };
}

// ============================================================
// rehype-pretty-code 配置
//   - 双主题：github-light（浅色）/ github-dark（深色）
//   - keepBackground: false — 使用 CSS 控制背景而非内联样式
//   - onVisitLine: 为每行添加 data-line 属性
// ============================================================
const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children.push({ type: "text", value: " " });
    }
    node.properties["data-line"] = "";
  },
};

// ============================================================
// 代码块顶栏：语言标签 + 复制按钮
// ============================================================
function CodeBlockHeader({ language, codeString }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [codeString]);

  return (
    <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
      <span>{language || "text"}</span>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={copied ? "已复制" : "复制代码"}
      >
        <ClipboardIcon className="h-3.5 w-3.5" />
        <span>{copied ? "已复制" : "复制"}</span>
      </button>
    </div>
  );
}

// ============================================================
// react-markdown 自定义组件
// ============================================================
const components = {
  /**
   * 代码块 / 行内代码渲染
   *
   * 判断逻辑：
   *   - 有 className（如 language-c）→ 代码块，带顶栏 + 复制
   *   - 无 className → 行内代码
   */
  code({ node, className, children, ...props }) {
    // 行内代码
    if (!className) {
      return (
        <code
          className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-pink-600 dark:bg-gray-800 dark:text-pink-400"
          {...props}
        >
          {children}
        </code>
      );
    }

    // 代码块：提取语言标签
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1].toUpperCase() : "";
    const codeString = String(children).replace(/\n$/, "");

    return (
      <div className="my-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <CodeBlockHeader language={language} codeString={codeString} />
        <div className="overflow-x-auto">
          <pre className="!mt-0 !rounded-t-none bg-[#f6f8fa] dark:bg-[#0d1117]">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      </div>
    );
  },

  /**
   * 外部链接：新标签打开 + 安全属性
   */
  a({ href, children, ...props }) {
    const isExternal = /^https?:\/\//.test(href || "");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-blue-600 underline decoration-blue-400 underline-offset-2 transition-colors hover:text-blue-800 dark:text-blue-400 dark:decoration-blue-500 dark:hover:text-blue-300"
        {...props}
      >
        {children}
      </a>
    );
  },

  /**
   * 图片：懒加载
   */
  img({ src, alt, ...props }) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="my-6 rounded-lg"
        {...props}
      />
    );
  },
};

// ============================================================
// MarkdownRenderer — 核心 Markdown 渲染组件
//
// 用法：
//   <MarkdownRenderer content={post.content} />
//
// 插件链：
//   remark:  frontmatter → gfm → math → directive → admonitions
//   rehype:  slug → autolink-headings → pretty-code → katex
// ============================================================
export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:no-underline prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        allowDangerousHtml
        remarkPlugins={[
          remarkFrontmatter,
          remarkGfm,
          remarkMath,
          remarkDirective,
          remarkAdmonitions,
        ]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["anchor-link"],
                ariaHidden: true,
                tabIndex: -1,
              },
            },
          ],
          [rehypePrettyCode, prettyCodeOptions],
          rehypeKatex,
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
