export interface ReadingTime {
  minutes: number;
  text: string;
}

function isChinese(text: string): boolean {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g);
  if (!chineseChars) return false;
  const totalChars = text.replace(/\s/g, "").length;
  return chineseChars.length / totalChars >= 0.3;
}

export function getReadingTime(text: string): ReadingTime {
  if (!text || text.trim().length === 0) {
    return { minutes: 1, text: "不到 1 分钟" };
  }

  const cleaned = text.trim();
  const units = isChinese(cleaned)
    ? cleaned.replace(/[\s\n\r]/g, "").length
    : cleaned.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(units / (isChinese(cleaned) ? 400 : 200));

  return {
    minutes: Math.max(1, minutes),
    text: minutes <= 1 ? "不到 1 分钟" : `约 ${minutes} 分钟`,
  };
}
