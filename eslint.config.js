import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

const browserGlobals = {
  AbortController: "readonly",
  Buffer: "readonly",
  HTMLElement: "readonly",
  IntersectionObserver: "readonly",
  MutationObserver: "readonly",
  Node: "readonly",
  NodeFilter: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  cancelAnimationFrame: "readonly",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  document: "readonly",
  fetch: "readonly",
  history: "readonly",
  localStorage: "readonly",
  location: "readonly",
  navigator: "readonly",
  requestAnimationFrame: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  __dirname: "readonly",
  __filename: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
};

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/generated/**",
      ".playwright-mcp/**",
      "*.png",
    ],
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: { ...browserGlobals, ...nodeGlobals },
    },
    plugins: {
      ...reactHooks.configs.flat.recommended.plugins,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      "no-undef": "error",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, allowExportNames: ["enhanceCodeBlock"] },
      ],
    },
  },
  prettier,
];
