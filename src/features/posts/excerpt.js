/**
 * 提取文章摘要（前 150 个字符）
 *
 * 处理流程：
 *   1. 移除 Markdown 语法标记（标题、代码块、链接、列表等）
 *   2. 取清理后文本的前 150 个字符
 *   3. 去除首尾空白
 */
export function extractExcerpt(content) {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, "") // 代码块（优先处理，避免内部语法干扰）
    .replace(/^#{1,6}\s+.*$/gm, "") // 标题
    .replace(/^---\s*$/gm, "") // 水平分割线
    .replace(/^>\s*/gm, "") // 引用
    .replace(/^\s*[-*+]\s/gm, "") // 无序列表
    .replace(/^\s*\d+\.\s/gm, "") // 有序列表
    .replace(/\|/g, "") // 表格管道符
    .replace(/`([^`]+)`/g, "$1") // 行内代码
    .replace(/\*\*([^*]+)\*\*/g, "$1") // 加粗
    .replace(/\*([^*]+)\*/g, "$1") // 斜体
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 链接
    .replace(/\n{2,}/g, " ") // 多个换行合并为空格
    .trim();

  return cleaned.slice(0, 150).trim();
}
