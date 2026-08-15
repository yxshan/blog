import { describe, expect, it } from "vitest";
import {
  clearTags,
  readQueryState,
  toggleTag,
  updateQueryState,
} from "./queryState";

describe("query state", () => {
  it("reads supported values without losing repeated tags", () => {
    expect(
      readQueryState("?tag=链表&tag=简单&category=algorithm&focus=1&q=反转"),
    ).toEqual({
      tags: ["链表", "简单"],
      category: "algorithm",
      focus: true,
      text: "反转",
      sort: "date-desc",
      page: null,
    });
  });

  it("preserves unknown parameters while updating known values", () => {
    const next = updateQueryState("?utm=campaign&tag=old", {
      category: "algorithm",
    });
    expect(next.toString()).toBe("utm=campaign&tag=old&category=algorithm");
  });

  it("toggles and clears tags", () => {
    expect(toggleTag("?tag=a&tag=b", "a").getAll("tag")).toEqual(["b"]);
    expect(toggleTag("?tag=a", "b").getAll("tag")).toEqual(["a", "b"]);
    expect(clearTags("?tag=a&tag=b&utm=x").toString()).toBe("utm=x");
  });
});
