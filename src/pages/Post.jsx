import { useParams, Link } from "react-router";

export default function Post() {
  const params = useParams();
  const slug = params["*"];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">文章详情</h1>
      <p>Slug: {slug}</p>
      <Link to="/" className="text-indigo-600">
        返回首页
      </Link>
    </div>
  );
}
