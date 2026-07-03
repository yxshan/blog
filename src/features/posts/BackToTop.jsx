import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

// ============================================================
// 返回顶部按钮
// 当滚动超过一屏高度时显示，点击平滑返回页面顶部
// ============================================================

/**
 * 返回顶部按钮组件
 *
 * 特性：
 *   - 固定在右下角，z-40
 *   - 滚动超过一屏高度（window.innerHeight）时渐入显示
 *   - 点击后以平滑动画滚动回顶部
 *   - 圆角、阴影，浅色/深色模式自适应背景
 *   - 带透明度淡入淡出过渡
 *
 * @returns {JSX.Element|null} 按钮元素
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /**
     * 监听滚动位置，切换按钮可见性
     *
     * 逻辑：
     *   scrollY > window.innerHeight → 显示（已滚过一屏）
     *   scrollY <= window.innerHeight → 隐藏
     */
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    // 初始化时检查当前滚动位置
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /**
   * 平滑滚动回页面顶部
   */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="返回顶部"
      className={`
        fixed bottom-8 right-8 z-40
        rounded-full p-3
        shadow-lg
        bg-white dark:bg-gray-800
        text-gray-600 dark:text-gray-300
        hover:text-gray-900 dark:hover:text-white
        hover:shadow-xl
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-indigo-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
