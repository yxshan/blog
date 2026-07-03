import { useEffect, useState } from "react";

// ============================================================
// 阅读进度条
// 固定在页面顶部，随滚动实时显示阅读进度
// 使用 requestAnimationFrame 节流优化滚动性能
// ============================================================

/**
 * 阅读进度条组件
 *
 * 特性：
 *   - 固定顶部，z-50，高度 4px
 *   - 渐变背景：indigo-500 → purple-500
 *   - 使用 requestAnimationFrame 节流，避免频繁重排
 *   - 到达顶部或底部时自动隐藏
 *   - 过渡动画：width 0.1s ease-out
 *
 * @returns {JSX.Element|null} 进度条元素
 */
export default function ReadingProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let ticking = false;

    /**
     * 计算并更新阅读进度百分比
     *
     * 公式：
     *   阅读进度 = scrollY / (文档总高 - 视口高) * 100
     *
     * 边界处理：
     *   - scrollY <= 0         → width = 0（顶部隐藏）
     *   - scroll 已达底部附近  → width = 0（底部隐藏）
     *   - 中间范围正常显示
     */
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight;
          const viewHeight = window.innerHeight;
          const maxScroll = docHeight - viewHeight;

          if (maxScroll <= 0) {
            setWidth(0);
          } else {
            const progress = (scrollY / maxScroll) * 100;

            // 顶部或底部时隐藏（width = 0），中间段正常显示
            if (scrollY <= 0 || progress >= 100) {
              setWidth(0);
            } else {
              setWidth(progress);
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    // 初始化时立即计算一次
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-1" aria-hidden="true">
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${width}%`,
          background: "linear-gradient(90deg, #6366f1, #a855f7)",
        }}
      />
    </div>
  );
}
