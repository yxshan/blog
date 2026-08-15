# yxshan's Blog

基于 Astro 7、React 19 islands 和 TypeScript 的静态算法题解博客，部署到 GitHub Pages 的 `/blog/` 路径。

## 快速开始

```bash
npm install
npm run dev
```

本地地址：`http://localhost:4321/blog/`。

提交前执行完整验证：

```bash
npm run typecheck
npm run validate
npm run lint
npm test
npm run build
npm run test:e2e
```

## 文档

- [文档导航](docs/README.md)
- [架构说明](docs/architecture.md)
- [开发与验证流程](docs/development.md)
- [文章编写规范](docs/content-authoring.md)
- [代码质量与安全检测方案](docs/quality-security-plan.md)
- [文章模板](docs/content/article-template.md)

## 核心约定

- Markdown 是内容的唯一事实来源。
- 页面只通过领域接口读取文章，不直接依赖生成的 JSON 格式。
- 依赖方向为 `pages/layouts → components/features → core/shared → integrations`。
- 外部能力必须通过适配器接入，未配置时不能影响静态构建和页面阅读。
- `dist/` 是生成产物，不提交到 Git。

## 发布

推送到 `main` 后，GitHub Actions 会执行类型检查、文章校验、lint、测试、生产构建和静态 smoke test，随后部署 `dist/` 到 GitHub Pages。
