import { describe, expect, it } from "vitest";
import { createPostSearcher } from "./postSearch";

const posts = [
  { title: "反转链表", excerpt: "链表题", searchText: "迭代 递归" },
  { title: "合并数组", excerpt: "顺序表题", searchText: "双指针" },
];

describe("post search", () => {
  it("returns Fuse-ranked matches for a non-empty query", () => {
    const searcher = createPostSearcher(posts);
    expect(searcher.search("递归")).toEqual([posts[0]]);
  });

  it("returns the source order for an empty query", () => {
    const searcher = createPostSearcher(posts);
    expect(searcher.search("  ")).toEqual(posts);
  });
});
