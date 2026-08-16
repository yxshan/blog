/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import { initToc } from "./toc";

describe("initToc", () => {
  it("marks the first heading as the current location", () => {
    document.body.innerHTML = `
      <article class="prose">
        <h2 id="first">第一节</h2>
        <h3 id="child">子节</h3>
        <h2 id="second">第二节</h2>
      </article>
      <nav id="toc"></nav>
    `;

    initToc();

    const buttons = document.querySelectorAll<HTMLButtonElement>(
      "#toc button[data-toc-id]",
    );
    expect(buttons).toHaveLength(3);
    expect(buttons[0]?.getAttribute("aria-current")).toBe("location");
    expect(buttons[0]?.dataset.active).toBe("true");
    expect(buttons[1]?.dataset.level).toBe("3");
  });
});
