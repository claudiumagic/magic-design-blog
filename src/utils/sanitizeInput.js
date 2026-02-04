/**
 * Escape basic HTML (anti XSS)
 */
export function sanitizeText(input) {
  if (!input) return "";

  return input
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validare email reală (nu perfectă, dar solidă)
 */
export function sanitizeEmail(email) {
  if (!email) {
    throw new Error("Email-ul este obligatoriu.");
  }

  const clean = email.trim().toLowerCase();

  const emailRegex =
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  if (!emailRegex.test(clean)) {
    throw new Error("Email invalid.");
  }

  return clean;
}

/**
 * Website (max 1 link, https)
 */
export function sanitizeWebsite(rawWebsite) {
  if (!rawWebsite) return null;

  let website = rawWebsite.trim().replace(/\s+/g, "");

  if ((website.match(/https?:\/\//gi) || []).length > 1) {
    throw new Error("Este permis un singur website.");
  }

  if (!/^https?:\/\//i.test(website)) {
    website = "https://" + website;
  }

  try {
    const url = new URL(website);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }

    return url.href;
  } catch {
    throw new Error("Website invalid.");
  }
}
