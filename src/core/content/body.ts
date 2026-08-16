export interface NormalizePostBodyOptions {
  title: string;
  tags?: readonly string[];
}

function readTagLine(line: string): string[] | null {
  const tags = [...line.matchAll(/#([^\s#]+)/g)].map((match) => match[1] ?? "");
  if (tags.length === 0) return null;
  const remainder = line.replace(/#([^\s#]+)/g, "").trim();
  return remainder ? null : tags;
}

function hasSameTags(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  if (actual.length !== expected.length) return false;
  const remaining = new Set(expected);
  for (const tag of actual) remaining.delete(tag);
  return remaining.size === 0;
}

export function normalizePostBody(
  content: string,
  { title, tags = [] }: NormalizePostBodyOptions,
): string {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  let firstContentLine = 0;

  while (firstContentLine < lines.length && !lines[firstContentLine]?.trim()) {
    firstContentLine += 1;
  }

  const heading = lines[firstContentLine]?.match(/^#\s+(.+?)\s*#?$/);
  if (heading?.[1]?.trim() === title.trim()) {
    lines.splice(firstContentLine, 1);
  }

  while (firstContentLine < lines.length && !lines[firstContentLine]?.trim()) {
    firstContentLine += 1;
  }

  const leadingTags = readTagLine(lines[firstContentLine]?.trim() ?? "");
  if (leadingTags && tags.length > 0 && hasSameTags(leadingTags, tags)) {
    lines.splice(firstContentLine, 1);
  }

  return lines.join("\n").replace(/^\n+/, "");
}
