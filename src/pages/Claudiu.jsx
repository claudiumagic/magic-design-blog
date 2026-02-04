import { useState } from "react";
import Editor from "./claudiu/editor";

export default function Claudiu() {
  const [logged, setLogged] = useState(false);
  const [pass, setPass] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin-token", data.token);
        setLogged(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Eroare login");
    }
  };

  if (!logged) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl mb-4">Login Admin</h2>
        <input
          type="text"
          className="border p-2 w-full mb-2"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Parolă"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-black text-white px-4 py-2"
        >
          Login
        </button>
      </div>
    );
  }

  return <Editor isAdmin={true} />;
}
