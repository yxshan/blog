import { useEffect, useState, useCallback } from "react";

// ============================================================
// 文章目录（Table of Contents）组件
//
// 特性：
//   - 从渲染后的文章 DOM 中提取 h2/h3 标题（依赖 rehype-slug 生成的 id）
//   - 桌面端：sticky 侧边栏，固定右侧，超出时滚动
//   - 移动端：默认隐藏
//   - 滚动监听：IntersectionObserver 高亮当前阅读位置对应的标题
//   - 点击标题平滑滚动到对应位置
//   - 无标题时自动隐藏整个组件
// ============================================================

/**
 * 从 prose 容器中提取标题信息
 *
 * 查询 .prose 容器下所有带 id 属性的 h2 和 h3 元素，
 * 构建为 { id, text, level } 的扁平数组
 *
 * @returns {Array<{ id: string, text: string, level: number }>}
 */
function extractHeadings() {
  const elements = document.querySelectorAll(".prose h2[id], .prose h3[id]");
  return Array.from(elements).map((el) => ({
    id: el.id,
    text: el.textContent || "",
    level: Number(el.tagName[1]),
  }));
}

/**
 * 将扁平的标题数组转为嵌套树结构
 *
 * 规则：
 *   - h2（level === 2）作为顶级节点
 *   - h3（level === 3）作为最近一个 h2 的子节点
 *   - 未被 h2 包裹的 h3 直接丢弃
 *
 * @param {Array<{ id: string, text: string, level: number }>} flatHeadings
 * @returns {Array<{ id: string, text: string, level: number, children: Array }>}
 */
function buildHeadingTree(flatHeadings) {
  const tree = [];
  let lastH2Index = -1;

  for (const item of flatHeadings) {
    if (item.level === 2) {
      tree.push({ ...item, children: [] });
      lastH2Index = tree.length - 1;
    } else if (item.level === 3 && lastH2Index >= 0) {
      tree[lastH2Index].children.push(item);
    }
  }

  return tree;
}

/**
 * TOC 组件
 *
 * @param {{ slug: string }} props
 *   slug — 文章标识，用作 useEffect 依赖，文章切换时重新提取标题
 */
export default function TOC({ slug }) {
  // 嵌套标题树
  const [tree, setTree] = useState([]);
  // 当前活跃（视口中）的标题 id
  const [activeId, setActiveId] = useState(null);

  // ============================================================
  // 提取标题 & 建立 IntersectionObserver
  // ============================================================
  useEffect(() => {
    // 提取当前页面所有 prose 容器内的标题
    const flatHeadings = extractHeadings();

    if (flatHeadings.length === 0) {
      setTree([]);
      return;
    }

    setTree(buildHeadingTree(flatHeadings));

    // —— 建立 IntersectionObserver 实现滚动监听 ——
    //
    // rootMargin 说明：
    //   top: -80px   — 标题距离视口顶部至少 80px 才算"进入"
    //                   留出 sticky header 的空间
    //   bottom: -80% — 标题必须在视口上方 20% 内才算"当前"
    //                   这样用户正在阅读该段落时标题才高亮
    const observer = new IntersectionObserver(
      (entries) => {
        // 取所有正在相交的标题，选 DOM 顺序中最早的那个
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort((a, b) => {
            // 按 DOM 出现顺序排序
            const pos = a.compareDocumentPosition(b);
            return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          });

        if (visible.length > 0) {
          setActiveId(visible[0].id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    // 观察所有标题元素
    const elements = document.querySelectorAll(".prose h2[id], .prose h3[id]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [slug]);

  // ============================================================
  // 点击标题 → 平滑滚动
  // ============================================================
  const handleClick = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // ============================================================
  // 无标题时不渲染
  // ============================================================
  if (tree.length === 0) return null;

  return (
    <nav aria-label="文章目录" className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
        {/* 目录标题 */}
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          目录
        </h3>

        {/* 嵌套标题列表 */}
        <ul className="space-y-1 border-l border-gray-200 dark:border-gray-700">
          {tree.map((h2) => (
            <li key={h2.id}>
              {/* h2 标题项 */}
              <button
                onClick={() => handleClick(h2.id)}
                className={`
                  block w-full py-1 pl-3 pr-2 text-left text-sm transition-colors
                  border-l-2 -ml-px
                  ${
                    activeId === h2.id
                      ? "border-indigo-500 text-indigo-600 font-bold dark:text-indigo-400"
                      : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }
                `}
              >
                {h2.text}
              </button>

              {/* h3 子标题（缩进） */}
              {h2.children.length > 0 && (
                <ul className="space-y-1">
                  {h2.children.map((h3) => (
                    <li key={h3.id}>
                      <button
                        onClick={() => handleClick(h3.id)}
                        className={`
                          block w-full py-1 pl-6 pr-2 text-left text-sm transition-colors
                          border-l-2 -ml-px
                          ${
                            activeId === h3.id
                              ? "border-indigo-500 text-indigo-600 font-bold dark:text-indigo-400"
                              : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
                          }
                        `}
                      >
                        {h3.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
