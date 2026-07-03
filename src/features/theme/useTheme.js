import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";

/**
 * useTheme - 访问主题上下文的自定义 Hook
 *
 * 返回值：
 * - theme: 当前主题 'light' | 'dark'
 * - isDark: 布尔值，当前是否为暗色模式
 * - toggleTheme: 切换 light ↔ dark
 * - setTheme: 设置指定主题值
 *
 * 必须在 <ThemeProvider> 内部使用，否则会抛出错误。
 */
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用");
  }
  return context;
}

export { useTheme };
