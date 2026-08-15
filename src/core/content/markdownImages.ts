export interface MarkdownImageReference {
  source: string;
  alt: string;
  target: string;
  start: number;
  end: number;
  contentStart: number;
  targetEnd: number;
  suffixStart: number;
  wrapped: boolean;
}

function findClosingParenthesis(markdown: string, start: number): number {
  let nestedParentheses = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;
  for (let index = start; index < markdown.length; index += 1) {
    const character = markdown[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(") nestedParentheses += 1;
    if (character === ")") {
      if (nestedParentheses === 0) return index;
      nestedParentheses -= 1;
    }
  }
  return -1;
}

export function findMarkdownImages(markdown: string): MarkdownImageReference[] {
  const images: MarkdownImageReference[] = [];
  let cursor = 0;
  while (cursor < markdown.length) {
    const start = markdown.indexOf("![", cursor);
    if (start < 0) break;
    const altEnd = markdown.indexOf("]", start + 2);
    if (altEnd < 0 || markdown[altEnd + 1] !== "(") {
      cursor = start + 2;
      continue;
    }

    const contentStart = altEnd + 2;
    let targetStart = contentStart;
    while (/\s/.test(markdown[targetStart] ?? "")) targetStart += 1;
    let targetEnd = targetStart;
    let close: number;
    let wrapped = false;
    if (markdown[targetStart] === "<") {
      wrapped = true;
      targetStart += 1;
      targetEnd = markdown.indexOf(">", targetStart);
      if (targetEnd < 0) {
        cursor = start + 2;
        continue;
      }
      close = findClosingParenthesis(markdown, targetEnd + 1);
    } else {
      let depth = 0;
      let escaped = false;
      for (
        targetEnd = targetStart;
        targetEnd < markdown.length;
        targetEnd += 1
      ) {
        const character = markdown[targetEnd];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (character === "\\") {
          escaped = true;
          continue;
        }
        if (character === "(") depth += 1;
        if (character === ")") {
          if (depth === 0) break;
          depth -= 1;
        }
        if (/\s/.test(character ?? "") && depth === 0) break;
      }
      close = findClosingParenthesis(markdown, targetEnd);
    }
    if (close < 0) {
      cursor = start + 2;
      continue;
    }

    images.push({
      source: markdown.slice(start, close + 1),
      alt: markdown.slice(start + 2, altEnd),
      target: markdown.slice(targetStart, targetEnd),
      start,
      end: close + 1,
      contentStart,
      targetEnd,
      suffixStart: wrapped ? targetEnd + 1 : targetEnd,
      wrapped,
    });
    cursor = close + 1;
  }
  return images;
}
