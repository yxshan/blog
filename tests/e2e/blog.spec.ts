import { expect, test, type Page } from "@playwright/test";
import postsIndex from "../../src/generated/posts-index.json" with { type: "json" };

const browserErrors = new WeakMap<Page, string[]>();
const publishedPosts = postsIndex.posts.filter((post) => !post.draft);
const publishedPostCount = publishedPosts.length;
const linkedIntervalPostCount = publishedPosts.filter(
  (post) => post.tags.includes("链表") && post.tags.includes("区间"),
).length;
const algorithmPostCount = publishedPosts.filter(
  (post) => post.category === "algorithm",
).length;

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

test("首页搜索、清空和无结果状态正常", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText(`共 ${publishedPostCount} 篇文章`)).toBeVisible();

  const search = page.getByPlaceholder("搜索文章标题或摘要...");
  await search.fill("找公共元素");
  await expect(page.getByText("搜索「找公共元素」找到 1 篇结果")).toBeVisible();
  await expect(page.getByRole("heading", { name: "找公共元素" })).toBeVisible();

  await page.getByRole("button", { name: "清除搜索" }).click();
  await expect(page.getByText(`共 ${publishedPostCount} 篇文章`)).toBeVisible();

  await search.fill("不存在的文章关键词");
  await expect(page.getByText("没有找到匹配的文章")).toBeVisible();
});

test("多标签、分类和未知查询参数可在刷新后恢复", async ({ page }) => {
  await page.goto("./?source=e2e");
  await page.getByTitle("筛选 链表").click();
  await page.getByTitle("筛选 区间").click();
  await expect(
    page.getByText(`共 ${linkedIntervalPostCount} 篇文章`),
  ).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.getAll("tag"))
    .toEqual(["链表", "区间"]);
  expect(new URL(page.url()).searchParams.get("source")).toBe("e2e");

  await page.reload();
  await expect(page.getByTitle("取消筛选 链表")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTitle("取消筛选 区间")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(new URL(page.url()).searchParams.get("source")).toBe("e2e");

  await page.goto("./?category=algorithm&source=e2e");
  await expect(page.getByText(`共 ${algorithmPostCount} 篇文章`)).toBeVisible();
  await expect(page.getByText("分类：algorithm ×")).toBeVisible();
});

test("Header 搜索入口返回首页并聚焦搜索框", async ({ page }) => {
  await page.goto("./posts/algorithm/reverse-list/");
  await page.getByRole("link", { name: "搜索" }).click();

  await expect(page).toHaveURL(/\/blog\/?\?focus=1$/);
  await expect(page.getByPlaceholder("搜索文章标题或摘要...")).toBeFocused();
});

test("移动端标签布局与菜单键盘交互正常", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  const tagRail = page.locator(".tag-filter-rail");
  await expect(tagRail).toBeVisible();
  const tagMetrics = await tagRail.evaluate((element) => ({
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(tagMetrics.clientHeight).toBeGreaterThanOrEqual(96);
  expect(tagMetrics.clientHeight).toBeLessThanOrEqual(112);
  expect(tagMetrics.scrollWidth).toBeGreaterThan(tagMetrics.clientWidth);

  const firstCard = page.locator(".article-card").first();
  await expect(firstCard).toBeVisible();
  expect((await firstCard.boundingBox())?.y ?? Infinity).toBeLessThan(430);

  await page.setViewportSize({ width: 360, height: 800 });
  const documentWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(documentWidth.scroll).toBeLessThanOrEqual(documentWidth.client);

  const menuButton = page.getByRole("button", { name: "打开菜单" });
  await menuButton.click();
  const menu = page.locator("[data-mobile-menu]");
  await expect(menu).toHaveAttribute("data-state", "open");
  await expect(menu).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("body")).toHaveClass(/menu-open/);
  await expect(
    page.locator("[data-menu-panel] [data-menu-close]"),
  ).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("data-state", "closed");
  await expect(page.locator("body")).not.toHaveClass(/menu-open/);
  await expect(menuButton).toBeFocused();

  await menuButton.click();
  await page
    .locator(".mobile-menu-backdrop")
    .click({ position: { x: 5, y: 5 } });
  await expect(menu).toHaveAttribute("data-state", "closed");

  await menuButton.click();
  await page.setViewportSize({ width: 1024, height: 800 });
  await expect(menu).toHaveAttribute("data-state", "closed");
  await expect(page.locator("body")).not.toHaveClass(/menu-open/);
});

test("减少动画偏好会关闭非必要过渡", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  const durations = await page
    .locator(".article-card")
    .first()
    .evaluate((card) => {
      const style = window.getComputedStyle(card);
      const toMilliseconds = (value: string) =>
        value.endsWith("ms")
          ? Number.parseFloat(value)
          : Number.parseFloat(value) * 1000;
      return {
        animation: style.animationDuration.split(", ").map(toMilliseconds),
        transition: style.transitionDuration.split(", ").map(toMilliseconds),
      };
    });
  expect(durations.animation.every((value) => value <= 0.01)).toBe(true);
  expect(durations.transition.every((value) => value <= 0.01)).toBe(true);
});

test("文章页导航、目录和主题切换正常", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./posts/algorithm/reverse-list/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByText("文章信息")).toBeVisible();
  await expect(page.getByText("正文", { exact: true })).toBeVisible();
  await expect(page.locator("time")).not.toContainText("NaN");
  await expect(
    page.getByRole("navigation", { name: "文章目录" }),
  ).toBeVisible();
  const previousPost = page.getByRole("link", { name: /上一篇：/ });
  const nextPost = page.getByRole("link", { name: /下一篇：/ });
  await expect(previousPost).toHaveAttribute("href", /^\/blog\/posts\//);
  await expect(nextPost).toHaveAttribute("href", /^\/blog\/posts\//);
  const nextPostHref = await nextPost.getAttribute("href");
  if (!nextPostHref) throw new Error("下一篇链接缺少 href");
  const expectedNextUrl = new URL(nextPostHref, page.url()).toString();
  await expect(page.locator('iframe[src*="giscus"]')).toHaveCount(0);

  const firstTocItem = page.getByRole("button", { name: "题目信息" });
  await firstTocItem.click();
  await expect(firstTocItem).toHaveAttribute("aria-current", "location");
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);

  const copyButton = page.getByRole("button", { name: "复制代码" }).first();
  await copyButton.click();
  await expect(copyButton).toContainText("已复制");

  await page.getByRole("button", { name: "切换到暗色模式" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await nextPost.click();
  await expect(page).toHaveURL(expectedNextUrl);
});
