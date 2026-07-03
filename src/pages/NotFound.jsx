import { Link } from "react-router";

/**
 * NotFound — 404 页面未找到
 *
 * 显示简洁的错误提示，并提供返回首页的链接。
 * 用于 react-router 的通配符路由 `path="*"`。
 */
function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      {/* 错误码 */}
      <h1 className="mb-4 text-8xl font-bold text-gray-200 dark:text-gray-800">
        404
      </h1>

      {/* 提示信息 */}
      <p className="mb-2 text-xl text-gray-600 dark:text-gray-400">
        页面未找到
      </p>
      <p className="mb-8 text-sm text-gray-400 dark:text-gray-500">
        你访问的页面不存在或已被移除
      </p>

      {/* 返回首页 */}
      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
      >
        返回首页
      </Link>
    </div>
  );
}

export { NotFound };
