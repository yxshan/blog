import { describe, expect, it } from "vitest";
import { validatePosts } from "./validate-posts.mjs";

describe("validatePosts", () => {
  it("passes for the current posts directory", () => {
    expect(() => validatePosts()).not.toThrow();
  });
});
