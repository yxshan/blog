import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { BlogLayout } from "./layouts/BlogLayout";
import { NotFound } from "./pages/NotFound";

const Home = lazy(() => import("./pages/Home"));
const Post = lazy(() => import("./pages/Post"));

/** 路由切换时自动滚动到页面顶部 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter basename="/blog">
          <ScrollToTop />
          <Suspense
            fallback={
              <div className="flex min-h-[60vh] items-center justify-center text-gray-500 dark:text-gray-400">
                加载中...
              </div>
            }
          >
            <Routes>
              <Route element={<BlogLayout />}>
                <Route index element={<Home />} />
                <Route path="posts/*" element={<Post />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
