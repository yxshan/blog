import { HashRouter, Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { BlogLayout } from "./layouts/BlogLayout";
import Home from "./pages/Home";
import Post from "./pages/Post";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
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
  );
}

export default App;
