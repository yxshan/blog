export function stripLeadingTitle(content: string, title: string): string {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  let firstContentLine = 0;

  while (firstContentLine < lines.length && !lines[firstContentLine]?.trim()) {
    firstContentLine += 1;
  }

  const heading = lines[firstContentLine]?.match(/^#\s+(.+?)\s*#?$/);
  if (!heading?.[1] || heading[1].trim() !== title.trim()) return content;

  return lines.slice(firstContentLine + 1).join("\n").replace(/^\n+/, "");
}
