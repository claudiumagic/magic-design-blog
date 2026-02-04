import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeWebsite,
} from "@/utils/sanitizeInput";



export default function Comments({ slug, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const formStart = useRef(Date.now());


  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    comment: "",
    company: "", // honeypot
    gdpr: false,

  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/comments?slug=${slug}`)
      .then(res => setComments(res.data || []));
  }, [slug]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitComment = async (e) => {
    e.preventDefault();

    if (Date.now() - formStart.current < 5000) {
      setError("Te rugăm să aștepți câteva secunde.");
      return;
    }

    let payload;
    try {
      payload = {
        slug,
        name: sanitizeText(form.name),
        email: sanitizeEmail(form.email),
        website: sanitizeWebsite(form.website),
        comment: sanitizeText(form.comment),
        company: form.company,
        gdpr: form.gdpr,
        startedAt: formStart.current,
        
      };
    } catch (err) {
      setError(err.message);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/comments",
        payload
      );
      setComments(prev => [...prev, res.data]);
      setForm({ name:"", email:"", website:"", comment:"", company:"",  gdpr: false, });
      formStart.current = Date.now();
      setError("");
    } catch {
      setError("Eroare la trimiterea comentariului.");
    }
  };

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Comentarii</h2>

      {comments.map(c => (
        <div key={c.id} className="border rounded-xl p-4 mb-4">
          <strong>{c.name}</strong>
          <p>{c.comment}</p>
        </div>
      ))}

      <form onSubmit={submitComment} className="space-y-3">
        {error && <p className="text-red-500">{error}</p>}

        <input className="
                  w-full rounded-lg border border-gray-300
                  px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-violet-400
                  transition
                "
                value={form.name} name="name" placeholder="Nume *" onChange={handleInput} required/>
        <input  className="
                  w-full rounded-lg border border-gray-300
                  px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-violet-400
                  transition
                "
                value={form.email} name="email" type="email" placeholder="Email *" onChange={handleInput} required/>
        <input  className="
                  w-full rounded-lg border border-gray-300
                  px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-violet-400
                  transition
                "
                value={form.website} name="website" placeholder="Website (opțional)" onChange={handleInput} />

        {/* honeypot */}
        <input  type="text"
                name="company"
                value={form.company}
                onChange={handleInput}
                className="hidden" 
                
                />

        <textarea
                className="
                  w-full rounded-lg border border-gray-300
                  px-3 py-2 min-h-[120px] text-sm
                  focus:outline-none focus:ring-2 focus:ring-violet-400
                  transition
                "
                value={form.comment}  name="comment" placeholder="Comentariu *" onChange={handleInput} required/>
        <label className="flex items-start gap-2 text-sm">
        {/* GDPR checkbox */}
        <input
          type="checkbox"
          name="gdpr"
          checked={form.gdpr}
          onChange={(e) =>
            setForm({ ...form, gdpr: e.target.checked })
          }
          required
        />
        <span>
          Sunt de acord ca datele mele să fie prelucrate conform{" "}
          <Link to="/privacy-policy" className="underline">
            Politicii de confidențialitate
          </Link>.
        </span>
      </label>

        <button className="bg-violet-700 text-white px-4 py-2 rounded">
          Trimite comentariu
        </button>
      </form>
    </section>
  );
}
