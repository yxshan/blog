import path from "node:path";
import { pathToFileURL } from "node:url";
import { PROJECT_ROOT } from "../src/core/content/source";
import { publishPost } from "./obsidian-publisher";

interface CliOptions {
  sourcePath: string;
  dryRun: boolean;
}

function parseArguments(args: string[]): CliOptions {
  const dryRun = args.includes("--dry-run");
  const unknownOptions = args.filter(
    (argument) => argument.startsWith("--") && argument !== "--dry-run",
  );
  if (unknownOptions.length > 0) {
    throw new Error(`未知参数: ${unknownOptions.join(", ")}`);
  }

  const sourcePaths = args.filter((argument) => !argument.startsWith("--"));
  if (sourcePaths.length !== 1 || !sourcePaths[0]) {
    throw new Error(
      '用法: npm run post:publish -- "/绝对路径/index.md" [--dry-run]',
    );
  }
  return { sourcePath: path.resolve(sourcePaths[0]), dryRun };
}

export function runPublishCli(args: string[]): void {
  const options = parseArguments(args);
  const result = publishPost({
    sourcePath: options.sourcePath,
    projectRoot: PROJECT_ROOT,
    dryRun: options.dryRun,
  });

  console.log(`[post:publish] 文章：${result.title}`);
  console.log(`[post:publish] 目标：${result.destinationRelativePath}`);

  if (result.status === "dry-run") {
    console.log(`[post:publish] 来源：${result.sourceFilePath}`);
    console.log("[post:publish] 发布文件：");
    for (const file of result.files) console.log(`  - ${file}`);
    if (result.transformations.length === 0) {
      console.log("[post:publish] Markdown 无需转换");
    } else {
      console.log("[post:publish] Markdown 转换：");
      for (const transformation of result.transformations) {
        console.log(`  - ${transformation.from} → ${transformation.to}`);
      }
    }
    console.log(
      `[post:publish] dry-run 校验通过（${result.files.length} 个文件）`,
    );
    return;
  }
  if (result.status === "no-change") {
    console.log("[post:publish] 文章内容没有变化，无需发布");
    return;
  }

  console.log(`[post:publish] PR：${result.prUrl}`);
  if (result.autoMergeEnabled) {
    console.log("[post:publish] 已开启自动合并，CI 通过后将自动部署");
  } else {
    console.warn(
      "[post:publish] PR 已创建，但无法开启自动合并。请在 GitHub Settings → General → Pull Requests 启用 Allow auto-merge。",
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    runPublishCli(process.argv.slice(2));
  } catch (error) {
    console.error(
      `[post:publish] 发布失败：${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
