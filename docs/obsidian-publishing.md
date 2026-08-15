# 使用 Obsidian 一键发布文章

博客提供 `post:publish` 命令，用于将当前 Obsidian 文章安全地发布到独立分支、创建 PR，并在 GitHub 检查通过后自动合并。发布器不会同步整个 Vault，也不会直接推送 `main`。

## 支持的目录

Obsidian Vault 必须包含 `.obsidian` 和 `posts`，文章文件名必须是 `index.md`：

```text
/Users/a1-6/Desktop/408/
├── .obsidian/
└── posts/
    ├── algorithm/链表/001-reverse-list/index.md
    └── kaoyan/010-converse/index.md
```

发布器使用 `posts` 后的第一个目录作为博客分类，并忽略分类与文章目录之间的组织目录：

```text
408/posts/algorithm/链表/001-reverse-list/index.md
→ blog/posts/algorithm/001-reverse-list/index.md
```

分类必须是小写英文 slug，文章目录必须符合 `NNN-lowercase-slug`。

## 文章格式

```yaml
---
title: 反转链表
date: 2026-08-15
tags:
  - 链表
difficulty: 中等
draft: false
---
```

支持同目录普通 Markdown 图片：

```markdown
![流程图](./流程图.png)
```

也支持 Obsidian 图片嵌入：

```markdown
![[流程图.png]]
```

发布时只复制正文实际引用的图片；缺失图片、越过文章目录的图片路径和不支持的图片格式会阻止发布。

## 首次设置

### 1. 登录 GitHub CLI

终端执行：

```bash
gh auth login
```

依次选择 GitHub.com、SSH 和浏览器登录。可用以下命令确认：

```bash
gh auth status
```

### 2. 开启自动合并

进入 GitHub 仓库 `Settings → General → Pull Requests`：

- 启用 `Allow auto-merge`。
- 启用 `Automatically delete head branches`。

保留现有 `main` ruleset 和必需检查。发布器通过 PR 合并，不需要为它放宽分支保护。

### 3. 配置 Obsidian

进入 `Settings → Community plugins → Browse`，安装并启用 `Shell commands`。

在 Shell commands 设置中新增命令：

```bash
npm run post:publish -- "{{file_path:absolute}}"
```

将 Working directory 设置为：

```text
/Users/a1-6/Desktop/blog
```

为命令设置别名“发布到博客”，再到 `Settings → Hotkeys` 绑定快捷键，例如 `Command + Option + P`。

Shell Commands 能执行本地程序，只配置和运行自己确认过的命令。

## 使用方法

发布前先预检，不会执行 Git 或 GitHub 写操作：

```bash
npm run post:publish -- \
  "/Users/a1-6/Desktop/408/posts/algorithm/链表/001-reverse-list/index.md" \
  --dry-run
```

dry-run 会在临时项目副本中运行真实文章校验，并显示文章来源、目标文件以及图片引用转换；临时副本随后自动删除。

正式发布：

```bash
npm run post:publish -- \
  "/Users/a1-6/Desktop/408/posts/algorithm/链表/001-reverse-list/index.md"
```

发布器会从最新 `origin/main` 创建临时 worktree，执行项目规定的类型检查、文章校验、Lint、架构检查、未使用代码检查、覆盖率测试、构建、冒烟测试、Playwright E2E 和依赖安全审计，再推送文章分支、创建 PR 并开启 squash auto-merge。首次发布会自动安装 Playwright Chromium。当前博客工作区的分支和未提交文件不会被切换或写入。

`draft: true` 的文章可以提交，但生产站点仍会隐藏草稿。内容没有变化时不会创建远程分支或 PR。

## 故障排查

- `GitHub CLI 尚未登录`：执行 `gh auth login`。
- `无法开启自动合并`：确认 GitHub 仓库启用了 `Allow auto-merge`，PR 会保留供手动处理。
- `远程分支已推送，但 PR 创建失败`：按终端给出的 compare 链接手动创建 PR。
- 本地校验失败：修复终端指出的 frontmatter、路径或图片问题后重新执行。
- CI 失败：PR 不会合并，在 GitHub Actions 中查看失败步骤；修复源文章后再次发布。
