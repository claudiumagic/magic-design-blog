import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./logo";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [clickedLink, setClickedLink] = useState(null);
  const location = useLocation();

  /* ================= ROUTE LOGIC ================= */
  const isArticle = location.pathname.startsWith("/article");
  const isPersonal = location.pathname.startsWith("/personal");

  /* ================= MOBILE HANDLERS ================= */
  const handleMobileClick = (path) => {
    setClickedLink(path);
    setTimeout(() => {
      setOpen(false);
    }, 120);
  };

  const mobileLinkProps = (path) => ({
    onClick: () => handleMobileClick(path),
    className: ({ isActive }) =>
      `mobile-link ${
        isActive ||
        (path === "/" && isArticle) ||
        (path === "/personal" && isPersonal)
          ? "active"
          : ""
      } ${clickedLink === path ? "clicked" : ""}`,
  });

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">

          {/* LEFT */}
          <div className="nav-left desktop-only">
            <NavLink
              to="/"
              className={() =>
                isArticle || location.pathname === "/" ? "active" : ""
              }
            >
              UI/UX Blog
            </NavLink>

            <NavLink
              to="/personal"
              className={() => (isPersonal ? "active" : "")}
            >
              Blog Personal
            </NavLink>
          </div>

          {/* HAMBURGER */}
          <button
            className={`hamburger mobile-only ${open ? "open" : ""}`}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
            <span />
          </button>

          {/* LOGO */}
          <div className="nav-logo">
            <Link to="/" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="nav-right desktop-only">
            <NavLink to="/despre" {...mobileLinkProps("/despre")}>
              Despre
            </NavLink>
            <NavLink to="/contact" {...mobileLinkProps("/contact")}>
              Contact
            </NavLink>
          </div>

        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <NavLink to="/" {...mobileLinkProps("/")}>UI/UX Blog</NavLink>
        <NavLink to="/personal" {...mobileLinkProps("/personal")}>Blog Personal</NavLink>
        <NavLink to="/despre" {...mobileLinkProps("/despre")}>Despre</NavLink>
        <NavLink to="/contact" {...mobileLinkProps("/contact")}>Contact</NavLink>
      </div>
    </>
  );
}
