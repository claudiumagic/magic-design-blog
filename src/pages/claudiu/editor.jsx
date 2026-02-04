import { useState, useEffect } from "react";
import slugify from "slugify";

/* ================== SLUG GENERATOR (CORECT) ================== */
function generateSlug(input, max = 60) {
  let slug = slugify(input || "", {
    lower: true,
    strict: true,
    trim: true,
  });

  if (!slug) return "";

  if (slug.length > max) {
    slug = slug.slice(0, max).replace(/-+\S*$/, "");
  }

  return slug;
}

const predefinedCategories = ["Web Design", "Graphic Design"];

export default function Editor() {
  const token = localStorage.getItem("token");

  /* ================== STATE ================== */
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] = useState(predefinedCategories[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [image, setImage] = useState(null);

  /* ================== LOAD POSTS ================== */
  const loadPosts = async () => {
    const res = await fetch("http://localhost:5000/api/posts");
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  /* ================== HANDLERS ================== */

  // slug automat din subtitle → fallback title
  const handleSubtitleChange = (e) => {
    const value = e.target.value;
    setSubtitle(value);

    if (!selectedPost) {
      setSlug(generateSlug(value || title));
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    if (!subtitle && !selectedPost) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setSelectedPost(null);
    setTitle("");
    setSubtitle("");
    setSlug("");
    setContent("");
    setCategory(predefinedCategories[0]);
    setCustomCategory("");
    setImage(null);
  };

  /* ================== SELECT POST ================== */
  const selectPost = (post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setSubtitle(post.subtitle || "");
    setSlug(post.slug);
    setContent(post.content);
    setCategory(post.category || predefinedCategories[0]);
    setCustomCategory("");
    setImage(null);
  };

  /* ================== SAVE ================== */
  const savePost = async () => {
    if (!slug || slug.length > 60) {
      alert("Slug invalid (max 60 caractere).");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("slug", slug);
    formData.append("content", content);
    formData.append("category", customCategory || category);
    if (image) formData.append("image", image);

    let url = "http://localhost:5000/post";
    let method = "POST";

    if (selectedPost) {
      url = `http://localhost:5000/api/posts/${selectedPost.slug}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      alert("Eroare la salvare articol");
      return;
    }

    alert(selectedPost ? "Articol actualizat!" : "Articol publicat!");
    resetForm();
    loadPosts();
  };

  /* ================== DELETE ================== */
  const deletePost = async (slugToDelete) => {
    if (!confirm("Sigur vrei să ștergi acest articol?")) return;

    const res = await fetch(
      `http://localhost:5000/api/posts/${slugToDelete}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("Eroare la ștergere");
      return;
    }

    alert("Articol șters!");
    if (selectedPost?.slug === slugToDelete) resetForm();
    loadPosts();
  };

  /* ================== RENDER ================== */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {selectedPost ? "Editează articol" : "Articol nou"}
      </h2>

      <div className="mb-6 space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Titlu"
          value={title}
          onChange={handleTitleChange}
        />

        <input
          className="border p-2 w-full"
          placeholder="Subtitlu / Tagline"
          value={subtitle}
          onChange={handleSubtitleChange}
        />

        <input
          className="border p-2 w-full bg-gray-100"
          placeholder="Slug (max 60 caractere)"
          value={slug}
          onChange={(e) => setSlug(generateSlug(e.target.value))}
        />

        <textarea
          className="border p-2 w-full h-40"
          placeholder="Conținut"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex gap-2">
          <select
            className="border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {predefinedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            className="border p-2 flex-1"
            placeholder="Categorie custom"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        </div>

        <input type="file" accept="image/*" onChange={handleImageChange} />

        <div className="flex gap-2">
          <button
            onClick={savePost}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            {selectedPost ? "Actualizează" : "Publică"}
          </button>

          {selectedPost && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Renunță
            </button>
          )}
        </div>
      </div>

      <hr className="my-6" />

      <h3 className="text-xl font-bold mb-2">Articole existente</h3>

      {posts.length === 0 && <p>Nu există articole.</p>}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.slug} className="border p-4 rounded shadow">
            <h4 className="font-semibold">{post.title}</h4>
            <p className="text-sm text-gray-600">
              {post.content.slice(0, 120)}…
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => selectPost(post)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Editează
              </button>

              <button
                onClick={() => deletePost(post.slug)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Șterge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
