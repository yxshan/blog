import { useEffect, useRef } from "react";
import { giscusAdapter } from "../../integrations/comments/giscusAdapter";

/**
 * giscus 评论组件。
 *
 * 需要在 .env 中配置 VITE_GISCUS_REPO_ID 和 VITE_GISCUS_CATEGORY_ID，
 * 未配置时不渲染，避免页面出现无效脚本。
 */
export default function Comments({ slug }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!giscusAdapter.isEnabled() || !containerRef.current) return undefined;
    return giscusAdapter.mount(containerRef.current, { slug });
  }, [slug]);

  if (!giscusAdapter.isEnabled()) return null;

  return (
    <section ref={containerRef} className="mt-12" aria-label="评论区" />
  );
}
