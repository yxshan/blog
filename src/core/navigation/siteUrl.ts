import { siteConfig } from "../config/siteConfig";

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function requireSlug(slug: string): string {
  const value = slug.trim();
  if (!value) throw new TypeError("post slug must not be empty");
  return value;
}

export function sitePath(path = ""): string {
  const base = withTrailingSlash(siteConfig.basePath);
  return `${base}${path.replace(/^\/+/, "")}`;
}

export function siteUrl(path = ""): string {
  return new URL(sitePath(path), siteConfig.siteUrl).toString();
}

export function postPath(slug: string): string {
  return sitePath(`posts/${encodeURI(requireSlug(slug))}`);
}

export function postUrl(slug: string): string {
  return siteUrl(`posts/${encodeURI(requireSlug(slug))}`);
}

export function homePath(query = ""): string {
  const suffix = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  return `${sitePath()}${suffix}`;
}
