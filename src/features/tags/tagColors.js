// ============================================================
// 标签颜色映射
// ============================================================

/**
 * 为常见难度标签返回固定颜色
 */
const DIFFICULTY_COLORS = {
  简单: { bg: "bg-green-100", text: "text-green-700" },
  中等: { bg: "bg-yellow-100", text: "text-yellow-700" },
  困难: { bg: "bg-red-100", text: "text-red-700" },
};

/**
 * 调色板：共 16 种颜色，供非难度标签使用
 */
const PALETTE = [
  { bg: "bg-slate-100", text: "text-slate-700" },
  { bg: "bg-red-100", text: "text-red-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-lime-100", text: "text-lime-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
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
