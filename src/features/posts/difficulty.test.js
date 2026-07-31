import { describe, expect, it } from "vitest";
import { normalizeDifficulty } from "./difficulty.js";

describe("normalizeDifficulty", () => {
  it("normalizes Chinese and English difficulty values", () => {
    expect(normalizeDifficulty("简单")).toBe("easy");
    expect(normalizeDifficulty("中等")).toBe("medium");
    expect(normalizeDifficulty("困难")).toBe("hard");
    expect(normalizeDifficulty("easy")).toBe("easy");
    expect(normalizeDifficulty("medium")).toBe("medium");
    expect(normalizeDifficulty("hard")).toBe("hard");
  });

  it("returns null for missing or unknown values", () => {
    expect(normalizeDifficulty()).toBeNull();
    expect(normalizeDifficulty(null)).toBeNull();
    expect(normalizeDifficulty("impossible")).toBeNull();
  });
});
