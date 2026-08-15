import { describe, expect, it } from "vitest";
import { findMarkdownImages } from "./markdownImages";

describe("findMarkdownImages", () => {
  it("parses a balanced destination separately from its title", () => {
    expect(
      findMarkdownImages('前文 ![图](./流程图(新版).png "说明") 后文'),
    ).toMatchObject([
      {
        source: '![图](./流程图(新版).png "说明")',
        alt: "图",
        target: "./流程图(新版).png",
        wrapped: false,
      },
    ]);
  });

  it("parses angle-wrapped paths containing spaces", () => {
    expect(findMarkdownImages("![图](<./流程 图.png>)")[0]).toMatchObject({
      target: "./流程 图.png",
      wrapped: true,
    });
  });
});
