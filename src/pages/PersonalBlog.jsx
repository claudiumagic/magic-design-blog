import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { layout, card, pagination } from "@/assets/style";
import RatingStars from "@/components/RatingStars";

const DEFAULT_COVER = "/images/default-cover.jpg";
const POSTS_PER_PAGE = 6;

export default function PersonalBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const start = (page - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
   const getRating = slug =>
    Number(localStorage.getItem(`rating-${slug}`)) || 0;

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center py-20">Se încarcă…</p>;
  }

  return (
    <section className={layout.pageSection}>
      {/* SEO */}
      <Helmet>
        <title>Personal Blog</title>
        <meta
          name="description"
          content="Articole personale despre design, UX, dezvoltare și gânduri proprii."
        />

      </Helmet>

      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Personal Blog</h1>
          <p>Gânduri, idei și articole personale.</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => (
            <Link
              key={post.slug}
              to={`/personal/${post.slug}?page=${page}`}
              state={{
                article: post,
                allArticles: posts,
                page,
              }}

              className="group"
            >
              <article className={card.wrapper}>
                <img
                  src={
                    post.cover
                      ? `http://localhost:5000${post.cover}`
                      : DEFAULT_COVER
                  }
                  alt={post.title}
                  className={card.image}
                />

                <div className={card.body}>
                  <h2 className={card.title}>{post.title}</h2>

                  <p className="text-sm line-clamp-3 opacity-80 mt-auto">
                    {post.content
                      ?.replace(/<[^>]+>/g, "")
                      .slice(0, 120)}
                    …
                  </p>
                  
                </div>
                <div className="mt-auto">
                  {getRating(post.slug) > 0 && (
                    <RatingStars
                      value={getRating(post.slug)}
                      readOnly
                      size="text-sm"
                    />
                  )}

                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <nav className="mt-14 flex justify-center gap-3">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const isActive = p === page;

            return (
              <Link
                key={p}
                to={`/personal?page=${p}`}
                className={`${pagination.link} ${
                  isActive ? pagination.active : ""
                }`}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </section>
  );
}
