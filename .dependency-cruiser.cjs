/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "模块之间禁止循环依赖。",
      from: {},
      to: { circular: true },
    },
    {
      name: "core-does-not-depend-on-upper-layers",
      severity: "error",
      comment: "core 只能依赖 core 或第三方库，不能反向依赖上层模块。",
      from: { path: "^src/core/" },
      to: {
        path: "^src/(components|features|integrations|layouts|lib|pages|shared)/",
      },
    },
    {
      name: "core-does-not-depend-on-ui-frameworks",
      severity: "error",
      comment: "core 不能依赖 React、Fuse.js 或 Giscus 等 UI 和外部实现。",
      from: { path: "^src/core/" },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^(react|react-dom|fuse[.]js|giscus|@giscus/)",
      },
    },
    {
      name: "features-do-not-depend-on-page-composition",
      severity: "error",
      comment: "feature 模块不能依赖页面、布局或页面编排模块。",
      from: { path: "^src/features/" },
      to: { path: "^src/(components|layouts|pages|lib)/" },
    },
    {
      name: "shared-does-not-depend-on-features-or-pages",
      severity: "error",
      comment: "shared 模块只能依赖 core 或第三方库。",
      from: { path: "^src/shared/" },
      to: {
        path: "^src/(components|features|integrations|layouts|lib|pages)/",
      },
    },
    {
      name: "integrations-do-not-depend-on-ui",
      severity: "error",
      comment: "外部适配器不能依赖页面或业务 UI 实现。",
      from: { path: "^src/integrations/" },
      to: { path: "^src/(components|features|layouts|lib|pages)/" },
    },
    {
      name: "libraries-do-not-depend-on-ui",
      severity: "error",
      comment: "集成入口不能依赖页面或 feature 实现。",
      from: { path: "^src/lib/" },
      to: {
        path: "^src/(components|features|integrations|layouts|pages|shared)/",
      },
    },
    {
      name: "scripts-do-not-depend-on-ui",
      severity: "error",
      comment: "构建脚本只能消费核心内容模型，不能依赖 UI 模块。",
      from: { path: "^scripts/" },
      to: {
        path: "^src/(components|features|integrations|layouts|lib|pages|shared)/",
      },
    },
    {
      name: "generated-index-is-catalog-private",
      severity: "error",
      comment: "生成索引只能由 core/content 目录模块读取。",
      from: { pathNot: "^src/core/content/" },
      to: { path: "^src/generated/" },
    },
    {
      name: "production-does-not-import-tests",
      severity: "error",
      comment: "生产模块不能依赖测试文件。",
      from: { pathNot: "[.](?:test|spec)[.](?:ts|tsx)$" },
      to: { path: "[.](?:test|spec)[.](?:ts|tsx)$" },
    },
    {
      name: "no-unresolvable",
      severity: "error",
      comment: "所有导入都必须能够解析。",
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
};
