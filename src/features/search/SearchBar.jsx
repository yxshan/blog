import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * 搜索输入框组件 — 受控组件
 *
 * Props:
 * - query: 当前搜索词
 * - onQueryChange: 搜索词变更回调
 */
export default function SearchBar({ query, onQueryChange, autoFocus }) {
  return (
    <div className="relative">
      {/* 左侧放大镜图标 */}
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        ref={(el) => {
          if (autoFocus && el) el.focus();
        }}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="搜索文章标题或摘要..."
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />

      {/* 非空时显示清除按钮 */}
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
