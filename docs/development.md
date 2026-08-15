# 开发与验证流程

## 环境要求

- Node.js 22
- npm
- UTF-8 文件编码

## 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 启动 /blog/ 开发服务
npm run typecheck    # TypeScript strict 检查
npm run validate     # 生成索引并校验文章
npm run lint         # ESLint
npm test             # Vitest 单元和 DOM 回归测试
npm run test:coverage # 测试并执行覆盖率门禁
npm run build        # Astro 生产构建、RSS 和 sitemap
npm run test:e2e     # 静态产物 smoke test
npm run security:audit # 阻断 High/Critical 依赖漏洞
npm run preview      # 本地预览 dist/
npm run format:check # 检查 Prettier 格式
```

## 推荐开发循环

1. 先为纯逻辑或 Bug 增加最小回归测试。
2. 修改对应深模块，避免把规则扩散到页面。
3. 开发中运行目标测试和 `npm run typecheck`。
4. UI 变更使用 `npm run dev` 做浏览器检查。
5. 提交前运行完整质量门禁。

完整质量门禁：

```bash
npm run typecheck
npm run validate
npm run lint
npm run test:coverage
npm run build
npm run test:e2e
npm run security:audit
npm run format:check
```

## 测试分层

- 单元测试：与被测 `.ts/.tsx` 文件相邻，覆盖日期、slug、筛选、URL 和标准化规则。
- 集成测试：覆盖 Markdown → `PostDocument` → `PostCatalog` 和生成索引。
- DOM 回归测试：使用 Vitest + happy-dom 检查 React 或浏览器增强逻辑。
- smoke test：检查 14 篇静态文章、RSS、sitemap、标题、目录和 `/blog/` 路径。
- 浏览器回归：搜索、清空、标签筛选、文章导航、主题和控制台错误。

## 提交与发布

提交信息使用小写 Conventional Commit 前缀：

```text
feat: add ...
fix: correct ...
refactor: migrate ...
posts: add ...
docs: update ...
chore: maintain ...
```

PR 应说明改动、验证命令，并为 UI 改动提供截图。推送到 `main` 后，CI 通过才进入 GitHub Pages 部署。

## 可选集成

复制 `.env.example` 为 `.env` 后配置 Giscus：

```text
VITE_GISCUS_REPO_ID
VITE_GISCUS_CATEGORY_ID
VITE_GISCUS_CATEGORY
```

所有 `VITE_` 变量都会面向浏览器构建，禁止放置私钥、管理 Token 或其他服务端秘密。
