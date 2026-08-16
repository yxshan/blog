import { expect, test, type Page } from "@playwright/test";

async function stabilizePage(page: Page, view: "home" | "article") {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after { caret-color: transparent !important; }
    `,
  });
  await page.evaluate((currentView) => {
    if (currentView === "home") {
      const tagButtons = [
        ...document.querySelectorAll<HTMLButtonElement>(
          ".tag-filter-rail .tag-filter-chip",
        ),
      ];
      tagButtons.forEach((button, index) => {
        if (index >= 10) {
          button.remove();
          return;
        }
        const parts = button.querySelectorAll("span");
        if (parts[1]) parts[1].textContent = `标签${index + 1}`;
        if (parts[2]) parts[2].textContent = `(${10 - index})`;
      });

      const resultCount = document.querySelector<HTMLElement>(
        "[data-result-count]",
      );
      if (resultCount) resultCount.textContent = "共 1 篇文章";
      const list = document.querySelector<HTMLElement>("[data-post-list]");
      const card = document.querySelector<HTMLAnchorElement>(
        'a.article-card[href$="/posts/algorithm/reverse-list"]',
      );
      if (list && card) {
        card.querySelector("h2")!.textContent = "稳定的文章标题示例";
        const paragraphs = card.querySelectorAll("p");
        if (paragraphs[0]) paragraphs[0].textContent = "2026-08-16";
        if (paragraphs[1]) {
          paragraphs[1].textContent =
            "这是一段用于视觉回归的稳定摘要，验证卡片的字号、行距、留白与层级。";
        }
        list.replaceChildren(card);
      }
      return;
    }

    const prose = document.querySelector<HTMLElement>(".article-prose");
    if (prose) {
      prose.innerHTML = `
        <h2 id="visual-heading">题目信息</h2>
        <p>这是一段稳定的正文示例，用于验证文章的字号、行距与阅读宽度。</p>
        <blockquote><p>克制的视觉反馈应该帮助阅读，而不是争夺注意力。</p></blockquote>
        <div class="code-block-wrapper">
          <div class="code-block-header"><span>C</span><button class="code-copy-btn" type="button">复制</button></div>
          <div class="code-block-body"><pre><code>int answer = 42;</code></pre></div>
        </div>
      `;
    }
  }, view);
  if (view === "home") {
    await expect(page.locator(".article-card")).toContainText(
      "稳定的文章标题示例",
    );
  } else {
    await expect(page.locator(".article-prose")).toBeVisible();
    await expect(page.locator(".article-prose")).toContainText(
      "稳定的正文示例",
    );
  }
}

test("桌面端亮色首页视觉基线", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./");
  await stabilizePage(page, "home");
  await expect(page).toHaveScreenshot("home-desktop-light.png", {
    animations: "disabled",
  });
});

test("移动端亮色首页视觉基线", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./");
  await stabilizePage(page, "home");
  await expect(page).toHaveScreenshot("home-mobile-light.png", {
    animations: "disabled",
  });
});

test("桌面端暗色文章页视觉基线", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("./posts/algorithm/reverse-list/");
  await stabilizePage(page, "article");
  await expect(page).toHaveScreenshot("article-desktop-dark.png", {
    animations: "disabled",
  });
});

test("移动端亮色文章页视觉基线", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./posts/algorithm/reverse-list/");
  await stabilizePage(page, "article");
  await expect(page).toHaveScreenshot("article-mobile-light.png", {
    animations: "disabled",
  });
});
