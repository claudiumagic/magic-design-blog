import { useEffect, useState } from "react";

export function useScrollFactor() {
  const [factor, setFactor] = useState(0);

  useEffect(() => {
    // dezactivare pe mobile (opțional, sigur)
    if (window.innerWidth < 768) {
      setFactor(0);
      return;
    }

    const onScroll = () => {
      const scrollY = window.scrollY;
      const clamped = Math.min(scrollY / 600, 1);
      setFactor(clamped * 40); // ajustezi aici: 25 / 40 / 60
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // cleanup CORECT
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return factor;
}
