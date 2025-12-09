-- ============================================================================
-- FantasyRealm Character Manager - Database Schema
-- PostgreSQL 15+
-- ============================================================================

-- ============================================================================
-- TABLE: role
-- User roles for authorization (user, employee, admin)
-- ============================================================================
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================================
-- TABLE: user
-- Registered users of the application
-- ============================================================================
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    role_id INTEGER NOT NULL REFERENCES role(id)
);

CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_pseudo ON "user"(pseudo);

-- ============================================================================
-- TABLE: character
-- Player characters created by users
-- ============================================================================
CREATE TABLE character (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female')),
    skin_color VARCHAR(7) NOT NULL,
    eye_color VARCHAR(7) NOT NULL,
    hair_color VARCHAR(7) NOT NULL,
    eye_shape VARCHAR(50) NOT NULL,
    nose_shape VARCHAR(50) NOT NULL,
    mouth_shape VARCHAR(50) NOT NULL,
    image TEXT,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    is_authorized BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

    CONSTRAINT uq_character_name_per_user UNIQUE (name, user_id)
);

CREATE INDEX idx_character_user_id ON character(user_id);

-- ============================================================================
-- TABLE: article
-- Customization items (clothing, armor, weapons, accessories)
-- ============================================================================
CREATE TABLE article (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('clothing', 'armor', 'weapon', 'accessory')),
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_article_type ON article(type);
CREATE INDEX idx_article_is_active ON article(is_active);

-- ============================================================================
-- TABLE: character_article
-- Many-to-many relationship between characters and equipped articles
-- ============================================================================
CREATE TABLE character_article (
    character_id INTEGER NOT NULL REFERENCES character(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES article(id) ON DELETE CASCADE,

    PRIMARY KEY (character_id, article_id)
);

-- ============================================================================
-- TABLE: comment
-- User reviews on shared characters
-- ============================================================================
CREATE TABLE comment (
    id SERIAL PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    commented_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    character_id INTEGER NOT NULL REFERENCES character(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

    CONSTRAINT uq_one_comment_per_user_per_character UNIQUE (character_id, author_id)
);

CREATE INDEX idx_comment_character_id ON comment(character_id);
CREATE INDEX idx_comment_author_id ON comment(author_id);
CREATE INDEX idx_comment_status ON comment(status);
