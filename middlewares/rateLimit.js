// rateLimit.js
const requests = new Map();

/**
 * Rate limit simplu per IP
 * @param {number} maxRequests
 * @param {number} windowMs
 */
export default function rateLimit(maxRequests = 5, windowMs = 60_000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const timestamps = requests
      .get(ip)
      .filter(ts => now - ts < windowMs);

    timestamps.push(now);
    requests.set(ip, timestamps);

    if (timestamps.length > maxRequests) {
      return res
        .status(429)
        .json({ error: "Prea multe cereri. Încearcă mai târziu." });
    }

    next();
  };
}
