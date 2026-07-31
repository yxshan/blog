export function deriveSlug(filePath) {
  const slug = filePath
    .replace(/^posts[\\/]/, "")
    .replace(/[\\/]index\.md$/, "");
  return slug
    .split(/[\\/]/)
    .map((segment) => segment.replace(/^\d+-/, ""))
    .join("/");
}

export function deriveCategory(slug) {
  return slug.split("/")[0];
}
