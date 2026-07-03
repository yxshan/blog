import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { BlogLayout } from "./layouts/BlogLayout";
import Home from "./pages/Home";
import Post from "./pages/Post";
import { NotFound } from "./pages/NotFound";

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
          <Routes>
            <Route element={<BlogLayout />}>
              <Route index element={<Home />} />
              <Route path="posts/*" element={<Post />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
