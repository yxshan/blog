/** @vitest-environment happy-dom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import type { CommentsAdapter } from "../../core/contracts";
import Comments from "./Comments";

describe("Comments", () => {
  it("renders nothing when the adapter is disabled", () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const adapter: CommentsAdapter = {
      isEnabled: () => false,
      mount: vi.fn(() => () => undefined),
    };

    act(() => root.render(<Comments slug="algorithm/example" adapter={adapter} />));
    expect(container.querySelector("section")).toBeNull();
    expect(adapter.mount).not.toHaveBeenCalled();
    act(() => root.unmount());
  });

  it("mounts and cleans up an enabled adapter", () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const cleanup = vi.fn();
    const mount = vi.fn(() => cleanup);
    const adapter: CommentsAdapter = {
      isEnabled: () => true,
      mount,
    };

    act(() => root.render(<Comments slug="algorithm/example" adapter={adapter} />));
    expect(container.querySelector('[aria-label="评论区"]')).not.toBeNull();
    expect(mount).toHaveBeenCalledWith(expect.any(HTMLElement), {
      slug: "algorithm/example",
    });
    act(() => root.unmount());
    expect(cleanup).toHaveBeenCalledOnce();
  });
});
