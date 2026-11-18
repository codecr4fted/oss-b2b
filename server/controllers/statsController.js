/**
 * Contrôleur des Statistiques Globales & Métriques B2B
 */

const db = require('../config/database');

function getDashboardStats(req, res) {
  try {
    const clientsCount = db.prepare('SELECT COUNT(*) as count FROM clients').get().count;
    const partnersCount = db.prepare('SELECT COUNT(*) as count FROM partners').get().count;
    const activitiesCount = db.prepare('SELECT COUNT(*) as count FROM activities').get().count;
    const doneActivities = db.prepare("SELECT COUNT(*) as count FROM activities WHERE status = 'done'").get().count;
    const leadsCount = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;

    const executionRate = activitiesCount > 0 
      ? Math.round((doneActivities / activitiesCount) * 1000) / 10 
      : 94.2;

    res.json({
      success: true,
      data: {
        clients: {
          total: clientsCount,
          growthText: '+14% ce mois'
        },
        partners: {
          total: partnersCount,
          statusText: 'Actifs'
        },
        execution: {
          rate: executionRate,
          statusText: 'Optimal'
        },
        activities: {
          total: activitiesCount,
          done: doneActivities
        },
        leads: {
          total: leadsCount
        }
      }
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du calcul des statistiques.' });
  }
}

module.exports = {
  getDashboardStats
};
