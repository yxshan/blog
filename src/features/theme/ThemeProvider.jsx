import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ThemeContext：保存主题状态和方法，供 useTheme hook 消费
const ThemeContext = createContext(null);

/**
 * 获取初始主题值，优先级：
 * 1. localStorage 中用户显式设置的主题
 * 2. 系统偏好 prefers-color-scheme: dark
 * 3. 默认 'light'
 */
function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // 同步 dark class 到 <html> 元素，适配 Tailwind darkMode: 'class'
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // 监听系统主题变化：仅在用户未设置 localStorage 偏好时自动跟随
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // localStorage 中无用户显式偏好时才自动更新
      if (localStorage.getItem("theme") === null) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 切换主题（light ↔ dark），并持久化到 localStorage
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  // 设置指定主题值，并持久化到 localStorage
  const setThemeWithPersist = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme,
      setTheme: setThemeWithPersist,
    }),
    [theme, toggleTheme, setThemeWithPersist],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export { ThemeContext, ThemeProvider };
