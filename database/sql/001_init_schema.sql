BEGIN;

-- ============================================================================
-- TABLE: roles
-- User roles for authorization (User, Employee, Admin)
-- ============================================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (label) VALUES ('User'), ('Employee'), ('Admin');

-- ============================================================================
-- TABLE: users
-- Registered users of the application
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_pseudo ON users(pseudo);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: character_classes
-- Game character classes (Guerrier, Mage, Archer, Voleur)
-- ============================================================================
CREATE TABLE character_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255),
    CONSTRAINT uq_character_classes_name UNIQUE (name)
);

INSERT INTO character_classes (name, description) VALUES
    ('Guerrier', 'Un combattant robuste qui excelle au corps à corps et peut porter des armures lourdes.'),
    ('Mage', 'Un puissant lanceur de sorts qui manie la magie des arcanes mais porte des armures légères.'),
    ('Archer', 'Un combattant à distance agile doté d''une précision mortelle et d''une armure intermédiaire.'),
    ('Voleur', 'Un assassin furtif qui frappe depuis les ombres avec des attaques rapides.');

-- ============================================================================
-- TABLE: equipment_slots
-- Equipment slot positions (14 slots, WoW-inspired)
-- ============================================================================
CREATE TABLE equipment_slots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    display_order INT NOT NULL,
    CONSTRAINT uq_equipment_slots_name UNIQUE (name)
);

INSERT INTO equipment_slots (name, display_order) VALUES
    ('Tête', 1),
    ('Épaules', 2),
    ('Dos', 3),
    ('Torse', 4),
    ('Poignets', 5),
    ('Mains', 6),
    ('Taille', 7),
    ('Jambes', 8),
    ('Pieds', 9),
    ('Cou', 10),
    ('Anneau 1', 11),
    ('Anneau 2', 12),
    ('Main droite', 13),
    ('Main gauche', 14);

-- ============================================================================
-- TABLE: characters
-- Player characters created by users
-- ============================================================================
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    class_id INTEGER NOT NULL REFERENCES character_classes(id) ON DELETE RESTRICT,
    gender VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    skin_color VARCHAR(7) NOT NULL,
    eye_color VARCHAR(7) NOT NULL,
    hair_color VARCHAR(7) NOT NULL,
    hair_style VARCHAR(50) NOT NULL,
    eye_shape VARCHAR(50) NOT NULL,
    nose_shape VARCHAR(50) NOT NULL,
    mouth_shape VARCHAR(50) NOT NULL,
    face_shape VARCHAR(50) NOT NULL,
    image BYTEA,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT uq_characters_name_per_user UNIQUE (name, user_id)
);

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_status ON characters(status);
CREATE INDEX idx_characters_gallery ON characters(is_shared, status)
    WHERE is_shared = TRUE AND status = 'approved';

-- ============================================================================
-- TABLE: article_types
-- Reference table for article categories
-- ============================================================================
CREATE TABLE article_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO article_types (name) VALUES ('Clothing'), ('Armor'), ('Weapon'), ('Accessory');

-- ============================================================================
-- TABLE: articles
-- Customization items linked to a type and an equipment slot
-- ============================================================================
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type_id INTEGER NOT NULL REFERENCES article_types(id) ON DELETE RESTRICT,
    slot_id INTEGER NOT NULL REFERENCES equipment_slots(id) ON DELETE RESTRICT,
    image BYTEA,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_articles_type_id ON articles(type_id);
CREATE INDEX idx_articles_slot_id ON articles(slot_id);
CREATE INDEX idx_articles_active ON articles(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- TABLE: character_articles
-- Many-to-many: characters <-> equipped articles
-- ============================================================================
CREATE TABLE character_articles (
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

    PRIMARY KEY (character_id, article_id)
);

-- ============================================================================
-- TABLE: comments
-- User reviews on shared characters
-- ============================================================================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    commented_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rejection_reason VARCHAR(500),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT uq_comments_one_per_user_per_character UNIQUE (character_id, author_id)
);

CREATE INDEX idx_comments_character_id ON comments(character_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_reviewed_by ON comments(reviewed_by_id);
CREATE INDEX idx_comments_pending ON comments(character_id) WHERE status = 'pending';

COMMIT;
