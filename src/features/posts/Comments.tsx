import { useEffect, useRef } from "react";
import type { CommentsAdapter } from "../../core/contracts";
import { giscusAdapter } from "../../integrations/comments/giscusAdapter";

interface CommentsProps {
  slug: string;
  adapter?: CommentsAdapter;
}

export default function Comments({
  slug,
  adapter = giscusAdapter,
}: CommentsProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!adapter.isEnabled() || !containerRef.current) return undefined;
    return adapter.mount(containerRef.current, { slug });
  }, [adapter, slug]);

  if (!adapter.isEnabled()) return null;
  return <section ref={containerRef} className="mt-12" aria-label="评论区" />;
}
