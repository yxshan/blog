import { describe, expect, it } from "vitest";
import { extractExcerpt } from "./excerpt.js";

describe("extractExcerpt", () => {
  it("strips markdown syntax and truncates to 150 characters", () => {
    const excerpt = extractExcerpt("# Title\n\nSome **bold** and `code`.");
    expect(excerpt).toBe("Some bold and code.");
  });

  it("removes code blocks before other content", () => {
    const excerpt = extractExcerpt("```js\nconst x = 1;\n```\nVisible text");
    expect(excerpt).toBe("Visible text");
  });
});
