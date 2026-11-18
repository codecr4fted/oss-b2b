/**
 * Application Express Principale - OSS B2B
 */

require('dotenv').config();
const path = require('node:path');
const express = require('express');

const { helmetMiddleware, corsMiddleware } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// 1. Sécurité HTTP & En-têtes de protection
app.use(helmetMiddleware);
app.use(corsMiddleware);

// 2. Parsers de corps de requêtes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Fichiers Statiques (Landing Page, Styles, Scripts, Favicons)
const rootDir = path.resolve(__dirname, '..');
app.use(express.static(rootDir, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true
}));

// 4. Routes API (avec limitation de débit)
app.use('/api', apiLimiter);
app.use('/api/v1', apiRoutes);

// 5. Route Racine (Fallback vers index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// 6. Gestion des erreurs 404 pour l'API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Point d’accès introuvable : ${req.method} ${req.originalUrl}`
  });
});

// 7. Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('[Erreur non interceptée]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Une erreur interne est survenue sur le serveur.' 
      : err.message || 'Erreur interne'
  });
});

module.exports = app;
