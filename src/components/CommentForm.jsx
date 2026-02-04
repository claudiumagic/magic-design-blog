import { useState } from "react";

export default function CommentForm() {
  const [form, setForm] = useState({ name: "", email: "", website: "", comment: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Comment submitted:", form);
    alert("Comentariul tău a fost trimis!");
    setForm({ name: "", email: "", website: "", comment: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded">
      <input
        type="text" name="name" placeholder="Nume" value={form.name} onChange={handleChange} required
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="text" name="website" placeholder="Website" value={form.website} onChange={handleChange}
        className="w-full p-2 mb-2 border rounded hidden" // Google să vadă, noi nu
      />
      <textarea
        name="comment" placeholder="Comentariu" value={form.comment} onChange={handleChange} required
        className="w-full p-2 mb-2 border rounded"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Trimite</button>
    </form>
  );
}
