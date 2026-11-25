const db = require('../config/db');
const AppError = require('../utils/AppError');

const CLIENT_SELECT = `
  SELECT c.id,
         c.user_id,
         c.nom_client,
         c.nom_contact,
         c.email,
         c.telephone,
         c.adresse,
         c.created_at,
         u.actif AS compte_actif,
         (c.user_id IS NOT NULL) AS a_un_compte
  FROM clients c
  LEFT JOIN users u ON u.id = c.user_id
`;

const listClients = async ({ search } = {}) => {
  const params = [];
  let whereClause = '';

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    whereClause = `
      WHERE c.nom_client ILIKE $1
         OR COALESCE(c.nom_contact, '') ILIKE $1
         OR COALESCE(c.email, '') ILIKE $1
         OR COALESCE(c.telephone, '') ILIKE $1
    `;
  }

  const { rows } = await db.query(
    `SELECT c.id,
            c.user_id,
            c.nom_client,
            c.nom_contact,
            c.email,
            c.telephone,
            c.adresse,
            c.created_at,
            u.actif AS compte_actif,
            (c.user_id IS NOT NULL) AS a_un_compte,
            COUNT(t.id)::int AS nombre_tickets
     FROM clients c
     LEFT JOIN users u ON u.id = c.user_id
     LEFT JOIN tickets t ON t.client_id = c.id
     ${whereClause}
     GROUP BY c.id, u.actif
     ORDER BY c.created_at DESC, c.id DESC`,
    params
  );

  return rows;
};

const getClientById = async (id, currentUser) => {
  const { rows } = await db.query(`${CLIENT_SELECT} WHERE c.id = $1`, [id]);

  if (rows.length === 0) {
    throw new AppError('Client introuvable.', 404);
  }

  const client = rows[0];

  if (currentUser.role === 'client' && client.user_id !== currentUser.id) {
    throw new AppError('Accès refusé. Vous ne pouvez consulter que votre propre fiche client.', 403);
  }

  const ticketsResult = await db.query(
    `SELECT t.id,
            t.reference,
            t.titre,
            t.type_demande,
            t.priorite,
            t.statut,
            t.date_creation,
            t.date_resolution,
            t.date_cloture,
            tech.nom AS technicien_nom,
            tech.prenom AS technicien_prenom
     FROM tickets t
     LEFT JOIN users tech ON tech.id = t.technicien_id
     WHERE t.client_id = $1
     ORDER BY t.date_creation DESC`,
    [id]
  );

  return {
    ...client,
    tickets: ticketsResult.rows,
  };
};

const createClient = async (payload) => {
  const { rows } = await db.query(
    `INSERT INTO clients (nom_client, nom_contact, email, telephone, adresse)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, nom_client, nom_contact, email, telephone, adresse, created_at`,
    [
      payload.nom_client,
      payload.nom_contact,
      payload.email,
      payload.telephone,
      payload.adresse,
    ]
  );

  return {
    ...rows[0],
    compte_actif: null,
    a_un_compte: false,
  };
};

const updateClient = async (id, payload) => {
  const { rows } = await db.query(
    `UPDATE clients
     SET nom_client = $1,
         nom_contact = $2,
         email = $3,
         telephone = $4,
         adresse = $5
     WHERE id = $6
     RETURNING id`,
    [
      payload.nom_client,
      payload.nom_contact,
      payload.email,
      payload.telephone,
      payload.adresse,
      id,
    ]
  );

  if (rows.length === 0) {
    throw new AppError('Client introuvable.', 404);
  }

  const updated = await db.query(`${CLIENT_SELECT} WHERE c.id = $1`, [id]);
  return updated.rows[0];
};

/**
 * Active ou désactive uniquement le compte utilisateur lié à la fiche client (users.actif).
 * Ne modifie ni ne supprime jamais la fiche client ni le compte utilisateur.
 */
const updateClientStatus = async (id, actif) => {
  const { rows } = await db.query(
    'SELECT id, user_id FROM clients WHERE id = $1',
    [id]
  );

  if (rows.length === 0) {
    throw new AppError('Client introuvable.', 404);
  }

  const client = rows[0];
  if (!client.user_id) {
    throw new AppError('Ce client ne possède pas de compte utilisateur.', 400);
  }

  await db.query('UPDATE users SET actif = $1 WHERE id = $2', [actif, client.user_id]);

  const updated = await db.query(`${CLIENT_SELECT} WHERE c.id = $1`, [id]);
  return updated.rows[0];
};

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  updateClientStatus,
};
