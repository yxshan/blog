import { describe, expect, it } from "vitest";
import { getReadingTime } from "./ReadingTime.js";

describe("getReadingTime", () => {
  it("estimates Chinese text at 400 characters per minute", () => {
    expect(getReadingTime("你好 ".repeat(200)).minutes).toBe(1);
  });

  it("returns at least one minute for short text", () => {
    expect(getReadingTime("hello world").text).toBe("不到 1 分钟");
  });
});
