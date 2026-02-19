BEGIN;

INSERT INTO users (pseudo, email, password_hash, is_suspended, must_change_password, role_id, created_at, updated_at)
VALUES
    -- -------------------------------------------------------------------------
    -- Admin (role_id=3)
    -- -------------------------------------------------------------------------
    ('Administrateur',   'admin@fantasy-realm.com',
     'gz+flIygdjE4OgCSJ+7i8MIiAdwZ4fGTwf2pASBiEsy6IBZiJZcCka1wXhq5Dzjy',
     FALSE, FALSE, 3, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),

    -- -------------------------------------------------------------------------
    -- Employees (role_id=2)
    -- -------------------------------------------------------------------------
    ('LunaVigil',        'marie.durand@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-01-20 09:00:00', '2025-01-20 09:00:00'),

    ('OrionGuard',       'thomas.bernard@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-01-22 14:30:00', '2025-01-22 14:30:00'),

    ('AuroreSentinelle', 'claire.martin@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-01-25 11:00:00', '2025-01-25 11:00:00'),

    ('VolcanWarden',     'julien.petit@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-02-01 08:00:00', '2025-02-01 08:00:00'),

    ('CristalKeeper',    'sophie.leroy@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-02-05 10:00:00', '2025-02-05 10:00:00'),

    ('OmbraPatrol',      'nicolas.moreau@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-02-10 09:30:00', '2025-02-10 09:30:00'),

    ('ZephyrMod',        'amelie.simon@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-02-15 13:00:00', '2025-02-15 13:00:00'),

    ('TempestWatch',     'pierre.fontaine@fantasy-realm.com',
     'NIdPlKb+2fVM6SrUYKIgd6wgJohkfVaRDtPo420FhKF52ytVUuk+0/c5WccSQ2tY',
     FALSE, FALSE, 2, '2025-02-20 08:00:00', '2025-02-20 08:00:00'),

    -- -------------------------------------------------------------------------
    -- Regular users (role_id=1)
    -- -------------------------------------------------------------------------
    ('DragonSlayer',     'user1@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-01 08:00:00', '2025-03-01 08:00:00'),

    ('ShadowMage',       'user2@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-03 12:15:00', '2025-03-03 12:15:00'),

    ('ElfeNoire',        'user3@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-05 16:45:00', '2025-03-05 16:45:00'),

    ('PaladinAuror',     'user4@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-08 09:30:00', '2025-03-08 09:30:00'),

    ('ArcherVert',       'user5@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-10 11:00:00', '2025-03-10 11:00:00'),

    ('NainForge',        'user6@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-12 14:00:00', '2025-03-12 14:00:00'),

    ('RuneMaster',       'user7@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-15 17:30:00', '2025-03-15 17:30:00'),

    -- Suspended user #1
    ('TrollDesMarais',   'user8@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     TRUE,  FALSE, 1, '2025-03-18 10:00:00', '2025-05-01 08:00:00'),

    ('GoblinRage',       'user9@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-20 13:00:00', '2025-03-20 13:00:00'),

    ('PhoenixFlame',     'user10@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-22 09:00:00', '2025-03-22 09:00:00'),

    ('LicorneSauvage',   'user11@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-25 15:00:00', '2025-03-25 15:00:00'),

    ('CorbeanNocturne',  'user12@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-03-28 11:30:00', '2025-03-28 11:30:00'),

    ('VipereArgent',     'user13@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-04-01 08:45:00', '2025-04-01 08:45:00'),

    ('LoupGrisonnant',   'user14@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-04-03 10:15:00', '2025-04-03 10:15:00'),

    -- Suspended user #2
    ('OrcEnrage',        'user15@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     TRUE,  FALSE, 1, '2025-04-05 14:00:00', '2025-05-15 16:00:00'),

    ('SerpentCristal',   'user16@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-04-08 09:00:00', '2025-04-08 09:00:00'),

    ('FalconEcarlate',   'user17@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-04-10 12:30:00', '2025-04-10 12:30:00'),

    ('DaemonHunter',     'user18@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-04-12 16:00:00', '2025-04-12 16:00:00'),

    ('VoleurDesSables',  'user19@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-04-15 09:00:00', '2025-04-15 09:00:00'),

    ('CielEtoile',       'user20@fantasy-realm.com',
     'pqETCZfnaeWfMu1SHJR/3kAWGo554yHdQ55CNg3Jc6TBP7eYgwz2s3shSHDaGS8x',
     FALSE, FALSE, 1, '2025-04-18 14:00:00', '2025-04-18 14:00:00')

ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- ARTICLES (~100 total)
--   type_id : 1=Clothing, 2=Armor, 3=Weapon, 4=Accessory
--   slot_id : 1=Tête, 2=Épaules, 3=Dos, 4=Torse, 5=Poignets, 6=Mains,
--             7=Taille, 8=Jambes, 9=Pieds, 10=Cou, 11=Anneau 1, 12=Anneau 2,
--             13=Main droite, 14=Main gauche
--   5-6 items have is_active=FALSE (marked with comment)
-- ============================================================================

INSERT INTO articles (name, type_id, slot_id, is_active)
VALUES
    -- -------------------------------------------------------------------------
    -- Vêtement (type_id=1) — 25 items
    -- -------------------------------------------------------------------------
    ('Tunique de lin',              1,  4, TRUE),   -- Torse
    ('Robe de mage émérite',        1,  4, TRUE),   -- Torse
    ('Chemise de noble brodée',     1,  4, TRUE),   -- Torse
    ('Veste de cuir souple',        1,  4, TRUE),   -- Torse
    ('Pourpoint de velours',        1,  4, TRUE),   -- Torse
    ('Chemisier en soie elfique',   1,  4, TRUE),   -- Torse
    ('Blouse de l''érudit',         1,  4, FALSE),  -- Torse [inactif]
    ('Cape du voyageur',            1,  3, TRUE),   -- Dos
    ('Manteau de fourrure arctique',1,  3, TRUE),   -- Dos
    ('Cape elfique brodée',         1,  3, TRUE),   -- Dos
    ('Mantelet de ranger',          1,  3, TRUE),   -- Dos
    ('Cape de l''ombre',            1,  3, FALSE),  -- Dos [inactif]
    ('Pantalon de ranger',          1,  8, TRUE),   -- Jambes
    ('Jupe longue de velours',      1,  8, TRUE),   -- Jambes
    ('Chausses de cuir tannées',    1,  8, TRUE),   -- Jambes
    ('Braies de laine épaisse',     1,  8, TRUE),   -- Jambes
    ('Pantalon de mage',            1,  8, TRUE),   -- Jambes
    ('Bottes en cuir souple',       1,  9, TRUE),   -- Pieds
    ('Sandales elfiques dorées',    1,  9, TRUE),   -- Pieds
    ('Souliers de velours noir',    1,  9, TRUE),   -- Pieds
    ('Bottines de voyage',          1,  9, TRUE),   -- Pieds
    ('Chaussons de mage',           1,  9, TRUE),   -- Pieds
    ('Sabatons en tissu renforcé',  1,  9, FALSE),  -- Pieds [inactif]
    ('Bottes de marche forestière', 1,  9, TRUE),   -- Pieds
    ('Jambières de soie',           1,  8, TRUE),   -- Jambes

    -- -------------------------------------------------------------------------
    -- Armure (type_id=2) — 25 items
    -- -------------------------------------------------------------------------
    ('Casque en fer forgé',         2,  1, TRUE),   -- Tête
    ('Heaume de mithril',           2,  1, TRUE),   -- Tête
    ('Armet du dragon noir',        2,  1, TRUE),   -- Tête
    ('Barbute de conquérant',       2,  1, TRUE),   -- Tête
    ('Casque à crête de phénix',    2,  1, TRUE),   -- Tête
    ('Épaulières de dragon doré',   2,  2, TRUE),   -- Épaules
    ('Spallières en acier poli',    2,  2, TRUE),   -- Épaules
    ('Pauldrons du champion',       2,  2, TRUE),   -- Épaules
    ('Épaulières de cuivre gravé',  2,  2, TRUE),   -- Épaules
    ('Plastron en acier trempé',    2,  4, TRUE),   -- Torse
    ('Cuirasse de mithril pur',     2,  4, TRUE),   -- Torse
    ('Haubert de mailles serrées',  2,  4, TRUE),   -- Torse
    ('Plastron runique ancien',     2,  4, TRUE),   -- Torse
    ('Brassards de bronze antique', 2,  5, TRUE),   -- Poignets
    ('Brassards en acier elfique',  2,  5, TRUE),   -- Poignets
    ('Garde-poignets en cuir clou', 2,  5, FALSE),  -- Poignets [inactif]
    ('Gantelets de mithril brillant',2, 6, TRUE),   -- Mains
    ('Gantelets du croisé ardent',  2,  6, TRUE),   -- Mains
    ('Mitaines de combat en acier', 2,  6, TRUE),   -- Mains
    ('Jambières en cotte de mailles',2, 8, TRUE),   -- Jambes
    ('Grèves en acier forgées',     2,  8, TRUE),   -- Jambes
    ('Cuissardes du paladin',       2,  8, TRUE),   -- Jambes
    ('Bouclier du gardien éternel', 2, 14, TRUE),   -- Main gauche
    ('Écu runique de défense',      2, 14, TRUE),   -- Main gauche
    ('Targe en bois de chêne sacré',2, 14, TRUE),   -- Main gauche

    -- -------------------------------------------------------------------------
    -- Arme (type_id=3) — 25 items
    -- -------------------------------------------------------------------------
    ('Épée longue du croisé',       3, 13, TRUE),   -- Main droite
    ('Épée courte de furtivité',    3, 13, TRUE),   -- Main droite
    ('Arc elfique en bois de lune', 3, 13, TRUE),   -- Main droite
    ('Arc court de chasseur',       3, 13, TRUE),   -- Main droite
    ('Arc long des forêts profondes',3,13, TRUE),   -- Main droite
    ('Bâton arcanique de maître',   3, 13, TRUE),   -- Main droite
    ('Bâton de cristal ancien',     3, 13, TRUE),   -- Main droite
    ('Bâton de bois de frêne sacré',3, 13, FALSE),  -- Main droite [inactif]
    ('Dague de l''ombre tranchante',3, 13, TRUE),   -- Main droite
    ('Dague empoisonnée des assassins',3,13,TRUE),  -- Main droite
    ('Hache de guerre des berserkers',3,13, TRUE),  -- Main droite
    ('Hache double tranchant',      3, 13, TRUE),   -- Main droite
    ('Lance de cristal enchantée',  3, 13, TRUE),   -- Main droite
    ('Lance de fer des gardes royaux',3,13, TRUE),  -- Main droite
    ('Marteau sacré du paladin',    3, 13, TRUE),   -- Main droite
    ('Masse d''armes enflammée',    3, 13, TRUE),   -- Main droite
    ('Faux de la faucheuse maudite',3, 13, TRUE),   -- Main droite
    ('Rapière du duelliste gracieux',3,13, TRUE),   -- Main droite
    ('Claymore des ancêtres celtes',3, 13, TRUE),   -- Main droite
    ('Flamberge des flammes éternelles',3,13,TRUE), -- Main droite
    ('Baguette de torsion arcanique',3,13, TRUE),   -- Main droite
    ('Sceptre du roi déchu',        3, 13, TRUE),   -- Main droite
    ('Trident de l''abyssal marin', 3, 13, TRUE),   -- Main droite
    ('Katana du vent tranchant',    3, 13, TRUE),   -- Main droite
    ('Fouet de soie ardente',       3, 13, TRUE),   -- Main droite

    -- -------------------------------------------------------------------------
    -- Accessoire (type_id=4) — 25 items
    -- -------------------------------------------------------------------------
    ('Anneau de puissance runique', 4, 11, TRUE),   -- Anneau 1
    ('Anneau en or des anciens',    4, 11, TRUE),   -- Anneau 1
    ('Anneau de protection sacrée', 4, 11, TRUE),   -- Anneau 1
    ('Anneau de glace éternelle',   4, 11, TRUE),   -- Anneau 1
    ('Bague de furtivité',          4, 12, TRUE),   -- Anneau 2
    ('Bague de régénération rapide',4, 12, TRUE),   -- Anneau 2
    ('Bague de l''archer précis',   4, 12, TRUE),   -- Anneau 2
    ('Bague du sang de dragon',     4, 12, TRUE),   -- Anneau 2
    ('Amulette de sagesse infinie', 4, 10, TRUE),   -- Cou
    ('Pendentif de vie abondante',  4, 10, TRUE),   -- Cou
    ('Collier de flammes vives',    4, 10, TRUE),   -- Cou
    ('Talisman du vent du nord',    4, 10, TRUE),   -- Cou
    ('Médaillon du conquérant',     4, 10, TRUE),   -- Cou
    ('Scarabée d''ambre magique',   4, 10, FALSE),  -- Cou [inactif]
    ('Ceinture du titan blindé',    4,  7, TRUE),   -- Taille
    ('Ceinture de cuir clouté',     4,  7, TRUE),   -- Taille
    ('Ceinture en soie de mage',    4,  7, TRUE),   -- Taille
    ('Ceinture de l''archer agile', 4,  7, TRUE),   -- Taille
    ('Ceinture de plaques forgée',  4,  7, TRUE),   -- Taille
    ('Ceinture de lames cachées',   4,  7, TRUE),   -- Taille
    ('Bracelet de mithril gravé',   4,  5, TRUE),   -- Poignets
    ('Bracelet de corail enchanté', 4,  5, TRUE),   -- Poignets
    ('Manchette de magie profonde', 4,  5, TRUE),   -- Poignets
    ('Jonc d''argent elfique',      4,  5, TRUE),   -- Poignets
    ('Bracelet maudit de l''abysse',4,  5, FALSE);  -- Poignets [inactif]

-- ============================================================================
-- CHARACTERS (~36 total, 1-2 per user)
--   class_id : 1=Guerrier, 2=Mage, 3=Archer, 4=Voleur
--   gender   : 'male' | 'female'
--   status   : 'draft' | 'pending' | 'approved' | 'rejected'
--   Approved + is_shared=TRUE characters are visible in the gallery.
-- ============================================================================

-- user1 — DragonSlayer (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Thorin Forgefer', 1, 'male', 'approved',
       '#C68642', '#3A7BD5', '#2C1810',
       'long', 'almond', 'straight', 'thin', 'square',
       TRUE, u.id, '2025-03-02 10:00:00', '2025-03-03 14:00:00'
FROM users u WHERE u.email = 'user1@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Aelindra Luneargent', 2, 'female', 'approved',
       '#F5D6C3', '#8B4513', '#FFD700',
       'curly', 'round', 'small', 'full', 'oval',
       TRUE, u.id, '2025-03-10 08:30:00', '2025-03-11 09:00:00'
FROM users u WHERE u.email = 'user1@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user2 — ShadowMage (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Nocturne Voilombre', 2, 'female', 'approved',
       '#3C2415', '#9B59B6', '#4A0080',
       'braided', 'almond', 'pointed', 'thin', 'heart',
       TRUE, u.id, '2025-03-15 20:00:00', '2025-03-17 10:00:00'
FROM users u WHERE u.email = 'user2@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Vesper Ecarlate', 2, 'female', 'draft',
       '#F0C8A0', '#1ABC9C', '#C0392B',
       'long', 'round', 'straight', 'full', 'oval',
       FALSE, u.id, '2025-04-05 09:00:00', '2025-04-05 09:00:00'
FROM users u WHERE u.email = 'user2@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user3 — ElfeNoire (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Lyriel Ventfleche', 3, 'female', 'approved',
       '#FFDAB9', '#27AE60', '#C0C0C0',
       'long', 'almond', 'small', 'thin', 'oval',
       TRUE, u.id, '2025-03-12 14:30:00', '2025-03-13 16:00:00'
FROM users u WHERE u.email = 'user3@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Sylvanas Ombrepointe', 3, 'female', 'pending',
       '#E8C39E', '#E67E22', '#8E44AD',
       'braided', 'narrow', 'pointed', 'medium', 'heart',
       TRUE, u.id, '2025-04-01 10:00:00', '2025-04-01 10:00:00'
FROM users u WHERE u.email = 'user3@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user4 — PaladinAuror (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Aurelion Lumiveil', 1, 'male', 'approved',
       '#F5D6C3', '#3498DB', '#D4A017',
       'short', 'round', 'straight', 'medium', 'square',
       TRUE, u.id, '2025-03-16 08:00:00', '2025-03-17 09:00:00'
FROM users u WHERE u.email = 'user4@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Solaris Heliodor', 1, 'female', 'rejected',
       '#D2A679', '#F1C40F', '#FFFFFF',
       'curly', 'almond', 'small', 'full', 'oval',
       FALSE, u.id, '2025-04-10 12:00:00', '2025-04-12 09:00:00'
FROM users u WHERE u.email = 'user4@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user5 — ArcherVert (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Robin Fougere', 3, 'male', 'approved',
       '#C68642', '#2ECC71', '#654321',
       'short', 'narrow', 'wide', 'thin', 'angular',
       TRUE, u.id, '2025-04-02 15:00:00', '2025-04-03 10:00:00'
FROM users u WHERE u.email = 'user5@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Artemis Clairdebois', 3, 'female', 'draft',
       '#F0C8A0', '#1ABC9C', '#228B22',
       'long', 'almond', 'straight', 'medium', 'heart',
       FALSE, u.id, '2025-04-15 18:00:00', '2025-04-15 18:00:00'
FROM users u WHERE u.email = 'user5@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user6 — NainForge (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Gimli Brisepierres', 1, 'male', 'approved',
       '#8D5524', '#E74C3C', '#B7410E',
       'long', 'round', 'flat', 'wide', 'square',
       TRUE, u.id, '2025-04-11 09:00:00', '2025-04-12 10:00:00'
FROM users u WHERE u.email = 'user6@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Brunhilde Rocfer', 1, 'female', 'pending',
       '#D2A679', '#8B4513', '#DAA520',
       'braided', 'narrow', 'wide', 'full', 'angular',
       TRUE, u.id, '2025-04-20 14:00:00', '2025-04-20 14:00:00'
FROM users u WHERE u.email = 'user6@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user7 — RuneMaster (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Merlin Archimage', 2, 'male', 'approved',
       '#F5D6C3', '#9B59B6', '#CCCCCC',
       'long', 'round', 'pointed', 'thin', 'oval',
       TRUE, u.id, '2025-04-22 08:00:00', '2025-04-23 10:00:00'
FROM users u WHERE u.email = 'user7@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Circe Enchanteresse', 2, 'female', 'approved',
       '#FFDAB9', '#E67E22', '#4A0080',
       'curly', 'almond', 'small', 'medium', 'heart',
       TRUE, u.id, '2025-05-01 11:00:00', '2025-05-02 09:00:00'
FROM users u WHERE u.email = 'user7@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user8 — TrollDesMarais (1 character, suspended user)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Gruk Marecageux', 1, 'male', 'approved',
       '#556B2F', '#FFD700', '#2F4F4F',
       'mohawk', 'narrow', 'flat', 'wide', 'square',
       TRUE, u.id, '2025-03-25 10:00:00', '2025-03-26 12:00:00'
FROM users u WHERE u.email = 'user8@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user9 — GoblinRage (1 character)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Zix Tranchevif', 4, 'male', 'approved',
       '#6B8E23', '#E74C3C', '#1C1C1C',
       'short', 'round', 'small', 'thin', 'angular',
       TRUE, u.id, '2025-04-06 15:00:00', '2025-04-07 08:00:00'
FROM users u WHERE u.email = 'user9@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user10 — PhoenixFlame (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Ignis Solembrase', 2, 'male', 'approved',
       '#F0C8A0', '#FF4500', '#8B0000',
       'short', 'round', 'straight', 'medium', 'oval',
       TRUE, u.id, '2025-03-23 09:00:00', '2025-03-24 11:00:00'
FROM users u WHERE u.email = 'user10@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Ember Cendrevive', 2, 'female', 'draft',
       '#E8B49A', '#FF6347', '#DC143C',
       'long', 'almond', 'small', 'full', 'heart',
       FALSE, u.id, '2025-04-18 14:00:00', '2025-04-18 14:00:00'
FROM users u WHERE u.email = 'user10@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user11 — LicorneSauvage (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Celeste Prismalis', 2, 'female', 'approved',
       '#FFF0E6', '#00CED1', '#FFB6C1',
       'long', 'round', 'small', 'full', 'oval',
       TRUE, u.id, '2025-03-26 10:00:00', '2025-03-27 09:00:00'
FROM users u WHERE u.email = 'user11@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Opaline Feerie', 3, 'female', 'pending',
       '#F5E6D3', '#7B68EE', '#E0B0FF',
       'curly', 'almond', 'pointed', 'thin', 'heart',
       TRUE, u.id, '2025-04-20 15:00:00', '2025-04-20 15:00:00'
FROM users u WHERE u.email = 'user11@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user12 — CorbeanNocturne (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Corvus Darkwing', 4, 'male', 'approved',
       '#2C2C2C', '#FF0000', '#000000',
       'short', 'narrow', 'straight', 'thin', 'angular',
       TRUE, u.id, '2025-03-29 09:00:00', '2025-03-30 10:00:00'
FROM users u WHERE u.email = 'user12@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Nyx Plumombre', 4, 'female', 'rejected',
       '#1A1A2E', '#8A2BE2', '#1C1C1C',
       'long', 'almond', 'pointed', 'full', 'oval',
       FALSE, u.id, '2025-04-22 18:00:00', '2025-04-24 08:00:00'
FROM users u WHERE u.email = 'user12@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user13 — VipereArgent (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Serpentis Argentum', 4, 'male', 'approved',
       '#D8D8D8', '#98FB98', '#C0C0C0',
       'short', 'narrow', 'straight', 'thin', 'angular',
       TRUE, u.id, '2025-04-02 08:00:00', '2025-04-03 09:00:00'
FROM users u WHERE u.email = 'user13@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Viper Argentee', 3, 'female', 'approved',
       '#E8E8E8', '#00FA9A', '#B8B8B8',
       'braided', 'almond', 'small', 'medium', 'heart',
       TRUE, u.id, '2025-04-25 11:00:00', '2025-04-26 10:00:00'
FROM users u WHERE u.email = 'user13@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user14 — LoupGrisonnant (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Fenrir Grismanteau', 1, 'male', 'approved',
       '#A0A0A0', '#FFD700', '#696969',
       'long', 'narrow', 'flat', 'wide', 'square',
       TRUE, u.id, '2025-04-04 10:00:00', '2025-04-05 09:00:00'
FROM users u WHERE u.email = 'user14@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Lupa Argentgris', 3, 'female', 'draft',
       '#B8B8B8', '#87CEEB', '#808080',
       'long', 'round', 'small', 'medium', 'oval',
       FALSE, u.id, '2025-04-28 16:00:00', '2025-04-28 16:00:00'
FROM users u WHERE u.email = 'user14@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user15 — OrcEnrage (1 character, suspended user)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Gorak Grognard', 1, 'male', 'approved',
       '#5D8233', '#FF4500', '#2E4B0A',
       'mohawk', 'narrow', 'flat', 'wide', 'square',
       TRUE, u.id, '2025-04-06 11:00:00', '2025-04-07 10:00:00'
FROM users u WHERE u.email = 'user15@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user16 — SerpentCristal (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Crystalis Serpens', 2, 'male', 'approved',
       '#E0F0FF', '#00FFFF', '#4169E1',
       'long', 'almond', 'pointed', 'thin', 'oval',
       TRUE, u.id, '2025-04-09 09:00:00', '2025-04-10 10:00:00'
FROM users u WHERE u.email = 'user16@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Azurine Glacelame', 3, 'female', 'pending',
       '#B0E2FF', '#1E90FF', '#87CEEB',
       'braided', 'round', 'small', 'full', 'heart',
       TRUE, u.id, '2025-04-30 14:00:00', '2025-04-30 14:00:00'
FROM users u WHERE u.email = 'user16@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user17 — FalconEcarlate (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Falco Rubisang', 3, 'male', 'approved',
       '#D2691E', '#FF4500', '#8B0000',
       'short', 'narrow', 'straight', 'thin', 'angular',
       TRUE, u.id, '2025-04-11 10:00:00', '2025-04-12 09:00:00'
FROM users u WHERE u.email = 'user17@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Scarlet Cielardent', 2, 'female', 'draft',
       '#FFB6C1', '#DC143C', '#FF69B4',
       'long', 'almond', 'small', 'full', 'heart',
       FALSE, u.id, '2025-05-01 16:00:00', '2025-05-01 16:00:00'
FROM users u WHERE u.email = 'user17@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user18 — DaemonHunter (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Daemon Chassenuit', 4, 'male', 'approved',
       '#1C1C1C', '#FF0000', '#000000',
       'short', 'narrow', 'straight', 'thin', 'angular',
       TRUE, u.id, '2025-04-13 09:00:00', '2025-04-14 10:00:00'
FROM users u WHERE u.email = 'user18@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Lilith Ombrevive', 4, 'female', 'approved',
       '#2D1B2E', '#8B008B', '#4B0082',
       'long', 'almond', 'pointed', 'thin', 'heart',
       TRUE, u.id, '2025-04-26 15:00:00', '2025-04-27 09:00:00'
FROM users u WHERE u.email = 'user18@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user19 — VoleurDesSables (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Aladdin Sabledor', 4, 'male', 'approved',
       '#D2A679', '#8B4513', '#1C1C1C',
       'short', 'round', 'straight', 'medium', 'oval',
       TRUE, u.id, '2025-04-16 11:00:00', '2025-04-17 10:00:00'
FROM users u WHERE u.email = 'user19@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Yasmine Dunerose', 3, 'female', 'pending',
       '#C8956C', '#20B2AA', '#3D1C02',
       'long', 'almond', 'small', 'full', 'oval',
       TRUE, u.id, '2025-05-01 13:00:00', '2025-05-01 13:00:00'
FROM users u WHERE u.email = 'user19@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- user20 — CielEtoile (2 characters)
INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Stella Astraveil', 2, 'female', 'approved',
       '#F0E6FF', '#9370DB', '#DDA0DD',
       'long', 'round', 'small', 'full', 'oval',
       TRUE, u.id, '2025-04-19 10:00:00', '2025-04-20 09:00:00'
FROM users u WHERE u.email = 'user20@fantasy-realm.com'
ON CONFLICT DO NOTHING;

INSERT INTO characters (name, class_id, gender, status, skin_color, eye_color, hair_color,
                        hair_style, eye_shape, nose_shape, mouth_shape, face_shape,
                        is_shared, user_id, created_at, updated_at)
SELECT 'Orion Celeste', 1, 'male', 'draft',
       '#E8D5C4', '#4169E1', '#2F4F4F',
       'short', 'almond', 'straight', 'medium', 'square',
       FALSE, u.id, '2025-05-01 17:00:00', '2025-05-01 17:00:00'
FROM users u WHERE u.email = 'user20@fantasy-realm.com'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS (~25 total)
--   Only on approved + is_shared=TRUE characters.
--   One comment per user per character (unique constraint).
--   ~15 approved, ~5 pending, ~5 rejected.
--   Rejected: must have rejection_reason, reviewed_at, reviewed_by_id.
--   Approved: must have reviewed_at, reviewed_by_id.
--   Pending : no reviewed_at, no reviewed_by_id.
-- ============================================================================

-- ---- Comments on "Thorin Forgefer" (DragonSlayer, Guerrier, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'Un guerrier magnifique ! Le design du visage est vraiment soigné, les couleurs de la peau et des yeux s''harmonisent parfaitement. Bravo pour ce personnage.',
       'approved',
       c.id, a.id, '2025-03-05 10:00:00',
       NULL, '2025-03-06 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user2@fantasy-realm.com'
JOIN users e ON e.email = 'marie.durand@fantasy-realm.com'
WHERE c.name = 'Thorin Forgefer'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 4,
       'Très beau personnage guerrier au style nordique affirmé. La coiffure longue et la mâchoire carrée lui donnent beaucoup de caractère. Il manque peut-être une touche de couleur vive.',
       'approved',
       c.id, a.id, '2025-03-06 14:00:00',
       NULL, '2025-03-07 08:30:00', e.id
FROM characters c
JOIN users a ON a.email = 'user3@fantasy-realm.com'
JOIN users e ON e.email = 'thomas.bernard@fantasy-realm.com'
WHERE c.name = 'Thorin Forgefer'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 3,
       'Le personnage est correct mais manque d''originalité. Les guerriers aux cheveux longs et teint basané sont très communs sur la plateforme. Bon travail sur les proportions tout de même.',
       'approved',
       c.id, a.id, '2025-03-12 16:00:00',
       NULL, '2025-03-13 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user5@fantasy-realm.com'
JOIN users e ON e.email = 'marie.durand@fantasy-realm.com'
WHERE c.name = 'Thorin Forgefer'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Aelindra Luneargent" (DragonSlayer, Mage, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'La meilleure mage que j''ai vue sur la plateforme depuis longtemps ! Les cheveux dorés avec les yeux ambrés créent une harmonie visuelle parfaite. Un vrai chef-d''œuvre.',
       'approved',
       c.id, a.id, '2025-03-15 12:00:00',
       NULL, '2025-03-16 08:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user4@fantasy-realm.com'
JOIN users e ON e.email = 'claire.martin@fantasy-realm.com'
WHERE c.name = 'Aelindra Luneargent'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 1,
       'Contenu inapproprié et irrespectueux envers la création de l''utilisateur.',
       'rejected',
       c.id, a.id, '2025-03-18 20:00:00',
       'Ce commentaire ne respecte pas la charte de la communauté. Les critiques doivent être constructives et bienveillantes. Merci de reformuler votre avis de façon respectueuse.',
       '2025-03-19 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user6@fantasy-realm.com'
JOIN users e ON e.email = 'marie.durand@fantasy-realm.com'
WHERE c.name = 'Aelindra Luneargent'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Nocturne Voilombre" (ShadowMage, Mage, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'Une mage ténébreuse absolument sublime ! Les yeux violets sur la peau sombre créent un effet saisissant. La tresse lui donne un côté mystérieux très réussi.',
       'approved',
       c.id, a.id, '2025-03-18 15:00:00',
       NULL, '2025-03-19 10:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user1@fantasy-realm.com'
JOIN users e ON e.email = 'thomas.bernard@fantasy-realm.com'
WHERE c.name = 'Nocturne Voilombre'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 4,
       'Très bon travail sur cette mage sombre. La combinaison violet et noir est classique mais toujours efficace. Je lui aurais peut-être donné un visage légèrement plus expressif.',
       'approved',
       c.id, a.id, '2025-03-22 11:00:00',
       NULL, '2025-03-23 09:30:00', e.id
FROM characters c
JOIN users a ON a.email = 'user7@fantasy-realm.com'
JOIN users e ON e.email = 'claire.martin@fantasy-realm.com'
WHERE c.name = 'Nocturne Voilombre'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Lyriel Ventfleche" (ElfeNoire, Archer, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 4,
       'Superbe archère elfique ! Les traits fins et les cheveux argentés lui confèrent une grâce naturelle. Les yeux verts complètent parfaitement le tout. Chapeau !',
       'approved',
       c.id, a.id, '2025-03-20 10:00:00',
       NULL, '2025-03-21 08:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user1@fantasy-realm.com'
JOIN users e ON e.email = 'julien.petit@fantasy-realm.com'
WHERE c.name = 'Lyriel Ventfleche'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 2,
       'Spam et contenu hors sujet sans rapport avec le personnage.',
       'rejected',
       c.id, a.id, '2025-04-01 21:00:00',
       'Ce commentaire ne porte pas sur le personnage présenté et ne respecte pas les règles de modération. Seuls les avis en lien direct avec la création sont acceptés.',
       '2025-04-02 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user9@fantasy-realm.com'
JOIN users e ON e.email = 'thomas.bernard@fantasy-realm.com'
WHERE c.name = 'Lyriel Ventfleche'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'Absolument magnifique ! Ce personnage dégage une aura de liberté et de précision. Le choix du teint pêche avec les cheveux gris est vraiment original et réussi.',
       'approved',
       c.id, a.id, '2025-04-05 19:00:00',
       NULL, '2025-04-06 10:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user10@fantasy-realm.com'
JOIN users e ON e.email = 'marie.durand@fantasy-realm.com'
WHERE c.name = 'Lyriel Ventfleche'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Aurelion Lumiveil" (PaladinAuror, Guerrier, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'Un paladin radieux par excellence ! Les teintes dorées des cheveux et les yeux bleus azur incarnent parfaitement la lumière divine. Un personnage inspirant.',
       'approved',
       c.id, a.id, '2025-03-20 08:00:00',
       NULL, '2025-03-21 10:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user3@fantasy-realm.com'
JOIN users e ON e.email = 'julien.petit@fantasy-realm.com'
WHERE c.name = 'Aurelion Lumiveil'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 1,
       'Nul.',
       'rejected',
       c.id, a.id, '2025-04-01 22:00:00',
       'Commentaire trop court et non constructif. Les avis doivent contenir au minimum une phrase d''explication pour être publiés sur la plateforme.',
       '2025-04-02 08:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user5@fantasy-realm.com'
JOIN users e ON e.email = 'claire.martin@fantasy-realm.com'
WHERE c.name = 'Aurelion Lumiveil'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Robin Fougere" (ArcherVert, Archer, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 3,
       'Un archer forestier classique et bien exécuté. Les proportions du visage sont bien travaillées et le teint basané s''accorde avec l''univers naturel du personnage.',
       'approved',
       c.id, a.id, '2025-04-05 14:00:00',
       NULL, '2025-04-06 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user2@fantasy-realm.com'
JOIN users e ON e.email = 'thomas.bernard@fantasy-realm.com'
WHERE c.name = 'Robin Fougere'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Gimli Brisepierres" (NainForge, Guerrier, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 4,
       'Un nain robuste et charismatique comme on les aime ! La peau sombre, les cheveux roux et les yeux rouges lui donnent une présence impressionnante sur le champ de bataille.',
       'approved',
       c.id, a.id, '2025-04-15 10:00:00',
       NULL, '2025-04-16 08:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user4@fantasy-realm.com'
JOIN users e ON e.email = 'sophie.leroy@fantasy-realm.com'
WHERE c.name = 'Gimli Brisepierres'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Merlin Archimage" (RuneMaster, Mage, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at)
SELECT 4,
       'Le sage archimage par excellence ! Les cheveux gris et les yeux violets forment un combo magique intemporel. Ce personnage inspire le respect et la sagesse des anciens.',
       'pending',
       c.id, a.id, '2025-04-25 12:00:00'
FROM characters c
JOIN users a ON a.email = 'user1@fantasy-realm.com'
WHERE c.name = 'Merlin Archimage'
ON CONFLICT DO NOTHING;

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at)
SELECT 5,
       'Incroyable travail sur ce mage ! Il dégage une vraie aura de puissance mystique. La combinaison des teintes grises et violettes est parfaitement maîtrisée.',
       'pending',
       c.id, a.id, '2025-04-26 15:00:00'
FROM characters c
JOIN users a ON a.email = 'user6@fantasy-realm.com'
WHERE c.name = 'Merlin Archimage'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Circe Enchanteresse" (RuneMaster, Mage, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'Circe est un personnage absolument envoûtant ! Les boucles et les teintes dorées de la peau avec les yeux orange créent un personnage chaleureux et mystérieux à la fois.',
       'approved',
       c.id, a.id, '2025-05-03 14:00:00',
       NULL, '2025-05-04 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user2@fantasy-realm.com'
JOIN users e ON e.email = 'nicolas.moreau@fantasy-realm.com'
WHERE c.name = 'Circe Enchanteresse'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Gruk Marecageux" (TrollDesMarais/suspended, Guerrier, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 3,
       'Un guerrier atypique avec sa peau verte et ses yeux dorés. L''originalité est présente même si le style troll ne plaît pas à tout le monde. La coiffure mohawk est audacieuse.',
       'approved',
       c.id, a.id, '2025-04-01 10:00:00',
       NULL, '2025-04-02 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user4@fantasy-realm.com'
JOIN users e ON e.email = 'amelie.simon@fantasy-realm.com'
WHERE c.name = 'Gruk Marecageux'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Ignis Solembrase" (PhoenixFlame, Mage, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at)
SELECT 4,
       'Un mage du feu vraiment réussi ! Les yeux rouge-orangé et les cheveux bordeaux collent parfaitement au thème du feu et du phénix. Beaucoup de cohérence dans ce personnage.',
       'pending',
       c.id, a.id, '2025-03-28 16:00:00'
FROM characters c
JOIN users a ON a.email = 'user3@fantasy-realm.com'
WHERE c.name = 'Ignis Solembrase'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Corvus Darkwing" (CorbeanNocturne, Voleur, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 4,
       'Un voleur dans les tons les plus sombres possible. C''est osé mais cohérent avec le thème du corbeau nocturne. Le rouge des yeux contraste remarquablement avec tout le noir.',
       'approved',
       c.id, a.id, '2025-04-01 11:00:00',
       NULL, '2025-04-02 10:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user5@fantasy-realm.com'
JOIN users e ON e.email = 'pierre.fontaine@fantasy-realm.com'
WHERE c.name = 'Corvus Darkwing'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Celeste Prismalis" (LicorneSauvage, Mage, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'Un personnage féerique et enchanteur ! Les teintes pastel de la peau et les cheveux roses associés aux yeux turquoise donnent une impression de magie pure. Absolument magnifique.',
       'approved',
       c.id, a.id, '2025-03-30 14:00:00',
       NULL, '2025-03-31 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user7@fantasy-realm.com'
JOIN users e ON e.email = 'amelie.simon@fantasy-realm.com'
WHERE c.name = 'Celeste Prismalis'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Fenrir Grismanteau" (LoupGrisonnant, Guerrier, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 4,
       'Un guerrier vieillissant plein de sagesse. Les tons gris et les yeux or transmettent parfaitement l''idée du loup chevronné. Une création sobre et efficace, bien pensée.',
       'approved',
       c.id, a.id, '2025-04-07 10:00:00',
       NULL, '2025-04-08 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user8@fantasy-realm.com'
JOIN users e ON e.email = 'nicolas.moreau@fantasy-realm.com'
WHERE c.name = 'Fenrir Grismanteau'
ON CONFLICT DO NOTHING;

-- ---- Comments on "Daemon Chassenuit" (DaemonHunter, Voleur, approved+shared) ----

INSERT INTO comments (rating, text, status, character_id, author_id,
                      commented_at, rejection_reason, reviewed_at, reviewed_by_id)
SELECT 5,
       'Probablement le voleur le plus intimidant de la galerie. Tout en noir avec les yeux rouges, il incarne parfaitement l''archétype du chasseur de démons. Excellent travail !',
       'approved',
       c.id, a.id, '2025-04-16 14:00:00',
       NULL, '2025-04-17 09:00:00', e.id
FROM characters c
JOIN users a ON a.email = 'user11@fantasy-realm.com'
JOIN users e ON e.email = 'pierre.fontaine@fantasy-realm.com'
WHERE c.name = 'Daemon Chassenuit'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CHARACTER_ARTICLES (~55 equipment assignments, 2-4 items per character)
-- Covers ~15-20 characters via name lookup (no hardcoded IDs).
-- ============================================================================

-- ---- Thorin Forgefer (Guerrier) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Thorin Forgefer' AND a.name = 'Plastron en acier trempé'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Thorin Forgefer' AND a.name = 'Épée longue du croisé'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Thorin Forgefer' AND a.name = 'Casque en fer forgé'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Thorin Forgefer' AND a.name = 'Bouclier du gardien éternel'
ON CONFLICT DO NOTHING;

-- ---- Aelindra Luneargent (Mage) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aelindra Luneargent' AND a.name = 'Robe de mage émérite'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aelindra Luneargent' AND a.name = 'Bâton arcanique de maître'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aelindra Luneargent' AND a.name = 'Amulette de sagesse infinie'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aelindra Luneargent' AND a.name = 'Ceinture en soie de mage'
ON CONFLICT DO NOTHING;

-- ---- Nocturne Voilombre (Mage) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Nocturne Voilombre' AND a.name = 'Robe de mage émérite'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Nocturne Voilombre' AND a.name = 'Bâton de cristal ancien'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Nocturne Voilombre' AND a.name = 'Anneau de glace éternelle'
ON CONFLICT DO NOTHING;

-- ---- Lyriel Ventfleche (Archer) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Lyriel Ventfleche' AND a.name = 'Arc elfique en bois de lune'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Lyriel Ventfleche' AND a.name = 'Cape elfique brodée'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Lyriel Ventfleche' AND a.name = 'Bottes en cuir souple'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Lyriel Ventfleche' AND a.name = 'Bague de furtivité'
ON CONFLICT DO NOTHING;

-- ---- Aurelion Lumiveil (Guerrier/Paladin) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aurelion Lumiveil' AND a.name = 'Cuirasse de mithril pur'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aurelion Lumiveil' AND a.name = 'Épaulières de dragon doré'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aurelion Lumiveil' AND a.name = 'Marteau sacré du paladin'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Aurelion Lumiveil' AND a.name = 'Anneau de puissance runique'
ON CONFLICT DO NOTHING;

-- ---- Robin Fougere (Archer) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Robin Fougere' AND a.name = 'Arc long des forêts profondes'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Robin Fougere' AND a.name = 'Tunique de lin'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Robin Fougere' AND a.name = 'Pantalon de ranger'
ON CONFLICT DO NOTHING;

-- ---- Gimli Brisepierres (Guerrier/Nain) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Gimli Brisepierres' AND a.name = 'Hache double tranchant'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Gimli Brisepierres' AND a.name = 'Heaume de mithril'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Gimli Brisepierres' AND a.name = 'Jambières en cotte de mailles'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Gimli Brisepierres' AND a.name = 'Ceinture du titan blindé'
ON CONFLICT DO NOTHING;

-- ---- Merlin Archimage (Mage) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Merlin Archimage' AND a.name = 'Robe de mage émérite'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Merlin Archimage' AND a.name = 'Bâton arcanique de maître'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Merlin Archimage' AND a.name = 'Pendentif de vie abondante'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Merlin Archimage' AND a.name = 'Collier de flammes vives'
ON CONFLICT DO NOTHING;

-- ---- Circe Enchanteresse (Mage) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Circe Enchanteresse' AND a.name = 'Bâton de cristal ancien'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Circe Enchanteresse' AND a.name = 'Talisman du vent du nord'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Circe Enchanteresse' AND a.name = 'Bague du sang de dragon'
ON CONFLICT DO NOTHING;

-- ---- Gruk Marecageux (Guerrier, suspended user) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Gruk Marecageux' AND a.name = 'Hache de guerre des berserkers'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Gruk Marecageux' AND a.name = 'Gantelets de mithril brillant'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Gruk Marecageux' AND a.name = 'Ceinture de plaques forgée'
ON CONFLICT DO NOTHING;

-- ---- Zix Tranchevif (Voleur) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Zix Tranchevif' AND a.name = 'Dague de l''ombre tranchante'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Zix Tranchevif' AND a.name = 'Bague de furtivité'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Zix Tranchevif' AND a.name = 'Cape de l''ombre'
ON CONFLICT DO NOTHING;

-- ---- Ignis Solembrase (Mage, PhoenixFlame) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Ignis Solembrase' AND a.name = 'Baguette de torsion arcanique'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Ignis Solembrase' AND a.name = 'Collier de flammes vives'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Ignis Solembrase' AND a.name = 'Anneau en or des anciens'
ON CONFLICT DO NOTHING;

-- ---- Celeste Prismalis (Mage, LicorneSauvage) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Celeste Prismalis' AND a.name = 'Sceptre du roi déchu'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Celeste Prismalis' AND a.name = 'Amulette de sagesse infinie'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Celeste Prismalis' AND a.name = 'Anneau de protection sacrée'
ON CONFLICT DO NOTHING;

-- ---- Corvus Darkwing (Voleur, CorbeanNocturne) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Corvus Darkwing' AND a.name = 'Dague empoisonnée des assassins'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Corvus Darkwing' AND a.name = 'Mantelet de ranger'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Corvus Darkwing' AND a.name = 'Ceinture de lames cachées'
ON CONFLICT DO NOTHING;

-- ---- Serpentis Argentum (Voleur, VipereArgent) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Serpentis Argentum' AND a.name = 'Rapière du duelliste gracieux'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Serpentis Argentum' AND a.name = 'Bague de l''archer précis'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Serpentis Argentum' AND a.name = 'Ceinture de cuir clouté'
ON CONFLICT DO NOTHING;

-- ---- Fenrir Grismanteau (Guerrier, LoupGrisonnant) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Fenrir Grismanteau' AND a.name = 'Claymore des ancêtres celtes'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Fenrir Grismanteau' AND a.name = 'Armet du dragon noir'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Fenrir Grismanteau' AND a.name = 'Grèves en acier forgées'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Fenrir Grismanteau' AND a.name = 'Médaillon du conquérant'
ON CONFLICT DO NOTHING;

-- ---- Daemon Chassenuit (Voleur, DaemonHunter) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Daemon Chassenuit' AND a.name = 'Faux de la faucheuse maudite'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Daemon Chassenuit' AND a.name = 'Cape de l''ombre'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Daemon Chassenuit' AND a.name = 'Anneau de glace éternelle'
ON CONFLICT DO NOTHING;

-- ---- Crystalis Serpens (Mage, SerpentCristal) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Crystalis Serpens' AND a.name = 'Bâton de cristal ancien'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Crystalis Serpens' AND a.name = 'Jonc d''argent elfique'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Crystalis Serpens' AND a.name = 'Talisman du vent du nord'
ON CONFLICT DO NOTHING;

-- ---- Stella Astraveil (Mage, CielEtoile) ----
INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Stella Astraveil' AND a.name = 'Sceptre du roi déchu'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Stella Astraveil' AND a.name = 'Collier de flammes vives'
ON CONFLICT DO NOTHING;

INSERT INTO character_articles (character_id, article_id)
SELECT c.id, a.id FROM characters c, articles a
WHERE c.name = 'Stella Astraveil' AND a.name = 'Bague de régénération rapide'
ON CONFLICT DO NOTHING;

COMMIT;
