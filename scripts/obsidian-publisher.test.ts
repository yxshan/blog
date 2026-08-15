import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildLocalQualityCommands,
  preparePublishedPost,
  publishPost,
  resolveObsidianPost,
  type GitHubPublisher,
} from "./obsidian-publisher";

const temporaryDirectories: string[] = [];
const skipQualityChecks = () => undefined;

function createVault(): string {
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), "obsidian-vault-"));
  temporaryDirectories.push(vaultRoot);
  fs.mkdirSync(path.join(vaultRoot, ".obsidian"));
  return vaultRoot;
}

function writePost(
  vaultRoot: string,
  relativeDirectory: string,
  content = [
    "---",
    "title: 测试文章",
    "date: 2026-08-15",
    "tags:",
    "  - 测试",
    "draft: false",
    "---",
    "正文",
  ].join("\n"),
): string {
  const directory = path.join(vaultRoot, "posts", relativeDirectory);
  fs.mkdirSync(directory, { recursive: true });
  const filePath = path.join(directory, "index.md");
  fs.writeFileSync(filePath, content);
  return filePath;
}

function runGit(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf-8" }).trim();
}

function createBlogRepository(existingPost?: {
  relativePath: string;
  contents: string;
}): string {
  const container = fs.mkdtempSync(path.join(os.tmpdir(), "blog-repository-"));
  temporaryDirectories.push(container);
  const projectRoot = path.join(container, "blog");
  const remoteRoot = path.join(container, "remote.git");
  fs.mkdirSync(projectRoot);
  runGit(projectRoot, ["init", "-b", "main"]);
  runGit(projectRoot, ["config", "user.name", "Publisher Test"]);
  runGit(projectRoot, ["config", "user.email", "publisher@example.com"]);
  fs.writeFileSync(
    path.join(projectRoot, "package.json"),
    JSON.stringify({
      name: "test-blog",
      private: true,
      scripts: Object.fromEntries(
        ["validate", "typecheck", "lint", "test", "build"].map((name) => [
          name,
          'node -e "process.exit(0)"',
        ]),
      ),
    }),
  );
  fs.writeFileSync(path.join(projectRoot, ".gitignore"), "node_modules/\n");
  if (existingPost) {
    const destination = path.join(projectRoot, existingPost.relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, existingPost.contents);
  }
  runGit(projectRoot, ["add", "."]);
  runGit(projectRoot, ["commit", "-m", "chore: initialize test blog"]);
  runGit(container, ["init", "--bare", remoteRoot]);
  runGit(projectRoot, ["remote", "add", "origin", remoteRoot]);
  runGit(projectRoot, ["push", "-u", "origin", "main"]);
  runGit(remoteRoot, ["symbolic-ref", "HEAD", "refs/heads/main"]);
  return projectRoot;
}

class FakeGitHubPublisher implements GitHubPublisher {
  authenticated = false;
  createdBranch: string | null = null;
  autoMergeRequested = false;

  constructor(
    private readonly behavior: {
      authenticationError?: Error;
      pullRequestError?: Error;
      autoMergeResult?: boolean;
    } = {},
  ) {}

  assertAuthenticated(): void {
    if (this.behavior.authenticationError) {
      throw this.behavior.authenticationError;
    }
    this.authenticated = true;
  }

  createPullRequest(options: { branch: string }): string {
    if (this.behavior.pullRequestError) throw this.behavior.pullRequestError;
    this.createdBranch = options.branch;
    return "https://github.com/yxshan/blog/pull/99";
  }

  enableAutoMerge(): boolean {
    this.autoMergeRequested = true;
    return this.behavior.autoMergeResult ?? true;
  }
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("resolveObsidianPost", () => {
  it("flattens Obsidian organization folders below the blog category", () => {
    const vaultRoot = createVault();
    const filePath = writePost(vaultRoot, "algorithm/链表/001-reverse-list");

    const realVaultRoot = fs.realpathSync(vaultRoot);
    expect(resolveObsidianPost(filePath)).toMatchObject({
      vaultRoot: realVaultRoot,
      sourcePostsRoot: path.join(realVaultRoot, "posts"),
      category: "algorithm",
      articleDirectory: "001-reverse-list",
      destinationRelativePath: "posts/algorithm/001-reverse-list/index.md",
    });
  });

  it("keeps articles that have no intermediate organization folder", () => {
    const vaultRoot = createVault();
    const filePath = writePost(vaultRoot, "kaoyan/010-converse");

    expect(resolveObsidianPost(filePath).destinationRelativePath).toBe(
      "posts/kaoyan/010-converse/index.md",
    );
  });

  it.each([
    ["a non-index Markdown file", "algorithm/001-valid/article.md"],
    ["an invalid article directory", "algorithm/not-numbered/index.md"],
    ["an invalid category", "算法/001-valid/index.md"],
  ])("rejects %s", (_label, relativePath) => {
    const vaultRoot = createVault();
    const filePath = path.join(vaultRoot, "posts", relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "content");

    expect(() => resolveObsidianPost(filePath)).toThrow();
  });

  it("rejects an index file outside an Obsidian posts directory", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "plain-post-"));
    temporaryDirectories.push(directory);
    const filePath = path.join(directory, "index.md");
    fs.writeFileSync(filePath, "content");

    expect(() => resolveObsidianPost(filePath)).toThrow(
      "Obsidian Vault 的 posts 目录",
    );
  });
});

describe("preparePublishedPost", () => {
  it("converts Obsidian image embeds and copies only referenced images", () => {
    const vaultRoot = createVault();
    const filePath = writePost(
      vaultRoot,
      "algorithm/链表/001-reverse-list",
      [
        "---",
        "title: 反转链表",
        "date: 2026-08-15",
        "tags: [链表]",
        "draft: false",
        "---",
        "![[流程图.png]]",
        "![结果](./结果.webp)",
        "![旧路径](posts/algorithm/链表/001-reverse-list/旧路径.jpg)",
      ].join("\n"),
    );
    const articleDirectory = path.dirname(filePath);
    fs.writeFileSync(path.join(articleDirectory, "流程图.png"), "png");
    fs.writeFileSync(path.join(articleDirectory, "结果.webp"), "webp");
    fs.writeFileSync(path.join(articleDirectory, "旧路径.jpg"), "jpg");
    fs.writeFileSync(path.join(articleDirectory, "未引用.png"), "unused");

    const prepared = preparePublishedPost(resolveObsidianPost(filePath));

    expect(prepared.title).toBe("反转链表");
    expect(prepared.markdown).toContain("![流程图](./流程图.png)");
    expect(prepared.files.map((file) => file.relativePath)).toEqual([
      "posts/algorithm/001-reverse-list/index.md",
      "posts/algorithm/001-reverse-list/旧路径.jpg",
      "posts/algorithm/001-reverse-list/流程图.png",
      "posts/algorithm/001-reverse-list/结果.webp",
    ]);
  });

  it("rejects missing and escaping image references", () => {
    const vaultRoot = createVault();
    const missing = writePost(
      vaultRoot,
      "algorithm/001-missing",
      "---\ntitle: Missing\ndate: 2026-08-15\ntags: [test]\n---\n![x](./missing.png)",
    );
    const escaping = writePost(
      vaultRoot,
      "algorithm/002-escaping",
      "---\ntitle: Escaping\ndate: 2026-08-15\ntags: [test]\n---\n![x](../secret.png)",
    );
    fs.writeFileSync(
      path.join(path.dirname(escaping), "..", "secret.png"),
      "x",
    );

    expect(() => preparePublishedPost(resolveObsidianPost(missing))).toThrow(
      "引用的图片不存在",
    );
    expect(() => preparePublishedPost(resolveObsidianPost(escaping))).toThrow(
      "图片路径不能离开文章目录",
    );
  });

  it("preserves Markdown image titles and balanced parentheses", () => {
    const vaultRoot = createVault();
    const filePath = writePost(
      vaultRoot,
      "algorithm/005-image-title",
      [
        "---",
        "title: 图片标题",
        "date: 2026-08-15",
        "tags: [测试]",
        "---",
        '![图](./流程图(新版).png "说明")',
      ].join("\n"),
    );
    fs.writeFileSync(
      path.join(path.dirname(filePath), "流程图(新版).png"),
      "png",
    );

    const prepared = preparePublishedPost(resolveObsidianPost(filePath));

    expect(prepared.markdown).toContain('![图](./流程图(新版).png "说明")');
    expect(prepared.files).toHaveLength(2);
  });

  it("validates required frontmatter before publishing", () => {
    const vaultRoot = createVault();
    const filePath = writePost(
      vaultRoot,
      "algorithm/003-invalid",
      "---\ntitle: Valid\ntags: []\ndate: invalid\n---\n正文",
    );

    expect(() => preparePublishedPost(resolveObsidianPost(filePath))).toThrow(
      "frontmatter",
    );
  });
});

describe("buildLocalQualityCommands", () => {
  it("uses an installed browser channel without downloading Chromium", () => {
    const commands = buildLocalQualityCommands("chrome");

    expect(commands).not.toContainEqual([
      "npx",
      ["playwright", "install", "chromium"],
    ]);
    expect(commands).toContainEqual(["npm", ["run", "test:e2e"]]);
  });

  it("installs Chromium when no browser channel is configured", () => {
    expect(buildLocalQualityCommands()).toContainEqual([
      "npx",
      ["playwright", "install", "chromium"],
    ]);
  });
});

describe("publishPost", () => {
  it("uses an isolated worktree, pushes a PR branch and enables auto-merge", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(vaultRoot, "algorithm/001-new-post");
    const projectRoot = createBlogRepository();
    const github = new FakeGitHubPublisher();

    const result = publishPost({
      sourcePath,
      projectRoot,
      github,
      qualityChecks: skipQualityChecks,
      now: () => new Date("2026-08-15T07:30:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "published",
      prUrl: "https://github.com/yxshan/blog/pull/99",
      autoMergeEnabled: true,
    });
    expect(github.authenticated).toBe(true);
    expect(github.createdBranch).toBe("posts/001-new-post-20260815-153000");
    expect(github.autoMergeRequested).toBe(true);
    expect(
      runGit(projectRoot, [
        "ls-remote",
        "--heads",
        "origin",
        "posts/001-new-post-20260815-153000",
      ]),
    ).toContain("refs/heads/posts/001-new-post-20260815-153000");
    expect(
      fs.existsSync(
        path.join(projectRoot, "posts/algorithm/001-new-post/index.md"),
      ),
    ).toBe(false);
  });

  it("updates an existing draft article on the remote branch", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(
      vaultRoot,
      "algorithm/006-update",
      "---\ntitle: 更新文章\ndate: 2026-08-15\ntags: [测试]\ndraft: true\n---\n新正文",
    );
    const destination = "posts/algorithm/006-update/index.md";
    const projectRoot = createBlogRepository({
      relativePath: destination,
      contents:
        "---\ntitle: 更新文章\ndate: 2026-08-15\ntags: [测试]\ndraft: false\n---\n旧正文",
    });
    const github = new FakeGitHubPublisher();

    const result = publishPost({
      sourcePath,
      projectRoot,
      github,
      qualityChecks: skipQualityChecks,
    });

    expect(result.status).toBe("published");
    const remoteRoot = path.join(path.dirname(projectRoot), "remote.git");
    expect(
      runGit(remoteRoot, [
        "show",
        `refs/heads/${github.createdBranch}:${destination}`,
      ]),
    ).toContain("draft: true\n---\n新正文");
  });

  it("does not create a branch when published content is unchanged", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(vaultRoot, "kaoyan/001-unchanged");
    const markdown = fs.readFileSync(sourcePath, "utf-8");
    const projectRoot = createBlogRepository({
      relativePath: "posts/kaoyan/001-unchanged/index.md",
      contents: markdown,
    });
    const github = new FakeGitHubPublisher();
    runGit(projectRoot, ["branch", "posts/001-unchanged-20260815-153000"]);

    const result = publishPost({
      sourcePath,
      projectRoot,
      github,
      now: () => new Date("2026-08-15T07:30:00.000Z"),
    });

    expect(result.status).toBe("no-change");
    expect(github.createdBranch).toBeNull();
  });

  it("keeps dry-run free of Git and GitHub mutations", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(vaultRoot, "kaoyan/002-preview");
    const projectRoot = createBlogRepository();
    const github = new FakeGitHubPublisher();
    const before = runGit(projectRoot, ["show-ref"]);

    const result = publishPost({
      sourcePath,
      projectRoot,
      github,
      dryRun: true,
    });

    expect(result.status).toBe("dry-run");
    expect(runGit(projectRoot, ["show-ref"])).toBe(before);
    expect(github.authenticated).toBe(false);
  });

  it("stops before Git mutations when GitHub authentication fails", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(vaultRoot, "kaoyan/003-auth-failure");
    const projectRoot = createBlogRepository();
    const before = runGit(projectRoot, ["show-ref"]);
    const github = new FakeGitHubPublisher({
      authenticationError: new Error("not logged in"),
    });

    expect(() => publishPost({ sourcePath, projectRoot, github })).toThrow(
      "not logged in",
    );
    expect(runGit(projectRoot, ["show-ref"])).toBe(before);
  });

  it("cleans the local branch when the remote rejects a push", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(vaultRoot, "kaoyan/004-push-failure");
    const projectRoot = createBlogRepository();
    const remoteRoot = path.join(path.dirname(projectRoot), "remote.git");
    const hookPath = path.join(remoteRoot, "hooks", "pre-receive");
    fs.writeFileSync(hookPath, "#!/bin/sh\nexit 1\n");
    fs.chmodSync(hookPath, 0o755);

    expect(() =>
      publishPost({
        sourcePath,
        projectRoot,
        github: new FakeGitHubPublisher(),
        qualityChecks: skipQualityChecks,
      }),
    ).toThrow("git push");
    expect(runGit(projectRoot, ["branch", "--list", "posts/*"])).toBe("");
  });

  it("keeps the remote branch and reports recovery when PR creation fails", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(vaultRoot, "kaoyan/005-pr-failure");
    const projectRoot = createBlogRepository();
    const github = new FakeGitHubPublisher({
      pullRequestError: new Error("GitHub unavailable"),
    });

    expect(() =>
      publishPost({
        sourcePath,
        projectRoot,
        github,
        qualityChecks: skipQualityChecks,
      }),
    ).toThrow("远程分支已推送，但 PR 创建失败");
    expect(
      runGit(projectRoot, ["ls-remote", "--heads", "origin", "posts/*"]),
    ).toContain("refs/heads/posts/");
  });

  it("returns the open PR when auto-merge is unavailable", () => {
    const vaultRoot = createVault();
    const sourcePath = writePost(vaultRoot, "kaoyan/006-auto-merge");
    const projectRoot = createBlogRepository();
    const github = new FakeGitHubPublisher({ autoMergeResult: false });

    const result = publishPost({
      sourcePath,
      projectRoot,
      github,
      qualityChecks: skipQualityChecks,
    });

    expect(result).toMatchObject({
      status: "published",
      prUrl: "https://github.com/yxshan/blog/pull/99",
      autoMergeEnabled: false,
    });
  });
});
