import { describe, expect, it } from "vitest";
import { loadPostSources } from "./source";

describe("content source", () => {
  it("normalizes the current Markdown collection through one pipeline", () => {
    const posts = loadPostSources();
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      expect(post).toMatchObject({
        slug: expect.stringContaining("/"),
        category: expect.any(String),
        title: expect.any(String),
        tags: expect.any(Array),
        content: expect.any(String),
      });
    }
  });
});
