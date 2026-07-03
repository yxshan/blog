import { getAllPosts } from "./api.js";

// ============================================================
// 分类发现：从已导入的文章中自动提取唯一分类
// 不依赖任何硬编码的分类名，完全由文章 slug 驱动
// ============================================================

/**
 * 获取所有分类及其文章数量
 *
 * 工作流程：
 *   1. 调用 getAllPosts() 获取全部文章列表
 *   2. 遍历文章，从 post.category 提取唯一分类
 *   3. 使用 Map 去重并统计每分类下的文章数
 *   4. 按分类名（name）字母升序排列
 *
 * @returns {Array<{name: string, slug: string, count: number}>}
 *   分类对象数组，每个对象包含：
 *     - name:  分类显示名（即 slug 第一段，如 "algorithm"）
 *     - slug:  分类 slug（与 name 一致，供路由使用）
 *     - count: 该分类下的文章总数
 *
 * 示例输出：
 *   [
 *     { name: "algorithm", slug: "algorithm", count: 5 },
 *     { name: "system",    slug: "system",    count: 2 },
 *   ]
 */
export function getCategories() {
  const posts = getAllPosts();

  // 使用 Map 去重并统计
  const categoryMap = new Map();

  for (const post of posts) {
    const cat = post.category;
    if (!cat) continue; // 跳过无分类文章（slug 不含 "/"）

    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        name: cat,
        slug: cat,
        count: 0,
      });
    }
    categoryMap.get(cat).count++;
  }

  // 转为数组并按名称字母顺序排序
  return Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "zh-Hans-CN"),
  );
}
