require('dotenv').config();
const db = require('../src/config/db');

async function test() {
  try {
    const tables = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Tables existantes:', tables.rows.map(r => r.table_name).join(', '));

    const tickets = await db.query('SELECT id, statut, technicien_id FROM tickets LIMIT 3');
    console.log('Tickets:', JSON.stringify(tickets.rows));

    if (tickets.rows.length > 0) {
      const ticketId = tickets.rows[0].id;
      const statut = tickets.rows[0].statut;
      const techId = tickets.rows[0].technicien_id;
      console.log('Test changement statut pour ticket', ticketId, '/ statut actuel:', statut, '/ technicien_id:', techId);

      const ALLOWED = {
        'Assigne': ['En cours'],
        'Assign\u00e9': ['En cours'],
        'En cours': ['En attente client', 'R\u00e9solu'],
        'En attente client': ['En cours'],
        'R\u00e9solu': ['Cl\u00f4tur\u00e9'],
      };
      console.log('Transitions autorisees depuis', statut, ':', ALLOWED[statut] || 'aucune');
    }

    const hist = await db.query('SELECT COUNT(*) as n FROM historique_tickets');
    console.log('Historique count:', hist.rows[0].n);

  } catch (e) {
    console.error('ERREUR DB:', e.message, '| code:', e.code);
  } finally {
    await db.pool.end();
  }
}

test();
