// ============================================================
// 标签列表 hook
// ============================================================

import { useMemo } from "react";
import { getAllPosts } from "../posts/api";

/**
 * 从所有文章中提取标签并统计出现次数
 *
 * 返回值按 count 降序排列（热门标签在前），格式：
 *   [{ name: "动态规划", count: 12 }, { name: "数组", count: 8 }, ...]
 *
 * @returns {{ name: string, count: number }[]} 标签列表
 */
export function useTags() {
  return useMemo(() => {
    const posts = getAllPosts();

    // 统计每个标签的出现次数
    const countMap = {};
    for (const post of posts) {
      for (const tag of post.tags) {
        if (countMap[tag]) {
          countMap[tag]++;
        } else {
          countMap[tag] = 1;
        }
      }
    }

    // 转换为数组并按 count 降序排列
    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);
}
