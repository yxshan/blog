import { execFileSync } from "node:child_process";

function commandFailure(
  command: string,
  args: string[],
  error: unknown,
): Error {
  const commandError = error as {
    stdout?: string | Buffer;
    stderr?: string | Buffer;
  };
  const details = [commandError.stdout, commandError.stderr]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean)
    .join("\n");
  return new Error(
    `命令执行失败: ${command} ${args.join(" ")}${details ? `\n${details}` : ""}`,
    { cause: error },
  );
}

export function runPublisherCommand(
  command: string,
  args: string[],
  cwd: string,
): string {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    throw commandFailure(command, args, error);
  }
}

export function runPublisherCommandBuffer(
  command: string,
  args: string[],
  cwd: string,
): Buffer {
  try {
    return execFileSync(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw commandFailure(command, args, error);
  }
}
