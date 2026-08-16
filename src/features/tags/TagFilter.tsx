import { XMarkIcon } from "@heroicons/react/24/outline";
import type { TagCount } from "../home/postFilter";
import { getTagColor } from "./tagColors";

interface TagFilterProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClear: () => void;
  tags?: TagCount[];
}

export default function TagFilter({
  selectedTags,
  onToggleTag,
  onClear,
  tags = [],
}: TagFilterProps) {
  return (
    <div className="tag-filter-shell" data-tag-filter>
      <div className="tag-filter-rail">
        {tags.map(({ name, count }) => {
          const isSelected = selectedTags.includes(name);
          const { bg, text } = getTagColor(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => onToggleTag(name)}
              aria-pressed={isSelected}
              title={isSelected ? `取消筛选 ${name}` : `筛选 ${name}`}
              className={`tag-filter-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                isSelected
                  ? `${bg} ${text} ring-1 ring-inset ring-current`
                  : "bg-white text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full bg-current ${isSelected ? text : "text-gray-400 dark:text-gray-500"}`}
              />
              <span>{name}</span>
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}

        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="tag-filter-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-200 hover:text-gray-600 hover:ring-gray-400 dark:ring-gray-700 dark:hover:text-gray-200"
            title="清除全部筛选"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>清除</span>
          </button>
        )}
      </div>
    </div>
  );
}
