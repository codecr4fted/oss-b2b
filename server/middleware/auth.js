/**
 * Middleware d'Authentification JWT & Contrôle d'Accès par Rôles (RBAC)
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'oss_b2b_super_secret_jwt_key_change_in_production_2026_central_africa';

/**
 * Vérification du Token Bearer
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Accès non autorisé : jeton d’authentification manquant.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Jeton invalide ou expiré.'
      });
    }

    // Récupérer les informations de l'utilisateur en base
    const user = db.prepare('SELECT id, email, full_name, company, role, plan FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'Utilisateur associé au jeton introuvable.'
      });
    }

    req.user = user;
    next();
  });
}

/**
 * Contrôle des autorisations par rôles (ex: requireRole('admin', 'manager'))
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé : privilèges insuffisants pour cette ressource.'
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
