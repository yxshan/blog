import { DIFFICULTY_MAP } from "./normalize";

export function findPostFrontmatterErrors(
  frontmatter: Record<string, unknown>,
): string[] {
  const errors: string[] = [];
  if (
    typeof frontmatter.title !== "string" ||
    frontmatter.title.trim().length === 0
  ) {
    errors.push("title 必须是非空字符串");
  }
  if (!frontmatter.date) errors.push("缺少必填字段 date");
  if (
    !Array.isArray(frontmatter.tags) ||
    frontmatter.tags.length === 0 ||
    !frontmatter.tags.every(
      (tag) => typeof tag === "string" && tag.trim().length > 0,
    )
  ) {
    errors.push("tags 必须是至少包含一个非空字符串的数组");
  }
  if (
    frontmatter.difficulty &&
    (typeof frontmatter.difficulty !== "string" ||
      !(frontmatter.difficulty in DIFFICULTY_MAP))
  ) {
    errors.push(`difficulty 必须是 ${Object.keys(DIFFICULTY_MAP).join(" / ")}`);
  }

  const date = frontmatter.date ? new Date(String(frontmatter.date)) : null;
  if (date && Number.isNaN(date.getTime())) errors.push("date 不是合法日期");
  if (
    frontmatter.updated &&
    Number.isNaN(new Date(String(frontmatter.updated)).getTime())
  ) {
    errors.push("updated 不是合法日期");
  }
  return errors;
}
