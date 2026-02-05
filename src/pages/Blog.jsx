import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";

import RatingStars from "@/components/RatingStars";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import { layout } from "@/assets/style";
import API_URL from "@/config/api";
import { resolveImage } from "@/utils/media";

const DEFAULT_COVER = "/images/default-cover.jpg";
const POSTS_PER_PAGE = 6;

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  /* ================= FETCH RSS ================= */
  useEffect(() => {
    axios
      .get(`${API_URL}/rss`)
      .then((res) => {
        const data = res.data;

        // 🛡️ BLINDAT: acceptăm doar array
        if (Array.isArray(data)) {
          setArticles(data);
        } else if (Array.isArray(data?.items)) {
          setArticles(data.items);
        } else {
          console.error("❌ RSS invalid:", data);
          setArticles([]);
        }
      })
      .catch((err) => {
        console.error("❌ RSS fetch error:", err);
        setArticles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className={layout.pageSection}>
        <BlogSkeleton />
      </section>
    );
  }

  /* ================= PAGINATION ================= */
  const start = (page - 1) * POSTS_PER_PAGE;
  const visible = Array.isArray(articles)
    ? articles.slice(start, start + POSTS_PER_PAGE)
    : [];

  const totalPages = Math.ceil(
    (Array.isArray(articles) ? articles.length : 0) / POSTS_PER_PAGE
  );

  /* ================= HELPERS ================= */
  const getRating = (slug) =>
    Number(localStorage.getItem(`rating-${slug}`)) || 0;

  const lcpImage =
    visible.length > 0
      ? resolveImage(visible[0].cover, DEFAULT_COVER)
      : null;

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <link rel="preconnect" href="https://files.smashing.media" />
        <link rel="dns-prefetch" href="https://files.smashing.media" />

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
        <link
          rel="canonical"
          href={`${window.location.origin}/?page=${page}`}
        />
      </Helmet>



      <section className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-10 text-center">
          UI / UX Blog
        </h1>

        {/* ================= GRID ================= */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((art, index) => (
            <Link
              key={art.slug}
              to={`/article/${art.slug}`}
              state={{ article: art, allArticles: visible }}
            >
              <article
                className="
                  relative flex flex-col h-full
                  rounded-2xl overflow-hidden
                  border bg-white
                  transition hover:-translate-y-1 hover:shadow-xl
                "
              >
                {art.external && (
                  <span className="absolute top-3 left-3 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                    EXTERN
                  </span>
                )}

                {/* IMAGE */}
                <img
                  src={resolveImage(art.cover, DEFAULT_COVER)}
                  alt={art.title}
                  className="h-48 w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchpriority={index === 0 ? "high" : "auto"}
                  onError={(e) =>
                    (e.currentTarget.src = DEFAULT_COVER)
                  }
                />

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-semibold mb-3">
                    {art.title}
                  </h2>

                  <p className="text-sm opacity-80 line-clamp-3 mb-4">
                    {art.excerpt}
                  </p>

                  {/* RATING */}
                  <div className="mt-auto min-h-[32px]">
                    <RatingStars
                      value={getRating(art.slug)}
                      readOnly
                      size="text-sm"
                      className={
                        getRating(art.slug) === 0
                          ? "opacity-30"
                          : ""
                      }
                    />

                    {getRating(art.slug) === 0 && (
                      <p className="text-[11px] opacity-40 mt-1">
                        Articol încă neevaluat
                      </p>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* ================= PAGINATION ================= */}
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
                    ${
                      p === page
                        ? "font-bold text-violet-700 underline"
                        : "opacity-60"
                    }
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
