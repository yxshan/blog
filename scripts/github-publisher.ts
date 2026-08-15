import { runPublisherCommand } from "./publisher-command";

export interface GitHubPublisher {
  assertAuthenticated(cwd: string): void;
  createPullRequest(options: {
    cwd: string;
    branch: string;
    title: string;
    body: string;
  }): string;
  enableAutoMerge(options: { cwd: string; prUrl: string }): boolean;
}

export class GhCliPublisher implements GitHubPublisher {
  assertAuthenticated(cwd: string): void {
    try {
      runPublisherCommand(
        "gh",
        ["auth", "status", "--hostname", "github.com"],
        cwd,
      );
    } catch (error) {
      throw new Error("GitHub CLI 尚未登录，请先执行 gh auth login", {
        cause: error,
      });
    }
  }

  createPullRequest(options: {
    cwd: string;
    branch: string;
    title: string;
    body: string;
  }): string {
    return runPublisherCommand(
      "gh",
      [
        "pr",
        "create",
        "--base",
        "main",
        "--head",
        options.branch,
        "--title",
        options.title,
        "--body",
        options.body,
      ],
      options.cwd,
    );
  }

  enableAutoMerge(options: { cwd: string; prUrl: string }): boolean {
    try {
      runPublisherCommand(
        "gh",
        ["pr", "merge", options.prUrl, "--auto", "--squash"],
        options.cwd,
      );
      return true;
    } catch {
      return false;
    }
  }
}
