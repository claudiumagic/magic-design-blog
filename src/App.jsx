import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import About from "./pages/About";
import PersonalBlog from "./pages/PersonalBlog";
import PersonalArticle from "./pages/PersonalArticle";
import Claudiu from "./pages/Claudiu";
import { useState } from "react";
import Editor from "./pages/claudiu/editor";
import EditorialPolicy from "./pages/EditorialPolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Admin from "./pages/claudiu/Admin";
import Layout from "./layout/Layout"; // 👈 IMPORTANT


  export default function App() {
  const [isAdmin, setIsAdmin] = useState(
    Boolean(localStorage.getItem("token"))
  );


  return (
    <>
      <Navbar />

      <Routes>

        {/* 🔥 PUBLIC SITE – ACELAȘI LAYOUT */}
        <Route element={<Layout />}>

          {/** MENU LINKS (public) **/}
          <Route path="/" element={<Blog isAdmin={isAdmin} />} />
          <Route path="/personal" element={<PersonalBlog isAdmin={isAdmin} />} />
          <Route path="/despre" element={<About isAdmin={isAdmin} />} />

          {/** CONTENT ROUTES – NU APAR ÎN MENIU **/}
          <Route path="/personal/:slug" element={<PersonalArticle isAdmin={isAdmin} />} />
          <Route path="/article/:slug" element={<Article isAdmin={isAdmin} />} />

          {/** LEGAL / INFO – NU APAR ÎN MENIU **/}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/editorial-policy" element={<EditorialPolicy />} />

        </Route>

        {/** ADMIN – FĂRĂ LAYOUT PUBLIC **/}
        <Route
          path="/claudiu"
          element={<Admin setIsAdmin={setIsAdmin} />}
        />
        <Route
          path="/editor"
          element={isAdmin ? <Editor /> : <Navigate to="/claudiu" />}
        />

      </Routes>
    </>

  );
}
