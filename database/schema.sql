-- ============================================================================
-- TESCOM-CI - Script de création de la base de données PostgreSQL (Neon)
-- Exactement 5 tables : users, clients, tickets, messages, historique_tickets
-- ============================================================================

-- 1. Table des utilisateurs (4 rôles : admin, employe, technicien, client)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'employe', 'technicien', 'client'))
);

-- 2. Table des clients (liée optionnellement à un compte utilisateur)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    nom_client VARCHAR(150) NOT NULL,
    nom_contact VARCHAR(150),
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table des tickets d'assistance
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(40) NOT NULL UNIQUE,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    cree_par_id INTEGER NOT NULL REFERENCES users(id),
    technicien_id INTEGER REFERENCES users(id),
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type_demande VARCHAR(30) NOT NULL,
    priorite VARCHAR(20) NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'Nouveau',
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_resolution TIMESTAMPTZ,
    date_cloture TIMESTAMPTZ,
    CONSTRAINT chk_ticket_type CHECK (
        type_demande IN (
            'incident',
            'maintenance',
            'installation',
            'reclamation',
            'information',
            'autre'
        )
    ),
    CONSTRAINT chk_ticket_priorite CHECK (
        priorite IN ('faible', 'moyenne', 'haute', 'urgente')
    ),
    CONSTRAINT chk_ticket_statut CHECK (
        statut IN (
            'Nouveau',
            'Assigné',
            'En cours',
            'En attente client',
            'Résolu',
            'Clôturé'
        )
    )
);

-- 4. Table des messages (publics et notes internes)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    contenu TEXT NOT NULL,
    interne BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_message_contenu CHECK (LENGTH(TRIM(contenu)) > 0)
);

-- 5. Table d'historique des actions sur les tickets (journal immuable)
CREATE TABLE IF NOT EXISTS historique_tickets (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(30) NOT NULL,
    ancien_statut VARCHAR(30),
    nouveau_statut VARCHAR(30),
    ancien_technicien_id INTEGER REFERENCES users(id),
    nouveau_technicien_id INTEGER REFERENCES users(id),
    commentaire TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_historique_action CHECK (
        action IN ('creation', 'changement_statut', 'affectation')
    )
);

-- Index utiles pour les performances de recherche et filtrage
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_technicien_id ON tickets(technicien_id);
CREATE INDEX IF NOT EXISTS idx_tickets_statut ON tickets(statut);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_historique_ticket_id ON historique_tickets(ticket_id);
