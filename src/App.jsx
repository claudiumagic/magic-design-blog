import { Routes, Route, Navigate } from "react-router-dom";
import { useState, lazy, Suspense } from "react";

import Navbar from "./components/Navbar";
import Layout from "./layout/Layout";
import Admin from "./pages/claudiu/Admin";
import Editor from "./pages/claudiu/editor";
import EditorialPolicy from "./pages/EditorialPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";

/* ================= LAZY PAGES (PUBLIC) ================= */

const Blog = lazy(() => import("./pages/Blog"));
const Article = lazy(() => import("./pages/Article"));
const PersonalBlog = lazy(() => import("./pages/PersonalBlog"));
const PersonalArticle = lazy(() => import("./pages/PersonalArticle"));
const About = lazy(() => import("./pages/About"));

/* ================= LOADER ================= */

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-pulse text-gray-400">
        Se încarcă…
      </div>
    </div>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(
    Boolean(localStorage.getItem("token"))
  );

  return (
    <>
      {/* 🔹 Navbar DOAR pentru site-ul public */}
      <Navbar />

      {/* 🔹 Suspense DOAR pentru paginile lazy */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ================= PUBLIC SITE ================= */}
          <Route element={<Layout />}>
            {/* MENIU */}
            <Route path="/" element={<Blog />} />
            <Route path="/personal" element={<PersonalBlog />} />
            <Route path="/despre" element={<About />} />

            {/* CONȚINUT */}
            <Route
              path="/personal/:slug"
              element={<PersonalArticle isAdmin={isAdmin} />}
            />
            <Route
              path="/article/:slug"
              element={<Article isAdmin={isAdmin} />}
            />

            {/* LEGAL */}
            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />
            <Route
              path="/editorial-policy"
              element={<EditorialPolicy />}
            />
          </Route>

          {/* ================= ADMIN (FĂRĂ LAYOUT) ================= */}
          <Route
            path="/claudiu"
            element={<Admin setIsAdmin={setIsAdmin} />}
          />
          <Route
            path="/editor"
            element={
              isAdmin ? <Editor /> : <Navigate to="/claudiu" replace />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
