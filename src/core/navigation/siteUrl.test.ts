import { describe, expect, it } from "vitest";
import { homePath, postPath, postUrl, sitePath } from "./siteUrl";

describe("site URLs", () => {
  it("centralizes the GitHub Pages base path", () => {
    expect(sitePath()).toBe("/blog/");
    expect(homePath("focus=1")).toBe("/blog/?focus=1");
    expect(postPath("algorithm/reverse-list")).toBe(
      "/blog/posts/algorithm/reverse-list",
    );
    expect(postUrl("algorithm/reverse-list")).toBe(
      "https://yxshan.github.io/blog/posts/algorithm/reverse-list",
    );
  });

  it("rejects an empty post slug", () => {
    expect(() => postPath(" ")).toThrow(TypeError);
  });
});
