/**
 * OSS B2B - Configuration & Initialisation Base de Données
 * Moteur : SQLite natif (Node.js 22.5+ / 24+ DatabaseSync)
 * Conçu pour haute performance, transactions ACID et zéro configuration requise.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Assurer l'existence du dossier data/
const dbDirectory = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbFilePath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(dbDirectory, 'ossb2b.db');

const db = new DatabaseSync(dbFilePath);

// Activer le mode WAL (Write-Ahead Logging) pour des lectures/écritures ultra-rapides et concurrentes
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Migration du schéma relationnel de production
 */
function initializeSchema() {
  db.exec(`
    -- Table des Utilisateurs & Administrateurs
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
      plan TEXT DEFAULT 'Currently',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Inscriptions / Leads (provenant de la landing page)
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone_prefix TEXT NOT NULL DEFAULT '+242',
      phone_number TEXT NOT NULL,
      plan TEXT DEFAULT 'Currently',
      needs TEXT,
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'trial_active', 'converted', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Activités & Missions opérationnelles
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'wait' CHECK(status IN ('done', 'prog', 'wait')),
      status_label TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      assigned_to TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Table des Partenaires & Réseaux d'affaires
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'done' CHECK(status IN ('done', 'prog', 'wait')),
      status_label TEXT NOT NULL,
      scope TEXT DEFAULT 'Réseau',
      contact_person TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Table des Clients suivis
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'done' CHECK(status IN ('done', 'prog', 'wait')),
      status_label TEXT NOT NULL,
      site TEXT NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Table d'Audit & Sécurité (Journalisation des actions sensibles)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seeder les données initiales si les tables sont vides
  const activityCount = db.prepare('SELECT COUNT(*) as count FROM activities').get().count;
  if (activityCount === 0) {
    seedInitialData();
  }
}

/**
 * Données d'amorçage réalistes et professionnelles
 */
function seedInitialData() {
  const insertActivity = db.prepare(`
    INSERT INTO activities (title, category, status, status_label, scheduled_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertActivity.run('Supervision Livraisons Clients', 'Opération Client', 'done', 'Validé', "Aujourd'hui, 11:30");
  insertActivity.run('Réunion Partenaires Stratégiques', 'Partenaire B2B', 'prog', 'En cours', "Aujourd'hui, 14:00");
  insertActivity.run('Validation Contrat Prestation', 'Prestation', 'wait', 'En attente', 'Demain, 09:00');
  insertActivity.run('Inventaire Dépôt Logistique', 'Logistique', 'done', 'Clôturé', 'Hier');

  const insertClient = db.prepare(`
    INSERT INTO clients (name, category, status, status_label, site)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertClient.run('Société Internationale de Distribution', 'Grand Compte', 'done', 'Actif', 'Direction Générale');
  insertClient.run('Cabinet d\'Expertise & Conseil', 'PME Partenaire', 'done', 'Actif', 'Siège Régional');
  insertClient.run('Transport & Transit Express', 'Logistique', 'prog', 'En relance', 'Pôle Logistique');
  insertClient.run('Groupe Commercial Retail', 'Commerce de détail', 'done', 'Actif', 'Agence Centrale');

  const insertPartner = db.prepare(`
    INSERT INTO partners (name, category, status, status_label, scope)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertPartner.run('Opérateur Télécoms & Connectivité', 'Connectivité & Réseau', 'done', 'Partenaire clé', 'Réseau');
  insertPartner.run('Solutions Cloud & Infrastructures', 'Télécoms & IT', 'done', 'Partenaire clé', 'Global');
  insertPartner.run('Chambre de Commerce & Réseau d\'Affaires', 'Institutionnel', 'done', 'Affilié', 'Fédération');
  insertPartner.run('Établissement Bancaire & Paiements', 'Finance & Paiement', 'prog', 'Intégration', 'Fintech');
}

initializeSchema();

module.exports = db;
