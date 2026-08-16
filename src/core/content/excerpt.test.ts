import { describe, expect, it } from "vitest";
import { extractExcerpt, markdownToPlainText } from "./excerpt";

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

  it("removes Markdown and Obsidian image syntax", () => {
    expect(
      extractExcerpt(
        '![[题目.png]]\n\n![流程图](./flow.png)\n\n<img src="x.png">\n\n可见正文',
      ),
    ).toBe("可见正文");
  });

  it("can preserve headings and code for search text", () => {
    expect(
      markdownToPlainText("## 解题思路\n\n```c\nint main() {}\n```", {
        includeCode: true,
        includeHeadings: true,
      }),
    ).toBe("解题思路 int main() {}");
  });

  it("removes hashtag markers without discarding their searchable words", () => {
    expect(extractExcerpt("正文提到 #链表 和 #two-pointers 标签")).toBe(
      "正文提到 链表 和 two-pointers 标签",
    );
  });
});
