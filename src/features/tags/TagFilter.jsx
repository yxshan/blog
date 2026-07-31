// ============================================================
// 标签筛选组件
// ============================================================

import { XMarkIcon } from "@heroicons/react/24/outline";
import { getTagColor } from "./tagColors";
import { useTags } from "./useTags";

/**
 * 标签筛选按钮组
 *
 * 受控组件，状态由父组件管理。展示所有标签及文章数，
 * 已选标签高亮填充，未选标签为幽灵样式。
 *
 * @param {{ selectedTags: string[], onToggleTag: (tag: string) => void }} props
 */
export default function TagFilter({ selectedTags, onToggleTag, onClear }) {
  const tags = useTags();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map(({ name, count }) => {
        const isSelected = selectedTags.includes(name);
        const { bg, text } = getTagColor(name);

        return (
          <button
            key={name}
            onClick={() => onToggleTag(name)}
            className={`
              inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium
              transition-colors duration-150
              ${
                isSelected
                  ? `${bg} ${text} ring-1 ring-inset ring-current`
                  : "bg-white text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              }
            `}
          >
            {/* 颜色圆点 */}
            <span
              className={`inline-block h-2 w-2 rounded-full bg-current ${isSelected ? text : "text-gray-400"}`}
            />
            <span>{name}</span>
            <span className="text-xs opacity-60">({count})</span>
          </button>
        );
      })}

      {/* 当有标签被选中时，显示"清除全部"按钮 */}
      {selectedTags.length > 0 && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-gray-400 ring-1 ring-inset ring-gray-200 hover:text-gray-600 hover:ring-gray-400 transition-colors duration-150"
          title="清除全部筛选"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>清除</span>
        </button>
      )}
    </div>
  );
}
