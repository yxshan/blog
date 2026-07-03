import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { BlogLayout } from "./layouts/BlogLayout";

// 代码分割：页面组件按需懒加载
const Home = lazy(() => import("./pages/Home"));
const Post = lazy(() => import("./pages/Post"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * 页面加载中的占位组件
 */
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
    </div>
  );
}

/**
 * App — 应用根组件
 *
 * 组件树：
 *   HashRouter（客户端路由，无 basename）
 *     └── HelmetProvider（SEO meta 管理）
 *           └── ThemeProvider（暗色模式上下文）
 *                 └── Routes
 *                       └── BlogLayout（Header + Outlet + Footer）
 *                             ├── / → Home（首页）
 *                             ├── /posts/:slug → Post（文章详情）
 *                             └── * → NotFound（404）
 *
 * 注意：
 *   - HashRouter 不加 basename（React Router #9800 bug），
 *     静态资源路径由 vite.config.js 的 base: '/blog/' 处理
 *   - 页面组件使用 React.lazy + Suspense 实现代码分割
 */
function App() {
  return (
    <HashRouter>
      <HelmetProvider>
        <ThemeProvider>
          <Routes>
            <Route element={<BlogLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Home />
                  </Suspense>
                }
              />
              <Route
                path="posts/:slug"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Post />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NotFound />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </ThemeProvider>
      </HelmetProvider>
    </HashRouter>
  );
}

export default App;
