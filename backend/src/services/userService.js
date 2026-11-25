const bcrypt = require('bcrypt');
const db = require('../config/db');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;
const USER_PUBLIC_COLUMNS = 'id, nom, prenom, email, telephone, role, actif, created_at';

const listUsers = async ({ role, actif, search } = {}) => {
  const conditions = [];
  const params = [];

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }

  if (actif === 'true' || actif === 'false') {
    params.push(actif === 'true');
    conditions.push(`actif = $${params.length}`);
  }

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(
      `(nom ILIKE $${params.length} OR prenom ILIKE $${params.length} OR email ILIKE $${params.length})`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT ${USER_PUBLIC_COLUMNS}
     FROM users
     ${whereClause}
     ORDER BY created_at DESC, id DESC`,
    params
  );

  return rows;
};

/**
 * Retourne la liste des techniciens actifs pour l'affectation des tickets (admin et employe).
 */
const listActiveTechniciens = async () => {
  const { rows } = await db.query(
    `SELECT id, nom, prenom, email
     FROM users
     WHERE role = 'technicien' AND actif = TRUE
     ORDER BY nom ASC, prenom ASC`
  );
  return rows;
};

const getUserById = async (id) => {
  const { rows } = await db.query(
    `SELECT ${USER_PUBLIC_COLUMNS}
     FROM users
     WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) {
    throw new AppError('Utilisateur introuvable.', 404);
  }

  return rows[0];
};

const createUser = async (payload) => {
  return db.withTransaction(async (tx) => {
    const existing = await tx.query('SELECT id FROM users WHERE email = $1', [payload.email]);
    if (existing.rows.length > 0) {
      throw new AppError('Un compte avec cette adresse email existe déjà.', 409);
    }

    const hashedPassword = await bcrypt.hash(payload.mot_de_passe, SALT_ROUNDS);

    const { rows } = await tx.query(
      `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role, actif)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${USER_PUBLIC_COLUMNS}`,
      [
        payload.nom,
        payload.prenom,
        payload.email,
        payload.telephone,
        hashedPassword,
        payload.role,
        payload.actif,
      ]
    );

    const user = rows[0];

    // Si l'administrateur crée un utilisateur avec le rôle client, on lui associe une fiche client.
    if (user.role === 'client') {
      await tx.query(
        `INSERT INTO clients (user_id, nom_client, nom_contact, email, telephone)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          `${user.prenom} ${user.nom}`,
          `${user.prenom} ${user.nom}`,
          user.email,
          user.telephone,
        ]
      );
    }

    return user;
  });
};

const updateUser = async (id, payload) => {
  const existing = await db.query('SELECT id, email FROM users WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Utilisateur introuvable.', 404);
  }

  const emailTaken = await db.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [
    payload.email,
    id,
  ]);
  if (emailTaken.rows.length > 0) {
    throw new AppError('Cette adresse email est déjà utilisée par un autre compte.', 409);
  }

  let hashedPassword = null;
  if (payload.mot_de_passe) {
    hashedPassword = await bcrypt.hash(payload.mot_de_passe, SALT_ROUNDS);
  }

  const { rows } = await db.query(
    `UPDATE users
     SET nom = $1,
         prenom = $2,
         email = $3,
         telephone = $4,
         role = $5,
         mot_de_passe = COALESCE($6, mot_de_passe)
     WHERE id = $7
     RETURNING ${USER_PUBLIC_COLUMNS}`,
    [
      payload.nom,
      payload.prenom,
      payload.email,
      payload.telephone,
      payload.role,
      hashedPassword,
      id,
    ]
  );

  return rows[0];
};

const updateUserStatus = async (id, actif, currentAdminId) => {
  if (id === currentAdminId && !actif) {
    throw new AppError('Vous ne pouvez pas désactiver votre propre compte administrateur.', 400);
  }

  const { rows } = await db.query(
    `UPDATE users
     SET actif = $1
     WHERE id = $2
     RETURNING ${USER_PUBLIC_COLUMNS}`,
    [actif, id]
  );

  if (rows.length === 0) {
    throw new AppError('Utilisateur introuvable.', 404);
  }

  return rows[0];
};

module.exports = {
  listUsers,
  listActiveTechniciens,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
};
