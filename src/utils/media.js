import API_URL from "@/config/api";

export function resolveImage(image, fallback = "/images/default-cover.jpg") {
  if (!image) return fallback;

  // dacă e deja https (extern)
  if (image.startsWith("https://")) return image;

  // dacă e http extern → forțăm https
  if (image.startsWith("http://")) {
    return image.replace(/^http:\/\//, "https://");
  }

  // dacă e path local (/uploads/...)
  return `${API_URL}${image}`;
}
