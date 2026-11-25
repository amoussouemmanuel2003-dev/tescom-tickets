require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcrypt');
const db = require('../src/config/db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });

/**
 * Lit un mot de passe depuis le terminal en masquant les caractères saisis si TTY.
 */
const askHidden = (question) =>
  new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      rl.question(question, (answer) => resolve(answer));
      return;
    }

    const stdin = process.stdin;
    const onData = (char) => {
      const str = char.toString('utf8');
      switch (str) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(question + '*'.repeat(rl.line.length));
          break;
      }
    };

    stdin.on('data', onData);
    rl.question(question, (value) => {
      stdin.removeListener('data', onData);
      resolve(value);
    });
  });

async function main() {
  console.log('\n=== TESCOM-CI : Création du compte Administrateur ===\n');

  if (!process.env.DATABASE_URL) {
    console.error('Erreur : DATABASE_URL doit être configurée dans backend/.env.');
    process.exitCode = 1;
    rl.close();
    return;
  }

  try {
    const nom = await ask('Nom : ');
    const prenom = await ask('Prénom : ');
    const emailInput = await ask('Email : ');
    const telephone = await ask('Téléphone (optionnel) : ');
    const motDePasse = await askHidden('Mot de passe (min. 8 caractères) : ');
    console.log('');

    const email = emailInput.toLowerCase();

    if (!nom || !prenom || !email) {
      throw new Error('Les champs nom, prénom et email sont obligatoires.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Format d\'email invalide.');
    }

    if (!motDePasse || motDePasse.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new Error('Un utilisateur avec cet email existe déjà.');
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const { rows } = await db.query(
      `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role, actif)
       VALUES ($1, $2, $3, $4, $5, 'admin', TRUE)
       RETURNING id, nom, prenom, email, role, actif, created_at`,
      [nom, prenom, email, telephone || null, hashedPassword]
    );

    const admin = rows[0];
    console.log('\nCompte administrateur créé avec succès :');
    console.log(`- ID    : ${admin.id}`);
    console.log(`- Nom   : ${admin.prenom} ${admin.nom}`);
    console.log(`- Email : ${admin.email}`);
    console.log(`- Rôle  : ${admin.role}`);
    console.log(`- Actif : ${admin.actif}\n`);
  } catch (err) {
    console.error(`\nÉchec : ${err.message}\n`);
    process.exitCode = 1;
  } finally {
    rl.close();
    await db.pool.end();
  }
}

main();
