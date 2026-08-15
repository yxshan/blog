/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { enhanceCodeBlock } from "./post-enhancements";

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
});
