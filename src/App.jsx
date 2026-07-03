import { BrowserRouter, Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { BlogLayout } from "./layouts/BlogLayout";
import Home from "./pages/Home";
import Post from "./pages/Post";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter basename="/blog">
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
