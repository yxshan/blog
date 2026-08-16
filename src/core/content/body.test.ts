import { describe, expect, it } from "vitest";
import { normalizePostBody } from "./body";

describe("normalizePostBody", () => {
  it("removes a Markdown h1 that duplicates the article title", () => {
    expect(
      normalizePostBody("# 反转链表\n\n## 题目信息", {
        title: "反转链表",
      }),
    ).toBe("## 题目信息");
  });

  it("removes a leading tag-only line matching frontmatter", () => {
    expect(
      normalizePostBody("#中等 #线性表 #考研真题\n\n正文", {
        title: "中位数",
        tags: ["中等", "线性表", "考研真题"],
      }),
    ).toBe("正文");
  });

  it("removes both a duplicate title and matching tags", () => {
    expect(
      normalizePostBody("# 中位数\n\n#中等 #分治\n\n## 题目信息\n正文", {
        title: "中位数",
        tags: ["中等", "分治"],
      }),
    ).toBe("## 题目信息\n正文");
  });

  it("keeps a different h1 and non-matching tags", () => {
    const content = "# 其他标题\n\n#专题 #补充\n\n正文";
    expect(
      normalizePostBody(content, {
        title: "反转链表",
        tags: ["链表", "反转"],
      }),
    ).toBe(content);
  });

  it("keeps hashtags inside article content", () => {
    const content = "正文提到 #链表 标签。\n\n## #号说明";
    expect(
      normalizePostBody(content, { title: "反转链表", tags: ["链表"] }),
    ).toBe(content);
  });
});
