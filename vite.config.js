import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { generateSitemap } from "./scripts/generate-sitemap.mjs";

export default defineConfig({
  base: "/blog/",
  plugins: [
    react(),
    // 构建完成后生成 sitemap.xml
    // 使用 Node.js fs API 直接读取 /posts/ 目录（不能用 import.meta.glob）
    {
      name: "sitemap",
      closeBundle() {
        try {
          generateSitemap("dist");
        } catch (err) {
          console.error("[sitemap] 生成失败（不影响构建）:", err);
        }
      },
    },
  ],
});
