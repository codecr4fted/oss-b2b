/**
 * Contrôleur des Partenaires & Clients
 */

const db = require('../config/database');

/**
 * Récupérer la liste des partenaires
 */
function getPartners(req, res) {
  try {
    const partners = db.prepare('SELECT * FROM partners ORDER BY id ASC').all();
    res.json({
      success: true,
      count: partners.length,
      data: partners
    });
  } catch (error) {
    console.error('Erreur getPartners:', error);
    res.status(500).json({ success: false, error: 'Impossible de charger les partenaires.' });
  }
}

/**
 * Récupérer la liste des clients
 */
function getClients(req, res) {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY id ASC').all();
    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Erreur getClients:', error);
    res.status(500).json({ success: false, error: 'Impossible de charger les clients.' });
  }
}

module.exports = {
  getPartners,
  getClients
};
