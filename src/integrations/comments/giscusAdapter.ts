import type { CommentsAdapter } from "../../core/contracts";

interface GiscusConfig {
  repoId?: string;
  categoryId?: string;
  category?: string;
}

export function createGiscusAdapter({
  repoId,
  categoryId,
  category = "Announcements",
}: GiscusConfig = {}): CommentsAdapter {
  const enabled = Boolean(repoId && categoryId);
  return {
    isEnabled: () => enabled,
    mount(container: HTMLElement): () => void {
      if (!enabled || !repoId || !categoryId) return () => undefined;
      container.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-repo", "yxshan/blog");
      script.setAttribute("data-repo-id", repoId);
      script.setAttribute("data-category", category);
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
    },
  };
}

export const giscusAdapter = createGiscusAdapter({
  repoId: import.meta.env.VITE_GISCUS_REPO_ID,
  categoryId: import.meta.env.VITE_GISCUS_CATEGORY_ID,
  category: import.meta.env.VITE_GISCUS_CATEGORY || "Announcements",
});
