import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

/**
 * 虚拟滚动列表 — 基于 @tanstack/react-virtual v3
 *
 * 仅渲染可视区域内的项，大幅降低 DOM 节点数量，
 * 适用于文章列表等长列表场景。
 *
 * @param {{ items: any[], renderItem: (item: any, index: number) => React.ReactNode, estimateSize?: number, overscan?: number }} props
 *   - items:         数据数组
 *   - renderItem:    单项渲染函数，接收 (item, index)
 *   - estimateSize:  单项预估高度（px），默认 120
 *   - overscan:      可见区域外额外渲染的项数，默认 5
 */
export default function VirtualList({
  items,
  renderItem,
  estimateSize = 120,
  overscan = 5,
}) {
  // 滚动容器引用，传递给 useVirtualizer 以监听滚动事件
  const scrollRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: (index) => items[index]?.slug ?? index,
    measureElement: (element) => element.getBoundingClientRect().height,
    useFlushSync: false, // React 19 兼容：避免与自动批处理冲突
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    // 外层：滚动容器，占满父容器高度
    <div ref={scrollRef} className="h-full overflow-auto">
      {/* 内层：相对定位容器，高度等于所有项的总高度，撑出滚动条 */}
      <div className="relative" style={{ height: `${totalSize}px` }}>
        {/* 只渲染可视区域内（含 overscan）的项 */}
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
