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

// 自定义 remark 插件：::::提示框语法
function remarkAdmonitions() {
  return (tree) => {
    visit(tree, "containerDirective", (node, index, parent) => {
      if (!["tip", "warning", "danger"].includes(node.name)) return;
      const titleMap = { tip: "提示", warning: "警告", danger: "危险" };
      parent.children.splice(
        index,
        1,
        {
          type: "html",
          value: `<div class="admonition admonition-${node.name}" data-admonition="${node.name}"><div class="admonition-title">${titleMap[node.name]}</div>`,
        },
        ...node.children,
        { type: "html", value: "</div>" },
      );
      return index + node.children.length + 2;
    });
  };
}

const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  onVisitLine(node) {
    if (node.children.length === 0)
      node.children.push({ type: "text", value: " " });
    node.properties["data-line"] = "";
  },
};

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
        className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <ClipboardIcon className="h-3.5 w-3.5" />
        <span>{copied ? "已复制" : "复制"}</span>
      </button>
    </div>
  );
}

const components = {
  code({ className, children, ...props }) {
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
    const lang =
      (/language-(\w+)/.exec(className || "") || [])[1]?.toUpperCase() || "";
    const codeStr = String(children).replace(/\n$/, "");
    return (
      <div className="my-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <CodeBlockHeader language={lang} codeString={codeStr} />
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
  a({ href, children, ...props }) {
    const ext = /^https?:\/\//.test(href || "");
    return (
      <a
        href={href}
        target={ext ? "_blank" : undefined}
        rel={ext ? "noopener noreferrer" : undefined}
        className="text-blue-600 underline decoration-blue-400 underline-offset-2 hover:text-blue-800 dark:text-blue-400"
        {...props}
      >
        {children}
      </a>
    );
  },
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
