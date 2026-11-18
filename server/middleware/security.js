/**
 * Middleware de Sécurité HTTP & CORS pour OSS B2B
 */

const helmet = require('helmet');
const cors = require('cors');

const isProduction = process.env.NODE_ENV === 'production';

// Configuration Content Security Policy stricte mais adaptée aux polices Google Fonts et SVG
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false
});

// Configuration CORS sécurisée
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5000', 'http://127.0.0.1:5000'];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (same-origin, curl, tests) ou celles présentes dans la liste
    if (!origin || allowedOrigins.includes(origin) || !isProduction) {
      return callback(null, true);
    }
    return callback(new Error('Origine non autorisée par la politique CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

module.exports = {
  helmetMiddleware,
  corsMiddleware
};
