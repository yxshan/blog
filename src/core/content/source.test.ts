import { describe, expect, it } from "vitest";
import { loadPostSources } from "./source";

describe("content source", () => {
  it("normalizes the current Markdown collection through one pipeline", () => {
    const posts = loadPostSources();
    expect(posts).toHaveLength(14);
    expect(posts[0]).toMatchObject({
      slug: expect.stringContaining("/"),
      category: expect.any(String),
      title: expect.any(String),
      tags: expect.any(Array),
      content: expect.any(String),
    });
  });
});
