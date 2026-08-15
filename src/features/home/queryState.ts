import type { PostSort } from "../../core/contracts";

export interface HomeQueryState {
  tags: string[];
  category: string | null;
  focus: boolean;
  text: string;
  sort: PostSort;
  page: number | null;
}

type QueryValue = string | number | boolean | null | undefined;
type QueryChanges = Record<string, QueryValue | QueryValue[]>;

function parseSort(value: string | null): PostSort {
  return value === "relevance" || value === "date-asc" ? value : "date-desc";
}

function parsePage(value: string | null): number | null {
  if (!value) return null;
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : null;
}

export function readQueryState(search = ""): HomeQueryState {
  const params = new URLSearchParams(search);
  return {
    tags: params.getAll("tag"),
    category: params.get("category"),
    focus: params.get("focus") === "1",
    text: params.get("q") || "",
    sort: parseSort(params.get("sort")),
    page: parsePage(params.get("page")),
  };
}

export function updateQueryState(
  search: string | URLSearchParams,
  changes: QueryChanges,
): URLSearchParams {
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

export function toggleTag(
  search: string | URLSearchParams,
  tag: string,
): URLSearchParams {
  const params = new URLSearchParams(search);
  const tags = params.getAll("tag");
  const nextTags = tags.includes(tag)
    ? tags.filter((current) => current !== tag)
    : [...tags, tag];
  return updateQueryState(params, { tag: nextTags });
}

export function clearTags(search: string | URLSearchParams): URLSearchParams {
  return updateQueryState(search, { tag: [] });
}

export function serializeQueryState(params: URLSearchParams): string {
  return params.toString();
}
