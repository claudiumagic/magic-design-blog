import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import RatingStars from "@/components/RatingStars";
import { layout } from "@/assets/style";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";

const DEFAULT_COVER = "/images/default-cover.jpg";
const POSTS_PER_PAGE = 6;

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
 


  useEffect(() => {
    axios.get("http://localhost:5000/api/rss")
      .then(res => setArticles(res.data || []))
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <section className={layout.pageSection}>
        <BlogSkeleton />
      </section>
    );
  }


  const start = (page - 1) * POSTS_PER_PAGE;
  const visible = articles.slice(start, start + POSTS_PER_PAGE);
  const totalPages = Math.ceil(articles.length / POSTS_PER_PAGE);

  const getRating = slug =>
    Number(localStorage.getItem(`rating-${slug}`)) || 0;
  const lcpImage =
    visible.length > 0
    ? visible[0].cover || DEFAULT_COVER
    : null;

  return (
    <>
      <Helmet>
        {lcpImage && (
          <link
            rel="preload"
            as="image"
            href={lcpImage}
            fetchpriority="high"
          />
        )}
        <title>UI / UX Blog – Inspirație & Resurse</title>
        <meta
          name="description"
          content="Articole UI/UX, design web și frontend."
        />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      <section className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-10 text-center">
          UI / UX Blog
        </h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
                <div key={art.slug} className="h-[420px] rounded-2xl bg-gray-100 animate-pulse" />
              ))
            : 
            visible.map((art ,index) => (
                <Link
                  key={`${art.slug}`}
                  to={`/article/${art.slug}`}
                  state={{ article: art, allArticles: visible }}
                >
                  <article className="
                    relative flex flex-col h-full
                    rounded-2xl overflow-hidden
                    border bg-white
                    transition hover:-translate-y-1 hover:shadow-xl
                  ">
                    {art.external && (
                      <span className="absolute top-3 left-3 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                        EXTERN
                      </span>
                    )}

                    <img
                      src={art.cover || DEFAULT_COVER}
                      className="h-48 w-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchpriority={index === 0 ? "high" : "auto"}
                    />

                    <div className="p-6 flex flex-col flex-1">
                      <h2 className="font-semibold mb-3">{art.title}</h2>

                      <p className="text-sm opacity-80 line-clamp-3 mb-4">
                        {art.excerpt}
                      </p>

                      <div className="mt-auto">
                        <RatingStars
                          value={getRating(art.slug)}
                          readOnly
                          size="text-sm"
                        />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-16 flex justify-center gap-4">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  to={`/?page=${p}`}
                  className={`
                    w-10 h-10 flex items-center justify-center
                    transition hover:-translate-y-1
                    ${p === page
                      ? "font-bold text-violet-700 underline"
                      : "opacity-60"}
                  `}
                >
                  {p}
                </Link>
              );
            })}
          </nav>
        )}
      </section>
    </>
  );
}
