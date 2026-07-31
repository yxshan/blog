export const DIFFICULTY_MAP = {
  简单: "easy",
  中等: "medium",
  困难: "hard",
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

export function normalizeDifficulty(value) {
  if (!value) return null;
  return DIFFICULTY_MAP[value] ?? null;
}
