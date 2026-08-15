/** @vitest-environment happy-dom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it } from "vitest";
import SearchBar from "./SearchBar";

function renderSearchBar(autoFocus: boolean): {
  container: HTMLDivElement;
  root: Root;
} {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <SearchBar
        query=""
        onQueryChange={() => undefined}
        autoFocus={autoFocus}
      />,
    );
  });
  return { container, root };
}

describe("SearchBar", () => {
  it("focuses the input when autoFocus becomes true", () => {
    const { container, root } = renderSearchBar(false);
    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(document.activeElement).not.toBe(input);
    act(() => {
      root.render(
        <SearchBar query="" onQueryChange={() => undefined} autoFocus />,
      );
    });
    expect(document.activeElement).toBe(input);
    act(() => root.unmount());
    container.remove();
  });
});
