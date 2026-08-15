import { describe, expect, it } from "vitest";
import { postCatalog } from "./catalog";

describe("post catalog", () => {
  it("exposes published posts without leaking generated index details", () => {
    const posts = postCatalog.listPublished();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      date: expect.any(Date),
    });
    expect(posts[0]).not.toHaveProperty("content");
  });

  it("queries the normalized catalog by tags and category", () => {
    const posts = postCatalog.query({
      tags: ["链表", "反转"],
      category: "algorithm",
    });
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => post.tags.includes("链表"))).toBe(true);
    expect(posts.every((post) => post.category === "algorithm")).toBe(true);
  });

  it("applies typed pagination after filtering and sorting", () => {
    const firstPage = postCatalog.query({ page: 1, pageSize: 2 });
    const secondPage = postCatalog.query({ page: 2, pageSize: 2 });
    expect(firstPage).toHaveLength(2);
    expect(secondPage).toHaveLength(2);
    expect(firstPage.map((post) => post.slug)).not.toEqual(
      secondPage.map((post) => post.slug),
    );
  });
});
