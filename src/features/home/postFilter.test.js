import { describe, expect, it } from "vitest";
import { collectTags, filterPosts } from "./postFilter";

const posts = [
  { slug: "a", category: "algorithm", tags: ["链表", "简单"] },
  { slug: "b", category: "algorithm", tags: ["数组", "简单"] },
  { slug: "c", category: "kaoyan", tags: ["链表", "中等"] },
];

describe("post filtering", () => {
  it("applies tag intersection before category matching", () => {
    expect(
      filterPosts(posts, { tags: ["链表", "简单"], category: "algorithm" }),
    ).toEqual([posts[0]]);
  });

  it("collects deterministic tag counts", () => {
    expect(collectTags(posts)).toEqual([
      { name: "简单", count: 2 },
      { name: "链表", count: 2 },
      { name: "中等", count: 1 },
      { name: "数组", count: 1 },
    ]);
  });
});
