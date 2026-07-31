import { useEffect, useRef } from "react";

/**
 * giscus 评论组件。
 *
 * 需要在 .env 中配置 VITE_GISCUS_REPO_ID 和 VITE_GISCUS_CATEGORY_ID，
 * 未配置时不渲染，避免页面出现无效脚本。
 */
export default function Comments({ slug }) {
  const containerRef = useRef(null);
  const repoId = import.meta.env.VITE_GISCUS_REPO_ID;
  const categoryId = import.meta.env.VITE_GISCUS_CATEGORY_ID;

  useEffect(() => {
    if (!repoId || !categoryId || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "yxshan/blog");
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute(
      "data-category",
      import.meta.env.VITE_GISCUS_CATEGORY || "Announcements",
    );
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [slug, repoId, categoryId]);

  if (!repoId || !categoryId) return null;

  return (
    <section ref={containerRef} className="mt-12" aria-label="评论区" />
  );
}
