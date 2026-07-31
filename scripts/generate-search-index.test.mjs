import { describe, expect, it } from "vitest";
import { extractSearchText } from "./generate-search-index.mjs";

describe("extractSearchText", () => {
  it("keeps code content and removes markdown syntax", () => {
    const text = extractSearchText(
      "## 解题思路\n\n```c\nint main() { return 0; }\n```\n\n**重点** [链接](https://example.com)",
    );
    expect(text).toContain("int main()");
    expect(text).toContain("重点");
    expect(text).toContain("链接");
    expect(text).not.toContain("```");
  });
});
