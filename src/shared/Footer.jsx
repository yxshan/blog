/**
 * Footer — 底部信息栏
 * - 居中显示版权信息和构建技术栈
 */
function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; 2026 yxshan&apos;s Blog
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Built with React + Vite
        </p>
      </div>
    </footer>
  );
}

export { Footer };
