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
    <div className="flex flex-wrap items-center gap-2">
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
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150 ${
              isSelected
                ? `${bg} ${text} ring-1 ring-inset ring-current`
                : "bg-white text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full bg-current ${isSelected ? text : "text-gray-400"}`}
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
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-200 transition-colors duration-150 hover:text-gray-600 hover:ring-gray-400"
          title="清除全部筛选"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>清除</span>
        </button>
      )}
    </div>
  );
}
