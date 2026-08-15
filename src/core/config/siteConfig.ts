import type { SiteConfig } from "../contracts";

function parseSampleRate(value: unknown, fallback: number): number {
  const rate = Number(value);
  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : fallback;
}

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
  errorMonitoring: Object.freeze({
    dsn: import.meta.env?.VITE_GLITCHTIP_DSN?.trim() || null,
    release: import.meta.env?.VITE_RELEASE?.trim() || null,
    environment: import.meta.env?.VITE_APP_ENVIRONMENT?.trim() || "production",
    sampleRate: parseSampleRate(
      import.meta.env?.VITE_GLITCHTIP_ERROR_SAMPLE_RATE,
      1,
    ),
  }),
}) satisfies SiteConfig;
