import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useTheme } from "../features/theme/useTheme";
import { getCategories } from "../features/posts/categories";
import { useTags } from "../features/tags/useTags";
import {
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/**
 * Header — 固定顶部导航栏
 * - 左侧：站点标题，点击跳转到首页
 * - 右侧：搜索按钮（占位）、暗色模式切换按钮
 * - 移动端（<768px）：隐藏右侧按钮，显示汉堡菜单图标（功能后续实现）
 */
function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const categories = useMemo(() => getCategories(), []);
  const tags = useTags().slice(0, 8);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* 左侧：站点标题 */}
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 no-underline hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
          >
            yxshan&apos;s Blog
          </Link>

          {/* 右侧：操作按钮区 */}
          <div className="flex items-center gap-2">
            {/* 搜索按钮：点击跳转到首页并自动聚焦搜索框 */}
            <Link
              to="/?focus=1"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="搜索"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Link>

            {/* 暗色模式切换 */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
            >
              {isDark ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* 移动端汉堡菜单 */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white md:hidden"
              aria-label="打开菜单"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <nav className="absolute right-0 top-0 h-full w-80 overflow-y-auto border-l border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-bold">导航</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="关闭菜单"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <Link
              to="/"
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              首页
            </Link>
            <Link
              to="/?focus=1"
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              搜索
            </Link>

            <h3 className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              分类
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/?category=${encodeURIComponent(category.slug)}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-400">
                    {category.count}
                  </span>
                </Link>
              ))}
            </div>

            <h3 className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              热门标签
            </h3>
            <div className="flex flex-wrap gap-2 px-3">
              {tags.map((tag) => (
                <Link
                  key={tag.name}
                  to={`/?tag=${encodeURIComponent(tag.name)}`}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export { Header };
