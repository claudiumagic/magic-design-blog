import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  const image = article.enclosure?.url || article.thumbnail || "https://via.placeholder.com/400";

  return (
    <div className="border p-4 rounded shadow">
      <img src={image} alt={article.title} className="w-full h-48 object-cover mb-2 rounded" />
      <h2 className="text-lg font-bold">{article.title}</h2>
      <p className="text-sm mt-1">Sursa: <a href={article.link} target="_blank" rel="noopener noreferrer">{new URL(article.link).hostname}</a></p>
      <Link
        to={`/article/${encodeURIComponent(article.link)}`}
        className="inline-block mt-2 text-blue-600 hover:underline"
      >
        Citește articolul
      </Link>
    </div>
  );
}
