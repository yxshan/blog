import type { Breadcrumb, BrowserOptions } from "@sentry/browser";
import { siteConfig } from "../../core/config/siteConfig";
import type { ErrorReporter, SiteConfig } from "../../core/contracts";

export type SentrySdk = Pick<
  typeof import("@sentry/browser"),
  "captureException" | "init"
>;

interface ErrorMonitoringDependencies {
  getPathname(): string;
  loadSdk(): Promise<SentrySdk>;
}

export interface ErrorMonitoring {
  enabled: boolean;
  initialize(): Promise<void>;
  reporter: ErrorReporter;
}

type ErrorMonitoringConfig = SiteConfig["errorMonitoring"];
type BeforeSendEvent = Parameters<NonNullable<BrowserOptions["beforeSend"]>>[0];
type BeforeSendTransactionEvent = Parameters<
  NonNullable<BrowserOptions["beforeSendTransaction"]>
>[0];
type SanitizableEvent = BeforeSendEvent | BeforeSendTransactionEvent;
type ExceptionValue = NonNullable<
  NonNullable<BeforeSendEvent["exception"]>["values"]
>[number];

function sanitizeUrl(value: string | undefined): string | undefined {
  if (!value) return value;
  try {
    const url = new URL(value, "https://redacted.invalid");
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.origin === "https://redacted.invalid"
      ? url.pathname
      : url.toString();
  } catch {
    return undefined;
  }
}

function sanitizeStacktrace(stacktrace: ExceptionValue["stacktrace"]): void {
  stacktrace?.frames?.forEach((frame) => {
    frame.filename = sanitizeUrl(frame.filename);
    frame.abs_path = sanitizeUrl(frame.abs_path);
  });
}

function sanitizeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  const category = breadcrumb.category ?? "";
  if (
    breadcrumb.type === "user" ||
    category === "console" ||
    category.startsWith("ui.")
  ) {
    return null;
  }

  const safeData: Record<string, unknown> = {};
  for (const key of ["method", "status_code", "url", "from", "to"]) {
    const value = breadcrumb.data?.[key];
    if (typeof value !== "string" && typeof value !== "number") continue;
    safeData[key] =
      typeof value === "string" && ["url", "from", "to"].includes(key)
        ? sanitizeUrl(value)
        : value;
  }

  return {
    ...breadcrumb,
    message: undefined,
    data: Object.keys(safeData).length > 0 ? safeData : undefined,
  };
}

function sanitizeEvent<T extends SanitizableEvent>(event: T): T {
  delete event.user;
  delete event.extra;
  delete event.logentry;
  delete event.message;
  event.transaction = sanitizeUrl(event.transaction);
  event.exception?.values?.forEach((exception) => {
    delete exception.value;
    sanitizeStacktrace(exception.stacktrace);
  });

  const componentStack = event.contexts?.react?.componentStack;
  const safeContexts: Record<
    string,
    NonNullable<typeof event.contexts>[string]
  > = {};
  for (const key of ["browser", "device", "os", "runtime"]) {
    const context = event.contexts?.[key];
    if (context) safeContexts[key] = context;
  }
  if (typeof componentStack === "string") {
    safeContexts.react = { componentStack: componentStack.slice(0, 4000) };
  }
  event.contexts =
    Object.keys(safeContexts).length > 0 ? safeContexts : undefined;

  const route =
    typeof event.tags?.route === "string"
      ? sanitizeUrl(event.tags.route)
      : undefined;
  event.tags = route ? { route } : undefined;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.env;
    delete event.request.headers;
    delete event.request.query_string;
    event.request.url = sanitizeUrl(event.request.url);
  }
  event.breadcrumbs = event.breadcrumbs
    ?.map(sanitizeBreadcrumb)
    .filter((breadcrumb): breadcrumb is Breadcrumb => breadcrumb !== null);
  return event;
}

function buildSdkOptions(config: ErrorMonitoringConfig): BrowserOptions {
  return {
    dsn: config.dsn ?? undefined,
    release: config.release ?? undefined,
    environment: config.environment,
    sampleRate: config.sampleRate,
    integrations: (defaults) =>
      defaults.filter((integration) => integration.name !== "BrowserSession"),
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    maxBreadcrumbs: 20,
    beforeBreadcrumb: sanitizeBreadcrumb,
    beforeSend: (event) => sanitizeEvent(event),
    beforeSendTransaction: (event) => sanitizeEvent(event),
  };
}

export function createErrorMonitoring(
  config: ErrorMonitoringConfig,
  dependencies: ErrorMonitoringDependencies = {
    getPathname: () =>
      typeof window === "undefined" ? "" : window.location.pathname,
    loadSdk: () => import("@sentry/browser"),
  },
): ErrorMonitoring {
  const enabled = Boolean(config.dsn);
  let sdk: SentrySdk | undefined;
  let initialization: Promise<SentrySdk | undefined> | undefined;

  function initializeSdk(): Promise<SentrySdk | undefined> {
    if (!enabled) return Promise.resolve(undefined);
    initialization ??= dependencies
      .loadSdk()
      .then((loadedSdk) => {
        loadedSdk.init(buildSdkOptions(config));
        sdk = loadedSdk;
        return loadedSdk;
      })
      .catch(() => {
        initialization = undefined;
        return undefined;
      });
    return initialization;
  }

  function capture(error: Error, context?: Record<string, unknown>): void {
    if (!enabled) return;
    if (!sdk) {
      void initializeSdk().then((loadedSdk) => {
        if (loadedSdk) capture(error, context);
      });
      return;
    }
    const componentStack =
      typeof context?.componentStack === "string"
        ? context.componentStack.slice(0, 4000)
        : undefined;
    try {
      sdk.captureException(error, {
        tags: { route: sanitizeUrl(dependencies.getPathname()) ?? "" },
        contexts: componentStack ? { react: { componentStack } } : undefined,
      });
    } catch {
      // Monitoring failures must never replace the application error path.
    }
  }

  return {
    enabled,
    initialize: async () => {
      await initializeSdk();
    },
    reporter: { report: capture },
  };
}

export const errorMonitoring = createErrorMonitoring(
  siteConfig.errorMonitoring,
);
