export default function requireGdprConsent(req, res, next) {
  if (!req.body.gdpr) {
    return res.status(400).json({
      error: "Este necesar acordul pentru prelucrarea datelor personale.",
    });
  }
  next();
}
