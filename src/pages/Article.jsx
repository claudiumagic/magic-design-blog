import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import RatingStars from "@/components/RatingStars";
import { buildSeo } from "@/utils/seo";
import Comments from "@/components/Comments";
import ArticleSkeleton from "@/components/skeletons/ArticleSkeleton";


const DEFAULT_COVER = "/images/default-cover.jpg";

export default function Article({ isAdmin }) {
  const { slug } = useParams();
  const location = useLocation();

  const [article, setArticle] = useState(
    location.state?.article || null
  );
  const [rating, setRating] = useState(
    Number(localStorage.getItem(`rating-${slug}`)) || 0
  );

  /* ================= FETCH ARTICLE ================= */
  useEffect(() => {
    window.scrollTo({ top: 0 });

    if (location.state?.article) {
      setArticle(location.state.article);
      return;
    }

    axios
      .get(`http://localhost:5000/api/posts/${slug}`)
      .then(res => setArticle(res.data))
      .catch(() => setArticle(null));
  }, [slug, location.state]);

  /* ================= SYNC RATING ================= */
  useEffect(() => {
    setRating(Number(localStorage.getItem(`rating-${slug}`)) || 0);
  }, [slug]);

  if (!article) {
    return <ArticleSkeleton />;
  }


  const isExternal = Boolean(article.external);

  /* ================= SEO ================= */
  const seo = buildSeo({
    title: article.title,
    description:
      article.excerpt ||
      article.content?.replace(/<[^>]+>/g, "").slice(0, 160),
    image: article.cover?.startsWith("http")
      ? article.cover
      : article.cover
      ? `http://localhost:5000${article.cover}`
      : DEFAULT_COVER,
    url: `${window.location.origin}/article/${article.slug}`,
  });

  /* ================= PREV / NEXT ================= */
  const allArticles = location.state?.allArticles || [];
  const index = allArticles.findIndex(a => a.slug === article.slug);
  const prevArticle = index > 0 ? allArticles[index - 1] : null;
  const nextArticle =
    index !== -1 && index < allArticles.length - 1
      ? allArticles[index + 1]
      : null;

  /* ================= RATING ================= */

  return (
    <>
      <Helmet>
         <link
          rel="preload"
          as="image"
          href={seo.image}
          fetchpriority="high"
        />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={article.external ? article.link : article.url} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.image} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={seo.url} />
        {isExternal && (
          <meta name="content-origin" content="external" />
        )}

        {isExternal && <meta name="robots" content="noindex,follow" />}
         <link
          rel="canonical"
          href={article.external ? article.link : article.url}
        />
      </Helmet>
      {isExternal && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: seo.description,
              image: seo.image,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": seo.url,
              },
              isBasedOn: article.link,
              publisher: {
                "@type": "Organization",
                name: article.source,
              },
            })}
          </script>
        </Helmet>
      )}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "UI / UX Blog",
                "item": `${window.location.origin}/`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": article.title,
                "item": `${window.location.origin}/article/${article.slug}`
              }
            ]
          })}
        </script>
      </Helmet>



      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* BREADCRUMB */}
        <nav className="mb-6 text-sm opacity-70 flex gap-2">
          <Link to="/" className="hover:underline">
            UI / UX Blog
          </Link>
          <span>→</span>
          <span className="opacity-50">{article.title}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
        {isExternal && (
          <p className="sr-only">
            This article is aggregated from an external source. All rights belong to the original author.
          </p>
        )}
        {/* IMAGE (NON-INTERACTIVE) */}
        <div className="relative mb-10">
          <img
            src={seo.image}
            alt={article.title}
            className="w-full h-80 object-cover rounded-2xl pointer-events-none"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            onError={(e) => (e.currentTarget.src = DEFAULT_COVER)}
          />

          {prevArticle && (
            <Link
              to={`/article/${prevArticle.slug}`}
              state={{ article: prevArticle, allArticles }}
              className="absolute left-4 top-1/2 -translate-y-1/2
                         bg-black/60 text-white w-10 h-10
                         flex items-center justify-center
                         rounded-full hover:bg-black/80 transition"
            >
              ←
            </Link>
          )}

          {nextArticle && (
            <Link
              to={`/article/${nextArticle.slug}`}
              state={{ article: nextArticle, allArticles }}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         bg-black/60 text-white w-10 h-10
                         flex items-center justify-center
                         rounded-full hover:bg-black/80 transition"
            >
              →
            </Link>
          )}
        </div>

        {/* CONTENT */}
        <div className="prose max-w-none mb-12">
          {isExternal ? (
            <>
              {article.excerpt && <p>{article.excerpt}</p>}
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-block mt-6 px-5 py-2 rounded-lg
                           bg-violet-600 text-white font-medium
                           hover:bg-violet-700 transition"
              >
                Citește articolul original →
              </a>
            </>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: article.content || article.html,
              }}
            />
          )}
        </div>

        {/* ⭐ RATING – ACTIV PENTRU TOATE ARTICOLELE */}
        <div className="mb-14">
          <p className="font-semibold mb-2">Rating articol:</p>

          <RatingStars
            value={rating}
            onRate={(v) => {
              setRating(v);
              localStorage.setItem(`rating-${slug}`, v);
            }}
            size="text-xl"
          />

          {isExternal && (
            <p className="text-xs opacity-60 mt-2">
              Rating intern al cititorilor UI / UX Blog.
              Nu reprezintă evaluarea oficială a sursei.
            </p>
          )}
        </div>


        {/* COMMENTS */}
        <Comments slug={article.slug} isAdmin={isAdmin} />
      </article>
    </>
  );
}
