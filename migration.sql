-- 1. Création des Tables
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    icon TEXT,
    color TEXT,
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id TEXT NOT NULL,
    subcategory_id TEXT,
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    price_range INTEGER,
    level TEXT DEFAULT 'debutant', -- debutant, confirme, pointu
    website TEXT,
    instagram TEXT,
    gentlemap_review TEXT,
    status TEXT DEFAULT 'approved',
    is_featured INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    city VARCHAR(255),
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT unique_place_identity UNIQUE (name, address)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    place_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    user_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_place FOREIGN KEY (place_id) REFERENCES places(id)
);

CREATE TABLE IF NOT EXISTS notebooks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    place_ids INTEGER[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insertion des Catégories
INSERT INTO categories (id, name, parent_id, icon, color) VALUES
('tailleur', 'Tailleur', NULL, 'scissors', '#5A5A40'),
('tailleur_grande', 'Grande Mesure', 'tailleur', NULL, NULL),
('tailleur_sur', 'Sur Mesure', 'tailleur', NULL, NULL),
('tailleur_demi', 'Demi Mesure', 'tailleur', NULL, NULL),
('tailleur_pap', 'Prêt-à-porter', 'tailleur', NULL, NULL),
('costumes_occasion', 'Costumes d''occasion', NULL, 'refresh-cw', '#121212'),
('souliers', 'Beaux Souliers', NULL, 'footprints', '#121212'),
('souliers_sur', 'Sur Mesure', 'souliers', NULL, NULL),
('souliers_demi', 'Demi Mesure', 'souliers', NULL, NULL),
('souliers_pap', 'Prêt-à-porter', 'souliers', NULL, NULL),
('chapeliers', 'Chapeliers et accessoires', NULL, 'shopping-bag', '#121212'),
('antiquaires', 'Antiquaires', NULL, 'lamp', '#121212'),
('librairies', 'Librairies anciennes', NULL, 'book-open', '#121212'),
('artisans', 'Artisans d''art', NULL, 'hammer', '#121212'),
('cafes', 'Cafés historiques', NULL, 'coffee', '#121212'),
('restaurants', 'Restaurants', NULL, 'utensils', '#121212'),
('hotels', 'Hôtels de charme', NULL, 'bed', '#121212')
ON CONFLICT (id) DO NOTHING;

-- 3. Insertion des Lieux (Focus Tailleurs, Souliers, Costumes d'occasion)
INSERT INTO places (name, description, category_id, subcategory_id, address, lat, lng, price_range, level, city, status, is_featured) VALUES
-- Costumes d'occasion
('Le Vif', 'Boutique de vêtements vintage et d''occasion de haute qualité.', 'costumes_occasion', NULL, '101 Rue de Turenne, 75003 Paris', 48.8615, 2.3635, 2, 'confirme', 'Paris', 'approved', 1),
('Brut Archives', 'Sélection pointue de vêtements militaires et de travail vintage.', 'costumes_occasion', NULL, '3 Rue Réaumur, 75003 Paris', 48.8655, 2.3585, 3, 'pointu', 'Paris', 'approved', 1),
('Thanx God I''m a V.I.P.', 'Une des meilleures friperies de luxe à Paris.', 'costumes_occasion', NULL, '12 Rue de Lancry, 75010 Paris', 48.8715, 2.3615, 3, 'debutant', 'Paris', 'approved', 1),
('Bernard Gavilan since 1994', 'Costumes par époque, plusieurs marques de luxe.', 'costumes_occasion', NULL, 'Rue Blaes 162, 1000 Bruxelles, Belgique', 50.8395, 4.3465, 3, 'confirme', 'Bruxelles', 'approved', 1),
('Pauline Carton boutique', 'Petite boutique proposant des costumes, tout au fond.', 'costumes_occasion', NULL, 'Rue de Flandre 29, 1000 Bruxelles, Belgique', 50.8510, 4.3475, 2, 'debutant', 'Bruxelles', 'approved', 1),
('The Manchego - Vintage Shop', 'Boutique vintage sélectionnée au coeur de Paris.', 'costumes_occasion', NULL, '22 Rue de Beaune, 75007 Paris', 48.8585, 2.3295, 3, 'confirme', 'Paris', 'approved', 1),
('Chez Ammar', 'Des perles rares dans un bordel savamment orchestré et beaucoup d''humour.', 'costumes_occasion', NULL, '65 Rue Nollet, 75017 Paris', 48.8875, 2.3215, 2, 'pointu', 'Paris', 'approved', 1),
('Chez Ugo', 'Sélection vintage de caractère à Lille.', 'costumes_occasion', NULL, '3 Place Aux Oignons 59800 Lille', 50.6405, 3.0625, 2, 'confirme', 'Lille', 'approved', 1),

-- Tailleurs (Grande Mesure, Sur Mesure, PAP)
('Cifonelli', 'Tailleur de grande mesure légendaire, célèbre pour son épaule cigarette.', 'tailleur', 'tailleur_grande', '31 Rue Marbeuf, 75008 Paris', 48.8695, 2.3035, 4, 'pointu', 'Paris', 'approved', 1),
('Camps de Luca', 'L''excellence de la grande mesure parisienne.', 'tailleur', 'tailleur_grande', '16 Rue de la Paix, 75002 Paris', 48.8690, 2.3310, 4, 'pointu', 'Paris', 'approved', 1),
('Smalto', 'L''élégance italienne au service de la mesure parisienne.', 'tailleur', 'tailleur_sur', '44 Rue François 1er, 75008 Paris', 48.8685, 2.3045, 4, 'confirme', 'Paris', 'approved', 1),
('Husbands', 'Prêt-à-porter de luxe inspiré des grandes heures du style classique.', 'tailleur', 'tailleur_pap', '57 Rue de Richelieu, 75002 Paris', 48.8675, 2.3390, 3, 'debutant', 'Paris', 'approved', 1),
('Scavini', 'Tailleur parisien réputé pour son style classique et ses pantalons à la coupe impeccable.', 'tailleur', 'tailleur_sur', '19 Boulevard de Courcelles, 75008 Paris', 48.8785, 2.3115, 3, 'confirme', 'Paris', 'approved', 1),
('Pini Parma', 'Le style italien accessible en prêt-à-porter.', 'tailleur', 'tailleur_pap', '63 Rue de la Boétie, 75008 Paris', 48.8735, 2.3125, 2, 'debutant', 'Paris', 'approved', 0),

-- Souliers (Sur Mesure, PAP)
('Berluti', 'L''art de la patine et du soulier d''exception.', 'souliers', 'souliers_sur', '31 Rue Marbeuf, 75008 Paris', 48.8695, 2.3035, 4, 'pointu', 'Paris', 'approved', 1),
('John Lobb', 'Le bottier de référence, élégance intemporelle.', 'souliers', 'souliers_sur', '21 Rue Boissy d''Anglas, 75008 Paris', 48.8690, 2.3220, 4, 'pointu', 'Paris', 'approved', 1),
('J.M. Weston', 'L''icône du soulier français, célèbre pour son mocassin 180.', 'souliers', 'souliers_pap', '114 Av. des Champs-Élysées, 75008 Paris', 48.8720, 2.3010, 3, 'debutant', 'Paris', 'approved', 1),
('Aubercy', 'Maison familiale proposant des souliers d''une finesse rare.', 'souliers', 'souliers_sur', '34 Rue Vivienne, 75002 Paris', 48.8700, 2.3400, 4, 'confirme', 'Paris', 'approved', 1)
ON CONFLICT (name, address) DO NOTHING;

-- Mise à jour automatique des villes basée sur l'adresse
UPDATE places SET city = 'Paris' WHERE (address LIKE '%Paris%' OR address LIKE '%750%') AND (city IS NULL OR city = '');
UPDATE places SET city = 'Bruxelles' WHERE (address LIKE '%Bruxelles%' OR address LIKE '%1000%') AND (city IS NULL OR city = '');
-- 4. Insertion des Carnets (Notebooks)
INSERT INTO notebooks (id, title, description, image_url, place_ids) VALUES
('debutant-costume-paris', 'Débutant dans le costume à Paris', 'Les meilleures adresses pour commencer sa garde-robe classique à Paris sans se ruiner.', 'https://images.unsplash.com/photo-1594932224828-b4b057b7d6ee?q=80&w=800&auto=format&fit=crop', ARRAY[83, 94, 96, 101]),
('antiquaires-art-nouveau', 'Antiquaires spécialisés Art Nouveau', 'Une sélection de boutiques pour les amoureux du style 1900.', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop', ARRAY[81, 82, 86]),
('bruxelles-vintage', 'Le meilleur du vintage à Bruxelles', 'Parcours dans les rues de Bruxelles pour dénicher des pièces d''exception.', 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=800&auto=format&fit=crop', ARRAY[84, 85])
ON CONFLICT (id) DO NOTHING;
