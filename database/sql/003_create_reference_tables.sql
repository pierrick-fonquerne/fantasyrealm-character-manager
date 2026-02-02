-- ============================================================================
-- Migration: Create game reference tables (character classes & equipment slots)
-- ============================================================================

-- Character classes reference table
CREATE TABLE character_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255),
    CONSTRAINT uq_character_classes_name UNIQUE (name)
);

-- Equipment slots reference table
CREATE TABLE equipment_slots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    display_order INT NOT NULL,
    CONSTRAINT uq_equipment_slots_name UNIQUE (name)
);

-- Seed character classes (4 classes)
INSERT INTO character_classes (name, description) VALUES
    ('Guerrier', 'Un combattant robuste qui excelle au corps à corps et peut porter des armures lourdes.'),
    ('Mage', 'Un puissant lanceur de sorts qui manie la magie des arcanes mais porte des armures légères.'),
    ('Archer', 'Un combattant à distance agile doté d''une précision mortelle et d''une armure intermédiaire.'),
    ('Voleur', 'Un assassin furtif qui frappe depuis les ombres avec des attaques rapides.');

-- Seed equipment slots (14 slots, WoW-inspired)
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
