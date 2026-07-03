import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// 全局样式 — 顺序很重要
import "./index.css"; // TailwindCSS base/components/utilities
import "katex/dist/katex.min.css"; // KaTeX 数学公式样式
import "./shared/shiki.css"; // Shiki 代码高亮双主题

/**
 * 应用入口
 *
 * 挂载 <App /> 到 #root 容器，使用 StrictMode 进行开发时检查。
 */
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
