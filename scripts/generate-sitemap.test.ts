import { describe, expect, it } from "vitest";
import { buildSitemapUrl } from "./generate-sitemap";

describe("buildSitemapUrl", () => {
  it("builds route URLs without a hash", () => {
    expect(buildSitemapUrl("algorithm/two-sum")).toBe(
      "https://yxshan.github.io/blog/posts/algorithm/two-sum",
    );
  });

  it("encodes non-ASCII slugs", () => {
    expect(buildSitemapUrl("分类/标题")).toContain("/posts/");
    expect(buildSitemapUrl("分类/标题")).not.toContain("#");
  });
});
