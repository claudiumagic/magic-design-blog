import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { layout, card, pagination } from "@/assets/style";
import RatingStars from "@/components/RatingStars";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import API_URL from "@/config/api";
import { resolveImage } from "@/utils/media";

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
  const getRating = (slug) =>
  Number(localStorage.getItem(`rating-${slug}`)) || 0;
 

  
  /* ================= FETCH POSTS ================= */

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then(res => {
        if (!res.ok) throw new Error("API down");
        return res.json();
      })
      .then(data => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);


  if (loading) {
  return (
    <section className={layout.pageSection}>
      <BlogSkeleton count={6} />
    </section>
  );
}

 const lcpImage =
  visiblePosts.length > 0
    ? resolveImage(visiblePosts[0].cover, DEFAULT_COVER)
    : null;


  return (
    
    <section className={layout.pageSection}>
      {/* SEO */}
      <Helmet>
        <title>Personal Blog</title>
        <meta
          name="description"
          content="Articole personale despre design, UX, dezvoltare și gânduri proprii."
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/personal?page=${page}`}
        />
      </Helmet>


      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Personal Blog</h1>
          <p>Gânduri, idei și articole personale.</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post, index) => (
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
                  src={resolveImage(post.cover, DEFAULT_COVER)}
                  alt={post.title}
                  className={card.image}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchpriority={index === 0 ? "high" : "auto"}
                  onError={(e) => (e.currentTarget.src = DEFAULT_COVER)}
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
                <div className="mt-auto min-h-[28px]">
                  <RatingStars
                    value={getRating(post.slug)}
                    readOnly
                    size="text-sm"
                    className="opacity-25"
                  />
                  {getRating(post.slug) === 0 && (
                    <p className="text-[11px] opacity-40 mt-1">
                      Articol încă neevaluat
                    </p>
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
