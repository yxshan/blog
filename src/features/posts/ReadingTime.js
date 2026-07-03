// ============================================================
// 阅读时长估算工具
// 根据文本内容智能估算阅读时间
//
// 策略：
//   - 中文文本：按 400 字/分钟估算（去除空白和换行符）
//   - 英文/混合文本：按 200 词/分钟估算
//   - 不足 1 分钟时：返回"不到 1 分钟"
// ============================================================

/**
 * 判断文本是否以中文为主
 *
 * 逻辑：
 *   扫描文本中的中文字符（Unicode 范围 \u4e00-\u9fff），
 *   如果中文字符占比 >= 30%，则视为中文文本，使用字/分钟估算；
 *   否则视为英文/混合文本，使用词/分钟估算。
 *
 * @param {string} text - 待判断的文本
 * @returns {boolean} 是否以中文为主
 */
function isChinese(text) {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g);
  if (!chineseChars) return false;

  const totalChars = text.replace(/\s/g, "").length;
  return chineseChars.length / totalChars >= 0.3;
}

/**
 * 估算阅读时长
 *
 * @param {string} text - 文章文本（Markdown 原文或纯文本）
 * @returns {{ minutes: number, text: string }}
 *   - minutes: 估算的分钟数（向上取整，至少为 1）
 *   - text:    中文显示文本（如 "约 3 分钟" 或 "不到 1 分钟"）
 *
 * @example
 *   getReadingTime("你好世界")        → { minutes: 1, text: "不到 1 分钟" }
 *   getReadingTime("a".repeat(400))  → { minutes: 1, text: "不到 1 分钟" }
 *   getReadingTime("a".repeat(600))  → { minutes: 3, text: "约 3 分钟" }
 */
export function getReadingTime(text) {
  if (!text || text.trim().length === 0) {
    return { minutes: 1, text: "不到 1 分钟" };
  }

  // 去除首尾空白
  const cleaned = text.trim();

  if (isChinese(cleaned)) {
    // 中文：统计字符（去除空白和换行），按 400 字/分钟估算
    const charCount = cleaned.replace(/[\s\n\r]/g, "").length;
    const minutes = Math.ceil(charCount / 400);
    return {
      minutes: Math.max(1, minutes),
      text: minutes <= 1 ? "不到 1 分钟" : `约 ${minutes} 分钟`,
    };
  } else {
    // 英文/混合：统计单词，按 200 词/分钟估算
    const words = cleaned.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(words / 200);
    return {
      minutes: Math.max(1, minutes),
      text: minutes <= 1 ? "不到 1 分钟" : `约 ${minutes} 分钟`,
    };
  }
}
