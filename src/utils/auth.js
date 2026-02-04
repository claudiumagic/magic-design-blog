export function isAdmin() {
  return localStorage.getItem("isAdmin") === "true";
}