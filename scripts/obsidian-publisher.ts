import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { GhCliPublisher, type GitHubPublisher } from "./github-publisher";
import {
  preparePublishedPost,
  resolveObsidianPost,
  type PreparedPublishedPost,
} from "./obsidian-post";
import {
  runPublisherCommand,
  runPublisherCommandBuffer,
} from "./publisher-command";

export {
  preparePublishedPost,
  resolveObsidianPost,
  type PreparedPublishedPost,
  type PublishedFile,
  type ResolvedObsidianPost,
} from "./obsidian-post";
export type { GitHubPublisher } from "./github-publisher";

export interface PublishPostOptions {
  sourcePath: string;
  projectRoot: string;
  dryRun?: boolean;
  github?: GitHubPublisher;
  now?: () => Date;
  qualityChecks?: (worktreeRoot: string) => void;
}

export type PublishPostResult =
  | {
      status: "dry-run";
      title: string;
      sourceFilePath: string;
      destinationRelativePath: string;
      files: string[];
      transformations: Array<{ from: string; to: string }>;
    }
  | {
      status: "no-change";
      title: string;
      destinationRelativePath: string;
      files: string[];
    }
  | {
      status: "published";
      title: string;
      destinationRelativePath: string;
      branch: string;
      prUrl: string;
      autoMergeEnabled: boolean;
    };

function formatBranchTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}${values.month}${values.day}-${values.hour}${values.minute}${values.second}`;
}

function writePreparedFiles(
  destinationRoot: string,
  prepared: PreparedPublishedPost,
): void {
  const destinationDirectory = path.resolve(
    destinationRoot,
    path.posix.dirname(prepared.source.destinationRelativePath),
  );
  const postsRoot = path.resolve(destinationRoot, "posts");
  if (
    destinationDirectory !== postsRoot &&
    !destinationDirectory.startsWith(`${postsRoot}${path.sep}`)
  ) {
    throw new Error("发布目标不能离开博客 posts 目录");
  }

  fs.rmSync(destinationDirectory, { recursive: true, force: true });
  for (const file of prepared.files) {
    const destination = path.resolve(destinationRoot, file.relativePath);
    if (!destination.startsWith(`${postsRoot}${path.sep}`)) {
      throw new Error(`发布文件不能离开博客 posts 目录: ${file.relativePath}`);
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, file.contents);
  }
}

function matchesOriginMain(
  projectRoot: string,
  prepared: PreparedPublishedPost,
): boolean {
  const articlePath = path.posix.dirname(
    prepared.source.destinationRelativePath,
  );
  const trackedFiles = runPublisherCommand(
    "git",
    ["ls-tree", "-r", "--name-only", "origin/main", "--", articlePath],
    projectRoot,
  )
    .split("\n")
    .filter(Boolean)
    .sort();
  const expectedFiles = prepared.files.map((file) => file.relativePath).sort();
  if (
    trackedFiles.length !== expectedFiles.length ||
    trackedFiles.some((file, index) => file !== expectedFiles[index])
  ) {
    return false;
  }
  return prepared.files.every((file) =>
    runPublisherCommandBuffer(
      "git",
      ["show", `origin/main:${file.relativePath}`],
      projectRoot,
    ).equals(file.contents),
  );
}

function validateDryRun(
  projectRoot: string,
  prepared: PreparedPublishedPost,
): void {
  const sandboxRoot = fs.mkdtempSync(path.join(os.tmpdir(), "blog-dry-run-"));
  try {
    for (const relativePath of [
      "package.json",
      "tsconfig.json",
      "scripts",
      "src",
      "posts",
    ]) {
      const sourcePath = path.join(projectRoot, relativePath);
      if (fs.existsSync(sourcePath)) {
        fs.cpSync(sourcePath, path.join(sandboxRoot, relativePath), {
          recursive: true,
        });
      }
    }
    const nodeModules = path.join(projectRoot, "node_modules");
    if (fs.existsSync(nodeModules)) {
      fs.symlinkSync(
        nodeModules,
        path.join(sandboxRoot, "node_modules"),
        "dir",
      );
    }
    writePreparedFiles(sandboxRoot, prepared);
    runPublisherCommand("npm", ["run", "validate"], sandboxRoot);
  } finally {
    fs.rmSync(sandboxRoot, { recursive: true, force: true });
  }
}

function repositoryWebUrl(projectRoot: string): string | null {
  try {
    const remote = runPublisherCommand(
      "git",
      ["remote", "get-url", "origin"],
      projectRoot,
    );
    if (remote.startsWith("git@github.com:")) {
      return `https://github.com/${remote.slice("git@github.com:".length).replace(/\.git$/, "")}`;
    }
    if (remote.startsWith("https://github.com/")) {
      return remote.replace(/\.git$/, "");
    }
    return null;
  } catch {
    return null;
  }
}

function cleanupWorktree(options: {
  projectRoot: string;
  worktreeRoot: string;
  branch: string;
  added: boolean;
}): void {
  if (options.added) {
    try {
      runPublisherCommand(
        "git",
        ["worktree", "remove", "--force", options.worktreeRoot],
        options.projectRoot,
      );
    } catch {
      // Final filesystem cleanup handles an already-detached worktree.
    }
    try {
      runPublisherCommand(
        "git",
        ["branch", "-D", options.branch],
        options.projectRoot,
      );
    } catch {
      // A failed worktree creation may leave no local branch.
    }
  }
  fs.rmSync(options.worktreeRoot, { recursive: true, force: true });
}

function runLocalQualityChecks(worktreeRoot: string): void {
  for (const [command, args] of [
    ["npm", ["run", "typecheck"]],
    ["npm", ["run", "validate"]],
    ["npm", ["run", "lint"]],
    ["npm", ["run", "quality:architecture"]],
    ["npm", ["run", "quality:unused"]],
    ["npm", ["run", "test:coverage"]],
    ["npm", ["run", "build"]],
    ["npm", ["run", "test:smoke"]],
    ["npx", ["playwright", "install", "chromium"]],
    ["npm", ["run", "test:e2e"]],
    ["npm", ["run", "security:audit"]],
  ] as const) {
    runPublisherCommand(command, [...args], worktreeRoot);
  }
}

export function publishPost(options: PublishPostOptions): PublishPostResult {
  const projectRoot = fs.realpathSync(path.resolve(options.projectRoot));
  if (!fs.existsSync(path.join(projectRoot, ".git"))) {
    throw new Error(`博客项目不是 Git 仓库: ${projectRoot}`);
  }
  const prepared = preparePublishedPost(
    resolveObsidianPost(options.sourcePath),
  );
  const commonResult = {
    title: prepared.title,
    destinationRelativePath: prepared.source.destinationRelativePath,
    files: prepared.files.map((file) => file.relativePath),
  };

  if (options.dryRun) {
    validateDryRun(projectRoot, prepared);
    return {
      status: "dry-run",
      ...commonResult,
      sourceFilePath: prepared.source.sourceFilePath,
      transformations: prepared.transformations,
    };
  }

  const github = options.github ?? new GhCliPublisher();
  github.assertAuthenticated(projectRoot);
  runPublisherCommand("git", ["fetch", "origin", "main"], projectRoot);
  if (matchesOriginMain(projectRoot, prepared)) {
    return { status: "no-change", ...commonResult };
  }

  const timestamp = formatBranchTimestamp(
    (options.now ?? (() => new Date()))(),
  );
  const branch = `posts/${prepared.source.articleDirectory}-${timestamp}`;
  const worktreeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "blog-publish-"));
  let worktreeAdded = false;
  try {
    runPublisherCommand(
      "git",
      ["worktree", "add", "-b", branch, worktreeRoot, "origin/main"],
      projectRoot,
    );
    worktreeAdded = true;
    const projectNodeModules = path.join(projectRoot, "node_modules");
    if (fs.existsSync(projectNodeModules)) {
      fs.symlinkSync(
        projectNodeModules,
        path.join(worktreeRoot, "node_modules"),
        "dir",
      );
    }
    writePreparedFiles(worktreeRoot, prepared);
    (options.qualityChecks ?? runLocalQualityChecks)(worktreeRoot);

    const stagePaths = [
      path.posix.dirname(prepared.source.destinationRelativePath),
    ];
    if (fs.existsSync(path.join(worktreeRoot, "src/generated"))) {
      stagePaths.push("src/generated");
    }
    runPublisherCommand("git", ["add", "--all", ...stagePaths], worktreeRoot);
    runPublisherCommand(
      "git",
      ["commit", "-m", `posts: publish ${prepared.title}`],
      worktreeRoot,
    );
    runPublisherCommand(
      "git",
      ["push", "origin", `HEAD:refs/heads/${branch}`],
      worktreeRoot,
    );

    let prUrl: string;
    try {
      prUrl = github.createPullRequest({
        cwd: worktreeRoot,
        branch,
        title: `posts: publish ${prepared.title}`,
        body: [
          "由 Obsidian 文章发布器自动创建。",
          "",
          `- 来源文章：${prepared.source.articleDirectory}`,
          `- 目标路径：\`${prepared.source.destinationRelativePath}\``,
          "- 已验证：完整本地质量、安全与浏览器门禁",
        ].join("\n"),
      });
    } catch (error) {
      const webUrl = repositoryWebUrl(projectRoot);
      const recovery = webUrl
        ? `请打开 ${webUrl}/compare/main...${encodeURIComponent(branch)}?expand=1`
        : `请为分支 ${branch} 手动创建 PR。`;
      throw new Error(`远程分支已推送，但 PR 创建失败。${recovery}`, {
        cause: error,
      });
    }

    return {
      status: "published",
      title: prepared.title,
      destinationRelativePath: prepared.source.destinationRelativePath,
      branch,
      prUrl,
      autoMergeEnabled: github.enableAutoMerge({ cwd: worktreeRoot, prUrl }),
    };
  } finally {
    cleanupWorktree({
      projectRoot,
      worktreeRoot,
      branch,
      added: worktreeAdded,
    });
  }
}
