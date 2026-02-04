const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

if (!API_BASE) {
  console.error("❌ VITE_API_BASE nu este definit!");
}

export const API = {
  articles: `${API_BASE}/personal`,
  posts: `${API_BASE}/posts`,
  comments: `${API_BASE}/comments`,
  articleBySlug: (slug) => `${API_BASE}/personal?slug=${slug}`,
};
