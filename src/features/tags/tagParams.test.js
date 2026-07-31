import { describe, expect, it } from "vitest";
import { clearTagParams, toggleTagParam } from "./tagParams.js";

describe("tagParams", () => {
  it("adds a tag", () => {
    const next = toggleTagParam(new URLSearchParams(), "简单");
    expect(next.getAll("tag")).toEqual(["简单"]);
  });

  it("removes a tag when clicked again", () => {
    const next = toggleTagParam(new URLSearchParams("?tag=简单"), "简单");
    expect(next.getAll("tag")).toEqual([]);
  });

  it("keeps other tags when toggling one off", () => {
    const next = toggleTagParam(
      new URLSearchParams("?tag=简单&tag=链表"),
      "简单",
    );
    expect(next.getAll("tag")).toEqual(["链表"]);
  });

  it("clears all tags", () => {
    const next = clearTagParams(new URLSearchParams("?tag=简单&tag=链表"));
    expect(next.getAll("tag")).toEqual([]);
  });
});
