import type { SiteConfig } from "../contracts";

export const siteConfig = Object.freeze({
  siteUrl: "https://yxshan.github.io",
  basePath: "/blog",
  locale: "zh-CN",
  comments: Object.freeze({
    enabled: Boolean(
      import.meta.env?.VITE_GISCUS_REPO_ID &&
      import.meta.env?.VITE_GISCUS_CATEGORY_ID,
    ),
  }),
}) satisfies SiteConfig;

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}
