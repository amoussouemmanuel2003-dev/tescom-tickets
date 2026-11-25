const db = require('../config/db');
const { STATUTS, PRIORITES } = require('../validators/ticketValidator');

const getStats = async (currentUser) => {
  const params = [];
  let scopeWhere = '';

  if (currentUser.role === 'technicien') {
    params.push(currentUser.id);
    scopeWhere = `WHERE t.technicien_id = $${params.length}`;
  } else if (currentUser.role === 'client') {
    params.push(currentUser.id);
    scopeWhere = `WHERE c.user_id = $${params.length}`;
  }

  const [summaryRes, statusRes, priorityRes, recentRes, assignedToMeRes] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_tickets,
              COUNT(*) FILTER (WHERE t.statut NOT IN ('Résolu', 'Clôturé'))::int AS tickets_ouverts,
              COUNT(*) FILTER (WHERE t.statut = 'Résolu')::int AS tickets_resolus,
              COUNT(*) FILTER (WHERE t.statut = 'Clôturé')::int AS tickets_clotures
       FROM tickets t
       JOIN clients c ON c.id = t.client_id
       ${scopeWhere}`,
      params
    ),
    db.query(
      `SELECT t.statut, COUNT(*)::int AS total
       FROM tickets t
       JOIN clients c ON c.id = t.client_id
       ${scopeWhere}
       GROUP BY t.statut`,
      params
    ),
    db.query(
      `SELECT t.priorite, COUNT(*)::int AS total
       FROM tickets t
       JOIN clients c ON c.id = t.client_id
       ${scopeWhere}
       GROUP BY t.priorite`,
      params
    ),
    db.query(
      `SELECT t.id,
              t.reference,
              t.titre,
              t.type_demande,
              t.priorite,
              t.statut,
              t.date_creation,
              c.nom_client,
              tech.nom AS technicien_nom,
              tech.prenom AS technicien_prenom
       FROM tickets t
       JOIN clients c ON c.id = t.client_id
       LEFT JOIN users tech ON tech.id = t.technicien_id
       ${scopeWhere}
       ORDER BY t.date_creation DESC, t.id DESC
       LIMIT 5`,
      params
    ),
    db.query(
      `SELECT COUNT(*)::int AS total
       FROM tickets
       WHERE technicien_id = $1`,
      [currentUser.id]
    ),
  ]);

  const par_statut = {};
  for (const s of STATUTS) {
    par_statut[s] = 0;
  }
  for (const row of statusRes.rows) {
    par_statut[row.statut] = row.total;
  }

  const par_priorite = {};
  for (const p of PRIORITES) {
    par_priorite[p] = 0;
  }
  for (const row of priorityRes.rows) {
    par_priorite[row.priorite] = row.total;
  }

  return {
    ...summaryRes.rows[0],
    tickets_assignes_technicien:
      currentUser.role === 'technicien' ? assignedToMeRes.rows[0].total : 0,
    par_statut,
    par_priorite,
    derniers_tickets: recentRes.rows,
  };
};

module.exports = {
  getStats,
};
