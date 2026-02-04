import fs from "fs";
import path from "path";
import RSS from "rss";

const SITE_URL = "https://blog.magic-design.ro";

const postsDir = "./src/posts";
const outDir = "./src/generated";
const postsFile = path.join(outDir, "posts.json");
const rssFile = "./public/rss.xml";

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const files = fs.readdirSync(postsDir);

const posts = files.map((file) => {
  const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");

  const [, fm, content] = raw.split("---");

  const data = {};
  fm.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      data[key.trim()] = rest.join(":").trim();
    }
  });

  return {
    ...data,
    content,
    url: `${SITE_URL}/personal/${data.slug}`,
  };
});

// sort by date
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// save JSON
fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

// create RSS
const feed = new RSS({
  title: "Magic Design Blog – Blog Personal",
  site_url: SITE_URL,
  feed_url: `${SITE_URL}/rss.xml`,
  description: "Articole despre parcursul meu în design & development",
  language: "ro",
});

posts.forEach((post) => {
  feed.item({
    title: post.title,
    url: post.url,
    date: post.date,
    description: post.description,
  });
});

fs.writeFileSync(rssFile, feed.xml({ indent: true }));

console.log("✅ posts.json + rss.xml generated");
