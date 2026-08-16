/** @vitest-environment happy-dom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import TagFilter from "./TagFilter";

describe("TagFilter", () => {
  it("exposes selected state and keeps tag controls in the scroll rail", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const onToggleTag = vi.fn();

    act(() => {
      root.render(
        <TagFilter
          selectedTags={["链表"]}
          onToggleTag={onToggleTag}
          onClear={() => undefined}
          tags={[
            { name: "链表", count: 8 },
            { name: "数组", count: 5 },
          ]}
        />,
      );
    });

    const selected = container.querySelector<HTMLButtonElement>(
      'button[title="取消筛选 链表"]',
    );
    expect(selected?.getAttribute("aria-pressed")).toBe("true");
    expect(selected?.closest(".tag-filter-rail")).not.toBeNull();

    act(() => selected?.click());
    expect(onToggleTag).toHaveBeenCalledWith("链表");
    act(() => root.unmount());
    container.remove();
  });
});
