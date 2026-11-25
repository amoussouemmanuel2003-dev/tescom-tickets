const db = require('../config/db');
const AppError = require('../utils/AppError');

const STATUT_NOUVEAU = 'Nouveau';
const STATUT_ASSIGNE = 'Assign\u00e9';
const STATUT_EN_COURS = 'En cours';
const STATUT_EN_ATTENTE = 'En attente client';
const STATUT_RESOLU = 'R\u00e9solu';
const STATUT_CLOTURE = 'Cl\u00f4tur\u00e9';

const ALLOWED_TRANSITIONS = {
  [STATUT_ASSIGNE]: [STATUT_EN_COURS],
  [STATUT_EN_COURS]: [STATUT_EN_ATTENTE, STATUT_RESOLU],
  [STATUT_EN_ATTENTE]: [STATUT_EN_COURS],
  [STATUT_RESOLU]: [STATUT_CLOTURE],
};

const TICKET_DETAIL_SELECT = `
  SELECT t.id,
         t.reference,
         t.client_id,
         t.cree_par_id,
         t.technicien_id,
         t.titre,
         t.description,
         t.type_demande,
         t.priorite,
         t.statut,
         t.date_creation,
         t.date_resolution,
         t.date_cloture,
         c.nom_client,
         c.nom_contact AS client_contact,
         c.email AS client_email,
         c.telephone AS client_telephone,
         c.adresse AS client_adresse,
         c.user_id AS client_user_id,
         creator.nom AS cree_par_nom,
         creator.prenom AS cree_par_prenom,
         creator.role AS cree_par_role,
         tech.nom AS technicien_nom,
         tech.prenom AS technicien_prenom,
         tech.email AS technicien_email
  FROM tickets t
  JOIN clients c ON c.id = t.client_id
  JOIN users creator ON creator.id = t.cree_par_id
  LEFT JOIN users tech ON tech.id = t.technicien_id
`;

/**
 * Génère une référence unique atomique au format TES-AAAA-NNNN dans la transaction courante.
 */
const generateTicketReference = async (tx) => {
  const year = new Date().getFullYear();
  // Verrou consultatif transactionnel pour éviter toute collision en cas de créations simultanées
  await tx.query('SELECT pg_advisory_xact_lock(918273645)');

  const { rows } = await tx.query(
    `SELECT COALESCE(MAX(CAST(SPLIT_PART(reference, '-', 3) AS INTEGER)), 0) AS max_num
     FROM tickets
     WHERE reference LIKE $1`,
    [`TES-${year}-%`]
  );

  const nextNum = Number(rows[0].max_num) + 1;
  return `TES-${year}-${String(nextNum).padStart(4, '0')}`;
};

/**
 * Récupère un ticket et vérifie que l'utilisateur connecté a le droit d'y accéder.
 */
const assertTicketAccess = async (ticketId, currentUser, queryRunner = db) => {
  const { rows } = await queryRunner.query(`${TICKET_DETAIL_SELECT} WHERE t.id = $1`, [ticketId]);

  if (rows.length === 0) {
    throw new AppError('Ticket introuvable.', 404);
  }

  const ticket = rows[0];

  if (currentUser.role === 'technicien' && ticket.technicien_id !== currentUser.id) {
    throw new AppError('Accès refusé. Ce ticket ne vous est pas affecté.', 403);
  }

  if (currentUser.role === 'client' && ticket.client_user_id !== currentUser.id) {
    throw new AppError('Accès refusé. Vous ne pouvez consulter que vos propres tickets.', 403);
  }

  return ticket;
};

const listTickets = async (filters = {}, currentUser) => {
  const conditions = [];
  const params = [];

  if (currentUser.role === 'technicien') {
    params.push(currentUser.id);
    conditions.push(`t.technicien_id = $${params.length}`);
  } else if (currentUser.role === 'client') {
    params.push(currentUser.id);
    conditions.push(`c.user_id = $${params.length}`);
  }

  if (filters.search && filters.search.trim()) {
    params.push(`%${filters.search.trim()}%`);
    conditions.push(`(t.reference ILIKE $${params.length} OR t.titre ILIKE $${params.length})`);
  }

  if (filters.statut) {
    params.push(filters.statut);
    conditions.push(`t.statut = $${params.length}`);
  }

  if (filters.priorite) {
    params.push(filters.priorite);
    conditions.push(`t.priorite = $${params.length}`);
  }

  if (filters.type_demande) {
    params.push(filters.type_demande);
    conditions.push(`t.type_demande = $${params.length}`);
  }

  if (filters.client_id && (currentUser.role === 'admin' || currentUser.role === 'employe')) {
    params.push(Number(filters.client_id));
    conditions.push(`t.client_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `${TICKET_DETAIL_SELECT}
     ${whereClause}
     ORDER BY t.date_creation DESC, t.id DESC`,
    params
  );

  return rows;
};

const getTicketById = async (id, currentUser) => {
  return assertTicketAccess(id, currentUser);
};

const createTicket = async (payload, currentUser) => {
  if (currentUser.role === 'technicien') {
    throw new AppError('Un technicien ne peut pas créer de ticket.', 403);
  }

  return db.withTransaction(async (tx) => {
    let clientId = payload.client_id;

    if (currentUser.role === 'client') {
      const clientRes = await tx.query('SELECT id FROM clients WHERE user_id = $1', [
        currentUser.id,
      ]);
      if (clientRes.rows.length === 0) {
        throw new AppError('Aucune fiche client associée à votre compte.', 400);
      }
      clientId = clientRes.rows[0].id;
    } else {
      const clientExists = await tx.query('SELECT id FROM clients WHERE id = $1', [clientId]);
      if (clientExists.rows.length === 0) {
        throw new AppError('Client introuvable.', 404);
      }
    }

    const reference = await generateTicketReference(tx);

    const inserted = await tx.query(
      `INSERT INTO tickets (reference, client_id, cree_par_id, technicien_id, titre, description, type_demande, priorite, statut)
       VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        reference,
        clientId,
        currentUser.id,
        payload.titre,
        payload.description,
        payload.type_demande,
        payload.priorite,
        STATUT_NOUVEAU,
      ]
    );

    const ticketId = inserted.rows[0].id;

    await tx.query(
      `INSERT INTO historique_tickets (ticket_id, user_id, action, nouveau_statut, commentaire)
       VALUES ($1, $2, 'creation', 'Nouveau', $3)`,
      [ticketId, currentUser.id, 'Création du ticket']
    );

    const fullTicket = await tx.query(`${TICKET_DETAIL_SELECT} WHERE t.id = $1`, [ticketId]);
    return fullTicket.rows[0];
  });
};

const updateTicket = async (id, payload, currentUser) => {
  if (currentUser.role === 'technicien') {
    throw new AppError('Un technicien ne peut pas modifier les informations du ticket.', 403);
  }

  const ticket = await assertTicketAccess(id, currentUser);

  if (ticket.statut === STATUT_CLOTURE) {
    throw new AppError('Un ticket clôturé reste consultable mais ne peut plus être modifié.', 409);
  }

  if (currentUser.role === 'client') {
    if (ticket.statut !== 'Nouveau') {
      throw new AppError(
        'Vous ne pouvez modifier le titre et la description que lorsque le ticket est au statut Nouveau.',
        409
      );
    }

    await db.query(
      `UPDATE tickets
       SET titre = $1,
           description = $2
       WHERE id = $3`,
      [payload.titre, payload.description, id]
    );
  } else {
    await db.query(
      `UPDATE tickets
       SET titre = $1,
           description = $2,
           type_demande = $3,
           priorite = $4
       WHERE id = $5`,
      [payload.titre, payload.description, payload.type_demande, payload.priorite, id]
    );
  }

  return assertTicketAccess(id, currentUser);
};

const assignTicket = async (id, { technicien_id, commentaire }, currentUser) => {
  return db.withTransaction(async (tx) => {
    const ticketRes = await tx.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (ticketRes.rows.length === 0) {
      throw new AppError('Ticket introuvable.', 404);
    }

    const ticket = ticketRes.rows[0];
    if (ticket.statut === STATUT_CLOTURE) {
      throw new AppError('Impossible d\'affecter un ticket clôturé.', 409);
    }

    const techRes = await tx.query(
      'SELECT id, nom, prenom, role, actif FROM users WHERE id = $1',
      [technicien_id]
    );
    if (techRes.rows.length === 0) {
      throw new AppError('Technicien introuvable.', 404);
    }

    const tech = techRes.rows[0];
    if (tech.role !== 'technicien' || !tech.actif) {
      throw new AppError(
        'Seul un utilisateur actif ayant le rôle technicien peut être affecté à un ticket.',
        400
      );
    }

    const ancienStatut = ticket.statut;
    const nouveauStatut = ancienStatut === STATUT_NOUVEAU ? STATUT_ASSIGNE : ancienStatut;
    const ancienTechId = ticket.technicien_id;

    await tx.query(
      `UPDATE tickets
       SET technicien_id = $1,
           statut = $2
       WHERE id = $3`,
      [technicien_id, nouveauStatut, id]
    );

    const defaultComment = ancienTechId
      ? `Réaffectation au technicien ${tech.prenom} ${tech.nom}`
      : `Affectation initiale au technicien ${tech.prenom} ${tech.nom}`;

    await tx.query(
      `INSERT INTO historique_tickets (
         ticket_id,
         user_id,
         action,
         ancien_statut,
         nouveau_statut,
         ancien_technicien_id,
         nouveau_technicien_id,
         commentaire
       )
       VALUES ($1, $2, 'affectation', $3, $4, $5, $6, $7)`,
      [
        id,
        currentUser.id,
        ancienStatut,
        nouveauStatut,
        ancienTechId,
        technicien_id,
        commentaire || defaultComment,
      ]
    );

    const fullTicket = await tx.query(`${TICKET_DETAIL_SELECT} WHERE t.id = $1`, [id]);
    return fullTicket.rows[0];
  });
};

/**
 * Applique une transition de statut validée et journalise l'historique dans la même transaction.
 */
const changeTicketStatus = async (id, { statut, commentaire }, currentUser) => {
  return db.withTransaction(async (tx) => {
    const ticketRes = await tx.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (ticketRes.rows.length === 0) {
      throw new AppError('Ticket introuvable.', 404);
    }

    const ticket = ticketRes.rows[0];

    if (currentUser.role === 'technicien' && ticket.technicien_id !== currentUser.id) {
      throw new AppError('Accès refusé. Ce ticket ne vous est pas affecté.', 403);
    }

    if (ticket.statut === STATUT_CLOTURE) {
      throw new AppError('Un ticket clôturé ne peut plus être modifié.', 409);
    }

    if (statut === STATUT_CLOTURE && currentUser.role === 'technicien') {
      throw new AppError('Un technicien ne peut pas clôturer un ticket.', 403);
    }

    if (ticket.statut === STATUT_NOUVEAU && statut === STATUT_ASSIGNE) {
      throw new AppError(
        'Le passage au statut Assigné s\'effectue uniquement lors de l\'affectation d\'un technicien.',
        409
      );
    }

    const allowedNext = ALLOWED_TRANSITIONS[ticket.statut] || [];
    if (!allowedNext.includes(statut)) {
      throw new AppError(
        `Transition de statut interdite : "${ticket.statut}" vers "${statut}".`,
        409
      );
    }

    if (statut !== STATUT_NOUVEAU && !ticket.technicien_id) {
      throw new AppError('Un technicien doit être affecté avant de changer le statut.', 409);
    }

    await tx.query('UPDATE tickets SET statut = $1 WHERE id = $2', [statut, id]);

    if (statut === STATUT_RESOLU) {
      await tx.query('UPDATE tickets SET date_resolution = NOW() WHERE id = $1', [id]);
    }
    if (statut === STATUT_CLOTURE) {
      await tx.query('UPDATE tickets SET date_cloture = NOW() WHERE id = $1', [id]);
    }

    await tx.query(
      `INSERT INTO historique_tickets (
         ticket_id,
         user_id,
         action,
         ancien_statut,
         nouveau_statut,
         commentaire
       )
       VALUES ($1, $2, 'changement_statut', $3, $4, $5)`,
      [id, currentUser.id, ticket.statut, statut, commentaire || null]
    );

    const fullTicket = await tx.query(`${TICKET_DETAIL_SELECT} WHERE t.id = $1`, [id]);
    return fullTicket.rows[0];
  });
};

const closeTicket = async (id, { commentaire }, currentUser) => {
  return changeTicketStatus(id, { statut: STATUT_CLOTURE, commentaire }, currentUser);
};

const getTicketHistory = async (ticketId, currentUser) => {
  await assertTicketAccess(ticketId, currentUser);

  const { rows } = await db.query(
    `SELECT h.id,
            h.ticket_id,
            h.user_id,
            h.action,
            h.ancien_statut,
            h.nouveau_statut,
            h.ancien_technicien_id,
            h.nouveau_technicien_id,
            h.commentaire,
            h.created_at,
            actor.nom AS auteur_nom,
            actor.prenom AS auteur_prenom,
            actor.role AS auteur_role,
            old_tech.nom AS ancien_technicien_nom,
            old_tech.prenom AS ancien_technicien_prenom,
            new_tech.nom AS nouveau_technicien_nom,
            new_tech.prenom AS nouveau_technicien_prenom
     FROM historique_tickets h
     JOIN users actor ON actor.id = h.user_id
     LEFT JOIN users old_tech ON old_tech.id = h.ancien_technicien_id
     LEFT JOIN users new_tech ON new_tech.id = h.nouveau_technicien_id
     WHERE h.ticket_id = $1
     ORDER BY h.created_at ASC, h.id ASC`,
    [ticketId]
  );

  return rows;
};

module.exports = {
  STATUT_NOUVEAU,
  STATUT_ASSIGNE,
  STATUT_EN_COURS,
  STATUT_EN_ATTENTE,
  STATUT_RESOLU,
  STATUT_CLOTURE,
  assertTicketAccess,
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  changeTicketStatus,
  closeTicket,
  getTicketHistory,
};
