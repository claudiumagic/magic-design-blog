import { Outlet, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useScrollFactor } from "../hooks/useScrollFactor";

// 🔥 lazy load
const BackgroundLines = lazy(() =>
  import("../components/background/BackgroundLines")
);

export default function Layout() {
  const scrollFactor = useScrollFactor();
  const location = useLocation();

  // ❌ dezactivăm background pe pagini grele
  const disableBackground =
    location.pathname.startsWith("/article") ||
    location.pathname.startsWith("/personal/");

  return (
    <main className="layout-root min-h-screen">
      {!disableBackground && (
        <Suspense fallback={null}>
          <BackgroundLines scrollFactor={scrollFactor} />
        </Suspense>
      )}

      <div className="main-surface article-surface max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  );
}
