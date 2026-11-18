/**
 * Définition et Centralisation des Routes de l'API OSS B2B v1
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const leadController = require('../controllers/leadController');
const activityController = require('../controllers/activityController');
const partnerController = require('../controllers/partnerController');
const statsController = require('../controllers/statsController');

const { authenticateToken, requireRole } = require('../middleware/auth');
const { authAndFormLimiter } = require('../middleware/rateLimiter');

// 1. Healthcheck (Pour les sondes de monitoring, Docker, Vercel, Railway, Render)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'OSS B2B API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 2. Inscriptions Prospects (Formulaire Landing Page)
router.post('/leads', authAndFormLimiter, leadController.submitLead);
router.get('/leads', authenticateToken, requireRole('admin'), leadController.getLeads);

// 3. Authentification & Comptes Utilisateurs
router.post('/auth/register', authAndFormLimiter, authController.register);
router.post('/auth/login', authAndFormLimiter, authController.login);
router.get('/auth/me', authenticateToken, authController.getProfile);

// 4. Activités & Missions
router.get('/activities', activityController.getActivities);
router.post('/activities', authenticateToken, activityController.createActivity);
router.patch('/activities/:id/status', authenticateToken, activityController.updateActivityStatus);

// 5. Partenaires & Réseaux
router.get('/partners', partnerController.getPartners);

// 6. Clients
router.get('/clients', partnerController.getClients);

// 7. Statistiques & KPIs
router.get('/stats', statsController.getDashboardStats);

module.exports = router;
