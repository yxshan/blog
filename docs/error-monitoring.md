# 错误监控与发布诊断

## 设计目标

错误监控通过 `ErrorReporter` 接缝接入 GlitchTip。页面和领域模块不依赖
GlitchTip 或 Sentry SDK；具体实现位于
`src/integrations/errors/glitchtipReporter.ts`。

没有配置 DSN 时：

- 不下载浏览器 SDK 动态 chunk。
- 不发送错误、性能或用户数据。
- React ErrorBoundary 仍保留友好回退界面和开发日志。

配置后，监控覆盖全局浏览器异常和首页 React island 渲染错误。

## GitHub 配置

在仓库 **Settings → Secrets and variables → Actions** 中配置：

| 类型     | 名称                          | 用途                                      |
| -------- | ----------------------------- | ----------------------------------------- |
| Variable | `GLITCHTIP_DSN`               | 浏览器公开 DSN，启用错误上报              |
| Variable | `GLITCHTIP_URL`               | GlitchTip 实例地址                        |
| Variable | `GLITCHTIP_ORG`               | organization slug                         |
| Variable | `GLITCHTIP_PROJECT`           | project slug                              |
| Variable | `GLITCHTIP_ERROR_SAMPLE_RATE` | 错误采样率，默认 `1`                      |
| Secret   | `GLITCHTIP_AUTH_TOKEN`        | source map 上传 Token，禁止写入代码或日志 |

DSN 会编译进浏览器资源，它是客户端提交地址，不应被当作管理密钥。Auth Token
具有管理能力，必须只存放在 GitHub Secret。配置 DSN 后，其他四项上传配置缺少
任何一项都会阻止部署，避免生成无法还原源码的错误事件。

## 发布与 source map

部署构建使用 Git commit SHA 作为 `release`，生产环境标记为
`production`。只有 DSN、实例地址、组织、项目和 Auth Token 全部配置时才会：

1. 生成 hidden source maps。
2. 使用 Cargo lock 构建固定版本的 GlitchTip CLI；构建步骤不接触 Auth Token。
3. 注入 debug ID 并上传 source maps。
4. 从 `dist/` 删除全部 `.map` 文件。
5. 验证公开部署中不存在 source map。

上传或清理失败会阻止部署。source map 不提交到 Git，也不会进入 GitHub Pages
产物。

## 隐私约束

默认允许：

- 错误类型和调用栈（错误消息默认脱敏）。
- 不包含查询参数的 pathname。
- 浏览器和系统上下文。
- 最长 4000 字符的 React component stack。
- release 与 environment。

默认移除：

- 用户对象、Cookie、HTTP Header 和请求体。
- URL 查询参数与 hash。
- 搜索词、评论内容、输入和点击 breadcrumbs。
- console breadcrumbs、额外上下文和本地变量。
- 非白名单 tags、contexts 和异常消息。

当前仅启用错误监控，不启用性能追踪。后续如需性能数据，应独立评审采样量、
数据保留周期和隐私要求。

## 告警建议

在 GlitchTip 项目设置中至少创建：

1. 新问题立即通知。
2. 已解决问题再次出现时通知。
3. 同一问题 5 分钟内超过 5 次时通知。

先发送到项目维护者邮箱；需要团队协作时再增加 webhook。告警必须包含
environment、release、首次/最近发生时间和事件数量。

高频错误完成处理后，必须基于
[`error-incident-template.md`](./error-incident-template.md) 留下处理记录，并添加能
复现根因的回归测试；没有回归测试时不得将问题标记为完成。

## 验证步骤

1. 在本地 `.env` 中配置测试项目 DSN 和 `VITE_APP_ENVIRONMENT=development`。
2. 启动 `npm run dev`。
3. 从浏览器控制台异步抛出一个明确标记的测试异常。
4. 确认 GlitchTip 收到事件，URL 不包含查询参数且 release 正确。
5. 删除测试事件并清空本地 DSN。

禁止为验证而把测试异常提交到生产代码。
