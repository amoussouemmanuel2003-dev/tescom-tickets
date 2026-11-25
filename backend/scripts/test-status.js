require('dotenv').config();
const db = require('../src/config/db');

const STATUT_RESOLU  = 'R\u00e9solu';
const STATUT_CLOTURE = 'Cl\u00f4tur\u00e9';

async function test() {
  try {
    // Simule exactement ce que fait changeTicketStatus
    const ticketRes = await db.query('SELECT id, statut, technicien_id FROM tickets WHERE id = 1');
    const ticket = ticketRes.rows[0];
    console.log('Ticket avant:', ticket);

    // Test UPDATE avec paramètres pour date_resolution / date_cloture
    await db.query('UPDATE tickets SET statut = $1 WHERE id = $2', ['En cours', 1]);
    if ('En cours' === STATUT_RESOLU) await db.query('UPDATE tickets SET date_resolution = NOW() WHERE id = $1', [1]);
    if ('En cours' === STATUT_CLOTURE) await db.query('UPDATE tickets SET date_cloture = NOW() WHERE id = $1', [1]);

    const after = await db.query('SELECT id, statut, date_resolution FROM tickets WHERE id = 1');
    console.log('Ticket apres:', after.rows[0]);

    // Remet à Assigné pour ne pas casser les données
    await db.query("UPDATE tickets SET statut = 'Assign\u00e9' WHERE id = 1");
    console.log('Restaure statut Assigné OK');

  } catch (e) {
    console.error('ERREUR:', e.message, e.code);
  } finally {
    await db.pool.end();
  }
}

test();
