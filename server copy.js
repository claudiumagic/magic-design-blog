import express from "express"; 
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import Parser from "rss-parser";

const app = express();
const PORT = 5000;
const parser = new Parser();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); // doar articole proprii

// --- Creare folder uploads dacă nu există ---
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// --- Multer setup pentru upload ---
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- Posts proprii ---
const postsFile = path.join(process.cwd(), "posts.json");

function loadPosts() {
  return fs.existsSync(postsFile) ? JSON.parse(fs.readFileSync(postsFile)) : [];
}

function savePosts(posts) {
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
}

// --- Comentarii ---
const commentsFile = path.join(process.cwd(), "comments.json");

function loadComments() {
  return fs.existsSync(commentsFile) ? JSON.parse(fs.readFileSync(commentsFile)) : [];
}

function saveComments(comments) {
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
}

// --- POSTARE articol propriu ---
app.post("/post", upload.single("image"), (req, res) => {
  try {
    const { title, subtitle, slug, content, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "/default-image.jpg";
    const postSlug = slug || slugify(subtitle || title, { lower: true, strict: true });

    const posts = loadPosts();

    const newPost = {
      title,
      subtitle,
      slug: postSlug,
      content,
      cover: image,
      category: category ? category.split(",").map(c => c.trim()) : [],
      date: new Date().toISOString(),
    };

    posts.unshift(newPost);
    savePosts(posts);

    res.json({ success: true, slug: postSlug });
  } catch (err) {
    console.error("Error publishing post:", err);
    res.status(500).json({ error: "Failed to publish post" });
  }
});

// --- GET articole proprii ---
app.get("/api/posts", (req, res) => {
  res.json(loadPosts());
});

// --- GET RSS externe ---
const feeds = [
  { name: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
  { name: "Speckyboy", url: "https://speckyboy.com/feed/" },
  { name: "Alex Design", url: "https://alex-design.ro/blog/feed/" }
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

app.get("/api/rss", async (req, res) => {
  try {
    let allItems = [];
    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = parsed.items.map(item => ({
          title: item.title,
          slug: slugify(item.title, { lower: true, strict: true }),
          excerpt: item.contentSnippet || "",
          content: item["content:encoded"] || item.content || "",
          date: item.pubDate || item.isoDate || null,
          cover: item.enclosure?.url || extractImage(item["content:encoded"] || item.content, feed.url) || "/default-image.jpg",
          source: feed.name,
          link: item.link
        }));
        allItems = allItems.concat(items);
      } catch (err) {
        console.error(`Fetch RSS error for ${feed.name}:`, err.message);
      }
    }
    res.json(allItems);
  } catch (err) {
    console.error("General RSS fetch error:", err);
    res.status(500).json({ error: "Failed to fetch RSS" });
  }
});

// --- Comentarii API ---
// GET comentarii după slug
app.get("/api/comments", (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "Slug lipsă" });
  const comments = loadComments().filter(c => c.slug === slug);
  res.json(comments);
});

// POST comentariu nou
app.post("/api/comments", (req, res) => {
  try {
    const { slug, name, email, website, comment, newsletter } = req.body;
    if (!slug || !name || !email || !comment) {
      return res.status(400).json({ error: "Câmpuri obligatorii lipsă" });
    }

    const comments = loadComments();
    const newComment = {
      id: Date.now(),
      slug,
      name,
      email,
      website: website || "",
      comment,
      newsletter: !!newsletter,
      date: new Date().toISOString(),
    };

    comments.push(newComment);
    saveComments(comments);

    res.json(newComment);
  } catch (err) {
    console.error("Error saving comment:", err);
    res.status(500).json({ error: "Eroare la salvarea comentariului" });
  }
});

// DELETE comentariu (admin)
app.delete("/api/comments/:id", (req, res) => {
  const { id } = req.params;
  const comments = loadComments();
  const index = comments.findIndex(c => c.id == id);
  if (index === -1) return res.status(404).json({ error: "Comentariu inexistent" });

  comments.splice(index, 1);
  saveComments(comments);
  res.json({ success: true });
});

// --- Start server ---
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
