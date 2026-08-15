import { describe, expect, it } from "vitest";
import { formatDate, toDate } from "./date";

describe("post dates", () => {
  it("keeps date-only values stable across timezone boundaries", () => {
    const date = toDate("2026-07-28");
    expect(date?.toISOString()).toBe("2026-07-28T00:00:00.000Z");
    expect(formatDate(date)).toBe("2026-07-28");
  });

  it("returns safe output for missing or invalid values", () => {
    expect(toDate("invalid")).toBeNull();
    expect(formatDate(null)).toBe("");
  });
});
