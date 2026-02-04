import { Outlet } from "react-router-dom";
import BackgroundLines from "../components/background/BackgroundLines";
import { useScrollFactor } from "../hooks/useScrollFactor";

export default function Layout() {
  const scrollFactor = useScrollFactor();

  return (
    <main className="layout-root min-h-screen">
      <BackgroundLines scrollFactor={scrollFactor} />

      {/* contentul */}
      <div className="main-surface article-surface max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  );
}

