interface MarkdownTextOptions {
  includeCode?: boolean;
  includeHeadings?: boolean;
}

export function markdownToPlainText(
  content: string,
  { includeCode = false, includeHeadings = false }: MarkdownTextOptions = {},
): string {
  return content
    .replace(/```[^\n]*\n?([\s\S]*?)```/g, (_match, code: string) =>
      includeCode ? code : " ",
    )
    .replace(/!\[\[[^\]]+\]\]/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/^\s{0,3}#{1,6}\s+(.+)$/gm, (_match, heading: string) =>
      includeHeadings ? heading : " ",
    )
    .replace(/^---\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .replace(/\|/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, "$1$2")
    .replace(/[$~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractExcerpt(content: string): string {
  const cleaned = markdownToPlainText(content);
  return cleaned.slice(0, 150).trim();
}
