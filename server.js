import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import Parser from "rss-parser";
import jwt from "jsonwebtoken";

import { db } from "./db.js";
import rateLimit from "./middlewares/rateLimit.js";
import requireGdprConsent from "./middlewares/requireGdprConsent.js";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeWebsite,
} from "./src/utils/sanitizeInput.js";

/* =========================================================
   CONFIG
   ========================================================= */

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "super-secret-change-me";

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://blog.magic-design.ro",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

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

app.use("/uploads", express.static(uploadsDir));

/* =========================================================
   AUTH
   ========================================================= */

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "claudiu" && password === "") {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
      expiresIn: "2h",
    });
    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing token" });

  try {
    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/* =========================================================
   HEALTH
   ========================================================= */

app.get("/api/health", async (_, res) => {
  await db.query("SELECT 1");
  res.json({ ok: true });
});

/* =========================================================
   SLUG
   ========================================================= */

const SLUG_FILLERS = ["design", "web", "ux", "ui", "frontend", "development"];

function normalizeSlug(input, min = 30, max = 60) {
  let slug = slugify(input || "", { lower: true, strict: true });
  if (!slug) return "";

  if (slug.length > max) slug = slug.slice(0, max);

  let i = 0;
  while (slug.length < min && i < SLUG_FILLERS.length) {
    if (!slug.includes(SLUG_FILLERS[i])) slug += "-" + SLUG_FILLERS[i];
    i++;
  }

  return slug;
}

/* =========================================================
   POSTS
   ========================================================= */

app.get("/api/posts", async (_, res) => {
  try {
    const result = await db.query("SELECT * FROM posts ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Posts error:", err);
    res.status(500).json({ error: "Eroare server posts" });
  }
});

app.get("/api/posts/:slug", async (req, res) => {
  const { slug } = req.params;

  const result = await db.query(
    "SELECT * FROM posts WHERE slug = $1 LIMIT 1",
    [slug]
  );

  if (result.rows.length > 0) {
    return res.json(result.rows[0]);
  }

  res.status(404).json({ error: "Post not found" });
});

app.post(
  "/api/posts",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const { title, subtitle, slug, content, category } = req.body;
    const finalSlug = normalizeSlug(slug || subtitle || title);

    const result = await db.query(
      `INSERT INTO posts
       (title, subtitle, slug, content, cover, category, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING slug`,
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

    res.json({ success: true, slug: result.rows[0].slug });
  }
);

/* =========================================================
   COMMENTS
   ========================================================= */

app.get("/api/comments", async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.json([]);

  const result = await db.query(
    "SELECT * FROM comments WHERE post_slug = $1 ORDER BY date DESC",
    [slug]
  );

  res.json(result.rows);
});

app.post(
  "/api/comments",
  rateLimit(3, 60_000),
  requireGdprConsent,
  async (req, res) => {
    try {
      if (req.body.company) return res.json({ ok: true });
      if (Date.now() - req.body.startedAt < 5000)
        return res.status(400).json({ error: "Prea rapid" });

      const { slug, name, email, comment, website } = req.body;
      if (!slug || !name || !email || !comment)
        return res.status(400).json({ error: "Date lipsă" });

      const cleanName = sanitizeText(name);
      const cleanEmail = sanitizeEmail(email);
      const cleanComment = sanitizeText(comment);
      const cleanWebsite = sanitizeWebsite(website);

      const result = await db.query(
        `INSERT INTO comments
         (post_slug, name, email, website, comment, date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          slug,
          cleanName,
          cleanEmail,
          cleanWebsite || null,
          cleanComment,
          new Date(),
        ]
      );

      res.json({
        id: result.rows[0].id,
        name: cleanName,
        comment: cleanComment,
        website: cleanWebsite,
      });
    } catch (err) {
      console.error("Comment error:", err);
      res.status(500).json({ error: "Eroare server" });
    }
  }
);

/* =========================================================
   START
   ========================================================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
