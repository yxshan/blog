import { describe, expect, it, vi } from "vitest";
import { createErrorMonitoring, type SentrySdk } from "./glitchtipReporter";

const enabledConfig = {
  dsn: "https://public@example.com/1",
  release: "abc123",
  environment: "test",
  sampleRate: 0.5,
};

describe("createErrorMonitoring", () => {
  it("stays disabled without a DSN and does not load the SDK", async () => {
    const loadSdk = vi.fn<() => Promise<SentrySdk>>();
    const monitoring = createErrorMonitoring(
      { ...enabledConfig, dsn: null },
      { getPathname: () => "/blog/", loadSdk },
    );

    monitoring.reporter.report(new Error("disabled"));
    await monitoring.initialize();

    expect(monitoring.enabled).toBe(false);
    expect(loadSdk).not.toHaveBeenCalled();
  });

  it("does not break the page when the monitoring SDK cannot load", async () => {
    const init = vi.fn<SentrySdk["init"]>();
    const loadSdk = vi
      .fn<() => Promise<SentrySdk>>()
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValue({ init, captureException: () => "id" });
    const monitoring = createErrorMonitoring(enabledConfig, {
      getPathname: () => "/blog/",
      loadSdk,
    });

    await expect(monitoring.initialize()).resolves.toBeUndefined();
    await expect(monitoring.initialize()).resolves.toBeUndefined();

    expect(loadSdk).toHaveBeenCalledTimes(2);
    expect(init).toHaveBeenCalledOnce();
  });

  it("isolates exceptions thrown by the monitoring SDK", async () => {
    const monitoring = createErrorMonitoring(enabledConfig, {
      getPathname: () => "/blog/",
      loadSdk: async () => ({
        init: () => undefined,
        captureException: () => {
          throw new Error("SDK failed");
        },
      }),
    });
    await monitoring.initialize();

    expect(() =>
      monitoring.reporter.report(new Error("render failed")),
    ).not.toThrow();
  });

  it("initializes once and reports only pathname and bounded React context", async () => {
    const init = vi.fn<SentrySdk["init"]>();
    const captureException = vi.fn<SentrySdk["captureException"]>(() => "id");
    const monitoring = createErrorMonitoring(enabledConfig, {
      getPathname: () => "/blog/?q=private",
      loadSdk: async () => ({ init, captureException }),
    });

    await monitoring.initialize();
    await monitoring.initialize();
    monitoring.reporter.report(new Error("render failed"), {
      componentStack: "HomeApp",
      searchText: "private",
    });

    expect(init).toHaveBeenCalledOnce();
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { route: "/blog/" },
      contexts: { react: { componentStack: "HomeApp" } },
    });
  });

  it("configures privacy filters for events, breadcrumbs and sessions", async () => {
    const init = vi.fn<SentrySdk["init"]>();
    const monitoring = createErrorMonitoring(enabledConfig, {
      getPathname: () => "/blog/",
      loadSdk: async () => ({
        init,
        captureException: () => "id",
      }),
    });
    await monitoring.initialize();

    const options = init.mock.calls[0]?.[0];
    expect(options?.dataCollection).toMatchObject({
      userInfo: false,
      cookies: false,
      urlQueryParams: false,
      stackFrameVariables: false,
    });
    expect(
      typeof options?.integrations === "function"
        ? options.integrations([
            { name: "BrowserSession", setupOnce: () => undefined },
            { name: "GlobalHandlers", setupOnce: () => undefined },
          ])
        : [],
    ).toEqual([{ name: "GlobalHandlers", setupOnce: expect.any(Function) }]);

    const sanitized = await options?.beforeSend?.(
      {
        type: undefined,
        request: {
          url: "https://user:password@example.com/blog/?q=secret#result",
          cookies: { session: "secret" },
          headers: { authorization: "secret" },
          data: "comment text",
          query_string: "q=secret",
          env: { PRIVATE_TOKEN: "secret" },
        },
        user: { email: "private@example.com" },
        extra: { searchText: "secret" },
        message: "private search text",
        exception: {
          values: [
            {
              type: "Error",
              value: "private comment",
              stacktrace: {
                frames: [
                  {
                    filename: "https://example.com/app.js?token=secret",
                    abs_path:
                      "https://user:password@example.com/app.js#private",
                  },
                ],
              },
            },
          ],
        },
        tags: { route: "/blog/?q=secret", searchText: "secret" },
        contexts: {
          react: { componentStack: "HomeApp" },
          private: { comment: "secret" },
        },
        breadcrumbs: [
          { category: "ui.input", message: "secret" },
          {
            category: "navigation",
            data: { from: "/blog/?q=secret", to: "/blog/posts/a" },
          },
        ],
      },
      {},
    );

    expect(sanitized).toMatchObject({
      request: { url: "https://example.com/blog/" },
      tags: { route: "/blog/" },
      contexts: { react: { componentStack: "HomeApp" } },
      exception: {
        values: [
          {
            type: "Error",
            stacktrace: {
              frames: [
                {
                  filename: "https://example.com/app.js",
                  abs_path: "https://example.com/app.js",
                },
              ],
            },
          },
        ],
      },
      breadcrumbs: [
        {
          category: "navigation",
          data: { from: "/blog/", to: "/blog/posts/a" },
        },
      ],
    });
    expect(sanitized).not.toHaveProperty("user");
    expect(sanitized).not.toHaveProperty("extra");
    expect(sanitized).not.toHaveProperty("message");
    expect(sanitized?.tags).not.toHaveProperty("searchText");
    expect(sanitized?.contexts).not.toHaveProperty("private");
    expect(sanitized?.exception?.values?.[0]).not.toHaveProperty("value");
    expect(sanitized?.request).not.toHaveProperty("cookies");
    expect(sanitized?.request).not.toHaveProperty("headers");
    expect(sanitized?.request).not.toHaveProperty("data");
    expect(sanitized?.request).not.toHaveProperty("query_string");
    expect(sanitized?.request).not.toHaveProperty("env");
  });

  it("drops malformed URLs instead of using an unsafe fallback", async () => {
    const init = vi.fn<SentrySdk["init"]>();
    const monitoring = createErrorMonitoring(enabledConfig, {
      getPathname: () => "http://user:password@",
      loadSdk: async () => ({ init, captureException: () => "id" }),
    });
    await monitoring.initialize();

    const options = init.mock.calls[0]?.[0];
    const sanitized = await options?.beforeSend?.(
      { type: undefined, request: { url: "http://user:password@" } },
      {},
    );

    expect(sanitized?.request?.url).toBeUndefined();
  });
});
