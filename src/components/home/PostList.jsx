import StaticArticleCard from "./StaticArticleCard";

export default function PostList({ posts }) {
  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-gray-400">没有找到匹配的文章</p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <StaticArticleCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
