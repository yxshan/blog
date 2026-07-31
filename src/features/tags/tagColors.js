// ============================================================
// 标签颜色映射
// ============================================================

/**
 * 为常见难度标签返回固定颜色
 */
const DIFFICULTY_COLORS = {
  简单: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-300",
  },
  中等: {
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  困难: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
  },
};

/**
 * 调色板：共 16 种颜色，供非难度标签使用
 */
const PALETTE = [
  {
    bg: "bg-slate-100 dark:bg-slate-900/40",
    text: "text-slate-700 dark:text-slate-300",
  },
  {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
  },
  {
    bg: "bg-orange-100 dark:bg-orange-900/40",
    text: "text-orange-700 dark:text-orange-300",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    bg: "bg-lime-100 dark:bg-lime-900/40",
    text: "text-lime-700 dark:text-lime-300",
  },
  {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    bg: "bg-teal-100 dark:bg-teal-900/40",
    text: "text-teal-700 dark:text-teal-300",
  },
  {
    bg: "bg-cyan-100 dark:bg-cyan-900/40",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  {
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-700 dark:text-sky-300",
  },
  {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  {
    bg: "bg-violet-100 dark:bg-violet-900/40",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    bg: "bg-fuchsia-100 dark:bg-fuchsia-900/40",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  {
    bg: "bg-pink-100 dark:bg-pink-900/40",
    text: "text-pink-700 dark:text-pink-300",
  },
  {
    bg: "bg-rose-100 dark:bg-rose-900/40",
    text: "text-rose-700 dark:text-rose-300",
  },
];

/**
 * 简单的字符串哈希函数
 * 将标签名映射为一个非负整数，保证相同标签始终得到相同颜色
 *
 * @param {string} str - 标签名
 * @returns {number} 哈希值
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

/**
 * 根据标签名返回对应的 Tailwind 颜色类名
 *
 * 规则：
 *   - 简单 / 中等 / 困难 → 固定颜色（绿 / 黄 / 红）
 *   - 其他标签 → 基于哈希从调色板中选取，保证相同标签一致性
 *
 * @param {string} tagName - 标签名称
 * @returns {{ bg: string, text: string }} bg/text 对应的 Tailwind 类名
 */
export function getTagColor(tagName) {
  // 优先匹配难度标签
  if (DIFFICULTY_COLORS[tagName]) {
    return DIFFICULTY_COLORS[tagName];
  }

  // 其他标签通过哈希取模确定颜色
  const index = hashString(tagName) % PALETTE.length;
  return PALETTE[index];
}
