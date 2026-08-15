import { describe, expect, it } from "vitest";
import { getTagColor } from "./tagColors";

describe("tag colors", () => {
  it("uses fixed semantic colors for difficulty tags", () => {
    expect(getTagColor("简单").text).toContain("green");
    expect(getTagColor("中等").text).toContain("yellow");
    expect(getTagColor("困难").text).toContain("red");
  });

  it("maps arbitrary tags to a deterministic palette color", () => {
    expect(getTagColor("链表")).toEqual(getTagColor("链表"));
    expect(getTagColor("链表")).toHaveProperty("bg");
    expect(getTagColor("链表")).toHaveProperty("text");
  });
});
