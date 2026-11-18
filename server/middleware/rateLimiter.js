/**
 * Middleware de Limitation de Débit (Rate Limiting & Anti-Brute-Force)
 */

const rateLimit = require('express-rate-limit');

// Limiteur général d'API (100 requêtes par tranche de 15 minutes par IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Trop de requêtes effectuées depuis cette adresse IP. Veuillez patienter 15 minutes.'
  }
});

// Limiteur renforcé pour les formulaires sensibles (Inscriptions, Authentification : 10 requêtes par 15 min)
const authAndFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Trop de tentatives d’inscription ou de connexion. Veuillez réessayer plus tard.'
  }
});

module.exports = {
  apiLimiter,
  authAndFormLimiter
};
