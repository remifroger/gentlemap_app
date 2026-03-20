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

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT,
    date VARCHAR(50),
    author VARCHAR(100),
    category VARCHAR(50),
    image TEXT,
    notebook_id VARCHAR(255)
);

-- 1. Insertion des Catégories
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
INSERT INTO places (id, name, description, category_id, subcategory_id, address, lat, lng, price_range, level, city, status, is_featured) VALUES
-- Costumes d'occasion
(1, 'Le Vif', 'Boutique de vêtements vintage et d''occasion de haute qualité.', 'costumes_occasion', NULL, '101 Rue de Turenne, 75003 Paris', 48.8615, 2.3635, 2, 'confirme', 'Paris', 'approved', 1),
(2, 'Brut Archives', 'Sélection pointue de vêtements militaires et de travail vintage.', 'costumes_occasion', NULL, '3 Rue Réaumur, 75003 Paris', 48.8655, 2.3585, 3, 'pointu', 'Paris', 'approved', 1),
(3, 'Thanx God I''m a V.I.P.', 'Une des meilleures friperies de luxe à Paris.', 'costumes_occasion', NULL, '12 Rue de Lancry, 75010 Paris', 48.8715, 2.3615, 3, 'debutant', 'Paris', 'approved', 1),
(4, 'Bernard Gavilan since 1994', 'Costumes par époque, plusieurs marques de luxe.', 'costumes_occasion', NULL, 'Rue Blaes 162, 1000 Bruxelles, Belgique', 50.8395, 4.3465, 3, 'confirme', 'Bruxelles', 'approved', 1),
(5, 'Pauline Carton boutique', 'Petite boutique proposant des costumes, tout au fond.', 'costumes_occasion', NULL, 'Rue de Flandre 29, 1000 Bruxelles, Belgique', 50.8510, 4.3475, 2, 'debutant', 'Bruxelles', 'approved', 1),
(6, 'The Manchego - Vintage Shop', 'Boutique vintage sélectionnée au coeur de Paris.', 'costumes_occasion', NULL, '22 Rue de Beaune, 75007 Paris', 48.8585, 2.3295, 3, 'confirme', 'Paris', 'approved', 1),
(7, 'Chez Ammar', 'Des perles rares dans un bordel savamment orchestré et beaucoup d''humour.', 'costumes_occasion', NULL, '65 Rue Nollet, 75017 Paris', 48.8875, 2.3215, 2, 'pointu', 'Paris', 'approved', 1),
(8, 'Chez Ugo', 'Sélection vintage de caractère à Lille.', 'costumes_occasion', NULL, '3 Place Aux Oignons 59800 Lille', 50.6405, 3.0625, 2, 'confirme', 'Lille', 'approved', 1),

-- Tailleurs (Grande Mesure, Sur Mesure, PAP)
(9, 'Cifonelli', 'Tailleur de grande mesure légendaire, célèbre pour son épaule cigarette.', 'tailleur', 'tailleur_grande', '31 Rue Marbeuf, 75008 Paris', 48.8695, 2.3035, 4, 'pointu', 'Paris', 'approved', 1),
(10, 'Camps de Luca', 'L''excellence de la grande mesure parisienne.', 'tailleur', 'tailleur_grande', '16 Rue de la Paix, 75002 Paris', 48.8690, 2.3310, 4, 'pointu', 'Paris', 'approved', 1),
(11, 'Smalto', 'L''élégance italienne au service de la mesure parisienne.', 'tailleur', 'tailleur_sur', '44 Rue François 1er, 75008 Paris', 48.8685, 2.3045, 4, 'confirme', 'Paris', 'approved', 1),
(12, 'Husbands', 'Prêt-à-porter de luxe inspiré des grandes heures du style classique.', 'tailleur', 'tailleur_pap', '57 Rue de Richelieu, 75002 Paris', 48.8675, 2.3390, 3, 'debutant', 'Paris', 'approved', 1),
(13, 'Scavini', 'Tailleur parisien réputé pour son style classique et ses pantalons à la coupe impeccable.', 'tailleur', 'tailleur_sur', '19 Boulevard de Courcelles, 75008 Paris', 48.8785, 2.3115, 3, 'confirme', 'Paris', 'approved', 1),
(14, 'Pini Parma', 'Le style italien accessible en prêt-à-porter.', 'tailleur', 'tailleur_pap', '63 Rue de la Boétie, 75008 Paris', 48.8735, 2.3125, 2, 'debutant', 'Paris', 'approved', 0),

-- Souliers (Sur Mesure, PAP)
(15, 'Berluti', 'L''art de la patine et du soulier d''exception.', 'souliers', 'souliers_sur', '31 Rue Marbeuf, 75008 Paris', 48.8695, 2.3035, 4, 'pointu', 'Paris', 'approved', 1),
(16, 'John Lobb', 'Le bottier de référence, élégance intemporelle.', 'souliers', 'souliers_sur', '21 Rue Boissy d''Anglas, 75008 Paris', 48.8690, 2.3220, 4, 'pointu', 'Paris', 'approved', 1),
(17, 'J.M. Weston', 'L''icône du soulier français, célèbre pour son mocassin 180.', 'souliers', 'souliers_pap', '114 Av. des Champs-Élysées, 75008 Paris', 48.8720, 2.3010, 3, 'debutant', 'Paris', 'approved', 1),
(18, 'Aubercy', 'Maison familiale proposant des souliers d''une finesse rare.', 'souliers', 'souliers_sur', '34 Rue Vivienne, 75002 Paris', 48.8700, 2.3400, 4, 'confirme', 'Paris', 'approved', 1),
-- Nouvelles adresses
(19, 'Café Cirio', 'Un café historique de Bruxelles à l''ambiance Belle Époque, resté dans son jus depuis 1886.', 'cafes', NULL, 'Rue de la Bourse 18, 1000 Bruxelles, Belgique', 50.8484, 4.3501, 2, 'debutant', 'Bruxelles', 'approved', 0),
(20, 'Cyrano', 'Ancien café-concert au décor Art Nouveau magnifique, idéal pour un verre dans une ambiance historique.', 'cafes', NULL, '3 Rue Biot, 75017 Paris', 48.8836, 2.3274, 2, 'confirme', 'Paris', 'approved', 0),
(21, 'Antiquaire Delalande', 'Spécialiste mondial des objets de marine, d''astronomie et de globes terrestres anciens.', 'antiquaires', NULL, '35 Rue de Lille, 75007 Paris', 48.8582, 2.3292, 4, 'pointu', 'Paris', 'approved', 0),
(22, 'Restaurant Polidor', 'Créé en 1845, ce restaurant a vu passer Verlaine, Rimbaud et Hemingway. Cuisine bourgeoise traditionnelle.', 'restaurants', NULL, '41 Rue Monsieur le Prince, 75006 Paris', 48.8497, 2.3396, 2, 'debutant', 'Paris', 'approved', 0),
(23, 'Simon''s', 'Une adresse confidentielle pour dénicher de superbes vestes et costumes d''occasion de belle facture.', 'costumes_occasion', NULL, '10 Boulevard Arago, 75013 Paris', 48.8352, 2.3482, 2, 'confirme', 'Paris', 'approved', 0),
(24, 'Stéphane', 'Boutique élégante proposant une sélection avec une véritable touche anglaise au cœur des Batignolles.', 'tailleur', 'tailleur_pap', '65 Place du Docteur Félix Lobligeois, 75017 Paris', 48.8872, 2.3182, 3, 'confirme', 'Paris', 'approved', 0)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    address = EXCLUDED.address,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    price_range = EXCLUDED.price_range,
    level = EXCLUDED.level,
    city = EXCLUDED.city,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured;

-- Mettre à jour la séquence des IDs pour la table places
SELECT setval(pg_get_serial_sequence('places', 'id'), COALESCE((SELECT MAX(id) FROM places), 1));

-- Mise à jour automatique des villes basée sur l'adresse
UPDATE places SET city = 'Paris' WHERE (address LIKE '%Paris%' OR address LIKE '%750%') AND (city IS NULL OR city = '');
UPDATE places SET city = 'Bruxelles' WHERE (address LIKE '%Bruxelles%' OR address LIKE '%1000%') AND (city IS NULL OR city = '');
-- 4. Insertion des Carnets (Notebooks)
INSERT INTO notebooks (id, title, description, image_url, place_ids) VALUES
('debutant-costume-paris', 'Débutant dans le costume à Paris', 'Les meilleures adresses pour commencer sa garde-robe classique à Paris sans se ruiner.', 'https://images.unsplash.com/photo-1594932224828-b4b057b7d6ee?q=80&w=800&auto=format&fit=crop', ARRAY[1, 3, 7, 12, 14]),
('bruxelles-vintage', 'Le meilleur du vintage à Bruxelles', 'Parcours dans les rues de Bruxelles pour dénicher des pièces d''exception.', 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=800&auto=format&fit=crop', ARRAY[4, 5]),
('tailleurs-exception', 'Les Tailleurs d''Exception', 'Une sélection des maisons les plus prestigieuses de la capitale.', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop', ARRAY[9, 10, 11, 13])
ON CONFLICT (id) DO NOTHING;

-- 5. Insertion des Articles de Blog
INSERT INTO blog_posts (slug, title, excerpt, content, date, author, category, image, notebook_id) VALUES
('itineraire-debutant-paris-costumes-occasion', 'Itinéraire du débutant à Paris : L''art du costume d''occasion', 'Comment se constituer une garde-robe classique de haute volée sans se ruiner ? Suivez notre guide pas à pas dans les rues de Paris.', '<p>Débuter dans l''art tailleur peut sembler intimidant, surtout quand on regarde les prix de la Grande Mesure. Pourtant, Paris regorge de trésors pour qui sait où chercher. Nous avons conçu cet itinéraire spécialement pour ceux qui veulent allier élégance intemporelle et budget maîtrisé.</p><h3>Étape 1 : La chine de luxe chez Ammar</h3><p>Commencez votre journée au 13 Rue de la Grange Batelière. Chez Ammar, vous apprendrez à reconnaître les belles matières et les coupes d''exception. C''est ici que vous trouverez peut-être votre première veste en tweed ou un costume de grande maison à une fraction de son prix d''origine.</p><h3>Étape 2 : L''accessoire chez Charvet</h3><p>Une fois votre veste trouvée, dirigez-vous vers la Place Vendôme. Même si vous n''achetez pas de chemise sur mesure, l''observation des soies et des lins chez Charvet affinera votre œil. Une belle cravate ou une pochette d''occasion (trouvée chez Ammar) se marie parfaitement avec l''excellence de cette maison.</p><h3>Étape 3 : La retouche, secret de l''élégance</h3><p>Un costume d''occasion n'est parfait que s'il est ajusté. Passez voir Scavini pour comprendre l''importance d''une ligne d''épaule ou d''un tombé de pantalon. Un bon retoucheur est le meilleur ami de l''amateur de vintage.</p><p>Cet itinéraire n''est pas qu''une liste de boutiques, c''est une éducation de l''œil. Prenez le temps de discuter avec les passionnés que vous rencontrerez sur votre route.</p>', '19 Mars 2026', 'L''équipe Gentlemap', 'Carnet', 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=800', 'paris-debutant-costumes'),
('cifonelli-epaule-iconique-rue-marbeuf', 'Cifonelli : L''Épaule Iconique de la Rue Marbeuf', 'Plongez dans l''univers du plus célèbre tailleur de la Grande Mesure parisienne, où chaque coupe est une œuvre d''art.', '<p>Située au 31 Rue Marbeuf, la maison Cifonelli incarne l''excellence du tailleur parisien. Fondée en 1880, elle est aujourd''hui dirigée par Lorenzo et Massimo Cifonelli, qui perpétuent un savoir-faire unique au monde.</p><p>Ce qui rend Cifonelli si spécial, c''est avant tout son "épaule". Une coupe particulière, légèrement projetée vers l''avant, qui offre une silhouette à la fois structurée et d''une souplesse incroyable. C''est le mariage parfait entre la rigueur anglaise et la fluidité italienne.</p><p>Entrer chez Cifonelli, c''est entrer dans un temple de la patience. Un costume en Grande Mesure nécessite plus de 80 heures de travail manuel et plusieurs essayages. Chaque détail, de la boutonnière à la doublure, est pensé pour l''homme qui le porte.</p><p>Pour les amateurs d''élégance classique, c''est une étape incontournable de notre carte.</p>', '15 Mars 2026', 'L''équipe Gentlemap', 'Tailleur', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800', NULL),
('chez-ammar-caverne-alibaba-vintage', 'Chez Ammar : La Caverne d''Alibaba du Vintage', 'Découvrez notre adresse favorite pour dénicher des costumes d''occasion et des pièces rares au cœur du 9ème arrondissement.', '<p>Au 13 Rue de la Grange Batelière, se cache l''un des secrets les mieux gardés des élégants parisiens : Chez Ammar. Loin des friperies classiques, cette boutique propose une sélection pointue de costumes d''occasion, de vestes de sport et d''accessoires de luxe.</p><p>Ammar, le maître des lieux, possède un œil infaillible pour dénicher des pièces de grandes maisons à des prix accessibles. On y trouve souvent du Cifonelli (justement !), du Hermès ou du Charvet, patiemment sélectionnés pour leur état et leur style intemporel.</p><p>C''est l''endroit idéal pour commencer une garde-robe classique sans se ruiner, ou pour trouver la pièce rare qui manque à votre collection. L''accueil y est toujours chaleureux, et les conseils d''Ammar sont précieux pour quiconque s''intéresse à l''histoire du vêtement.</p>', '10 Mars 2026', 'L''équipe Gentlemap', 'Vintage', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800', NULL),
('le-select-ame-de-montparnasse', 'Le Select : L''Âme de Montparnasse', 'Retour sur l''histoire d''un café mythique où le temps semble s''être arrêté, entre littérature et élégance décontractée.', '<p>Le Select, au 99 Boulevard du Montparnasse, n''est pas qu''un simple café. C''est une institution qui a vu passer Hemingway, Picasso et Fitzgerald. Contrairement à ses voisins parfois trop touristiques, Le Select a su préserver son authenticité.</p><p>Avec son comptoir en zinc, ses banquettes en cuir et ses serveurs en tablier blanc, l''ambiance y est restée celle du Paris des années 30. C''est l''endroit parfait pour lire un livre de la Librairie Galignani tout en dégustant un café ou un apéritif.</p><p>L''élégance ici est discrète, presque nonchalante. C''est le lieu idéal pour observer la faune parisienne et se laisser porter par l''histoire littéraire du quartier.</p>', '5 Mars 2026', 'L''équipe Gentlemap', 'Café', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800', NULL)
ON CONFLICT (slug) DO NOTHING;
