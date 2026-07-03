import { Component } from "react";

/**
 * ErrorBoundary — 错误边界（必须是类组件）
 * 捕获子树中渲染阶段的异常，展示回退 UI，防止整个页面白屏。
 *
 * 使用方式：
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * 捕获子组件渲染错误
   * 将错误信息记录到 state，以便渲染回退 UI
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * 错误发生后的副作用：日志上报
   * 生产环境中可以替换为实际的错误上报服务（如 Sentry）
   */
  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] 捕获到渲染错误：", error);
    console.error("[ErrorBoundary] 组件堆栈：", errorInfo.componentStack);
  }

  /** 刷新页面重试 */
  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          {/* 错误图标 */}
          <div className="mb-4 text-6xl text-gray-300 dark:text-gray-600">
            !
          </div>
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

          {/* 开发模式下显示具体错误信息 */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 max-w-lg overflow-auto whitespace-pre-wrap rounded-lg bg-red-50 p-4 text-left text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    // 无错误时正常渲染子组件
    return this.props.children;
  }
}

export { ErrorBoundary };
