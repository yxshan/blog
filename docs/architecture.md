# 架构说明

## 系统概览

项目采用 Astro 静态输出，React 只负责首页搜索和筛选等交互岛。Markdown 是内容唯一事实来源，构建期生成文章目录、搜索索引、HTML、RSS 和 sitemap。

```text
Markdown
  → ContentSource
  → 标准化 PostDocument
  → PostCatalog
  → Astro pages / search index / RSS / sitemap
```

## 模块职责

| 目录                | 职责                                       |
| ------------------- | ------------------------------------------ |
| `posts/`            | Markdown 文章及其本地图片                  |
| `src/pages/`        | Astro 路由与页面编排                       |
| `src/layouts/`      | HTML 外壳、meta 和全局布局                 |
| `src/components/`   | 页面级 Astro/React 组件                    |
| `src/features/`     | 搜索、筛选、文章展示等业务能力             |
| `src/core/`         | 领域契约、内容源、文章目录、站点配置和 URL |
| `src/integrations/` | Giscus、分析、订阅等外部适配器             |
| `src/lib/`          | Markdown 渲染和文章读取的集成入口          |
| `src/generated/`    | 构建生成的类型化 JSON 索引                 |
| `scripts/`          | 索引、校验、RSS、sitemap 和 smoke test     |

## 依赖方向

```text
pages / layouts
        ↓
components / feature modules
        ↓
domain contracts / core utilities
        ↓
framework and external adapters
```

禁止以下依赖：

- `core` 或 `features` 反向依赖 `pages`。
- 页面直接读取 `src/generated/*.json`。
- 多个模块分别实现 slug、日期、URL、草稿或 Frontmatter 规则。
- 领域模块直接依赖 Giscus、Fuse.js 等第三方实现。
- 外部 SDK 在页面组件内部直接初始化。

## 核心领域模型

领域契约位于 `src/core/contracts.ts`：

- `PostMeta`：可序列化的标准文章元数据。
- `PostDocument`：元数据和 Markdown 正文。
- `RuntimePost`：页面运行期文章模型，日期已安全转换。
- `PostQuery`：文本、标签、分类、排序和分页条件。
- `PostCatalog`：文章列表、详情和组合查询接口。
- `CommentsAdapter`、`AnalyticsAdapter`、`SubscriptionAdapter`：外部能力边界。

未知 Frontmatter 必须先标准化，生成 JSON 在进入目录模块时还会执行运行时结构、日期和 slug 集合校验。

## 首页交互

首页由 `HomeApp` 编排以下模块：

- `queryState`：URL 查询参数读取、更新和未知参数保留。
- `postSearch`：封装 Fuse.js 搜索。
- `postFilter`：标签交集与分类筛选。
- `PostList`：只负责列表和空状态。

筛选组合顺序为：

```text
搜索结果 → 标签交集 → 分类筛选 → 排序
```

## 静态部署边界

- Astro 输出目录为 `dist/`。
- GitHub Pages base path 固定为 `/blog/`，URL 必须由 `siteUrl` 模块生成。
- 评论未配置时返回 disabled，不影响文章页。
- `dist/` 不进入版本控制，由 GitHub Actions 重新生成。
