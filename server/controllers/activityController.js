/**
 * Contrôleur des Activités Opérationnelles & Missions
 */

const db = require('../config/database');

/**
 * Récupérer toutes les activités
 */
function getActivities(req, res) {
  try {
    const activities = db.prepare('SELECT * FROM activities ORDER BY id DESC').all();
    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Erreur getActivities:', error);
    res.status(500).json({ success: false, error: 'Impossible de charger les activités.' });
  }
}

/**
 * Créer une nouvelle activité
 */
function createActivity(req, res) {
  try {
    const { title, category, status, status_label, scheduled_date, assigned_to } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Titre et catégorie d’activité obligatoires.'
      });
    }

    const cleanStatus = status || 'wait';
    const cleanLabel = status_label || (cleanStatus === 'done' ? 'Validé' : cleanStatus === 'prog' ? 'En cours' : 'En attente');
    const cleanDate = scheduled_date || "Aujourd'hui";

    const stmt = db.prepare(`
      INSERT INTO activities (title, category, status, status_label, scheduled_date, assigned_to, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      category.trim(),
      cleanStatus,
      cleanLabel,
      cleanDate,
      assigned_to || null,
      req.user ? req.user.id : null
    );

    res.status(201).json({
      success: true,
      message: 'Activité créée avec succès.',
      data: {
        id: Number(result.lastInsertRowid),
        title,
        category,
        status: cleanStatus,
        status_label: cleanLabel,
        scheduled_date: cleanDate
      }
    });
  } catch (error) {
    console.error('Erreur createActivity:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création de l’activité.' });
  }
}

/**
 * Mettre à jour le statut d'une activité
 */
function updateActivityStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, status_label } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Nouveau statut requis.' });
    }

    const validStatuses = ['done', 'prog', 'wait'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Statut invalide.' });
    }

    const label = status_label || (status === 'done' ? 'Validé' : status === 'prog' ? 'En cours' : 'En attente');

    const result = db.prepare(`
      UPDATE activities 
      SET status = ?, status_label = ?
      WHERE id = ?
    `).run(status, label, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Activité introuvable.' });
    }

    res.json({
      success: true,
      message: 'Statut mis à jour.'
    });
  } catch (error) {
    console.error('Erreur updateActivityStatus:', error);
    res.status(500).json({ success: false, error: 'Erreur mise à jour statut.' });
  }
}

module.exports = {
  getActivities,
  createActivity,
  updateActivityStatus
};
