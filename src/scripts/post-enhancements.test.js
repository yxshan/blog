/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { enhanceCodeBlock } from "./post-enhancements.js";

function createCodeBlock() {
  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.className = "language-js";
  code.textContent = "const answer = 42;";
  pre.appendChild(code);
  return pre;
}

describe("post-enhancements", () => {
  it("does not wrap an already wrapped code block again", () => {
    document.body.innerHTML = "";
    document.body.appendChild(createCodeBlock());

    enhanceCodeBlock(document.querySelector("pre"), "js");
    expect(document.querySelectorAll(".code-block-wrapper")).toHaveLength(1);

    enhanceCodeBlock(document.querySelector(".code-block-wrapper pre"), "js");
    expect(document.querySelectorAll(".code-block-wrapper")).toHaveLength(1);
    expect(document.querySelectorAll(".code-block-header")).toHaveLength(1);
  });
});
