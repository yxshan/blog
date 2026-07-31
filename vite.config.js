import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { generateSitemap } from "./scripts/generate-sitemap.mjs";
import { generatePostIndex } from "./scripts/generate-index.mjs";
import { generateSearchIndex } from "./scripts/generate-search-index.mjs";
import { generateStaticPages } from "./scripts/generate-static-pages.mjs";
import { generateRss, generateRobots } from "./scripts/generate-rss.mjs";

function regenerateIndexes() {
  generatePostIndex();
  generateSearchIndex();
}

export default defineConfig({
  base: "/blog/",
  plugins: [
    react(),
    {
      name: "post-index",
      buildStart() {
        regenerateIndexes();
      },
      configureServer(server) {
        let debounceTimer;
        try {
          fs.watch(
            path.resolve("posts"),
            { recursive: true },
            (_eventType, filename) => {
              if (filename && filename.toString().endsWith(".md")) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                  regenerateIndexes();
                  server.ws.send({ type: "full-reload" });
                }, 150);
              }
            },
          );
        } catch (error) {
          console.error("[post-index] 无法监听 posts 目录:", error);
        }
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
    {
      name: "static-pages",
      closeBundle() {
        generateStaticPages("dist");
        generateRss("dist");
        generateRobots("dist");
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
