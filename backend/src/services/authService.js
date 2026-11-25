const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

const sanitizeUser = (row) => ({
  id: row.id,
  nom: row.nom,
  prenom: row.prenom,
  email: row.email,
  telephone: row.telephone,
  role: row.role,
  actif: row.actif,
  created_at: row.created_at,
});

const fetchLinkedClient = async (userId, queryRunner = db) => {
  const { rows } = await queryRunner.query(
    `SELECT id, user_id, nom_client, nom_contact, email, telephone, adresse, created_at
     FROM clients
     WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * Inscrit un nouveau client et crée son compte utilisateur + fiche client dans une transaction.
 */
const registerClient = async (payload) => {
  return db.withTransaction(async (tx) => {
    const existing = await tx.query('SELECT id FROM users WHERE email = $1', [payload.email]);
    if (existing.rows.length > 0) {
      throw new AppError('Un compte avec cette adresse email existe déjà.', 409);
    }

    const hashedPassword = await bcrypt.hash(payload.mot_de_passe, SALT_ROUNDS);

    const userResult = await tx.query(
      `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role, actif)
       VALUES ($1, $2, $3, $4, $5, 'client', TRUE)
       RETURNING id, nom, prenom, email, telephone, role, actif, created_at`,
      [payload.nom, payload.prenom, payload.email, payload.telephone, hashedPassword]
    );

    const user = sanitizeUser(userResult.rows[0]);

    const clientResult = await tx.query(
      `INSERT INTO clients (user_id, nom_client, nom_contact, email, telephone, adresse)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, nom_client, nom_contact, email, telephone, adresse, created_at`,
      [
        user.id,
        payload.nom_client,
        payload.nom_contact,
        payload.email,
        payload.telephone,
        payload.adresse,
      ]
    );

    const client = clientResult.rows[0];
    const token = signToken(user);

    return { token, user, client };
  });
};

/**
 * Authentifie un utilisateur actif et retourne un jeton JWT.
 */
const login = async ({ email, mot_de_passe }) => {
  const { rows } = await db.query(
    `SELECT id, nom, prenom, email, telephone, mot_de_passe, role, actif, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (rows.length === 0) {
    throw new AppError('Email ou mot de passe incorrect.', 401);
  }

  const userRow = rows[0];
  const passwordValid = await bcrypt.compare(mot_de_passe, userRow.mot_de_passe);
  if (!passwordValid) {
    throw new AppError('Email ou mot de passe incorrect.', 401);
  }

  if (!userRow.actif) {
    throw new AppError('Votre compte est désactivé. Contactez un administrateur.', 403);
  }

  const user = sanitizeUser(userRow);
  const client = user.role === 'client' ? await fetchLinkedClient(user.id) : null;
  const token = signToken(user);

  return { token, user, client };
};

/**
 * Retourne le profil complet de l'utilisateur connecté.
 */
const getMe = async (userId) => {
  const { rows } = await db.query(
    `SELECT id, nom, prenom, email, telephone, role, actif, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError('Utilisateur introuvable.', 404);
  }

  const user = sanitizeUser(rows[0]);
  const client = user.role === 'client' ? await fetchLinkedClient(user.id) : null;

  return { ...user, client };
};

/**
 * Met à jour le profil de l'utilisateur connecté (nom, prénom, téléphone, mot de passe optionnel).
 */
const updateMe = async (userId, payload) => {
  const { rows } = await db.query(
    `SELECT id, mot_de_passe
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError('Utilisateur introuvable.', 404);
  }

  let newHashedPassword = null;
  if (payload.nouveau_mot_de_passe) {
    const validOld = await bcrypt.compare(payload.ancien_mot_de_passe, rows[0].mot_de_passe);
    if (!validOld) {
      throw new AppError('L\'ancien mot de passe est incorrect.', 400);
    }
    newHashedPassword = await bcrypt.hash(payload.nouveau_mot_de_passe, SALT_ROUNDS);
  }

  const updated = await db.query(
    `UPDATE users
     SET nom = $1,
         prenom = $2,
         telephone = $3,
         mot_de_passe = COALESCE($4, mot_de_passe)
     WHERE id = $5
     RETURNING id, nom, prenom, email, telephone, role, actif, created_at`,
    [payload.nom, payload.prenom, payload.telephone, newHashedPassword, userId]
  );

  return sanitizeUser(updated.rows[0]);
};

module.exports = {
  registerClient,
  login,
  getMe,
  updateMe,
};
