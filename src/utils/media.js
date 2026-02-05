const ASSETS_URL = import.meta.env.VITE_ASSETS_URL;

export function resolveImage(src, fallback) {
  if (!src) return fallback;
  if (src.startsWith("http")) return src;
  return `${ASSETS_URL}${src}`;
}
