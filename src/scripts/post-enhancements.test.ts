/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { enhanceCodeBlock, enhanceTable } from "./post-enhancements";

function createCodeBlock(): HTMLPreElement {
  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.className = "language-js";
  code.textContent = "const answer = 42;";
  pre.appendChild(code);
  return pre;
}

function requirePre(selector: string): HTMLPreElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLPreElement)) {
    throw new Error(`未找到代码块: ${selector}`);
  }
  return element;
}

describe("post-enhancements", () => {
  it("does not wrap an already wrapped code block again", () => {
    document.body.innerHTML = "";
    document.body.appendChild(createCodeBlock());
    enhanceCodeBlock(requirePre("pre"), "js");
    expect(document.querySelectorAll(".code-block-wrapper")).toHaveLength(1);
    enhanceCodeBlock(requirePre(".code-block-wrapper pre"), "js");
    expect(document.querySelectorAll(".code-block-wrapper")).toHaveLength(1);
    expect(document.querySelectorAll(".code-block-header")).toHaveLength(1);
  });

  it("adds accessible copy feedback", () => {
    document.body.innerHTML = "";
    document.body.appendChild(createCodeBlock());
    enhanceCodeBlock(requirePre("pre"), "js");
    const button = document.querySelector(".code-copy-btn");
    expect(button?.getAttribute("aria-label")).toBe("复制代码");
    expect(button?.querySelector("[aria-live='polite']")?.textContent).toBe(
      "复制",
    );
  });

  it("wraps tables once for contained horizontal scrolling", () => {
    document.body.innerHTML =
      "<table><tbody><tr><td>内容</td></tr></tbody></table>";
    const table = document.querySelector("table");
    if (!(table instanceof HTMLTableElement)) throw new Error("未找到表格");
    enhanceTable(table);
    enhanceTable(table);
    expect(document.querySelectorAll(".table-scroll-region")).toHaveLength(1);
  });
});
