const siteUrl = "https://yxshan.github.io";
const basePath = "/blog";

export const siteConfig = Object.freeze({
  siteUrl,
  basePath,
  locale: "zh-CN",
  comments: Object.freeze({
    enabled: Boolean(
      import.meta.env?.VITE_GISCUS_REPO_ID &&
      import.meta.env?.VITE_GISCUS_CATEGORY_ID,
    ),
  }),
});

export function getSiteConfig() {
  return siteConfig;
}
