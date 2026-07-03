import fm from "front-matter";

// ============================================================
// 全局导入：使用 Vite 的 import.meta.glob 一次性导入所有文章
// 匹配 /posts/**/index.md，以原始字符串形式（?raw）导入
// eager: true 表示构建时同步加载，无需异步等待
// ============================================================
const postModules = import.meta.glob("/posts/**/index.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// ============================================================
// 工具函数
// ============================================================

/**
 * 从文件路径推导文章 slug
 *
 * 处理逻辑：
 *   1. 去掉 "/posts/" 前缀和 "/index.md" 后缀
 *   2. 去除每级目录的序号前缀（如 "001-" → ""）
 *
 * 示例：/posts/algorithm/001-two-sum/index.md → algorithm/two-sum
 */
function deriveSlug(filePath) {
  let slug = filePath
    .replace(/^\/posts\//, "") // 去掉前缀
    .replace(/\/index\.md$/, ""); // 去掉 suffix

  // 去掉各级目录的序号前缀（如 001-、02- 等）
  slug = slug
    .split("/")
    .map((segment) => segment.replace(/^\d+-/, ""))
    .join("/");

  return slug;
}

/**
 * 从 slug 推导文章分类
 * slug 的第一段即为分类名（如 "algorithm/two-sum" → "algorithm"）
 */
function deriveCategory(slug) {
  return slug.split("/")[0];
}

/**
 * 提取文章摘要（前 150 个字符）
 *
 * 处理流程：
 *   1. 移除 Markdown 语法标记（标题、代码块、链接、列表等）
 *   2. 取清理后文本的前 150 个字符
 *   3. 去除首尾空白
 */
function extractExcerpt(content) {
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

// ============================================================
// 文章处理管道
// ============================================================

/**
 * 将原始 Markdown 导入结果转换为文章对象数组的内部实现
 *
 * 每一步：
 *   1. 用 gray-matter 解析 frontmatter + 正文
 *   2. 推导 slug、分类、摘要
 *   3. 生产环境下过滤 draft: true 的文章
 *   4. 按日期降序排列
 *
 * 注意：该函数非导出，仅用于 getAllPosts 计算缓存依据
 */
function processPosts() {
  const posts = Object.entries(postModules)
    .map(([filePath, raw]) => {
      // front-matter 解析：分离元数据（attributes）和正文（body）
      let attributes, body;
      try {
        const parsed = fm(raw);
        attributes = parsed.attributes;
        body = parsed.body;
      } catch (e) {
        console.warn("[posts] 解析失败:", filePath, e.message);
        attributes = {};
        body = raw;
      }
      const slug = deriveSlug(filePath);

      return {
        // 身份标识
        slug,
        category: deriveCategory(slug),

        // 元数据（来自 frontmatter）
        title: attributes.title || "",
        date: attributes.date ? new Date(attributes.date) : null,
        updated: attributes.updated ? new Date(attributes.updated) : null,
        tags: Array.isArray(attributes.tags) ? attributes.tags : [],
        difficulty: attributes.difficulty || null,
        leetcode: attributes.leetcode || null,
        draft: attributes.draft === true,

        // 正文
        excerpt: extractExcerpt(body),
        content: body, // 完整 Markdown 内容，供 react-markdown 渲染
      };
    })
    // 生产环境下过滤草稿文章
    .filter((post) => {
      if (import.meta.env.PROD && post.draft) {
        return false;
      }
      return true;
    })
    // 按日期降序排列（最新在前）
    .sort((a, b) => {
      if (!a.date) return 1; // 无日期的文章排在最后
      if (!b.date) return -1;
      return b.date - a.date;
    });

  return posts;
}

// ============================================================
// 对外接口
// ============================================================

/**
 * 获取所有已发布的文章
 *
 * @returns {Array} 文章对象数组，按日期降序排列
 *
 * 文章对象结构：
 *   - slug:        文章唯一标识（如 "algorithm/two-sum"）
 *   - category:    分类名（如 "algorithm"）
 *   - title:       文章标题
 *   - date:        Date 对象（可能为 null）
 *   - tags:        标签数组
 *   - difficulty:  难度等级（可能为 null）
 *   - leetcode:    LeetCode 链接（可能为 null）
 *   - draft:       是否为草稿
 *   - excerpt:     摘要文本（前 150 字符）
 *   - content:     原始 Markdown 内容
 */
export function getAllPosts() {
  return processPosts();
}

/**
 * 根据 slug 精确查找一篇文章
 *
 * @param {string} slug - 文章 slug（如 "algorithm/two-sum"）
 * @returns {Object|null} 匹配的文章对象，不存在时返回 null
 */
export function getPostBySlug(slug) {
  return getAllPosts().find((post) => post.slug === slug) || null;
}

/**
 * 根据标签名筛选文章
 *
 * @param {string} tag - 标签名（大小写不敏感）
 * @returns {Array} 匹配标签的文章数组
 */
export function getPostsByTag(tag) {
  const lowerTag = tag.toLowerCase();
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === lowerTag),
  );
}

/**
 * 全文搜索文章
 *
 * 搜索范围：标题 + 摘要
 * 匹配方式：大小写不敏感的子串匹配
 *
 * 注意：当前实现为简单匹配，后续可用 Fuse.js 替换为模糊搜索
 *
 * @param {string} query - 搜索关键词
 * @returns {Array} 匹配的文章数组，按日期降序排列
 */
export function searchPosts(query) {
  const lowerQuery = query.toLowerCase();
  return getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery),
  );
}
