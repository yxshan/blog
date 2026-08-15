import { Component, type ErrorInfo, type ReactNode } from "react";
import type { ErrorReporter } from "../core/contracts";

interface ErrorBoundaryProps {
  children: ReactNode;
  reporter?: ErrorReporter;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.reporter) {
      this.props.reporter.report(error, {
        componentStack: errorInfo.componentStack,
      });
      return;
    }
    console.error("[ErrorBoundary] 捕获到渲染错误：", error);
    console.error("[ErrorBoundary] 组件堆栈：", errorInfo.componentStack);
  }

  private handleRetry = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-6xl text-gray-300 dark:text-gray-600">!</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
          页面出现错误
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          请尝试刷新页面，如果问题依然存在请联系管理员。
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          刷新重试
        </button>
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-6 max-w-lg overflow-auto whitespace-pre-wrap rounded-lg bg-red-50 p-4 text-left text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
