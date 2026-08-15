# 代码质量与安全检测方案

## 1. 目标

为项目建立可持续的代码质量门禁、安全左移和错误诊断能力，在不改变 Astro 静态部署模式的前提下实现：

- Bug 在合并前被类型检查、测试和浏览器流程尽早发现。
- 有漏洞的依赖、硬编码密钥和危险代码能够自动告警。
- 模块依赖方向可执行，不只停留在文档约定。
- 线上浏览器异常包含版本和调用栈，能够快速定位。
- 检测结果可解释、可复现，例外有原因和过期时间。

## 2. 专业术语

| 术语            | 含义             | 本项目关注点                                       |
| --------------- | ---------------- | -------------------------------------------------- |
| Quality Gate    | 代码质量门禁     | 检查失败时阻止合并或部署                           |
| SAST            | 静态应用安全测试 | 分析 TypeScript 和 GitHub Actions 中的危险代码路径 |
| SCA             | 软件成分分析     | 检查直接和传递依赖的已知漏洞                       |
| Secret Scanning | 密钥扫描         | 阻止 Token、私钥和密码进入 Git 历史                |
| E2E             | 端到端测试       | 在真实浏览器验证搜索、路由和文章阅读流程           |
| Observability   | 可观测性         | 收集真实用户错误、版本、路由和性能信息             |
| Shift Left      | 安全左移         | 在本地和 PR 阶段发现问题，而不是部署后处理         |

## 3. 当前基线

当前已经启用：

- TypeScript strict，`allowJs: false`。
- ESLint、React Hooks 规则和 Prettier。
- Vitest 单元、集成和 happy-dom 回归测试。
- Frontmatter、路径、日期、slug 和图片校验。
- Astro 生产构建。
- 14 篇静态文章、RSS、sitemap 和 `/blog/` 路径 smoke test。
- GitHub Actions CI 和部署工作流。
- React `ErrorBoundary` 与可注入 `ErrorReporter` 接口。

### 实施状态

| 能力                                  | 状态                                                        |
| ------------------------------------- | ----------------------------------------------------------- |
| High/Critical 依赖漏洞清理            | 已完成，当前 `npm audit` 为 0                               |
| Vitest V8 覆盖率门禁                  | 已完成，阈值为 lines/functions/statements 70%、branches 60% |
| CI 依赖安全审计                       | 已完成，High/Critical 阻断                                  |
| Dependabot npm 与 GitHub Actions 更新 | 版本更新已配置；安全更新需在 GitHub 设置中启用              |
| CodeQL JavaScript/TypeScript 扫描     | 已配置代码与 Actions 扫描，推送后生效                       |
| Gitleaks Git 历史密钥扫描             | 已配置最小权限工作流，推送后生效                            |
| GitHub 分支保护必需检查               | 待仓库管理员在 GitHub 设置中启用                            |
| 模块边界、Knip、Playwright            | 已完成并接入 CI                                             |
| GlitchTip 错误上报                    | 待 Phase 3                                                  |

当前缺口：

- Dependabot 告警和安全更新需要在 GitHub 仓库设置中启用；仓库配置只负责版本更新。
- 尚无线上错误收集实现。

## 4. 推荐工具组合

### 4.1 本地与 CI 质量检查

继续使用 TypeScript、ESLint、Vitest 和现有内容校验。新增 `@vitest/coverage-v8`，先只对 `src/core/`、`src/features/` 和 `src/lib/` 设置覆盖率目标。

初始建议：

```text
lines: 70%
functions: 70%
branches: 60%
statements: 70%
```

覆盖率只衡量测试触达范围，不代表代码正确；关键领域规则和回归 Bug 必须有行为断言。

### 4.2 依赖漏洞扫描（SCA）

第一阶段使用：

- `npm audit --audit-level=high`：零配置、适合 npm 项目。
- GitHub Dependabot：自动创建安全升级 PR。

第二阶段可增加 [OSV-Scanner](https://google.github.io/osv-scanner/)，扫描 `package-lock.json` 并输出 SARIF。OSV-Scanner 与 npm audit 高度重叠，因此只有在需要独立漏洞数据库或统一报告时才同时启用。

策略：

- Critical/High：CI 阻断；有安全版本时尽快修复。
- Moderate：告警，按可达性和项目暴露面评估。
- Low：进入定期维护，不阻断紧急交付。
- 禁止在自动流程中运行 `npm audit fix --force`。

### 4.3 静态安全分析（SAST）

首选 GitHub CodeQL 默认配置，覆盖 JavaScript/TypeScript 和 GitHub Actions。公开仓库可直接在 GitHub Security 设置中启用。

参考：[CodeQL code scanning](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning)。

只有出现项目特有规则时再引入 [Semgrep](https://semgrep.dev/docs/semgrep-ci/sample-ci-configs)，例如：

- 禁止绕过 `sanitize-html` 直接渲染不可信 HTML。
- 禁止组件直接读取 `src/generated/*.json`。
- 禁止在客户端代码中访问管理 Token。
- 禁止新增 `eval`、动态脚本注入或不受控外部 URL。

### 4.4 密钥扫描

使用 [Gitleaks](https://github.com/gitleaks/gitleaks) 扫描提交差异和 Git 历史。

必须阻止：

- GitHub、npm、云平台和分析服务 Token。
- 私钥、密码和连接字符串。
- 写权限 API Key。

`VITE_` 环境变量会进入浏览器构建，只能存放允许公开的客户端配置。误报必须通过带原因的配置排除，不能只把规则整体关闭。

### 4.5 模块边界检测

建议使用 `dependency-cruiser` 作为依赖图检查器，必要时配合 `eslint-plugin-boundaries`。

自动执行以下规则：

```text
禁止循环依赖
禁止 core → pages/components/features
禁止 features → pages
禁止 pages 直接读取 generated JSON
禁止 core 依赖 React、Fuse.js 或 Giscus
禁止 integrations 反向成为领域规则来源
```

使用 `Knip` 检测未使用文件、导出和依赖。当前 Astro、脚本、E2E 和预留 no-op 适配器入口已经显式配置，扫描结果稳定，因此已升级为 CI 阻断门禁。

### 4.6 浏览器端到端测试

使用 Playwright 把当前人工回归转为真实浏览器 CI：

1. `/blog/` 首页加载并显示 14 篇文章。
2. 搜索、清空和无结果状态。
3. 多标签交集筛选。
4. URL 未知参数保留，刷新后恢复筛选状态。
5. Header 搜索按钮跳转和聚焦。
6. 文章只有一个主标题，日期不是 `NaN`。
7. 上一篇/下一篇、目录导航和 `/blog/` 链接正确。
8. Giscus 未配置时文章正常显示。
9. 页面无 `console.error` 和 React hydration 错误。

Playwright 测试只保留关键用户旅程，复杂筛选组合继续由快速的纯函数测试覆盖。

### 4.7 线上错误监控

通过已有 `ErrorReporter` 接口接入 [GlitchTip](https://glitchtip.com/documentation/)；它支持开源、自托管和 Sentry 兼容 SDK。

允许上报：

- 异常名称、消息和调用栈。
- 当前路由。
- 浏览器和系统版本。
- Git commit SHA 或发布版本。

禁止默认上报：

- 搜索文本、评论内容和完整 URL 查询参数。
- Cookie、本地存储内容和用户标识。
- 环境变量和文章草稿内容。

Source map 应在发布流程中上传到监控服务，但不应作为公开部署文件长期暴露。

## 5. 分阶段实施

### Phase 0：清理当前漏洞

- 运行非破坏性的 `npm audit fix`，升级安全补丁版本。
- 完整执行类型、测试、构建和 smoke test。
- 再次运行 `npm audit`，目标为 0 个 High/Critical。

### Phase 1：低维护成本安全门禁

- 增加 `security:audit` 和 `test:coverage` 命令。
- 配置覆盖率报告和初始阈值。
- 启用 Dependabot security/version updates。
- 启用 CodeQL 默认扫描。
- 增加 Gitleaks GitHub Actions。
- 将检查设为 `main` 分支必需状态。

验收：PR 无法在类型错误、测试失败、High/Critical 漏洞或密钥泄露时合并。

仓库内配置不能代替 GitHub 平台设置。代码推送后，由仓库管理员完成：

1. 打开 **Settings → Advanced Security**，确认 Dependency graph 已启用。
2. 启用 **Dependabot alerts**。
3. 启用 **Dependabot security updates**。
4. 打开 **Settings → Rules / Branches**，为主分支要求 CI、CodeQL 和 Gitleaks 检查通过后才能合并。

### Phase 2：架构与浏览器回归

- 引入 dependency-cruiser 并固化模块依赖方向。
- 引入 Knip，先告警后门禁。
- 引入 Playwright，覆盖关键用户旅程。
- 将浏览器测试纳入 `npm run test:e2e`。

验收：循环依赖和越层引用被 CI 阻止；首页和文章关键流程在 Chromium 中自动通过。

### Phase 3：线上诊断能力

- 实现 GlitchTip `ErrorReporter` 适配器。
- 配置发布版本和私有 source map 上传。
- 增加错误采样、隐私过滤和告警阈值。
- 为高频错误建立回归测试和处理记录。

验收：能够从一条线上错误定位到发布版本、路由和源代码位置，且不采集敏感内容。

### Phase 4：规模扩大后的可选能力

当项目或协作者明显增加时，再评估 SonarQube Community Build、自托管 Renovate 和集中式质量趋势面板。当前阶段不建议引入需要长期维护的服务器。

## 6. 目标 CI 顺序

```text
npm ci
npm run typecheck
npm run validate
npm run lint
npm run quality:architecture
npm run quality:unused
npm run test:coverage
npm run build
npm run test:smoke
npm run test:e2e
npm run security:audit
secret scan
CodeQL analysis
```

快速检查和确定性检查靠前，生产构建和浏览器测试靠后。安全扫描可以拆为独立并行 job，但都必须作为分支保护的必需检查。

## 7. 告警处理规则

每条被忽略的安全或质量告警必须记录：

```text
规则或漏洞 ID
影响范围
不可达或可接受风险的证据
负责人
忽略原因
复查或失效日期
```

禁止永久忽略且没有原因。安全例外到期后 CI 应重新失败，迫使项目重新评估。

## 8. 推荐落地顺序

结合当前项目规模，推荐采用：

```text
Phase 0 → Phase 1 → dependency-cruiser → Playwright → GlitchTip
```

SonarQube、Semgrep 和 OSV-Scanner 都是可参考方案，但不应仅为了工具数量而同时引入。每个工具都必须对应一个现有检测缺口，并有明确的告警负责人和处理流程。
