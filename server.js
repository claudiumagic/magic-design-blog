import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import Parser from "rss-parser";
import { db } from "./db.js";
import rateLimit from "./middlewares/rateLimit.js";
import requireGdprConsent from "./middlewares/requireGdprConsent.js";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeWebsite,
} from "./src/utils/sanitizeInput.js";

console.log("DB HOST:", process.env.DB_HOST);
console.log("DB PORT:", process.env.DB_PORT);
console.log("DB NAME:", process.env.DB_NAME);


/* =========================================================
   CONFIG
   ========================================================= */

const app = express();
const PORT = process.env.PORT || 5000;

const RSS_TIMEOUT = 8000;            // 8s per feed
const RSS_LIMIT_PER_FEED = 10;       // max articole / feed
const RSS_GLOBAL_LIMIT = 30;         // max articole total

const parser = new Parser({
  timeout: RSS_TIMEOUT,
});

const externalPostsCache = new Map();
const RSS_TTL = 24 * 60 * 60 * 1000; // 24h



/* =========================================================
   Token
   ========================================================= */

import jwt from "jsonwebtoken";

const JWT_SECRET = "super-secret-change-me";
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "claudiu" && password === "") {
    const token = jwt.sign(
      { role: "admin" },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid credentials" });
});
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// temporar
app.get("/health", (req, res) => {
  res.json({ ok: true });
});


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
  cors({
    origin: [
      "https://blog.magic-design.ro",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

/* =========================================================
   ADMIN (TEMP)
   ========================================================= */

// function requireAdmin(req, res, next) {
//   const auth = req.headers.authorization;
//   if (!auth) {
//     return res.status(401).json({ error: "Neautorizat" });
//   }
//   next();
// }

/* =========================================================
   SLUG NORMALIZATION
   ========================================================= */

const SLUG_FILLERS = ["design", "web", "ux", "ui", "frontend", "development"];

function normalizeSlug(input, min = 30, max = 60) {
  let slug = slugify(input || "", {
    lower: true,
    strict: true,
    trim: true,
  });

  if (!slug) return "";

  if (slug.length > max) {
    slug = slug.slice(0, max).replace(/-+$/g, "");
  }

  let i = 0;
  while (slug.length < min && i < SLUG_FILLERS.length) {
    if (!slug.includes(SLUG_FILLERS[i])) {
      slug += "-" + SLUG_FILLERS[i];
    }
    i++;
  }

  return slug;
}

/* =========================================================
   UPLOADS
   ========================================================= */

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* =========================================================
   HEALTH
   ========================================================= */

app.get("/api/health", async (_, res) => {
  await db.query("SELECT 1");
  res.json({ ok: true });
});

/* =========================================================
   POSTS
   ========================================================= */

app.get("/api/posts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM posts");
    res.json(rows);
  } catch (err) {
    console.error("Posts error:", err);
    res.status(500).json({ error: "Eroare server posts" });
  }
});




// POST slug
app.get('/api/posts/:slug', async (req, res) => {
  const { slug } = req.params;

  // 1️⃣ caută în DB (postări personale)
  const [rows] = await db.query(
    "SELECT * FROM posts WHERE slug = ? LIMIT 1",
    [slug]
  );

  if (rows.length > 0) {
    return res.json(rows[0]);
  }


  // 2️⃣ fallback: caută în cache RSS
  if (externalPostsCache.has(slug)) {
    const cached = externalPostsCache.get(slug);

    if (Date.now() - cached.cachedAt < RSS_TTL) {
      return res.json(cached);
    } else {
      externalPostsCache.delete(slug);
    }
  }


  // 3️⃣ nimic găsit
  res.status(404).json({ error: 'Post not found' });
});


app.post(
  "/post",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const { title, subtitle, slug, content, category } = req.body;

    const finalSlug = normalizeSlug(slug || subtitle || title);

    await db.query(
      `INSERT INTO posts
       (title, subtitle, slug, content, cover, category, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle,
        finalSlug,
        content,
        req.file ? `/uploads/${req.file.filename}` : null,
        category || null,
        new Date(),
      ]
    );

    res.json({ success: true, slug: finalSlug });
  }
);

app.put(
  "/api/posts/:slug",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const oldSlug = req.params.slug;
    const { title, subtitle, slug, content, category } = req.body;

    const finalSlug = normalizeSlug(slug);

    await db.query(
      `UPDATE posts SET
        title = ?,
        subtitle = ?,
        slug_old = IF(slug <> ?, slug, slug_old),
        slug = ?,
        content = ?,
        category = ?,
        cover = IFNULL(?, cover)
       WHERE slug = ?`,
      [
        title,
        subtitle,
        finalSlug,
        finalSlug,
        content,
        category,
        req.file ? `/uploads/${req.file.filename}` : null,
        oldSlug,
      ]
    );

    res.json({ success: true, slug: finalSlug });
  }
);

/* =========================================================
   COMMENTS
   ========================================================= */

app.get("/api/comments", async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.json([]);

  const [rows] = await db.query(
    "SELECT * FROM comments WHERE post_slug = ? ORDER BY date DESC",
    [slug]
  );

  res.json(rows);
});

/* =========================================================
   COMMENTS – POST
   ========================================================= */

app.post(
  "/api/comments",
  rateLimit(3, 60_000),        // max 3 comentarii / minut / IP
  requireGdprConsent,         // GDPR enforcement
  async (req, res) => {
    try {
      /* ================= Anti-spam ================= */

      // honeypot
      if (req.body.company) {
        return res.status(400).json({ error: "Spam detectat" });
      }

      // timestamp check (anti-bot)
      if (Date.now() - req.body.startedAt < 5000) {
        return res.status(400).json({ error: "Prea rapid" });
      }

      /* ================= Extract input ================= */

      const {
        slug,
        name,
        email,
        comment,
        website,
      } = req.body;

      /* ================= Validate required ================= */

      if (!slug || !name || !email || !comment) {
        return res.status(400).json({ error: "Date lipsă" });
      }

      /* ================= Sanitize ================= */

      const cleanName = sanitizeText(name);
      const cleanEmail = sanitizeEmail(email);
      const cleanComment = sanitizeText(comment);
      const cleanWebsite = sanitizeWebsite(website);

      /* ================= Spam words ================= */

      const spamWords = [
        "casino",
        "viagra",
        "crypto",
        "bet",
        "loan",
        "porn",
        "seo service",
      ];

      const text = `${cleanName} ${cleanComment}`.toLowerCase();
      if (spamWords.some(w => text.includes(w))) {
        // silently ignore spam
        return res.json({ ok: true });
      }

      /* ================= Insert DB ================= */

      const [result] = await db.query(
        `INSERT INTO comments
         (post_slug, name, email, website, comment, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          slug,
          cleanName,
          cleanEmail,
          cleanWebsite || null,
          cleanComment,
          new Date(),
        ]
      );

      /* ================= Response ================= */

      res.json({
        id: result.insertId,
        name: cleanName,
        comment: cleanComment,
        website: cleanWebsite,
      });

    } catch (err) {
      console.error("❌ Comment error:", err);
      res.status(500).json({ error: "Eroare server" });
    }
  }
);
 




/* =========================================================
   WEBMENTIONS
   ========================================================= */

  app.get("/api/webmentions", async (req, res) => {
    const { slug } = req.query;
    if (!slug) return res.json([]);

    const [rows] = await db.query(
      "SELECT * FROM webmentions WHERE post_slug = ? ORDER BY date DESC",
      [slug]
    );

    res.json(rows);
  });

  /* =========================================================
    RSS
    ========================================================= */

  const feeds = [
    { name: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
    { name: "Speckyboy", url: "https://speckyboy.com/feed/" },
  ];

  function extractImage(html, feedUrl) {
    const match = html?.match(/<img.*?src=["'](.*?)["']/);
    if (!match) return null;

    let src = match[1];
    if (src.startsWith("//")) src = "https:" + src;
    if (src.startsWith("/")) {
      const url = new URL(feedUrl);
      src = url.origin + src;
    }
    return src;
  }

  app.get("/api/rss", async (_, res) => {
    let all = [];
    const seenSlugs = new Set();



    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        parsed.items.slice(0, RSS_LIMIT_PER_FEED)
                    .forEach(item => {
          const slug = slugify(item.title, { lower: true, strict: true });
          if (seenSlugs.has(slug)) return;
          seenSlugs.add(slug);

          const article = {
            title: item.title,
            slug,
            excerpt: item.contentSnippet || "",
            content: item["content:encoded"] || item.content || "",
            cover:
              item.enclosure?.url ||
              extractImage(item.content, feed.url) ||
              null,
            date: item.pubDate || null,
            source: feed.name,
            link: item.link,
            external: true,
          };
          

          externalPostsCache.set(slug, {
            ...article,
            cachedAt: Date.now(),
          });

          all.push(article);
        });
      } catch (err) {
        console.error(`❌ RSS failed: ${feed.name}`, err.message);
        // IMPORTANT: continuăm cu celelalte feed-uri
      }
    }
    all = all
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, RSS_GLOBAL_LIMIT);

      res.json(all);
    });
    /* =========================================================
   SITEMAP.XML
   ========================================================= */

    app.get("/sitemap.xml", async (req, res) => {
      try {
        const [posts] = await db.query(
          "SELECT slug, date FROM posts ORDER BY date DESC"
        );

        const baseUrl = "https://blog.magic-design.ro"; // 👈 domeniul final

        const staticPages = [
          { path: "", priority: "1.0" },
          { path: "/personal", priority: "0.9" },
          { path: "/despre", priority: "0.6" },
          { path: "/privacy-policy", priority: "0.3" },
          { path: "/editorial-policy", priority: "0.3" },
        ];


        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // pagini statice
        staticPages.forEach(p => {
          xml += `
          <url>
            <loc>${baseUrl}${p.path}</loc>
            <changefreq>monthly</changefreq>
            <priority>${p.priority}</priority>
          </url>`;
        });


        // articole personale
        posts.forEach(post => {
          xml += `
      <url>
        <loc>${baseUrl}/personal/${post.slug}</loc>
        <lastmod>${new Date(post.date).toISOString()}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.9</priority>
      </url>`;
        });

        xml += `\n</urlset>`;

        res.header("Content-Type", "application/xml");
        res.send(xml);
      } catch (err) {
        console.error("❌ Sitemap error:", err);
        res.status(500).send("Sitemap error");
      }
    });

    /* =========================================================
   RSS PERSONAL
   ========================================================= */

    app.get("/rss.xml", async (req, res) => {
      try {
        const [posts] = await db.query(
          "SELECT title, slug, content, date FROM posts ORDER BY date DESC LIMIT 20"
        );

        const siteUrl = "https://blog.magic-design.ro";

        let rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
      <title>Personal Blog – Claudiu</title>
      <link>${siteUrl}</link>
      <description>Articole personale despre UX, design și dezvoltare.</description>
      <language>ro</language>
    `;

        posts.forEach(post => {
          rss += `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${siteUrl}/personal/${post.slug}</link>
        <guid isPermaLink="true">${siteUrl}/personal/${post.slug}</guid>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <description><![CDATA[
          ${post.content
            ?.replace(/<[^>]+>/g, "")
            .slice(0, 300)}…
        ]]></description>
      </item>`;
        });

        rss += `
    </channel>
    </rss>`;

        res.header("Content-Type", "application/rss+xml");
        res.send(rss);
      } catch (err) {
        console.error("❌ RSS error:", err);
        res.status(500).send("RSS error");
      }
    });





/* =========================================================
   START
   ========================================================= */


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

