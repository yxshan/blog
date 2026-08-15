const knownKeys = ["tag", "category", "focus", "q", "sort", "page"];

export function readQueryState(search = "") {
  const params = new URLSearchParams(search);
  return {
    tags: params.getAll("tag"),
    category: params.get("category"),
    focus: params.get("focus") === "1",
    text: params.get("q") || "",
    sort: params.get("sort") || "date-desc",
    page: params.get("page") || null,
  };
}

export function updateQueryState(search, changes) {
  const params = new URLSearchParams(search);
  for (const [key, value] of Object.entries(changes)) {
    params.delete(key);
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (
        item !== null &&
        item !== undefined &&
        item !== "" &&
        item !== false
      ) {
        params.append(key, String(item));
      }
    }
  }
  return params;
}

export function toggleTag(search, tag) {
  const params = new URLSearchParams(search);
  const tags = params.getAll("tag");
  const nextTags = tags.includes(tag)
    ? tags.filter((current) => current !== tag)
    : [...tags, tag];
  return updateQueryState(params, { tag: nextTags });
}

export function clearTags(search) {
  return updateQueryState(search, { tag: [] });
}

export function serializeQueryState(params) {
  return params.toString();
}

export { knownKeys };
