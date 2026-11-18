/**
 * OSS B2B - Serveur de Production & Développement
 * Point d'entrée principal
 */

const app = require('./server/app');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 OSS B2B Serveur démarré avec succès !`);
  console.log(`📡 URL locale        : http://localhost:${PORT}`);
  console.log(`🌐 Environnement     : ${NODE_ENV}`);
  console.log(`🛡️  Sécurité & API    : Activées sur /api/v1`);
  console.log(`💾 Base de données   : SQLite active (mode WAL)`);
  console.log(`=======================================================`);
});

// Gestion des arrêts propres (SIGINT, SIGTERM)
function gracefulShutdown(signal) {
  console.log(`\nReçu signal ${signal}. Arrêt propre du serveur OSS B2B...`);
  server.close(() => {
    console.log('Serveur HTTP fermé.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
