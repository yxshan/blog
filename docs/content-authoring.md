# 文章编写规范

## 路径

新文章必须位于：

```text
posts/<category>/NNN-lowercase-slug/index.md
```

示例：

```text
posts/algorithm/001-two-sum/index.md
```

- `NNN-` 是三位序号，只用于内容目录组织。
- URL 会移除数字前缀，得到 `/blog/posts/algorithm/two-sum`。
- 图片与文章放在同一目录，使用 `![](./image.png)` 引用。

## Frontmatter

```yaml
---
title: 两数之和
date: 2026-07-01
updated: 2026-07-03
tags: [简单, 哈希表, 数组]
difficulty: 简单
leetcode: https://leetcode.cn/problems/two-sum/
draft: true
---
```

| 字段         | 要求                                    |
| ------------ | --------------------------------------- |
| `title`      | 必填，非空字符串                        |
| `date`       | 必填，合法日期                          |
| `updated`    | 可选，合法日期                          |
| `tags`       | 必填，至少一个非空字符串                |
| `difficulty` | 可选：简单/中等/困难或 easy/medium/hard |
| `leetcode`   | 可选，题目链接                          |
| `draft`      | 可选；`true` 时生产环境隐藏             |

## Markdown 规则

- Frontmatter 的 `title` 是文章唯一主标题；正文中重复的一级标题会在渲染前移除。
- 正文章节从 `##` 开始，`##` 和 `###` 会进入右侧目录。
- 代码块应声明语言，例如 `c`、`cpp`、`python`、`java` 或 `javascript`。
- 数学公式使用 `$...$` 和 `$$...$$`，由 KaTeX 渲染。
- 外部链接会在新窗口打开；Markdown HTML 会经过白名单清理。
- 同名标题会生成不重复的锚点。

完整结构见[文章模板](content/article-template.md)。

## 校验

新增或修改文章后运行：

```bash
npm run validate
npm run build
```

校验会检查路径、Frontmatter、日期、difficulty、重复 slug、图片引用及生成索引一致性。
