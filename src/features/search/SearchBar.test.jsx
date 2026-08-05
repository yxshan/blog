/** @vitest-environment happy-dom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import SearchBar from "./SearchBar";

function renderSearchBar(autoFocus) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <SearchBar query="" onQueryChange={() => {}} autoFocus={autoFocus} />,
    );
  });
  return { container, root };
}

describe("SearchBar", () => {
  it("focuses the input when autoFocus becomes true", () => {
    const { container, root } = renderSearchBar(false);
    const input = container.querySelector("input");

    expect(document.activeElement).not.toBe(input);

    act(() => {
      root.render(
        <SearchBar query="" onQueryChange={() => {}} autoFocus={true} />,
      );
    });

    expect(document.activeElement).toBe(input);
    root.unmount();
    container.remove();
  });
});
