import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { generateSitemap } from "./scripts/generate-sitemap.mjs";
import { generatePostIndex } from "./scripts/generate-index.mjs";

export default defineConfig({
  base: "/blog/",
  plugins: [
    react(),
    {
      name: "post-index",
      buildStart() {
        generatePostIndex();
      },
    },
    // 构建完成后生成 sitemap.xml
    // 使用 Node.js fs API 直接读取 /posts/ 目录（不能用 import.meta.glob）
    {
      name: "sitemap",
      closeBundle() {
        generateSitemap("dist");
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules") &&
            (id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/react-helmet-async/"))
          ) {
            return "react-vendor";
          }
          if (
            id.includes("node_modules") &&
            (id.includes("/marked") ||
              id.includes("/katex/") ||
              id.includes("/highlight.js/") ||
              id.includes("/dompurify/") ||
              id.includes("/marked-katex-extension/"))
          ) {
            return "content-vendor";
          }
          return undefined;
        },
      },
    },
  },
});
