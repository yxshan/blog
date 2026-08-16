/** @vitest-environment happy-dom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import type { RuntimePost } from "../../core/contracts";
import PostList from "./PostList";

function createPost(slug: string, title: string): RuntimePost {
  return {
    slug,
    category: "algorithm",
    title,
    date: new Date("2026-08-16T00:00:00Z"),
    updated: null,
    tags: ["链表"],
    difficulty: "easy",
    leetcode: null,
    draft: false,
    excerpt: `${title}摘要`,
    modulePath: `/posts/${slug}/index.md`,
    searchText: title,
  };
}

describe("PostList", () => {
  it("keeps catalog order when the transition key changes", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const posts = [createPost("a", "第一篇"), createPost("b", "第二篇")];

    act(() => root.render(<PostList posts={posts} transitionKey="first" />));
    act(() => root.render(<PostList posts={posts} transitionKey="second" />));

    expect(
      [...container.querySelectorAll("h2")].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(["第一篇", "第二篇"]);
    expect(container.querySelector("[data-post-list]")).not.toBeNull();
    act(() => root.unmount());
    container.remove();
  });

  it("renders a stable empty state", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(<PostList posts={[]} transitionKey="empty" />));
    expect(container.querySelector(".post-empty-state")?.textContent).toContain(
      "没有找到匹配的文章",
    );
    act(() => root.unmount());
    container.remove();
  });
});
