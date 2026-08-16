import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  query,
  onQueryChange,
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="search-shell relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="搜索文章标题或摘要..."
        className="search-input w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-12 text-sm text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
      />
      <button
        type="button"
        onClick={() => onQueryChange("")}
        disabled={!query}
        aria-hidden={!query}
        data-visible={Boolean(query)}
        className="search-clear absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label="清除搜索"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
