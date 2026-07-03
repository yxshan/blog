# blog-static-site - Work Plan

## TL;DR (For humans)

**What you'll get:** 一个基于 React 19 + Vite 6 的静态算法博客，所有文章以 Markdown 存放在 `/posts/` 目录下自动发现，构建时全量解析为静态 JSON，GitHub Actions 自动部署到 `yxshan.github.io/blog`。支持暗色模式、全文模糊搜索、标签筛选、虚拟滚动（200+ 文章流畅）、KaTeX 数学公式、目录导航、代码复制等全套阅读体验。

**Why this approach:** 约定优于配置——新增分类只需在 `/posts/` 下建文件夹，路由、标签、导航自动适配。功能按 `features/<module>/` 分层，每个模块自包含可独立拔插。代码高亮使用 `rehype-pretty-code`（Shiki 构建时渲染），零运行时 JS 开销。

**What it will NOT do:** 没有后端 API、没有数据库、不需要服务器、不支持用户评论/登录、不生成 OG 图片（只生成 sitemap.xml 和 JSON-LD 结构化数据）。

**Effort:** Medium（22 个文件，6 个执行波次）
**Risk:** Low — 纯静态站点，无运行时依赖外部服务
**Decisions to sanity-check:** 文章目录在 `/posts/` 而非 `/public/posts/`（Vite 限制）；HashRouter 不设 basename（已知 bug 规避）；react-helmet-async v3 在 React 19 下 titleTemplate 失效，页面标题需手动拼接；React 19 + react-router v7 替代了需求文档中的 React 18 + Router v6（2026 年新项目推荐升级，所有依赖已适配）。

Your next move: 审阅后批准，或选择运行高精度双重审查。完整执行细节见下文。

---

> TL;DR (machine): Medium effort, Low risk, 22 files / 25 todos / 6 waves, React 19 + Vite 6 + react-router v7, pure static deploy to GitHub Pages

## Scope
### Must have
- 静态 Markdown 博客，`/posts/<category>/<slug>/index.md` 自动发现
- 首页文章列表（按日期倒序，虚拟滚动，标签筛选，Fuse.js 模糊搜索）
- 文章详情页（代码高亮 Shiki 双主题，KaTeX 数学公式，Admonitions 提示框，TOC 目录）
- 暗色模式跟随系统 + 手动切换
- 阅读润滑：进度条、代码复制、阅读时长、标题锚点、上下篇导航、相关文章、返回顶部
- 草稿模式（`draft: true`，开发可见/生产过滤）
- sitemap.xml + JSON-LD 结构化数据 + react-helmet-async SEO meta
- GitHub Actions 自动部署到 `yxshan/blog` 的 gh-pages 分支
- 响应式适配（移动端 + 桌面端）
- Skip to Content + @media print 打印样式

### Must NOT have (guardrails, anti-slop, scope boundaries)
- 不要后端 API / 数据库 / 服务端渲染
- 不要用户认证 / 评论系统 / 订阅表单 / RSS
- 不要测试框架（手工 QA 清单替代）
- 不要 TypeScript（保持 JSX）
- 不要全局状态管理库（React hooks + context 足够）
- 不要 OG 图片自动生成
- 不要 react-syntax-highlighter（用 rehype-pretty-code 替代）
- 不要把 markdown 文件放在 `public/` 目录（Vite 不处理 public 下文件）
- 不要给 HashRouter 加 basename 参数（已知 React Router #9800 bug）
- 不要 react-helmet-async 的 titleTemplate（React 19 下失效，改为手动拼接标题）

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none（无测试框架，每个 todo 附带 QA 验证场景：启动 dev server → 浏览器检查渲染 → 执行交互验证）
- Evidence: .omo/evidence/task-<N>-blog-static-site.md（每个 todo 完成后记录截图或 CLI 输出）

QA 工具链：
- `vite build && vite preview` 验证生产构建
- `curl -s http://localhost:4173/blog/` 验证页面响应
- 浏览器 DevTools Network 面板验证静态资源加载（无 404）
- `npx serve dist` 模拟 GitHub Pages 部署环境
- Lighthouse 验证无无障碍/SEO 严重问题

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.

- **Wave 1: 项目脚手架**（4 todos）— 项目能 `vite dev` 跑起来
- **Wave 2: 数据层**（3 todos）— Markdown 自动发现 + 解析 + 示例文章
- **Wave 3: 布局与主题**（4 todos）— 导航框架 + 暗色模式 + Shiki 双主题 CSS
- **Wave 4: 首页**（5 todos）— 文章列表 + 搜索 + 标签 + 虚拟滚动
- **Wave 5: 详情页**（5 todos）— Markdown 渲染 + TOC + 润滑组件
- **Wave 6: 组装与收尾**（4 todos）— 路由 + 入口 + sitemap + 最终润色

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| T1(package.json) | — | T5, 所有 install 步骤 | T2, T3, T4 |
| T2(vite.config) | — | T5, T11 | T1, T3, T4 |
| T3(tailwind.config) | — | T8, T9 | T1, T2, T4 |
| T4(index+deploy) | — | T23 | T1, T2, T3 |
| T5(posts/api.js) | T1, T2 | T6, T12, T14, T15 | T8 |
| T6(categories.js) | T5 | T14 | T7 |
| T7(示例文章) | — | T5(验证数据) | T6, T8 |
| T8(theme) | T3 | T9, T10 | T5, T7 |
| T9(Header+Footer) | T8 | T10 | T12 |
| T10(BlogLayout) | T9, T8 | T22 | T11 |
| T11(Shiki CSS) | T2 | T20 | T10 |
| T12(ArticleCard) | T5 | T13, T16 | T9 |
| T13(VirtualList) | T12 | T16 | T14 |
| T14(tags) | T5, T6 | T16 | T15 |
| T15(search) | T5 | T16 | T14 |
| T16(Home) | T12, T13, T14, T15 | T22 | T17 |
| T17(MD components) | T2 | T20 | T16 |
| T18(TOC) | T17 | T20 | T19 |
| T19(进度条等) | — | T20 | T18 |
| T20(Post) | T17, T18, T19 | T22 | T21 |
| T21(NotFound) | — | T22 | T20 |
| T22(App.jsx) | T10, T16, T20, T21 | T23 | T24 |
| T23(main.jsx) | T22, T4 | — | T24 |
| T24(sitemap) | T5 | — | T22, T23 |
| T25(polish) | — | — | 任意波次后 |

## Todos
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

### Wave 1: 项目脚手架

- [ ] 1. `package.json`: 创建项目依赖清单，包含所有需要的库
  What to do: 创建 `package.json`，包含 react@19, react-dom@19, react-router@7, react-markdown@10, remark-frontmatter, remark-gfm, remark-math, remark-directive, rehype-katex, katex, rehype-slug, rehype-autolink-headings, rehype-pretty-code, shiki, gray-matter, react-helmet-async@3, fuse.js@7, @tanstack/react-virtual@3, @heroicons/react@2, tailwindcss@3, postcss, autoprefixer, unist-util-visit, hastscript, mdast-util-to-hast, vite@6。Must NOT: 不要 react-syntax-highlighter。
  Parallelization: Wave 1 | Blocked by: — | Blocks: T5, 所有 `npm install`
  References: `/Users/a1-6/Desktop/blog/需求文档.md:3-8`
  Acceptance criteria: `npm install` 无错误完成，所有依赖解析成功
  QA scenarios: happy=运行 `npm install && npm ls --depth=0` 确认所有包已安装; failure=故意写错包名 npm install 应报错
  Commit: N | —

- [ ] 2. `vite.config.js`: 配置 Vite 6 构建参数
  What to do: 创建 `vite.config.js`，设置 `base: '/blog/'`，配置 `import.meta.glob` 需要的插件，确保 `/posts/` 目录下的 MD 文件能被 `?raw` 导入。Must NOT: 设置 `publicDir: 'public'` 以外的高危配置。
  Parallelization: Wave 1 | Blocked by: — | Blocks: T5, T11
  References: Vite 6 文档 — `import.meta.glob('/posts/**/*.md', { query: '?raw', import: 'default', eager: true })`
  Acceptance criteria: `vite build` 无错误，构建产物包含所有 MD 文件内容
  QA scenarios: happy=运行 `vite build` 确认 dist 目录生成; failure=路径错误导致构建失败
  Commit: N | —

- [ ] 3. `tailwind.config.js` + `postcss.config.js` + `src/index.css` + `.gitignore`: 配置 TailwindCSS 3 + 全局样式 + 版本控制
  What to do: 创建 `tailwind.config.js`（content 路径包含 `./index.html` 和 `./src/**/*.{js,jsx}`），配置 `darkMode: 'class'` 支持手动暗色切换 + `prefers-color-scheme` 检测。创建 `postcss.config.js` 引入 tailwindcss 和 autoprefixer 插件。创建 `src/index.css`，内容为 `@tailwind base; @tailwind components; @tailwind utilities;`。创建 `.gitignore`（含 `node_modules/`, `dist/`, `.env`）。Must NOT: 不要使用 TailwindCSS v4（API 不兼容），不要把 @tailwind directives 写在其他文件中。
  Parallelization: Wave 1 | Blocked by: — | Blocks: T8, T9
  References: TailwindCSS 3 官方配置文档
  Acceptance criteria: `npx tailwindcss --help` 正常，`vite dev` 后 Tailwind 样式生效
  QA scenarios: happy=在组件中使用 `className="text-blue-500"` 确认蓝色文本渲染; failure=content 路径错误导致样式未生成
  Commit: N | —

- [ ] 4. `index.html` + `.github/workflows/deploy.yml`: 入口 HTML + 部署工作流
  What to do: 创建 `index.html`（`<div id="root">` + Vite 入口 script），创建 `.github/workflows/deploy.yml`（on push to main → checkout → npm ci → vite build → deploy to gh-pages）。Must NOT: 不要加除 gh-pages 以外的部署目标。
  Parallelization: Wave 1 | Blocked by: — | Blocks: T23
  References: `vite build` 输出到 `dist/`，gh-pages 部署需 `JamesIves/github-pages-deploy-action@v4`
  Acceptance criteria: push to main 后 GitHub Actions 自动构建并部署
  QA scenarios: happy=模拟运行 workflow（`act` 或检查 YAML 语法）; failure=base 路径错误导致资源 404
  Commit: N | —

### Wave 2: 数据层

- [ ] 5. `src/features/posts/api.js`: 文章数据加载核心
  What to do: 创建 `src/features/posts/api.js`，使用 `import.meta.glob('/posts/**/*.md', { query: '?raw', import: 'default', eager: true })` 导入所有 MD 文件，用 `gray-matter` 解析 Frontmatter，返回文章列表数组（含 slug, title, date, tags, difficulty, leetcode, excerpt, category, path）。导出 `getAllPosts()`, `getPostBySlug(slug)`, `getPostsByTag(tag)`, `searchPosts(query)`。注意：`eager: true` 将全部 MD 内容内联到 JS bundle，200 篇 × 5KB ≈ 1MB 纯文本。`gray-matter` 解析在模块加载时同步执行（运行时 parse，非构建时预生成 JSON）。此方案在 200 篇文章规模下可接受，若未来超过 500 篇需考虑构建时代码生成 JSON 文件替代 eager import。`getAllPosts()` 需在 `import.meta.env.PROD` 时过滤掉 `draft: true` 的文章（草稿仅在开发环境可见）。Must NOT: 不要在 `/public/` 下读取文件。slug 生成规则：去掉 `NNN-` 数字前缀，保留目录层级，如 `/posts/algorithm/001-two-sum/index.md` → slug = `algorithm/two-sum`。若 Frontmatter 解析失败（如 YAML 语法错误），跳过该文章并 `console.warn`，不阻塞整个列表加载。
  Parallelization: Wave 2 | Blocked by: T1, T2 | Blocks: T6, T12, T14, T15, T24
  References: `gray-matter` npm 文档；需求文档.md:30-50
  Acceptance criteria: `getAllPosts()` 返回数组，每项含 title/date/tags/excerpt/slug；`getPostBySlug('algorithm/two-sum')` 返回单篇文章对象含 content
  QA scenarios: happy=导入 1 篇示例文章后 console.log(getAllPosts()) 输出正确数据; failure=Frontmatter 格式错误时 `gray-matter` 抛出错误被正确捕获; edge=slug 冲突时去重策略
  Commit: Y | `feat(posts): add markdown post loader with frontmatter parsing`

- [ ] 6. `src/features/posts/categories.js`: 分类自动发现
  What to do: 创建 `src/features/posts/categories.js`，从 getAllPosts() 的 slug 中提取 category（slug 第一段），去重后返回分类列表。每个分类自动生成 `{ name, slug, count }`。Must NOT: 不要硬编码分类名称。
  Parallelization: Wave 2 | Blocked by: T5 | Blocks: T14
  References: T5 slug 规则 — `algorithm/two-sum` → category = `algorithm`
  Acceptance criteria: `getCategories()` 返回 `[{ name: 'algorithm', slug: 'algorithm', count: N }]`；新增目录后自动出现新分类
  QA scenarios: happy=新增 `/posts/system-design/001-xxx/index.md` 后 getCategories() 自动包含 system-design; failure=无文章时返回空数组
  Commit: Y | `feat(posts): add auto-discovery category system`

- [ ] 7. `posts/algorithm/001-two-sum/index.md`: 示例文章
  What to do: 创建 `/posts/algorithm/001-two-sum/index.md`，内容来自 `模版.md` 填入完整的两数之和题解（含 Frontmatter: title, date, tags, leetcode, difficulty；正文含题目信息、解题思路、代码实现、易错点、总结）。Must NOT: 不要放在 `/public/posts/`。
  Parallelization: Wave 2 | Blocked by: — | Blocks: T5(验证数据)
  References: `/Users/a1-6/Desktop/blog/模版.md`; 需求文档.md:34-113
  Acceptance criteria: T5 的 getAllPosts() 能正确解析此文章，title="两数之和", tags=["简单","哈希表","数组"], slug="algorithm/two-sum"
  QA scenarios: happy=打开文章文件确认 Frontmatter 格式正确; failure=YAML 语法错误导致 gray-matter 解析失败
  Commit: Y | `docs: add sample post for two-sum algorithm`

### Wave 3: 布局与主题

- [ ] 8. `src/features/theme/`: 暗色模式 Provider + Hook
  What to do: 创建 `src/features/theme/ThemeProvider.jsx`（React Context 管理主题状态），`src/features/theme/useTheme.js`（hook 返回 { theme, toggleTheme, isDark }）。初始化逻辑：读取 localStorage → 回退 `prefers-color-scheme` → 默认 light。在 `<html>` 上 toggle `dark` class。Must NOT: 不要用 Tailwind 的 `darkMode: 'media'`（需要手动切换能力）。
  Parallelization: Wave 3 | Blocked by: T3 | Blocks: T9, T10
  References: TailwindCSS `darkMode: 'class'` 配置
  Acceptance criteria: 系统暗色模式下首次加载自动应用 dark；手动 toggle 后 localStorage 持久化，刷新保持
  QA scenarios: happy=切换按钮点击后页面切换暗/亮; failure=localStorage 不可用时回退到系统偏好; edge=`prefers-color-scheme` 不支持的旧浏览器
  Commit: Y | `feat(theme): add dark mode with system preference detection`

- [ ] 9. `src/shared/Header.jsx` + `src/shared/Footer.jsx`: 导航框架
  What to do: 创建 Header 组件（固定顶部，含 Logo/标题链接、导航链接从 getCategories() 动态生成、搜索按钮、暗色模式切换按钮（heroicons sun/moon 图标））。创建 Footer 组件（版权信息 + "Built with React + Vite"）。移动端：Header 导航折叠为汉堡菜单。Must NOT: 不要硬编码导航项，所有分类链接从 categories.js 动态获取。
  Parallelization: Wave 3 | Blocked by: T8 | Blocks: T10
  References: `@heroicons/react/24/outline` — SunIcon, MoonIcon, MagnifyingGlassIcon, Bars3Icon
  Acceptance criteria: 桌面端显示所有分类链接 + 搜索 + 主题切换；移动端汉堡菜单展开/收起；暗色模式按钮切换图标
  QA scenarios: happy=点击分类链接导航到对应筛选页面; failure=无分类时导航区不显示空列表; edge=窗口 resize 时响应式切换正确
  Commit: Y | `feat(layout): add responsive header with dynamic navigation`

- [ ] 10. `src/layouts/BlogLayout.jsx` + `src/shared/ErrorBoundary.jsx`: 主布局 + 错误边界
  What to do: 创建 `ErrorBoundary.jsx`（React class component，捕获子组件渲染错误，显示降级 UI"页面出现错误，请刷新重试"，开发环境显示错误详情）。创建 `BlogLayout.jsx`，组合 Header + `<main>` + `<Outlet />` + Footer，用 `<ErrorBoundary>` 包裹 `<Outlet />`。使用 React Router 的 `<Outlet />` 渲染子路由。Skip to Content 链接放在 `<main>` 之前。Must NOT: 不要在 Layout 中写业务逻辑或数据获取；不要用函数组件实现 Error Boundary（需 class component 或 react-error-boundary 库）。
  Parallelization: Wave 3 | Blocked by: T8, T9 | Blocks: T22
  References: react-router v7 — `import { Outlet } from 'react-router'`
  Acceptance criteria: 任意子路由页面在 Header 下方、Footer 上方渲染；Skip to Content 对键盘 Tab 可见
  QA scenarios: happy=页面滚动时 Header 固定; failure=Skip to Content 在 `prefers-reduced-motion` 下有动画
  Commit: Y | `feat(layout): add BlogLayout with skip-to-content accessibility`

- [ ] 11. `src/shared/shiki.css`: rehype-pretty-code 双主题 CSS
  What to do: 创建 `src/shared/shiki.css`。rehype-pretty-code 双主题模式（T17 配置 `theme: { light: 'github-light', dark: 'github-dark' }`）在同一个 `<code>` 块内生成两组 `<span>`——一组带 `data-theme="github-light"`，一组带 `data-theme="github-dark"`。CSS 规则：默认隐藏 dark span（`span[data-theme='github-dark'] { display: none; }`），在 `html.dark` 下隐藏 light span 并显示 dark span（`html.dark span[data-theme='github-light'] { display: none; } html.dark span[data-theme='github-dark'] { display: inline; }`）。同时在 `code[data-theme]` 上设置 `background-color` 同步切换。Must NOT: 不要自己写 CSS 变量映射（rehype-pretty-code 自动生成行内样式），不要用 `var(--shiki-*)` 手动映射。
  Parallelization: Wave 3 | Blocked by: T2 | Blocks: T20
  References: rehype-pretty-code 官方文档 dual theme 示例；T8 暗色模式通过 `<html class="dark">` 控制
  Acceptance criteria: 暗色模式切换时代码块配色从 github-light 变为 github-dark，无闪烁
  QA scenarios: happy=在 Post 页面切换暗色模式，代码块颜色正确切换; failure=CSS 变量未定义导致代码块无颜色
  Commit: Y | `feat(shiki): add dual-theme CSS for rehype-pretty-code`

### Wave 4: 首页

- [ ] 12. `src/shared/ArticleCard.jsx`: 文章卡片组件
  What to do: 创建 `ArticleCard.jsx`，接收 post 对象 prop，渲染标题（`<Link>` 到 `/posts/:slug`）、日期（格式化为 YYYY-MM-DD）、摘要（截取 150 字符）、标签列表（每个标签用颜色圆点 + 文字）。Must NOT: 不要硬编码标签颜色，所有颜色从 `tags/tagColors.js` 获取。
  Parallelization: Wave 4 | Blocked by: T5 | Blocks: T13, T16
  References: `/Users/a1-6/Desktop/blog/需求文档.md:12-13`
  Acceptance criteria: 卡片显示标题/日期/摘要/标签；点击标题导航到详情页；标签颜色按难度区分（简单=绿，困难=红）
  QA scenarios: happy=渲染卡片后 snapshot 确认布局; failure=post 对象缺失字段时显示占位文本; edge=标题极长时不溢出
  Commit: Y | `feat(home): add ArticleCard component`

- [ ] 13. `src/shared/VirtualList.jsx`: 虚拟滚动列表
  What to do: 创建 `VirtualList.jsx`，使用 `@tanstack/react-virtual` 的 `useVirtualizer` hook。配置 `estimateSize: () => 120`（卡片预估高度），`overscan: 5`，`useFlushSync: false`（消除 React 19 flushSync 告警）。接收 `items` 数组 + `renderItem` 函数 prop。Must NOT: 不要自己实现滚动逻辑，不要用 `react-window`。
  Parallelization: Wave 4 | Blocked by: T12 | Blocks: T16
  References: `@tanstack/react-virtual` v3 docs — `useVirtualizer` API
  Acceptance criteria: 200+ 项列表滚动流畅无 layout shift；只渲染可视区域 + overscan 项；快速滚动无空白
  QA scenarios: happy=创建 200 项 mock 数据，DOM 中只渲染 ~15 个元素; failure=overscan 太小导致快速滚动出现空白; edge=窗口 resize 时正确重算
  Commit: Y | `feat(home): add virtual scrolling list for 200+ posts`

- [ ] 14. `src/features/tags/`: 标签系统
  What to do: 创建 `src/features/tags/useTags.js`（从 getAllPosts() 提取所有标签，统计 count），`src/features/tags/TagFilter.jsx`（标签列表组件，支持多选/单选切换），`src/features/tags/tagColors.js`（难度标签固定映射：简单→#22c55e green，中等→#eab308 yellow，困难→#ef4444 red；其他算法标签从 12 色调色板自动分配，按标签名 hash 取模）。Must NOT: 不要用随机颜色（刷新会变）。
  Parallelization: Wave 4 | Blocked by: T5, T6 | Blocks: T16
  References: TailwindCSS 颜色调色板: slate, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
  Acceptance criteria: 选择"哈希表"标签过滤出包含此标签的文章；取消选择显示全部；颜色在刷新后不变
  QA scenarios: happy=点击标签后列表过滤; failure=无匹配标签时显示"没有找到相关文章"; edge=同时选多个标签时显示交集
  Commit: Y | `feat(tags): add tag filter with deterministic color mapping`

- [ ] 15. `src/features/search/`: 搜索功能
  What to do: 创建 `src/features/search/SearchBar.jsx`（输入框 + 搜索图标），`src/features/search/useSearch.js`（hook 用 Fuse.js 索引 getAllPosts() 结果，搜索 title + excerpt 字段，300ms debounce，最少 1 字符触发）。搜索结果替换列表内容（选中搜索时隐藏标签筛选结果）。Must NOT: 不要用服务端搜索、不要用 Algolia。
  Parallelization: Wave 4 | Blocked by: T5 | Blocks: T16
  References: Fuse.js v7 文档 — `new Fuse(list, { keys: ['title', 'excerpt'], threshold: 0.3 })`
  Acceptance criteria: 输入"两数之和"找到对应文章；输入"哈希"找到所有含哈希标签的文章；空搜索显示全部
  QA scenarios: happy=输入关键词后实时更新结果; failure=0 结果时显示"没有找到匹配的文章"; edge=特殊字符输入（正则注入）不报错
  Commit: Y | `feat(search): add Fuse.js client-side fuzzy search`

- [ ] 16. `src/pages/Home.jsx`: 首页
  What to do: 创建 `Home.jsx`，组合 SearchBar（顶部）+ TagFilter（搜索栏下方横排）+ VirtualList（渲染 ArticleCard）。从 useSearch 获取搜索结果，useTags 获取当前筛选标签，交集生成最终列表。按日期倒序排列。右上角显示文章总数。Must NOT: 不要把搜索和标签筛选逻辑写在 Home.jsx 内部，所有逻辑来自 hooks。
  Parallelization: Wave 4 | Blocked by: T12, T13, T14, T15 | Blocks: T22
  References: react-router v7 — `import { useSearchParams }` 可选用于 URL 持久化搜索/标签状态
  Acceptance criteria: 首页渲染文章列表；搜索+标签联合筛选；清空筛选恢复全部；移动端布局正确
  QA scenarios: happy=加载首页显示所有文章卡片按日期排列; failure=无文章时显示"暂无文章"占位; edge=文章更新日期后排序正确
  Commit: Y | `feat(home): add home page with search and tag filter`

### Wave 5: 详情页

- [ ] 17. `src/features/posts/MarkdownRenderer.jsx`: Markdown 渲染组件（含代码增强 + Admonitions）
  What to do: 创建 `MarkdownRenderer.jsx`，使用 `react-markdown` 配置所有 remark/rehype 插件：
  **插件顺序**：`remarkFrontmatter` → `remarkGfm` → `remarkMath` → `remarkDirective` → 自定义 `remarkAdmonitions` → `rehypeSlug` → `rehypeAutolinkHeadings` → `rehypePrettyCode` → `rehypeKatex`。
  **Shiki 主题加载**：从 `shiki` 导入主题 — `import { createHighlighter } from 'shiki'` 或直接使用 `rehype-pretty-code` 的 `theme` 选项传字符串名（若当前版本不支持字符串，则用 `import { bundledThemes } from 'shiki/themes'`）。T11 生成的 CSS 使用 span show/hide 模式。
  **rehype-pretty-code 配置**：`theme: { light: 'github-light', dark: 'github-dark' }`, `keepBackground: false`（背景由 CSS 控制）。注意与 T11 的 CSS 选择器一致——T11 通过 `span[data-theme='github-dark']` 控制显示/隐藏。
  **自定义 remarkAdmonitions 插件**：需使用 `unist-util-visit` 遍历 MDAST，找到 `containerDirective` 节点（name 为 tip/warning/danger），用 `hastscript`（或 `h` from `hastscript`）构造 `<div class="admonition admonition-{type}">` 包裹子内容。参考 `remark-directive` 官方示例 + `mdast-util-to-hast` 转换子节点。
  **react-markdown components**：`code` 块渲染时注入复制按钮（右上角 ClipboardIcon）和语言标签（左上角 `data-language` 属性显示）；`a` 链接加 `target="_blank" rel="noopener noreferrer"`。
  **KaTeX CSS**：在 MarkdownRenderer 中 import `katex/dist/katex.min.css`（公式渲染必须，T23 也会 import 但提前引入确保开发阶段正常显示）。
  Must NOT: 不要用 react-syntax-highlighter；rehypeSlug 必须在 rehypeAutolinkHeadings 之前；Shiki 生成的 HTML 结构（data-theme 属性）必须与 T11 的 CSS 选择器对齐。
  Parallelization: Wave 5 | Blocked by: T2, T11 | Blocks: T18, T20
  References: react-markdown@10 API — `rehypePlugins`, `remarkPlugins`, `components`; rehype-pretty-code official dual theme guide; remark-directive 官方示例 + `unist-util-visit`; `hastscript` npm; `mdast-util-to-hast`
  Acceptance criteria: 渲染完整 MD 文章，代码块高亮正确，:::tip 渲染为提示框，公式正确显示
  QA scenarios: happy=渲染示例文章确认代码块有复制按钮和语言标签; failure=缺少 KaTeX CSS 导致公式不显示; edge=嵌套指令（:::tip 内含 :::warning）正确渲染
  Commit: Y | `feat(post): add MarkdownRenderer with code copy and admonitions`

- [ ] 18. `src/features/posts/TOC.jsx`: 目录侧边栏
  What to do: 创建 `TOC.jsx`，从 react-markdown 渲染后的 DOM 中提取 h2/h3 标题（用 `document.querySelectorAll('h2[id], h3[id]')`），渲染为层级列表。桌面端：`sticky top-24` 固定在右侧（或左侧）；移动端：折叠到文章顶部。使用 IntersectionObserver 实现 scroll-spy（当前可视区域标题高亮）。点击标题平滑滚动到对应位置。Must NOT: 不要用第三方 TOC 库。
  Parallelization: Wave 5 | Blocked by: T17 | Blocks: T20
  References: IntersectionObserver API — `rootMargin: '-80px 0px -80% 0px'` 检测顶部进入视口的标题
  Acceptance criteria: 文章有多个 h2 时 TOC 列出全部；滚动时当前标题高亮对应；点击标题跳转正确
  QA scenarios: happy=滚动文章时 TOC 高亮同步变化; failure=无标题文章 TOC 不显示; edge=标题含特殊字符时 id 生成正确
  Commit: Y | `feat(post): add table of contents with scroll-spy`

- [ ] 19. `src/features/posts/ReadingProgress.jsx` + `src/features/posts/BackToTop.jsx` + `src/features/posts/ReadingTime.js`: 阅读润滑组件
  What to do: 
  - `ReadingProgress.jsx`：固定在页面顶部的渐变色进度条（`h-1`），用 `scroll` 事件计算 `scrollTop / (scrollHeight - clientHeight)`。
  - `BackToTop.jsx`：右下角浮动按钮，滚动超过一屏时显示，点击 `window.scrollTo({ top: 0, behavior: 'smooth' })`。
  - `ReadingTime.js`：导出 `getReadingTime(text)` 函数，中文字符数 / 400，英文单词数 / 200，返回 `{ minutes, text: '约 N 分钟' }`。显示在 ArticleCard 和文章详情页顶部。
  Must NOT: 进度条不要用第三方库；返回顶部按钮不要用 heroicons 以外的图标。
  Parallelization: Wave 5 | Blocked by: — | Blocks: T20
  References: `requestAnimationFrame` 节流进度条更新
  Acceptance criteria: 滚动文章时进度条从 0%→100%；返回顶部按钮在滚动 >1 屏后显示；阅读时长计算准确
  QA scenarios: happy=长文章进度条完成 100% 后隐藏; failure=`scrollHeight === clientHeight`（短文章）时进度条不显示; edge=快速滚动时进度条无抖动
  Commit: Y | `feat(post): add reading progress, back-to-top, and reading time`

- [ ] 20. `src/pages/Post.jsx`: 文章详情页
  What to do: 创建 `Post.jsx`，从 URL params 提取 slug（`useParams()`），调用 `getPostBySlug(slug)` 获取文章。页面布局：
  - 顶部：文章标题 + 日期 + 标签 + 阅读时长 + 难度徽章
  - 左侧/右侧（桌面端）：TOC sticky 侧边栏（T18）
  - 中央：进度条（T19）+ MarkdownRenderer（T17）+ 相关文章（基于标签交集排序，最多 5 篇）+ 上一篇/下一篇导航
  - 右下角：返回顶部按钮（T19）
  - react-helmet-async `<Helmet>` 设置：title = `{post.title} — yxshan's Blog`，meta description = post.excerpt，canonical URL = `/blog/#/posts/{slug}`，JSON-LD BlogPosting schema。
  - 文章底部显示"最后更新于 X 天前"（from frontmatter `updated` 字段，fallback 到 `date`）
  Must NOT: 不要用 titleTemplate（React 19 下失效）；slug 不存在时显示 NotFound。
  Parallelization: Wave 5 | Blocked by: T17, T18, T19 | Blocks: T22
  References: react-router v7 — `useParams()`; react-helmet-async v3 — `<Helmet>`; T5 — `getPostBySlug()`
  Acceptance criteria: 访问 `/posts/algorithm/two-sum` 渲染完整文章；SEO meta 标签正确；相关文章推荐合理
  QA scenarios: happy=渲染完整带 TOC 的文章; failure=slug 不存在时跳转到 NotFound; edge=draft 文章在开发环境可见生产不可见; edge=文章内容为空时不报错
  Commit: Y | `feat(post): add post detail page with full reading experience`

- [ ] 21. `src/pages/NotFound.jsx`: 404 页面
  What to do: 创建 `NotFound.jsx`，显示"页面未找到"提示 + 返回首页链接。使用 TailwindCSS 样式。Must NOT: 不要复杂动画。
  Parallelization: Wave 5 | Blocked by: — | Blocks: T22
  References: react-router v7 — 通配符路由 `path="*"`
  Acceptance criteria: 访问不存在路径显示 404 页面 + 返回首页链接可点击
  QA scenarios: happy=访问 `/posts/nonexistent` 渲染 404; edge=HashRouter 下 hash 路径错误也显示 404
  Commit: Y | `feat: add 404 Not Found page`

### Wave 6: 组装与收尾

- [ ] 22. `src/App.jsx`: 路由配置
  What to do: 创建 `App.jsx`，配置 HashRouter + Routes：
  ```jsx
  <HashRouter>
    <HelmetProvider>
      <ThemeProvider>
        <Routes>
          <Route element={<BlogLayout />}>
            <Route index element={<Home />} />
            <Route path="posts/:slug" element={<Post />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </HelmetProvider>
  </HashRouter>
  ```
  使用 `React.lazy(() => import('./pages/...'))` + `<Suspense fallback={...}>` 实现代码分割。Must NOT: HashRouter 不加 basename 参数。
  Parallelization: Wave 6 | Blocked by: T10, T16, T20, T21 | Blocks: T23
  References: react-router v7 — `import { HashRouter, Routes, Route } from 'react-router'`；React.lazy + Suspense
  Acceptance criteria: 路由 `/` 渲染 Home，`/posts/algorithm/two-sum` 渲染 Post，其他渲染 NotFound；Lazy loading 生效（Network 面板可见 chunk）
  QA scenarios: happy=所有路由正常渲染; failure=缺少 React.lazy fallback 时页面白屏; edge=直接访问 hash URL 刷新后正确渲染
  Commit: Y | `feat(app): add routing with lazy-loaded code splitting`

- [ ] 23. `src/main.jsx`: 应用入口
  What to do: 创建 `src/main.jsx`，渲染 `<App />` 到 `#root`。导入全局样式：`./index.css`（Tailwind directives: `@tailwind base/components/utilities`）+ `katex/dist/katex.min.css` + `./shared/shiki.css`。Must NOT: 不要额外全局 CSS 覆盖 Tailwind。
  Parallelization: Wave 6 | Blocked by: T22, T4 | Blocks: —
  References: `import 'katex/dist/katex.min.css'`
  Acceptance criteria: `vite dev` 启动无报错，页面正常渲染
  QA scenarios: happy=`vite build && vite preview` 后所有页面可访问; failure=缺少 CSS import 导致样式缺失
  Commit: Y | `feat: add app entry point with global styles`

- [ ] 24. `scripts/generate-sitemap.mjs` + Vite build hook: sitemap.xml 生成
  What to do: 创建 `scripts/generate-sitemap.mjs`，从 `src/features/posts/api.js` 导入 `getAllPosts` 生成 `sitemap.xml`。由于 `import.meta.glob` 仅在 Vite 构建上下文有效，主方案为在 `vite.config.js` 中添加 `closeBundle` 钩子，在构建完成后调用 sitemap 生成函数写入 `dist/sitemap.xml`。URL 格式：`<url><loc>https://yxshan.github.io/blog/#/posts/{slug}</loc><lastmod>{date}</lastmod></url>`。排除 `draft: true` 的文章。Must NOT: 不要依赖 `node scripts/generate-sitemap.mjs` 独立运行（import.meta.glob 不可用），不要生成 changefreq 和 priority。
  Parallelization: Wave 6 | Blocked by: T5 | Blocks: —
  References: Sitemap XML 规范 — sitemaps.org/protocol.html
  Acceptance criteria: `vite build` 后在 `dist/sitemap.xml` 中生成所有非草稿文章 URL，XML 格式有效
  QA scenarios: happy=运行 `vite build` 确认 `dist/sitemap.xml` 存在且格式正确; failure=draft 文章不在 sitemap 中; edge=0 篇文章时生成空 sitemap（含 `<urlset>` 根元素）
  Commit: Y | `feat: add sitemap.xml generation script`

- [ ] 25. `@media print` 样式 + Skip to Content + 最终润色
  What to do: 在 `src/index.css` 中添加 `@media print` 规则：隐藏 header/footer/nav/sidebar/back-to-top/进度条，文章内容全宽，字体调整为 `12pt` serif，代码块 `white-space: pre-wrap`，链接显示 URL。
  Skip to Content：在 BlogLayout 中 `<main>` 前加 `<a href="#main-content" className="sr-only focus:not-sr-only ...">跳到正文</a>`。
  最终润色：favicon（`public/favicon.ico`占位）、页面标题默认值"yxshan's Blog"、无障碍 aria 标签检查、`prefers-reduced-motion` 禁用过渡动画。Must NOT: 不要引入新依赖。
  Parallelization: Wave 6 | Blocked by: — | Blocks: —
  References: CSS `@media print` 最佳实践；TailwindCSS `sr-only` utility
  Acceptance criteria: 打印预览时只显示文章内容；Tab 键可触发 Skip to Content；`prefers-reduced-motion: reduce` 时无动画
  QA scenarios: happy=Ctrl+P 预览确认打印布局; failure=Skip to Content 在视觉上不可见; edge=代码块在打印时有水平滚动
  Commit: Y | `feat: add print styles, skip-to-content, and final polish`

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — 逐条检查 25 个 todo 是否全部完成，验收标准是否通过
- [ ] F2. Code quality review — 检查文件是否超过 250 行、是否有未使用的 import、中文注释是否到位
- [ ] F3. Real manual QA — 完整 QA 场景验证：启动 dev server → 首页列表渲染 → 标签筛选 → 搜索 → 文章详情 → TOC 跳转 → 暗色模式切换 → 移动端响应式 → 404 页面 → vite build → vite preview → sitemap 检查 → 打印预览
- [ ] F4. Scope fidelity — 对照 Must NOT have 清单确认无越界（无后端代码、无测试框架、无 TypeScript、无 react-syntax-highlighter、markdown 不在 public/ 下）

## Commit strategy
每波次完成后提交一次，共 6 个 commits：
1. `chore: scaffold project with Vite, React 19, and TailwindCSS`
2. `feat: add markdown post loader with auto-discovery categories`
3. `feat: add layout framework with dark mode and shiki themes`
4. `feat: add home page with virtual scrolling, search, and tag filter`
5. `feat: add post detail page with TOC and reading enhancements`
6. `feat: add routing, sitemap, and final polish`

## Success criteria
1. 项目 `vite build` 无错误完成，产物 `dist/` 目录可被 `vite preview` 正常服务
2. 首页加载 200+ 篇文章时虚拟滚动流畅（< 16ms per frame）
3. 任意文章详情页正确渲染代码高亮、数学公式、Admonitions 提示框
4. 搜索功能可在 < 100ms 内返回结果
5. 暗色模式切换无闪烁，代码块双主题配色正确
6. GitHub Actions push to main 后自动部署到 `yxshan.github.io/blog`
7. 移动端（375px 宽度）所有页面可正常使用
8. sitemap.xml 可被 Google Search Console 正确解析
9. 新增一个分类目录后，无需改代码，首页自动显示新分类
10. `print` 打印预览只显示正文内容，无导航装饰
