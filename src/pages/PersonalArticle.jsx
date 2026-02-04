import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import RatingStars from "@/components/RatingStars";
import { buildSeo } from "@/utils/seo";
import Comments from "@/components/Comments";

const DEFAULT_COVER = "/images/default-cover.jpg";

export default function PersonalArticle({ isAdmin }) {
  const { slug } = useParams();
  const location = useLocation();

  const [article, setArticle] = useState(null);
  const [rating, setRating] = useState(
    Number(localStorage.getItem(`rating-${slug}`)) || 0
  );

  const allArticles = location.state?.allArticles || [];

   /* ================= FETCH ARTICLE ================= */
    useEffect(() => {
      window.scrollTo({ top: 0 });

      axios
        .get(`http://localhost:5000/api/posts/${slug}`)
        .then(res => setArticle(res.data))
        .catch(() => setArticle(null));
    }, [slug]);

    /* ================= SYNC RATING ================= */
    useEffect(() => {
      setRating(Number(localStorage.getItem(`rating-${slug}`)) || 0);
    }, [slug]);

    /* ⛔ DUPĂ TOATE HOOK-URILE */
    if (!article) {
      return <p className="text-center py-20">Articolul nu a fost găsit.</p>;
    }

  const seo = buildSeo({
    title: `${article.title} – Personal Blog`,
    description:
      article.excerpt ||
      article.content?.replace(/<[^>]+>/g, "").slice(0, 160),
    image: article.cover
      ? `http://localhost:5000${article.cover}`
      : DEFAULT_COVER,
    url: `${window.location.origin}/personal/${article.slug}`,
  });

  const index = allArticles.findIndex(a => a.slug === article.slug);
  const prev = index > 0 ? allArticles[index - 1] : null;
  const next =
    index !== -1 && index < allArticles.length - 1
      ? allArticles[index + 1]
      : null;

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.url} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.image} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={seo.url} />
        <link rel="author" href={`${window.location.origin}/despre`} />
      </Helmet>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": seo.description,
            "image": [seo.image],
            "author": {
              "@type": "Person",
              "name": "Claudiu", // 👈 numele tău (poți ajusta)
              "url": `${window.location.origin}/despre`,
            },
            "publisher": {
              "@type": "Organization",
              "name": "Personal Blog",
              // "logo": {
              //   "@type": "ImageObject",
              //   "url": `${window.location.origin}/images/logo.png`, 
              // },
            },
            "datePublished": article.date,
            "dateModified": article.updated_at || article.date,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": seo.url,
            },
          })}
        </script>
      </Helmet>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Personal Blog",
                "item": `${window.location.origin}/personal`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": article.title,
                "item": `${window.location.origin}/personal/${article.slug}`
              }
            ]
          })}
        </script>
      </Helmet>



      <article className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>

        <div className="relative mb-10">
          <img
            src={seo.image}
            className="w-full h-80 object-cover rounded-2xl"
          />

          {prev && (
            <Link
              to={`/personal/${prev.slug}`}
              state={{ allArticles }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
            >
              ←
            </Link>
          )}

          {next && (
            <Link
              to={`/personal/${next.slug}`}
              state={{ allArticles }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
            >
              →
            </Link>
          )}
        </div>

        <div
          className="prose max-w-none mb-12"
          dangerouslySetInnerHTML={{
            __html: article.html || article.content,
          }}
        />

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

        </div>

        <Comments slug={article.slug} isAdmin={isAdmin} />
      </article>
    </>
  );
}
