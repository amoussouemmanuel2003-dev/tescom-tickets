# TESCOM-CI — Application de Gestion des Tickets d'Assistance

Application web complète développée dans le cadre d'un projet de stage de BTS pour **TESCOM-CI**, permettant de gérer les clients, les tickets d'assistance, l'affectation aux techniciens, le suivi des échanges (publics et internes) et l'historique immuable des actions.

---

## 1. Architecture et technologies

- **Frontend** : Vue.js 3 (Composition API + `<script setup>`), Vite, Tailwind CSS, Vue Router, Pinia, Axios.
- **Backend** : Node.js, Express.js, PostgreSQL (`pg`), `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`.
- **Base de données** : PostgreSQL hébergée sur **Neon** (exactement 5 tables : `users`, `clients`, `tickets`, `messages`, `historique_tickets`).

---

## 2. Structure du projet

```text
tescom-tickets/
├── database/
│   └── schema.sql            # Script SQL des 5 tables et index
├── backend/
│   ├── scripts/
│   │   └── create-admin.js   # Script CLI manuel pour créer un admin
│   ├── src/
│   │   ├── config/db.js      # Pool PostgreSQL/Neon et helper de transaction
│   │   ├── middleware/       # auth.js, authorize.js, errorHandler.js
│   │   ├── routes/           # Routes REST /api/v1
│   │   ├── controllers/      # Contrôleurs Express
│   │   ├── services/         # Logique métier et requêtes SQL paramétrées
│   │   ├── validators/       # Validation stricte des entrées
│   │   ├── utils/            # AppError, apiResponse, asyncHandler
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── utils/
│   │   ├── views/
│   │   ├── App.vue
│   │   └── main.js
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 3. Installation et démarrage

### Étape 1 : Créer les tables sur PostgreSQL (Neon)

Exécutez le contenu du fichier `database/schema.sql` dans l'éditeur SQL de votre projet Neon (ou via `psql` sur une base de développement).

> **Sécurité** : Ne stockez jamais votre chaîne `DATABASE_URL` réelle dans le code source ou dans `.env.example`.

### Étape 2 : Configurer et démarrer le Backend

```bash
cd backend
npm install
cp .env.example .env
```

Renseignez ensuite `backend/.env` avec vos propres valeurs :

```env
PORT=5000
DATABASE_URL=postgresql://utilisateur:mot_de_passe@hote_neon/base_de_donnees?sslmode=require
JWT_SECRET=votre_cle_secrete_longue_et_aleatoire
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

Créer le premier compte **Administrateur** (en local/développement uniquement) :

```bash
npm run create-admin
```

Démarrer le serveur API :

```bash
npm run dev
```

L'API est disponible sur `http://localhost:5000/api/v1` (test de santé : `GET /api/v1/health`).

### Étape 3 : Configurer et démarrer le Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'interface web est accessible sur `http://localhost:5173`.

---

## 4. Rôles et règles métier implémentées

| Rôle | Droits principaux |
|---|---|
| `admin` | Gère les utilisateurs et rôles, gère les clients, voit tous les tickets, affecte/réaffecte, change les statuts, clôture, consulte les statistiques globales. |
| `employe` | Gère les clients, crée des tickets pour les clients, voit tous les tickets, affecte/réaffecte, change les statuts, clôture. |
| `technicien` | Consulte uniquement les tickets qui lui sont affectés, ajoute des messages/notes internes, fait évoluer le traitement (`Assigné` → `En cours` ⇄ `En attente client` → `Résolu`). Ne peut pas clôturer ni affecter. |
| `client` | S'inscrit, crée ses tickets, consulte uniquement ses tickets et ses messages publics, peut modifier titre/description tant que le ticket est `Nouveau`. |

### Cycle de vie des tickets

```text
Nouveau → Assigné → En cours → Résolu → Clôturé
                      ⇅
              En attente client
```

- La création d'un ticket génère automatiquement une référence unique `TES-AAAA-NNNN` et une entrée `creation` dans `historique_tickets`.
- La première affectation fait passer le ticket de `Nouveau` à `Assigné`.
- Toute réaffectation conserve le statut courant et enregistre l'ancien et le nouveau technicien dans `historique_tickets`.
- Un ticket `Clôturé` reste consultable mais ne peut plus être modifié.

---

## 5. Endpoints API REST (`/api/v1`)

- **Auth** : `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/me`
- **Utilisateurs** : `GET /users/techniciens`, `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `PUT /users/:id/status`
- **Clients** : `GET /clients`, `GET /clients/:id`, `POST /clients`, `PUT /clients/:id`, `PUT /clients/:id/status`
- **Tickets** : `GET /tickets`, `GET /tickets/:id`, `POST /tickets`, `PUT /tickets/:id`, `PUT /tickets/:id/assign`, `PUT /tickets/:id/status`, `PUT /tickets/:id/close`
- **Messages & Historique** : `GET /tickets/:ticketId/messages`, `POST /tickets/:ticketId/messages`, `GET /tickets/:ticketId/historique`
- **Tableau de bord** : `GET /dashboard/stats`
