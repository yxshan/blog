import { describe, expect, it } from "vitest";
import { findAstroImportViolations } from "./validate-architecture";

describe("findAstroImportViolations", () => {
  it("rejects generated index imports from Astro files", () => {
    expect(
      findAstroImportViolations([
        {
          filePath: "src/pages/index.astro",
          content:
            '---\nimport posts from "../generated/posts-index.json";\n---',
        },
      ]),
    ).toEqual([
      "src/pages/index.astro: generated 索引只能由 src/core/content 读取（../generated/posts-index.json）",
    ]);
  });

  it("allows Astro files to consume stable module interfaces", () => {
    expect(
      findAstroImportViolations([
        {
          filePath: "src/pages/index.astro",
          content:
            '---\nimport HomeIsland from "../components/home/HomeIsland";\n---',
        },
      ]),
    ).toEqual([]);
  });
});
