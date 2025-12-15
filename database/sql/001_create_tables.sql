-- ============================================================================
-- FantasyRealm Online Character Manager - Database Schema
-- PostgreSQL 18+
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
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    role_id INTEGER NOT NULL REFERENCES role(id)
);

CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_pseudo ON "user"(pseudo);
CREATE INDEX idx_user_role_id ON "user"(role_id);

-- ============================================================================
-- TABLE: character
-- Player characters created by users
-- ============================================================================
CREATE TABLE character (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    skin_color VARCHAR(50) NOT NULL,
    eye_color VARCHAR(50) NOT NULL,
    hair_color VARCHAR(50) NOT NULL,
    eye_shape VARCHAR(50) NOT NULL,
    nose_shape VARCHAR(50) NOT NULL,
    mouth_shape VARCHAR(50) NOT NULL,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    image BYTEA,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

    CONSTRAINT uq_character_name_per_user UNIQUE (name, user_id)
);

CREATE INDEX idx_character_user_id ON character(user_id);
CREATE INDEX idx_character_gallery ON character(is_shared, is_approved) WHERE is_shared = TRUE AND is_approved = TRUE;

-- ============================================================================
-- TABLE: article
-- Customization items (clothing, armor, weapons, accessories)
-- ============================================================================
CREATE TABLE article (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image BYTEA,
    type VARCHAR(50) NOT NULL
);

CREATE INDEX idx_article_type ON article(type);
CREATE INDEX idx_article_active_type ON article(type) WHERE is_active = TRUE;

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
    content VARCHAR(50) NOT NULL,
    comment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    character_id INTEGER NOT NULL REFERENCES character(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

    CONSTRAINT uq_one_comment_per_user_per_character UNIQUE (character_id, author_id)
);

CREATE INDEX idx_comment_character_id ON comment(character_id);
CREATE INDEX idx_comment_author_id ON comment(author_id);
CREATE INDEX idx_comment_pending ON comment(character_id) WHERE status = 'pending';
