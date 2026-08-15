import { describe, expect, it } from "vitest";
import { stripLeadingTitle } from "./body";

describe("stripLeadingTitle", () => {
  it("removes a Markdown h1 that duplicates the article title", () => {
    expect(stripLeadingTitle("# 反转链表\n\n## 题目信息", "反转链表")).toBe(
      "## 题目信息",
    );
  });

  it("keeps a different h1", () => {
    expect(stripLeadingTitle("# 其他标题\n\n正文", "反转链表")).toBe(
      "# 其他标题\n\n正文",
    );
  });
});
