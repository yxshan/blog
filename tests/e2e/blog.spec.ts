import { expect, test, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();

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
  await expect(page.getByText("共 14 篇文章")).toBeVisible();

  const search = page.getByPlaceholder("搜索文章标题或摘要...");
  await search.fill("找公共元素");
  await expect(page.getByText("搜索「找公共元素」找到 1 篇结果")).toBeVisible();
  await expect(page.getByRole("heading", { name: "找公共元素" })).toBeVisible();

  await page.getByRole("button", { name: "清除搜索" }).click();
  await expect(page.getByText("共 14 篇文章")).toBeVisible();

  await search.fill("不存在的文章关键词");
  await expect(page.getByText("没有找到匹配的文章")).toBeVisible();
});

test("多标签、分类和未知查询参数可在刷新后恢复", async ({ page }) => {
  await page.goto("./?source=e2e");
  await page.getByTitle("筛选 链表").click();
  await page.getByTitle("筛选 区间").click();
  await expect(page.getByText("共 2 篇文章")).toBeVisible();
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
  await expect(page.getByText("共 4 篇文章")).toBeVisible();
  await expect(page.getByText("分类：algorithm ×")).toBeVisible();
});

test("Header 搜索入口返回首页并聚焦搜索框", async ({ page }) => {
  await page.goto("./posts/algorithm/reverse-list/");
  await page.getByRole("link", { name: "搜索" }).click();

  await expect(page).toHaveURL(/\/blog\/?\?focus=1$/);
  await expect(page.getByPlaceholder("搜索文章标题或摘要...")).toBeFocused();
});

test("文章页导航、目录和主题切换正常", async ({ page }) => {
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

  await page.getByRole("button", { name: "题目信息" }).click();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);

  await page.getByRole("button", { name: "切换到暗色模式" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await nextPost.click();
  await expect(page).toHaveURL(expectedNextUrl);
});
