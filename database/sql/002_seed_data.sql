-- ============================================================================
-- FantasyRealm Character Manager - Seed Data
-- PostgreSQL 15+
-- ============================================================================

-- ============================================================================
-- ROLES
-- ============================================================================
INSERT INTO role (label) VALUES
    ('user'),
    ('employee'),
    ('admin');

-- ============================================================================
-- ADMIN USER
-- Password: Admin123! (BCrypt hash)
-- ============================================================================
INSERT INTO "user" (pseudo, email, password_hash, role_id) VALUES
    ('admin', 'admin@fantasyrealm.com', '$2a$11$rBVcQ4z4.vYZ3mQlJXqKaeKxNJqX5vYxJqKqYQ5ZJ8z5X5X5X5X5q', (SELECT id FROM role WHERE label = 'admin'));

-- ============================================================================
-- EMPLOYEE USER (for testing moderation)
-- Password: Employee123!
-- ============================================================================
INSERT INTO "user" (pseudo, email, password_hash, role_id) VALUES
    ('moderator', 'moderator@fantasyrealm.com', '$2a$11$rBVcQ4z4.vYZ3mQlJXqKaeKxNJqX5vYxJqKqYQ5ZJ8z5X5X5X5X5q', (SELECT id FROM role WHERE label = 'employee'));

-- ============================================================================
-- TEST USERS
-- Password: Test123!
-- ============================================================================
INSERT INTO "user" (pseudo, email, password_hash, role_id) VALUES
    ('player_one', 'player1@test.com', '$2a$11$rBVcQ4z4.vYZ3mQlJXqKaeKxNJqX5vYxJqKqYQ5ZJ8z5X5X5X5X5q', (SELECT id FROM role WHERE label = 'user')),
    ('dragon_slayer', 'player2@test.com', '$2a$11$rBVcQ4z4.vYZ3mQlJXqKaeKxNJqX5vYxJqKqYQ5ZJ8z5X5X5X5X5q', (SELECT id FROM role WHERE label = 'user')),
    ('mystic_mage', 'player3@test.com', '$2a$11$rBVcQ4z4.vYZ3mQlJXqKaeKxNJqX5vYxJqKqYQ5ZJ8z5X5X5X5X5q', (SELECT id FROM role WHERE label = 'user'));

-- ============================================================================
-- ARTICLES - Clothing
-- ============================================================================
INSERT INTO article (name, type, image) VALUES
    ('Apprentice Robe', 'clothing', NULL),
    ('Leather Tunic', 'clothing', NULL),
    ('Noble Vest', 'clothing', NULL),
    ('Traveler Cloak', 'clothing', NULL),
    ('Silk Dress', 'clothing', NULL);

-- ============================================================================
-- ARTICLES - Armor
-- ============================================================================
INSERT INTO article (name, type, image) VALUES
    ('Iron Chestplate', 'armor', NULL),
    ('Steel Helmet', 'armor', NULL),
    ('Dragon Scale Armor', 'armor', NULL),
    ('Mithril Chainmail', 'armor', NULL),
    ('Guardian Shield', 'armor', NULL);

-- ============================================================================
-- ARTICLES - Weapons
-- ============================================================================
INSERT INTO article (name, type, image) VALUES
    ('Iron Sword', 'weapon', NULL),
    ('Oak Staff', 'weapon', NULL),
    ('Elven Bow', 'weapon', NULL),
    ('Battle Axe', 'weapon', NULL),
    ('Enchanted Dagger', 'weapon', NULL);

-- ============================================================================
-- ARTICLES - Accessories
-- ============================================================================
INSERT INTO article (name, type, image) VALUES
    ('Ruby Amulet', 'accessory', NULL),
    ('Silver Ring', 'accessory', NULL),
    ('Leather Belt', 'accessory', NULL),
    ('Explorer Backpack', 'accessory', NULL),
    ('Golden Crown', 'accessory', NULL);

-- ============================================================================
-- TEST CHARACTERS (authorized and shared for gallery demo)
-- ============================================================================
INSERT INTO character (name, gender, skin_color, eye_color, hair_color, eye_shape, nose_shape, mouth_shape, is_shared, is_authorized, user_id) VALUES
    ('Thorin', 'male', '#E8BEAC', '#4A90D9', '#2C1810', 'almond', 'aquiline', 'thin', TRUE, TRUE, (SELECT id FROM "user" WHERE pseudo = 'player_one')),
    ('Elara', 'female', '#F5DEB3', '#50C878', '#FFD700', 'round', 'straight', 'full', TRUE, TRUE, (SELECT id FROM "user" WHERE pseudo = 'dragon_slayer')),
    ('Zephyr', 'male', '#8D5524', '#8B4513', '#000000', 'narrow', 'wide', 'medium', TRUE, TRUE, (SELECT id FROM "user" WHERE pseudo = 'mystic_mage'));

-- ============================================================================
-- TEST CHARACTER (pending moderation)
-- ============================================================================
INSERT INTO character (name, gender, skin_color, eye_color, hair_color, eye_shape, nose_shape, mouth_shape, is_shared, is_authorized, user_id) VALUES
    ('Shadow', 'male', '#3D2314', '#FF0000', '#1C1C1C', 'narrow', 'pointed', 'thin', FALSE, FALSE, (SELECT id FROM "user" WHERE pseudo = 'player_one'));

-- ============================================================================
-- EQUIP ARTICLES TO CHARACTERS
-- ============================================================================
INSERT INTO character_article (character_id, article_id) VALUES
    ((SELECT id FROM character WHERE name = 'Thorin'), (SELECT id FROM article WHERE name = 'Iron Chestplate')),
    ((SELECT id FROM character WHERE name = 'Thorin'), (SELECT id FROM article WHERE name = 'Iron Sword')),
    ((SELECT id FROM character WHERE name = 'Thorin'), (SELECT id FROM article WHERE name = 'Leather Belt')),
    ((SELECT id FROM character WHERE name = 'Elara'), (SELECT id FROM article WHERE name = 'Silk Dress')),
    ((SELECT id FROM character WHERE name = 'Elara'), (SELECT id FROM article WHERE name = 'Elven Bow')),
    ((SELECT id FROM character WHERE name = 'Elara'), (SELECT id FROM article WHERE name = 'Ruby Amulet')),
    ((SELECT id FROM character WHERE name = 'Zephyr'), (SELECT id FROM article WHERE name = 'Apprentice Robe')),
    ((SELECT id FROM character WHERE name = 'Zephyr'), (SELECT id FROM article WHERE name = 'Oak Staff')),
    ((SELECT id FROM character WHERE name = 'Zephyr'), (SELECT id FROM article WHERE name = 'Silver Ring'));

-- ============================================================================
-- TEST COMMENTS (approved)
-- ============================================================================
INSERT INTO comment (rating, text, status, character_id, author_id) VALUES
    (5, 'Amazing warrior design! Love the armor combo.', 'approved', (SELECT id FROM character WHERE name = 'Thorin'), (SELECT id FROM "user" WHERE pseudo = 'dragon_slayer')),
    (4, 'Beautiful elven character, very elegant!', 'approved', (SELECT id FROM character WHERE name = 'Elara'), (SELECT id FROM "user" WHERE pseudo = 'player_one')),
    (5, 'The mage aesthetic is perfect!', 'approved', (SELECT id FROM character WHERE name = 'Zephyr'), (SELECT id FROM "user" WHERE pseudo = 'dragon_slayer'));

-- ============================================================================
-- TEST COMMENT (pending moderation)
-- ============================================================================
INSERT INTO comment (rating, text, status, character_id, author_id) VALUES
    (3, 'Nice but could use more accessories.', 'pending', (SELECT id FROM character WHERE name = 'Thorin'), (SELECT id FROM "user" WHERE pseudo = 'mystic_mage'));
