import { Link } from "react-router";
import { useTheme } from "../features/theme/useTheme";
import {
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

/**
 * Header — 固定顶部导航栏
 * - 左侧：站点标题，点击跳转到首页
 * - 右侧：搜索按钮（占位）、暗色模式切换按钮
 * - 移动端（<768px）：隐藏右侧按钮，显示汉堡菜单图标（功能后续实现）
 */
function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
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

          {/* 移动端汉堡菜单（md 及以上隐藏，后续实现侧边栏菜单） */}
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white md:hidden"
            aria-label="打开菜单"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export { Header };
