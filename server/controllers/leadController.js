/**
 * Contrôleur des Inscriptions & Prospects (Leads)
 */

const db = require('../config/database');

/**
 * Enregistrement d'un nouveau prospect depuis la landing page
 */
function submitLead(req, res) {
  try {
    const { full_name, company, phone_prefix, phone_number, plan, needs } = req.body;

    if (!full_name || !company || !phone_number) {
      return res.status(400).json({
        success: false,
        error: 'Nom complet, entreprise et numéro de téléphone sont requis.'
      });
    }

    const cleanPrefix = phone_prefix ? phone_prefix.trim() : '+242';
    const cleanPhone = phone_number.trim();
    const cleanPlan = plan || 'Currently';

    const stmt = db.prepare(`
      INSERT INTO leads (full_name, company, phone_prefix, phone_number, plan, needs, status)
      VALUES (?, ?, ?, ?, ?, ?, 'new')
    `);

    const result = stmt.run(
      full_name.trim(),
      company.trim(),
      cleanPrefix,
      cleanPhone,
      cleanPlan,
      needs ? needs.trim() : null
    );

    // Audit log
    db.prepare('INSERT INTO audit_logs (action, entity_type, entity_id, ip_address) VALUES (?, ?, ?, ?)').run(
      'LEAD_SUBMITTED',
      'leads',
      Number(result.lastInsertRowid),
      req.ip
    );

    res.status(201).json({
      success: true,
      message: `Bienvenue ${full_name} ! Votre inscription pour le forfait ${cleanPlan} avec essai gratuit de 7 jours est confirmée.`,
      leadId: Number(result.lastInsertRowid),
      plan: cleanPlan
    });
  } catch (error) {
    console.error('Erreur soumission lead:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de l’enregistrement de votre inscription.'
    });
  }
}

/**
 * Liste des leads (Accessible aux administrateurs)
 */
function getLeads(req, res) {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('Erreur lecture leads:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des inscriptions.' });
  }
}

module.exports = {
  submitLead,
  getLeads
};
