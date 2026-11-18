/**
 * Contrôleur d'Authentification (Inscription, Connexion, Profil)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Inscription Utilisateur
 */
async function register(req, res) {
  try {
    const { email, password, full_name, company, phone, plan } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, mot de passe et nom complet sont obligatoires.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit comporter au moins 8 caractères.'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Un compte existe déjà avec cette adresse email.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, company, phone, plan, role)
      VALUES (?, ?, ?, ?, ?, ?, 'user')
    `).run(
      email.toLowerCase().trim(),
      passwordHash,
      full_name.trim(),
      company ? company.trim() : null,
      phone ? phone.trim() : null,
      plan || 'Currently'
    );

    const token = jwt.sign(
      { userId: result.lastInsertRowid, email: email.toLowerCase().trim(), role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    db.prepare('INSERT INTO audit_logs (action, entity_type, entity_id, ip_address) VALUES (?, ?, ?, ?)').run(
      'USER_REGISTER',
      'users',
      Number(result.lastInsertRowid),
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès ! Votre essai de 7 jours est activé.',
      token,
      user: {
        id: Number(result.lastInsertRowid),
        email: email.toLowerCase().trim(),
        full_name: full_name.trim(),
        company: company || null,
        plan: plan || 'Currently',
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur lors de l’inscription.' });
  }
}

/**
 * Connexion Utilisateur
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis.'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    db.prepare('INSERT INTO audit_logs (action, entity_type, entity_id, ip_address) VALUES (?, ?, ?, ?)').run(
      'USER_LOGIN',
      'users',
      user.id,
      req.ip
    );

    res.json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company: user.company,
        role: user.role,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ success: false, error: 'Erreur interne lors de la connexion.' });
  }
}

/**
 * Récupération du profil utilisateur authentifié
 */
function getProfile(req, res) {
  res.json({
    success: true,
    user: req.user
  });
}

module.exports = {
  register,
  login,
  getProfile
};
