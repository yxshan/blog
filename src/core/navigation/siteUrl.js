import { siteConfig } from "../config/siteConfig";

function withTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

export function sitePath(path = "") {
  const base = withTrailingSlash(siteConfig.basePath);
  return `${base}${String(path).replace(/^\/+/, "")}`;
}

export function siteUrl(path = "") {
  return new URL(sitePath(path), siteConfig.siteUrl).toString();
}

export function postPath(slug) {
  return sitePath(`posts/${encodeURI(slug)}`);
}

export function postUrl(slug) {
  return siteUrl(`posts/${encodeURI(slug)}`);
}

export function homePath(query = "") {
  const suffix = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  return `${sitePath()}${suffix}`;
}
