-- ============================================================================
-- FantasyRealm Online Character Manager - Database Schema
-- PostgreSQL 18+
-- ============================================================================

-- ============================================================================
-- TABLE: roles
-- User roles for authorization (user, employee, admin)
-- ============================================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE
);

-- Seed default roles
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
    role_id INTEGER NOT NULL REFERENCES roles(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_pseudo ON users(pseudo);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ============================================================================
-- TABLE: characters
-- Player characters created by users
-- ============================================================================
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    skin_color VARCHAR(7) NOT NULL,
    eye_color VARCHAR(7) NOT NULL,
    hair_color VARCHAR(7) NOT NULL,
    eye_shape VARCHAR(50) NOT NULL,
    nose_shape VARCHAR(50) NOT NULL,
    mouth_shape VARCHAR(50) NOT NULL,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    is_authorized BOOLEAN NOT NULL DEFAULT FALSE,
    image BYTEA,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT uq_characters_name_per_user UNIQUE (name, user_id)
);

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_gallery ON characters(is_shared, is_authorized) WHERE is_shared = TRUE AND is_authorized = TRUE;

-- ============================================================================
-- TABLE: articles
-- Customization items (clothing, armor, weapons, accessories)
-- ============================================================================
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image BYTEA,
    type VARCHAR(20) NOT NULL
);

CREATE INDEX idx_articles_type ON articles(type);
CREATE INDEX idx_articles_active_type ON articles(type) WHERE is_active = TRUE;

-- ============================================================================
-- TABLE: character_articles
-- Many-to-many relationship between characters and equipped articles
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
    commented_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT uq_comments_one_per_user_per_character UNIQUE (character_id, author_id)
);

CREATE INDEX idx_comments_character_id ON comments(character_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_pending ON comments(character_id) WHERE status = 'pending';
