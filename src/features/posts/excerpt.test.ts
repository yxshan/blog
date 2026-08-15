import { describe, expect, it } from "vitest";
import { extractExcerpt } from "./excerpt";

describe("extractExcerpt", () => {
  it("strips markdown syntax and truncates to 150 characters", () => {
    expect(extractExcerpt("# Title\n\nSome **bold** and `code`.")).toBe(
      "Some bold and code.",
    );
  });

  it("removes code blocks before other content", () => {
    expect(extractExcerpt("```js\nconst x = 1;\n```\nVisible text")).toBe(
      "Visible text",
    );
  });
});
