# yxshan's Blog

基于 React 19 + Vite 6 + TailwindCSS 3 的静态算法题解博客，自动部署到 GitHub Pages。

## 快速开始

```bash
git clone git@github.com:yxshan/blog.git
cd blog
npm install
npm run dev        # 本地开发 → http://localhost:5173/blog/
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

## 🏗 技术栈

| 层级      | 选型                                                  |
| --------- | ----------------------------------------------------- |
| 框架      | React 19 + React Router v7                            |
| 构建      | Vite 6                                                |
| 样式      | TailwindCSS 3 + 自定义 prose 排版                     |
| 内容解析  | `front-matter`（元数据）+ `marked`（Markdown → HTML） |
| 代码高亮  | `highlight.js` + CSS 行号                             |
| 数学公式  | `marked-katex-extension` + KaTeX                      |
| 搜索      | Fuse.js 客户端模糊搜索                                |
| 虚拟滚动  | `@tanstack/react-virtual`（200+ 文章流畅）            |
| SEO       | `react-helmet-async` + `sitemap.xml` + JSON-LD        |
| 测试/规范 | Vitest + ESLint + Prettier + 文章内容校验             |
| 部署      | GitHub Actions → GitHub Pages（BrowserRouter）        |

## 📁 项目结构

```
src/
├── App.jsx                        # 路由 + 页面跳转自动回顶
├── main.jsx                       # 入口
├── index.css                      # 全局样式（排版、暗色主题、打印）
├── features/
│   ├── posts/
│   │   ├── api.js                 # 元数据索引 + 正文按需加载
│   │   ├── categories.js          # 分类自动提取
│   │   ├── MarkdownRenderer.jsx   # Markdown → HTML + 代码增强
│   │   ├── TOC.jsx                # 右侧目录导航（sticky + scroll-spy）
│   │   ├── ReadingProgress.jsx    # 顶部阅读进度条
│   │   ├── BackToTop.jsx          # 返回顶部按钮
│   │   └── ReadingTime.js         # 阅读时长估算
│   ├── theme/                     # 暗色模式（Provider + Hook）
│   ├── tags/                      # 标签筛选 + 颜色映射
│   └── search/                    # Fuse.js 搜索
├── pages/
│   ├── Home.jsx                   # 首页（列表 + 搜索 + 虚拟滚动）
│   ├── Post.jsx                   # 文章详情页
│   └── NotFound.jsx               # 404 页面
├── shared/                        # 通用组件（Header、Footer、ArticleCard 等）
└── layouts/                       # 布局组件
```

## ⚠️ 注意事项

1. **路径格式**：必须是 `posts/<分类>/NNN-slug/index.md`，文件名必须是 `index.md`
2. **文件编码**：UTF-8，中文内容不要用 GBK
3. **图片引用**：如需配图，放在文章同目录下，用 `![](./image.png)` 引用；或使用外部图床
4. **草稿模式**：`draft: true` 的文章在开发环境可见，上线后自动隐藏
5. **扩展性**：首页只加载元数据索引，文章正文按 slug 动态加载；构建会为每篇文章生成静态入口页，并随 `posts/` 变更自动重建索引
6. **不要修改 `public/`**：静态资源放项目根目录，不要放 `/public/`（Vite 限制）
