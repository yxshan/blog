import { useParams, Link } from "react-router";
import { getPostBySlug } from "../features/posts/api";

/**
 * Post — 文章详情页（极简调试版）
 */
export default function Post() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">文章未找到</h1>
        <Link to="/" className="mt-4 inline-block text-indigo-600">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-2 text-sm text-gray-500">{post.excerpt}</p>
      <div className="mt-4 flex gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs">
            {tag}
          </span>
        ))}
      </div>
      <pre className="mt-8 whitespace-pre-wrap text-sm">{post.content}</pre>
    </div>
  );
}
