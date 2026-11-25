const db = require('../config/db');
const AppError = require('../utils/AppError');
const { assertTicketAccess, STATUT_CLOTURE } = require('./ticketService');

const listMessages = async (ticketId, currentUser) => {
  await assertTicketAccess(ticketId, currentUser);

  const filterInterne = currentUser.role === 'client' ? 'AND m.interne = FALSE' : '';

  const { rows } = await db.query(
    `SELECT m.id,
            m.ticket_id,
            m.user_id,
            m.contenu,
            m.interne,
            m.created_at,
            u.nom AS auteur_nom,
            u.prenom AS auteur_prenom,
            u.role AS auteur_role
     FROM messages m
     JOIN users u ON u.id = m.user_id
     WHERE m.ticket_id = $1
       ${filterInterne}
     ORDER BY m.created_at ASC, m.id ASC`,
    [ticketId]
  );

  return rows;
};

const createMessage = async (ticketId, { contenu, interne }, currentUser) => {
  const ticket = await assertTicketAccess(ticketId, currentUser);

  if (ticket.statut === STATUT_CLOTURE) {
    throw new AppError('Impossible d\'ajouter un message sur un ticket clôturé.', 409);
  }

  if (currentUser.role === 'client' && interne) {
    throw new AppError('Un client ne peut pas rédiger de message interne.', 403);
  }

  const { rows } = await db.query(
    `INSERT INTO messages (ticket_id, user_id, contenu, interne)
     VALUES ($1, $2, $3, $4)
     RETURNING id, ticket_id, user_id, contenu, interne, created_at`,
    [ticketId, currentUser.id, contenu, interne]
  );

  return {
    ...rows[0],
    auteur_nom: currentUser.nom,
    auteur_prenom: currentUser.prenom,
    auteur_role: currentUser.role,
  };
};

module.exports = {
  listMessages,
  createMessage,
};
