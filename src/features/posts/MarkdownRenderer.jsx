import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";

/**
 * 极简 Markdown 渲染器 — 用于排查 React #306 错误
 * 只包含核心渲染，无自定义组件、无 admonitions、无语法高亮
 */
export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
