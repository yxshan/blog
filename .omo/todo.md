# 📋 可扩展方向 Todo 文档

## 优先级说明

| 标记 | 含义 |
|------|------|
| 🔴 P0 | 已完成 |
| 🟢 P1 | 高价值低投入，建议优先 |
| 🟡 P2 | 有价值但需一定投入 |
| 🔵 P3 | 锦上添花，长期迭代 |

---

## 🔴 已完成

### 1. 数学公式渲染（KaTeX）

- [x] 技术：`marked-katex-extension` + `katex`
- [x] 效果：`$O(n)$` 内联、`$$...$$` 块级

### 2. 代码行号

- [x] 技术：纯 CSS `counter-reset` + `::before` 伪元素
- [x] 效果：行号 + hover 整行高亮

### 3. 目录栏优化

- [x] 技术：`IntersectionObserver` + Tailwind `sticky` + React `useState` 折叠
- [x] 效果：sticky 跟随、可折叠 h3、去重 ID、平滑高亮

---

## 🟢 P1 — 高价值低投入

### 4. 文章封面图

**技术栈**：Frontmatter 新增 `cover` 字段 + `<img>` 渲染  
**执行流程**：
1. 在 Frontmatter 模板中新增 `cover: /posts/algorithm/001-two-sum/cover.png`
2. Post.jsx 的文章头部渲染封面图（`<img>` + `rounded-xl` + `shadow`）
3. ArticleCard 也支持封面缩略图模式
4. 无封面图的文章保持现有效果

**预估**：~30 行，15 分钟

### 5. 搜索快捷键（`Cmd+K` / `Ctrl+K`）

**技术栈**：`useEffect` 全局键盘监听 + React state  
**执行流程**：
1. 在 App.jsx 或 Layout 层注册 `keydown` 事件
2. 按下 `Cmd+K` / `Ctrl+K` 时聚焦搜索框并滚动到顶部
3. `Escape` 关闭搜索并取消聚焦
4. 搜索框内显示 "⌘K" 提示文字

**预估**：~30 行，15 分钟

### 6. 暗色模式三态切换（浅色 / 深色 / 跟随系统）

**技术栈**：修改 `features/theme/ThemeProvider.jsx` + Header 按钮  
**执行流程**：
1. 将 `theme` 状态从 `'light' | 'dark'` 扩展为 `'light' | 'dark' | 'system'`
2. `'system'` 模式下读取 `prefers-color-scheme` 并自动跟随
3. Header 按钮改为三态循环图标（Sun → Moon → Monitor）
4. localStorage 持久化三态

**预估**：~40 行，20 分钟

### 7. 构建时生成首页静态 HTML 预渲染

**技术栈**：`vite-plugin-ssr` 或自定义 Vite 插件 + `react-dom/server`  
**执行流程**：
1. 在 `vite.config.js` 中增加 `transformIndexHtml` 或 `closeBundle` 钩子
2. 调用 `renderToString(<App />)` 生成首页 HTML 字符串
3. 替换 `dist/index.html` 中的 `<div id="root">` 为预渲染内容
4. React 水合（hydration）接管后续交互

**预估**：~50 行 Vite 插件，30 分钟

### 8. 文章图片支持

**技术栈**：无需额外依赖，修改 MarkdownRenderer 和构建逻辑  
**执行流程**：
1. 文章目录下可放置 `img/` 文件夹
2. Markdown 中 `![](./img/diagram.png)` 即可引用
3. 构建时将 `posts/` 下的图片复制到 `dist/` 对应的 public 路径
4. 在 `vite.config.js` 中配置 `publicDir` 或使用 `import.meta.glob` 导入图片

**预估**：~20 行，Vite 配置 + MarkdownRenderer `img` 增强已有

---

## 🟡 P2 — 有价值但需一定投入

### 9. 评论系统（Giscus）

**技术栈**：`@giscus/react` + GitHub Discussions API  
**执行流程**：
1. 在 `yxshan/blog` 仓库启用 Discussions
2. 安装 `@giscus/react`
3. 在 Post.jsx 文章底部添加 `<Giscus>` 组件
4. 映射 `post.slug` → Giscus `term` 实现每篇文章独立评论区
5. 配置暗色模式跟随（Giscus 支持 `theme` prop）

**预估**：~30 行，需先在 GitHub 仓库启用 Discussions

### 10. 构建时自动生成 OG 图片

**技术栈**：`satori` + `@resvg/resvg-js` + Vite 插件  
**执行流程**：
1. 安装 `satori`（JSX → SVG）和 `@resvg/resvg-js`（SVG → PNG）
2. 设计 OG 图片模板：标题 + 日期 + 标签 + 背景色
3. 在 `vite.config.js` closeBundle 钩子中生成
4. 输出到 `dist/og/<slug>.png`
5. Post.jsx 的 Helmet 中引用 `<meta property="og:image">`

**预估**：~80 行，1-2 小时

### 11. RSS Feed 生成

**技术栈**：`feed` npm 包 + Vite closeBundle 插件  
**执行流程**：
1. 安装 `feed`
2. 在 sitemap 生成脚本中同步生成 `rss.xml`
3. 包含每篇文章的标题、摘要、日期、链接
4. 在 `<head>` 中添加 `<link rel="alternate" type="application/rss+xml">`

**预估**：~40 行，20 分钟

### 12. 文章系列 / 合集

**技术栈**：Frontmatter 新增 `series` 字段 + 首页/文章页展示  
**执行流程**：
1. Frontmatter 新增 `series: 链表反转三部曲` 和 `series_order: 1`
2. `api.js` 增加 `getSeries(name)` 函数
3. 文章详情页顶部显示系列导航（第 N 篇 / 共 M 篇）
4. 首页可按系列分组展示

**预估**：~100 行，1 小时

### 13. 网站访问统计

**技术栈**：Google Analytics 4 或 Plausible（隐私友好）  
**执行流程**：
1. 在 Google Analytics 创建 Property，获取 Measurement ID
2. 在 `index.html` 中添加 GA script（或使用 `react-ga4`）
3. 添加页面浏览事件（路由切换触发 `page_view`）
4. 可选：Plausible 轻量方案（`<script defer data-domain="..." src="...">`）

**预估**：~10 行，10 分钟

### 14. 代码块一键复制行号区域不选中

**技术栈**：CSS `user-select: none`（已实现）  
**执行流程**：
1. 当前 CSS counter `::before` 生成的伪元素天然不可选中
2. 验证 `::before { user-select: none }` 在主流浏览器表现
3. 如有问题，改用表格布局（左列行号、右列代码）

**预估**：已基本完成，只需微调 CSS

### 15. 移动端目录折叠按钮

**技术栈**：React state + Tailwind 动画  
**执行流程**：
1. 移动端（`<lg`）在文章顶部添加"目录 ▼"浮动按钮
2. 点击展开全屏目录覆盖层（`fixed inset-0 z-50 bg-white/95`）
3. 选中标题后自动关闭覆盖层
4. 添加 `useEffect` 监听路由变化关闭

**预估**：~60 行，30 分钟

---

## 🔵 P3 — 锦上添花

### 16. 阅读进度环（右下角）

**技术栈**：SVG `circle` + `stroke-dasharray` + `IntersectionObserver`  
**执行流程**：
1. 在 BackToTop.jsx 中增加 SVG 进度环
2. 计算 `scrollTop / (scrollHeight - clientHeight)` 百分比
3. `stroke-dashoffset` 动态更新实现圆弧进度
4. 点击回顶部

**预估**：~50 行，30 分钟

### 17. PWA / 离线支持

**技术栈**：`vite-plugin-pwa`  
**执行流程**：
1. 安装 `vite-plugin-pwa`
2. 配置 `manifest`（图标、名称、主题色）
3. 启用 `workbox` 预缓存所有静态资源
4. 安装后支持离线浏览

**预估**：~30 行配置，20 分钟

### 18. 自定义独立页面

**技术栈**：现有路由 + Markdown 渲染  
**执行流程**：
1. 在项目根目录创建 `pages/about.md`
2. `import.meta.glob` 同时扫描 `/pages/*.md`
3. 在 App.jsx 增加动态路由 `/about` → 渲染 about.md
4. 首页导航增加"关于"链接

**预估**：~40 行，20 分钟

### 19. 全文高亮搜索结果关键词

**技术栈**：正则替换 + `dangerouslySetInnerHTML`  
**执行流程**：
1. 在搜索结果中，将匹配的关键词用 `<mark>` 标签包裹
2. ArticleCard 的摘要也高亮匹配部分
3. 通过 Tailwind `bg-yellow-200` 样式高亮

**预估**：~30 行，15 分钟

### 20. 文章内标题锚点链接复制

**技术栈**：DOM 后处理 + `navigator.clipboard`  
**执行流程**：
1. 在 MarkdownRenderer 的 `enhanceHeadings` 中，给每个标题后添加 `#` 链接图标
2. 点击复制完整 URL（含 hash）到剪贴板
3. Toast 提示"链接已复制"

**预估**：~50 行，30 分钟

---

## 📊 总结

| 优先级 | 数量 | 总预估时间 |
|--------|------|-----------|
| 🟢 P1 | 5 项 | ~1.5 小时 |
| 🟡 P2 | 7 项 | ~4 小时 |
| 🔵 P3 | 5 项 | ~2 小时 |
| **合计** | **17 项** | **~7.5 小时** |
