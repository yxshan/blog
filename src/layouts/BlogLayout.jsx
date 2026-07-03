import { Outlet } from "react-router";
import { Header } from "../shared/Header";
import { Footer } from "../shared/Footer";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { ThemeProvider } from "../features/theme/ThemeProvider";

/**
 * BlogLayout — 全局布局包裹器
 *
 * 结构：
 *   ThemeProvider（提供主题上下文）
 *     └── 页面容器（min-h-screen, flex flex-col）
 *           ├── Header（固定顶部）
 *           ├── 跳到正文（无障碍跳过链接）
 *           ├── main（flex-1，内容出口）
 *           │     └── ErrorBoundary（错误边界）
 *           │           └── Outlet（路由出口）
 *           └── Footer（底部）
 */
function BlogLayout() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Header />

        {/* 无障碍跳过导航链接 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-white focus:text-black focus:p-2"
        >
          跳到正文
        </a>

        <main id="main-content" className="flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export { BlogLayout };
