export function createGiscusAdapter(config = {}) {
  const { repoId, categoryId, category = "Announcements" } = config;

  return {
    isEnabled() {
      return Boolean(repoId && categoryId);
    },

    mount(container, { slug: _slug }) {
      if (!this.isEnabled()) return () => {};

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
  repoId: import.meta.env?.VITE_GISCUS_REPO_ID,
  categoryId: import.meta.env?.VITE_GISCUS_CATEGORY_ID,
  category: import.meta.env?.VITE_GISCUS_CATEGORY || "Announcements",
});
