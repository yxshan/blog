import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://yxshan.github.io",
  base: "/blog",
  output: "static",
  trailingSlash: "ignore",
  integrations: [react()],
  vite: {
    build: {
      sourcemap:
        process.env.ENABLE_PRIVATE_SOURCEMAPS === "true" ? "hidden" : false,
    },
  },
});
