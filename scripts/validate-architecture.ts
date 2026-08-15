import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { PROJECT_ROOT } from "../src/core/content/source";

export interface SourceFile {
  filePath: string;
  content: string;
}

function findFiles(dir: string, extension: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findFiles(filePath, extension);
    return entry.name.endsWith(extension) ? [filePath] : [];
  });
}

function toProjectPath(filePath: string): string {
  return path.relative(PROJECT_ROOT, filePath).split(path.sep).join("/");
}

export function findAstroImportViolations(files: SourceFile[]): string[] {
  const violations: string[] = [];
  for (const file of files) {
    const sourcePath = path.resolve(PROJECT_ROOT, file.filePath);
    const imports = ts.preProcessFile(file.content, true, true).importedFiles;
    for (const imported of imports) {
      if (!imported.fileName.startsWith(".")) continue;
      const target = toProjectPath(
        path.resolve(path.dirname(sourcePath), imported.fileName),
      );
      if (target === "src/generated" || target.startsWith("src/generated/")) {
        violations.push(
          `${file.filePath}: generated 索引只能由 src/core/content 读取（${imported.fileName}）`,
        );
      }
    }
  }
  return violations;
}

export function validateAstroArchitecture(
  rootDir: string = path.join(PROJECT_ROOT, "src"),
): void {
  const files = findFiles(rootDir, ".astro").map((filePath) => ({
    filePath: toProjectPath(filePath),
    content: fs.readFileSync(filePath, "utf-8"),
  }));
  const violations = findAstroImportViolations(files);
  if (violations.length > 0) {
    throw new Error(`Astro 模块依赖违规：\n${violations.join("\n")}`);
  }
  console.log(`[architecture] Astro 导入检查通过（${files.length} 个文件）`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  validateAstroArchitecture();
}
