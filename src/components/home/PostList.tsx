import type { RuntimePost } from "../../core/contracts";
import StaticArticleCard from "./StaticArticleCard";

interface PostListProps {
  posts: RuntimePost[];
  transitionKey: string;
}

export default function PostList({ posts, transitionKey }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div
        key={transitionKey}
        data-post-list
        className="post-list-transition post-empty-state flex min-h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 text-center text-gray-400 dark:border-gray-800 dark:text-gray-500"
      >
        <p>没有找到匹配的文章</p>
      </div>
    );
  }

  return (
    <div
      key={transitionKey}
      data-post-list
      className="post-list-transition space-y-4"
    >
      {posts.map((post) => (
        <StaticArticleCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
