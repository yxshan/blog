# yxshan's Blog

基于 Astro 7 + React 19 islands + TailwindCSS 3 的静态算法题解博客，自动部署到 GitHub Pages。

## 快速开始

```bash
git clone git@github.com:yxshan/blog.git
cd blog
npm install
npm run dev        # 本地开发 → http://localhost:4321/blog
npm run validate   # 校验文章元数据和图片引用
npm test           # 运行单元测试
npm run build      # 生产构建 → dist/
```

## 📝 如何添加文章

### 目录结构

每篇文章是一个独立的文件夹，放在 `posts/<分类>/<序号>-<英文slug>/index.md`：

```
posts/
└── algorithm/                        ← 分类目录（可任意命名）
    ├── 001-two-sum/                  ← 序号-英文名
    │   └── index.md                  ← 文章内容（必须是 index.md）
    └── 002-reverse-linked-list/
        └── index.md
```

**分类自动发现**：新增文件夹无需改代码，首页导航、标签筛选自动适配。

### 文件命名规则

| 部分      | 说明                                                | 示例                             |
| --------- | --------------------------------------------------- | -------------------------------- |
| 序号      | 三位数字 + `-`，决定目录排序                        | `001-`、`002-`                   |
| 英文 slug | 小写英文 + 连字符，对应访问 URL                     | `two-sum`、`reverse-linked-list` |
| URL 格式  | `https://yxshan.github.io/blog/posts/<分类>/<slug>` | `/posts/algorithm/two-sum`       |

### Frontmatter（必须的元数据）

每篇 `index.md` 顶部必须包含 YAML Frontmatter：

```yaml
---
title: 两数之和 # 必填：文章标题
date: 2026-07-01 # 必填：发布日期（YYYY-MM-DD）
tags: [简单, 哈希表, 数组] # 必填：标签数组（中英文皆可）
difficulty: 简单 # 可选：简单 / 中等 / 困难（也可用 easy / medium / hard）
leetcode: https://leetcode.cn/problems/two-sum/ # 可选：题目链接
updated: 2026-07-03 # 可选：最后更新日期
draft: true # 可选：草稿模式（true = 上线后不显示）
---
```

### Markdown 写作规范

#### 标题层级

- `#` 主标题（文章标题，一般与 frontmatter title 一致）
- `##` 二级标题（题目信息、解题思路、代码实现、易错点、总结）
- `###` 三级标题（具体方法名）
- 标题会自动生成 `id` 用于右侧目录导航，同名标题自动去重

#### 数学公式

使用 `$...$` 内联和 `$$...$$` 块级 LaTeX 语法（KaTeX 渲染）：

```markdown
时间复杂度 $O(n)$，空间复杂度 $O(1)$

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

#### 代码块

指定语言可获得语法高亮 + 行号：

````markdown
```c
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // ...
}
```
````

支持的常用语言：`c`, `python`, `java`, `javascript`, `cpp`, `go`, `rust` 等。

#### 表格

```markdown
| 序号 | 易错点    | 正确做法 |
| ---- | --------- | -------- |
| 1    | 忘记 xxxx | 应 xxxx  |
```

#### 引用块

```markdown
> 这是引用文字
```

#### 标签语法

文中 `#简单 #链表 #反转` 会自动渲染为彩色标签徽章。

#### 外部链接

以 `https://` 开头的链接会自动添加 `↗` 图标并在新窗口打开。

### 多题文章

一篇 `index.md` 可以包含多道相关题目（如反转链表全部放在一篇文章中）。此时相同名称的二级标题（如"解题思路""代码实现"）会在目录中自动去重。

## 🚀 发布上线

```bash
git add posts/
git commit -m "posts: add xxx solution"
git push
```

推送后 GitHub Actions 自动构建并部署到 `yxshan.github.io/blog`，约 1-2 分钟生效。

## 💬 评论配置

评论使用 giscus，未配置时不会渲染：

```bash
cp .env.example .env
```

然后在 `.env` 中填写 `VITE_GISCUS_REPO_ID`、`VITE_GISCUS_CATEGORY_ID` 等 giscus 配置项。

## 🏗 技术栈

| 层级      | 选型                                                  |
| --------- | ----------------------------------------------------- |
| 框架      | Astro 7 + React 19 islands                            |
| 构建      | Astro static build                                    |
| 样式      | TailwindCSS 3 + 自定义 prose 排版                     |
| 内容解析  | `front-matter`（元数据）+ `marked`（Markdown → HTML） |
| 代码高亮  | `highlight.js` + CSS 行号                             |
| 数学公式  | `marked-katex-extension` + KaTeX                      |
| 搜索      | Fuse.js 客户端模糊搜索                                |
| SEO       | 静态 HTML + `sitemap.xml` + Open Graph                |
| 测试/规范 | Vitest + ESLint + Prettier + 文章内容校验             |
| 部署      | GitHub Actions → GitHub Pages（Astro static）         |

## 📁 项目结构

```
src/
├── index.css                      # 全局样式（排版、暗色主题、打印）
├── pages/
│   ├── index.astro                # 首页（React 搜索岛 + 静态列表）
│   ├── posts/[...slug].astro      # 文章静态页
│   └── 404.astro                  # 404 页面
├── components/
│   ├── Header.astro               # 顶部导航 + 移动端菜单
│   ├── Footer.astro               # 底部 + RSS 入口
│   └── home/                      # 首页 React 组件
├── layouts/
│   └── BaseLayout.astro           # 全局布局与 meta
├── lib/
│   ├── posts.js                   # 文章元数据与正文读取
│   └── markdown.js                # Markdown → 静态 HTML
├── scripts/                       # 代码块增强、TOC
└── features/                      # 搜索、标签、评论、日期等 React 组件
```

## ⚠️ 注意事项

1. **路径格式**：必须是 `posts/<分类>/NNN-slug/index.md`，文件名必须是 `index.md`
2. **文件编码**：UTF-8，中文内容不要用 GBK
3. **图片引用**：如需配图，放在文章同目录下，用 `![](./image.png)` 引用；或使用外部图床
4. **草稿模式**：`draft: true` 的文章在开发环境可见，上线后自动隐藏
5. **扩展性**：每篇文章构建为完整静态 HTML；首页搜索使用构建期全文索引
