/*
  # Insertion de données de test pour CliniCare

  1. Données insérées
    - Profils utilisateurs (administrateurs, médecins, secrétaires)
    - Patients avec informations complètes
    - Rendez-vous programmés
    - Dossiers médicaux avec consultations
    - Prescriptions détaillées
    - Inventaire de médicaments et fournitures
    - Mouvements de stock
    - Factures et éléments de facturation
    - Paiements
    - Planning du personnel

  2. Cohérence des données
    - Relations entre tables respectées
    - Dates réalistes et cohérentes
    - Données médicales crédibles
    - Stock et mouvements logiques

  3. Variété des cas
    - Différents types de consultations
    - Statuts variés pour les rendez-vous
    - Factures payées et en attente
    - Stock normal et critique
*/

-- Insertion des profils utilisateurs
INSERT INTO profiles (id, email, first_name, last_name, role, speciality, phone, department, hire_date, salary, work_schedule, emergency_contact, address, is_active) VALUES
-- Administrateurs
('11111111-1111-1111-1111-111111111111', 'admin@clinicare.cm', 'Marie', 'Durand', 'admin', NULL, '+237 690 000 001', 'Administration', '2023-01-15', 3500000, 'Temps plein', '+237 690 000 011', 'Yaoundé, Quartier Bastos', true),
('22222222-2222-2222-2222-222222222222', 'directeur@clinicare.cm', 'Paul', 'Mbarga', 'admin', NULL, '+237 690 000 002', 'Direction', '2022-06-01', 4500000, 'Temps plein', '+237 690 000 012', 'Yaoundé, Quartier Melen', true),

-- Médecins
('33333333-3333-3333-3333-333333333333', 'dr.martin@clinicare.cm', 'Paul', 'Martin', 'doctor', 'Cardiologie', '+237 690 000 003', 'Médecine', '2023-03-01', 3200000, 'Temps plein', '+237 690 000 013', 'Yaoundé, Quartier Nlongkak', true),
('44444444-4444-4444-4444-444444444444', 'dr.kouam@clinicare.cm', 'Jean', 'Kouam', 'doctor', 'Médecine générale', '+237 690 000 004', 'Médecine', '2023-09-01', 2800000, 'Temps plein', '+237 690 000 014', 'Douala, Akwa', true),
('55555555-5555-5555-5555-555555555555', 'dr.dubois@clinicare.cm', 'Sophie', 'Dubois', 'doctor', 'Pédiatrie', '+237 690 000 005', 'Médecine', '2023-05-15', 3000000, 'Temps plein', '+237 690 000 015', 'Yaoundé, Quartier Emana', true),
('66666666-6666-6666-6666-666666666666', 'dr.nkomo@clinicare.cm', 'Claire', 'Nkomo', 'doctor', 'Gynécologie', '+237 690 000 006', 'Médecine', '2023-07-01', 3100000, 'Temps partiel', '+237 690 000 016', 'Yaoundé, Quartier Essos', true),

-- Secrétaires et personnel soignant
('77777777-7777-7777-7777-777777777777', 'secretaire@clinicare.cm', 'Sophie', 'Mbala', 'secretary', NULL, '+237 690 000 007', 'Accueil', '2023-06-15', 900000, 'Temps plein', '+237 690 000 017', 'Yaoundé, Quartier Mvog-Ada', true),
('88888888-8888-8888-8888-888888888888', 'infirmiere@clinicare.cm', 'Claire', 'Atangana', 'secretary', NULL, '+237 690 000 008', 'Soins infirmiers', '2023-04-10', 1200000, 'Temps plein', '+237 690 000 018', 'Yaoundé, Quartier Biyem-Assi', true),
('99999999-9999-9999-9999-999999999999', 'pharmacien@clinicare.cm', 'Michel', 'Fouda', 'secretary', NULL, '+237 690 000 009', 'Pharmacie', '2023-08-01', 1500000, 'Temps plein', '+237 690 000 019', 'Yaoundé, Quartier Mendong', true);

-- Insertion des patients
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, blood_type, allergies, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jean', 'Nguema', '1985-03-15', 'M', '+237 690 123 456', 'jean.nguema@email.com', 'Yaoundé, Quartier Bastos, Rue 1234', '+237 690 654 321', 'A+', '{"Pénicilline"}', '77777777-7777-7777-7777-777777777777'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Marie', 'Atangana', '1992-07-22', 'F', '+237 690 987 654', 'marie.atangana@email.com', 'Douala, Akwa, Avenue de la Liberté', '+237 690 111 222', 'O-', '{}', '77777777-7777-7777-7777-777777777777'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pierre', 'Biya', '1978-11-08', 'M', '+237 690 555 777', 'pierre.biya@email.com', 'Yaoundé, Quartier Melen, Rue des Palmiers', '+237 690 888 999', 'B+', '{"Aspirine", "Latex"}', '77777777-7777-7777-7777-777777777777'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Fatima', 'Hassan', '1995-02-14', 'F', '+237 690 333 444', 'fatima.hassan@email.com', 'Garoua, Quartier Plateau, BP 1234', '+237 690 777 888', 'AB+', '{}', '77777777-7777-7777-7777-777777777777'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Emmanuel', 'Mbappé', '1988-12-03', 'M', '+237 690 222 333', 'emmanuel.mbappe@email.com', 'Bamenda, Commercial Avenue, Mile 3', '+237 690 444 555', 'O+', '{"Iode"}', '77777777-7777-7777-7777-777777777777'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Aminata', 'Diallo', '2010-06-18', 'F', '+237 690 666 777', 'aminata.diallo@email.com', 'Yaoundé, Quartier Tsinga, Rue 5678', '+237 690 999 111', 'A-', '{}', '77777777-7777-7777-7777-777777777777'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Robert', 'Essomba', '1965-09-25', 'M', '+237 690 111 222', 'robert.essomba@email.com', 'Douala, Bonanjo, Rue Joffre', '+237 690 333 444', 'B-', '{"Morphine"}', '77777777-7777-7777-7777-777777777777'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Grace', 'Ngo', '1990-04-12', 'F', '+237 690 777 888', 'grace.ngo@email.com', 'Yaoundé, Quartier Omnisport, Immeuble ABC', '+237 690 555 666', 'AB-', '{}', '77777777-7777-7777-7777-777777777777');

-- Insertion des rendez-vous
INSERT INTO appointments (id, patient_id, doctor_id, date, time, duration, reason, status, notes, created_by) VALUES
-- Rendez-vous passés
('ap111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '2024-01-15', '09:00', 45, 'Douleurs thoraciques', 'completed', 'Patient ponctuel, symptômes bien décrits', '77777777-7777-7777-7777-777777777777'),
('ap222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', '2024-01-16', '14:30', 30, 'Contrôle de routine', 'completed', 'Examen général satisfaisant', '77777777-7777-7777-7777-777777777777'),
('ap333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '2024-01-17', '10:15', 60, 'Suivi hypertension', 'completed', 'Tension bien contrôlée', '77777777-7777-7777-7777-777777777777'),

-- Rendez-vous d'aujourd'hui
('ap444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', CURRENT_DATE, '09:30', 30, 'Vaccination enfant', 'confirmed', 'Rappel vaccins obligatoires', '77777777-7777-7777-7777-777777777777'),
('ap555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', CURRENT_DATE, '11:00', 45, 'Maux de tête persistants', 'scheduled', 'Premier rendez-vous', '77777777-7777-7777-7777-777777777777'),
('ap666666-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', CURRENT_DATE, '15:30', 30, 'Contrôle croissance', 'confirmed', 'Suivi pédiatrique régulier', '77777777-7777-7777-7777-777777777777'),

-- Rendez-vous futurs
('ap777777-7777-7777-7777-777777777777', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '66666666-6666-6666-6666-666666666666', CURRENT_DATE + INTERVAL '1 day', '08:30', 45, 'Consultation gynécologique', 'scheduled', 'Examen de routine', '77777777-7777-7777-7777-777777777777'),
('ap888888-8888-8888-8888-888888888888', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '33333333-3333-3333-3333-333333333333', CURRENT_DATE + INTERVAL '2 days', '14:00', 60, 'Bilan cardiologique', 'scheduled', 'Première consultation cardiologie', '77777777-7777-7777-7777-777777777777'),
('ap999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', CURRENT_DATE + INTERVAL '7 days', '10:00', 30, 'Résultats analyses', 'scheduled', 'Suivi examens complémentaires', '77777777-7777-7777-7777-777777777777');

-- Insertion des dossiers médicaux
INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, date, type, reason, symptoms, diagnosis, treatment, notes, attachments) VALUES
('mr111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'ap111111-1111-1111-1111-111111111111', '2024-01-15', 'specialist', 'Douleurs thoraciques', 'Douleur oppressante au niveau du thorax, essoufflement à l''effort, fatigue', 'Suspicion d''angine de poitrine - Recommandation d''examens complémentaires', 'Repos, éviter les efforts intenses, surveillance tension artérielle', 'Patient anxieux, antécédents familiaux de maladie cardiaque. Recommandé ECG et échographie cardiaque.', '{}'),

('mr222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'ap222222-2222-2222-2222-222222222222', '2024-01-16', 'general', 'Contrôle de routine', 'Aucun symptôme particulier', 'État général satisfaisant', 'Maintenir une alimentation équilibrée et une activité physique régulière', 'Tension artérielle normale (120/80), poids stable, pas de signes pathologiques.', '{}'),

('mr333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'ap333333-3333-3333-3333-333333333333', '2024-01-17', 'followup', 'Suivi hypertension', 'Légers maux de tête matinaux', 'Hypertension artérielle bien contrôlée sous traitement', 'Poursuite du traitement antihypertenseur, surveillance régulière', 'Bonne observance du traitement. Tension : 135/85 mmHg. Ajustement posologique si nécessaire.', '{}'),

('mr444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', NULL, '2024-01-10', 'emergency', 'Crise de migraine sévère', 'Céphalées intenses, nausées, photophobie', 'Migraine avec aura', 'Traitement symptomatique, repos en environnement calme', 'Épisode migraineux typique. Patient soulagé après traitement. Conseils préventifs donnés.', '{}'),

('mr555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', NULL, '2024-01-12', 'preventive', 'Bilan de santé enfant', 'Aucun symptôme', 'Développement normal pour l''âge', 'Poursuite des vaccinations selon calendrier', 'Croissance harmonieuse. Poids : 35kg, Taille : 140cm. Développement psychomoteur normal.', '{}');

-- Insertion des prescriptions
INSERT INTO prescriptions (id, medical_record_id, medication, dosage, frequency, duration, instructions) VALUES
-- Prescriptions pour Jean Nguema (douleurs thoraciques)
('pr111111-1111-1111-1111-111111111111', 'mr111111-1111-1111-1111-111111111111', 'Aspirine 75mg', '1 comprimé', '1 fois par jour', '30 jours', 'À prendre le matin avec un verre d''eau, de préférence après le petit-déjeuner'),
('pr222222-2222-2222-2222-222222222222', 'mr111111-1111-1111-1111-111111111111', 'Atorvastatine 20mg', '1 comprimé', '1 fois par jour le soir', '90 jours', 'À prendre après le dîner. Éviter le pamplemousse.'),

-- Prescriptions pour Pierre Biya (hypertension)
('pr333333-3333-3333-3333-333333333333', 'mr333333-3333-3333-3333-333333333333', 'Lisinopril 10mg', '1 comprimé', '1 fois par jour le matin', '90 jours', 'À prendre à jeun, 30 minutes avant le petit-déjeuner'),
('pr444444-4444-4444-4444-444444444444', 'mr333333-3333-3333-3333-333333333333', 'Amlodipine 5mg', '1 comprimé', '1 fois par jour', '90 jours', 'Peut être pris avec ou sans nourriture'),

-- Prescriptions pour Emmanuel Mbappé (migraine)
('pr555555-5555-5555-5555-555555555555', 'mr444444-4444-4444-4444-444444444444', 'Sumatriptan 50mg', '1 comprimé', 'En cas de crise', '10 comprimés', 'Prendre dès les premiers signes de migraine. Maximum 2 comprimés par 24h'),
('pr666666-6666-6666-6666-666666666666', 'mr444444-4444-4444-4444-444444444444', 'Paracétamol 1000mg', '1 comprimé', 'Toutes les 6h si besoin', '5 jours', 'En cas de douleur persistante. Ne pas dépasser 4g par jour');

-- Insertion des médicaments et fournitures
INSERT INTO medicines (id, name, category, manufacturer, batch_number, expiry_date, current_stock, min_stock, unit_price, location, unit, description, created_by) VALUES
-- Médicaments
('med11111-1111-1111-1111-111111111111', 'Paracétamol 500mg', 'medication', 'Pharma Cameroun', 'PC2024001', '2025-12-31', 5, 20, 250, 'Pharmacie - Étagère A1', 'boîte', 'Antalgique et antipyrétique', '99999999-9999-9999-9999-999999999999'),
('med22222-2222-2222-2222-222222222222', 'Amoxicilline 250mg', 'medication', 'MediCam', 'MC2024002', '2025-06-30', 45, 30, 180, 'Pharmacie - Étagère B2', 'boîte', 'Antibiotique à large spectre', '99999999-9999-9999-9999-999999999999'),
('med33333-3333-3333-3333-333333333333', 'Aspirine 75mg', 'medication', 'CardioMed', 'CM2024003', '2025-08-15', 25, 15, 150, 'Pharmacie - Étagère A2', 'boîte', 'Antiagrégant plaquettaire', '99999999-9999-9999-9999-999999999999'),
('med44444-4444-4444-4444-444444444444', 'Lisinopril 10mg', 'medication', 'HyperMed', 'HM2024004', '2025-10-20', 18, 12, 320, 'Pharmacie - Étagère C1', 'boîte', 'Inhibiteur de l''enzyme de conversion', '99999999-9999-9999-9999-999999999999'),
('med55555-5555-5555-5555-555555555555', 'Sumatriptan 50mg', 'medication', 'NeuroPharm', 'NP2024005', '2025-07-10', 8, 10, 850, 'Pharmacie - Étagère D1', 'boîte', 'Traitement de la migraine', '99999999-9999-9999-9999-999999999999'),

-- Fournitures médicales
('med66666-6666-6666-6666-666666666666', 'Seringues jetables 5ml', 'medical-supply', 'MedSupply', 'MS2024006', '2026-03-15', 150, 100, 50, 'Salle de soins - Armoire 1', 'pièce', 'Seringues stériles à usage unique', '99999999-9999-9999-9999-999999999999'),
('med77777-7777-7777-7777-777777777777', 'Gants latex stériles', 'medical-supply', 'SafeHands', 'SH2024007', '2025-08-20', 8, 20, 1200, 'Salle de soins - Armoire 2', 'boîte de 100', 'Gants d''examen en latex poudrés', '99999999-9999-9999-9999-999999999999'),
('med88888-8888-8888-8888-888888888888', 'Compresses stériles 10x10cm', 'medical-supply', 'SterileSupply', 'SS2024008', '2025-11-30', 25, 15, 800, 'Salle de soins - Étagère C1', 'paquet de 50', 'Compresses de gaze stériles', '99999999-9999-9999-9999-999999999999'),
('med99999-9999-9999-9999-999999999999', 'Masques chirurgicaux', 'medical-supply', 'ProtectMed', 'PM2024009', '2025-12-15', 200, 150, 25, 'Salle de soins - Armoire 3', 'pièce', 'Masques de protection à usage unique', '99999999-9999-9999-9999-999999999999'),

-- Équipements
('med10101-1010-1010-1010-101010101010', 'Thermomètre digital', 'equipment', 'MedTech', 'MT2024010', '2027-01-15', 3, 5, 15000, 'Cabinet médical', 'pièce', 'Thermomètre électronique médical', '99999999-9999-9999-9999-999999999999'),
('med11011-1101-1101-1101-110110110110', 'Tensiomètre automatique', 'equipment', 'CardioTech', 'CT2024011', '2026-09-30', 2, 3, 85000, 'Cabinet médical', 'pièce', 'Tensiomètre électronique avec brassard', '99999999-9999-9999-9999-999999999999'),

-- Consommables
('med12121-1212-1212-1212-121212121212', 'Alcool médical 70°', 'consumable', 'ChemMed', 'CM2024012', '2025-09-10', 12, 8, 2500, 'Salle de soins - Armoire 3', 'litre', 'Solution désinfectante', '99999999-9999-9999-9999-999999999999'),
('med13131-1313-1313-1313-131313131313', 'Coton hydrophile', 'consumable', 'CottonCare', 'CC2024013', '2026-12-31', 6, 10, 1500, 'Salle de soins - Étagère D1', 'paquet 500g', 'Coton médical stérile', '99999999-9999-9999-9999-999999999999'),

-- Matériel de diagnostic
('med14141-1414-1414-1414-141414141414', 'Bandelettes test glucose', 'diagnostic', 'DiagnoTest', 'DT2024014', '2025-04-30', 2, 5, 8500, 'Laboratoire - Réfrigérateur', 'boîte de 50', 'Test rapide de glycémie', '99999999-9999-9999-9999-999999999999'),
('med15151-1515-1515-1515-151515151515', 'Tests de grossesse', 'diagnostic', 'PregnancyTest', 'PT2024015', '2025-11-20', 15, 10, 1200, 'Laboratoire - Armoire A', 'boîte de 25', 'Tests urinaires de grossesse', '99999999-9999-9999-9999-999999999999');

-- Insertion des mouvements de stock
INSERT INTO stock_movements (id, medicine_id, type, quantity, reason, reference, date, user_id) VALUES
-- Entrées de stock (réapprovisionnement)
('sm111111-1111-1111-1111-111111111111', 'med11111-1111-1111-1111-111111111111', 'in', 50, 'Réapprovisionnement initial', 'BON-2024-001', '2024-01-01', '99999999-9999-9999-9999-999999999999'),
('sm222222-2222-2222-2222-222222222222', 'med22222-2222-2222-2222-222222222222', 'in', 60, 'Commande fournisseur', 'BON-2024-002', '2024-01-02', '99999999-9999-9999-9999-999999999999'),
('sm333333-3333-3333-3333-333333333333', 'med66666-6666-6666-6666-666666666666', 'in', 200, 'Stock initial', 'BON-2024-003', '2024-01-03', '99999999-9999-9999-9999-999999999999'),

-- Sorties de stock (utilisation/vente)
('sm444444-4444-4444-4444-444444444444', 'med11111-1111-1111-1111-111111111111', 'out', 45, 'Dispensation patients', 'DISP-2024-001', '2024-01-15', '99999999-9999-9999-9999-999999999999'),
('sm555555-5555-5555-5555-555555555555', 'med22222-2222-2222-2222-222222222222', 'out', 15, 'Prescription Dr. Kouam', 'PRESC-2024-001', '2024-01-16', '99999999-9999-9999-9999-999999999999'),
('sm666666-6666-6666-6666-666666666666', 'med66666-6666-6666-6666-666666666666', 'out', 50, 'Utilisation salle de soins', 'UTIL-2024-001', '2024-01-17', '88888888-8888-8888-8888-888888888888'),
('sm777777-7777-7777-7777-777777777777', 'med77777-7777-7777-7777-777777777777', 'out', 12, 'Consultations du jour', 'UTIL-2024-002', '2024-01-18', '88888888-8888-8888-8888-888888888888'),
('sm888888-8888-8888-8888-888888888888', 'med14141-1414-1414-1414-141414141414', 'out', 3, 'Tests diabète', 'TEST-2024-001', '2024-01-19', '88888888-8888-8888-8888-888888888888');

-- Insertion des factures
INSERT INTO invoices (id, patient_id, appointment_id, date, subtotal, tax, total, status, payment_method, paid_at, created_by) VALUES
('INV-2024-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ap111111-1111-1111-1111-111111111111', '2024-01-15', 40000, 0, 40000, 'paid', 'card', '2024-01-15 16:30:00', '77777777-7777-7777-7777-777777777777'),
('INV-2024-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ap222222-2222-2222-2222-222222222222', '2024-01-16', 15000, 0, 15000, 'paid', 'cash', '2024-01-16 15:45:00', '77777777-7777-7777-7777-777777777777'),
('INV-2024-003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ap333333-3333-3333-3333-333333333333', '2024-01-17', 25000, 0, 25000, 'pending', NULL, NULL, '77777777-7777-7777-7777-777777777777'),
('INV-2024-004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '2024-01-10', 35000, 0, 35000, 'overdue', NULL, NULL, '77777777-7777-7777-7777-777777777777'),
('INV-2024-005', 'ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, '2024-01-12', 20000, 0, 20000, 'paid', 'mobile-money', '2024-01-12 11:20:00', '77777777-7777-7777-7777-777777777777');

-- Insertion des éléments de facture
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total, medicine_id) VALUES
-- Facture INV-2024-001 (Jean Nguema - Consultation cardiologique)
('ii111111-1111-1111-1111-111111111111', 'INV-2024-001', 'Consultation cardiologique', 1, 25000, 25000, NULL),
('ii222222-2222-2222-2222-222222222222', 'INV-2024-001', 'ECG', 1, 15000, 15000, NULL),

-- Facture INV-2024-002 (Marie Atangana - Consultation générale)
('ii333333-3333-3333-3333-333333333333', 'INV-2024-002', 'Consultation générale', 1, 15000, 15000, NULL),

-- Facture INV-2024-003 (Pierre Biya - Suivi hypertension)
('ii444444-4444-4444-4444-444444444444', 'INV-2024-003', 'Consultation de suivi', 1, 20000, 20000, NULL),
('ii555555-5555-5555-5555-555555555555', 'INV-2024-003', 'Médicaments prescrits', 1, 5000, 5000, 'med44444-4444-4444-4444-444444444444'),

-- Facture INV-2024-004 (Emmanuel Mbappé - Urgence migraine)
('ii666666-6666-6666-6666-666666666666', 'INV-2024-004', 'Consultation d''urgence', 1, 30000, 30000, NULL),
('ii777777-7777-7777-7777-777777777777', 'INV-2024-004', 'Sumatriptan 50mg (boîte)', 1, 5000, 5000, 'med55555-5555-5555-5555-555555555555'),

-- Facture INV-2024-005 (Aminata Diallo - Bilan pédiatrique)
('ii888888-8888-8888-8888-888888888888', 'INV-2024-005', 'Consultation pédiatrique', 1, 20000, 20000, NULL);

-- Insertion des paiements
INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, reference, notes, created_by) VALUES
('pay11111-1111-1111-1111-111111111111', 'INV-2024-001', 40000, 'card', '2024-01-15', 'CARD-20240115-001', 'Paiement par carte Visa', '77777777-7777-7777-7777-777777777777'),
('pay22222-2222-2222-2222-222222222222', 'INV-2024-002', 15000, 'cash', '2024-01-16', 'CASH-20240116-001', 'Paiement en espèces', '77777777-7777-7777-7777-777777777777'),
('pay33333-3333-3333-3333-333333333333', 'INV-2024-005', 20000, 'mobile-money', '2024-01-12', 'MOMO-20240112-001', 'Orange Money', '77777777-7777-7777-7777-777777777777');

-- Insertion du planning du personnel
INSERT INTO staff_schedules (id, staff_id, date, start_time, end_time, shift, status, created_by) VALUES
-- Planning de cette semaine
('sch11111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', CURRENT_DATE, '08:00', '16:00', 'full-day', 'confirmed', '11111111-1111-1111-1111-111111111111'),
('sch22222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', CURRENT_DATE, '08:00', '16:00', 'full-day', 'confirmed', '11111111-1111-1111-1111-111111111111'),
('sch33333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', CURRENT_DATE, '09:00', '17:00', 'full-day', 'confirmed', '11111111-1111-1111-1111-111111111111'),
('sch44444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', CURRENT_DATE, '07:30', '15:30', 'morning', 'confirmed', '11111111-1111-1111-1111-111111111111'),
('sch55555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', CURRENT_DATE, '15:00', '23:00', 'afternoon', 'confirmed', '11111111-1111-1111-1111-111111111111'),

-- Planning de demain
('sch66666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', CURRENT_DATE + INTERVAL '1 day', '08:00', '16:00', 'full-day', 'scheduled', '11111111-1111-1111-1111-111111111111'),
('sch77777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', CURRENT_DATE + INTERVAL '1 day', '14:00', '18:00', 'afternoon', 'scheduled', '11111111-1111-1111-1111-111111111111'),
('sch88888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', CURRENT_DATE + INTERVAL '1 day', '07:30', '15:30', 'morning', 'scheduled', '11111111-1111-1111-1111-111111111111'),

-- Planning de la semaine prochaine
('sch99999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', CURRENT_DATE + INTERVAL '7 days', '08:00', '16:00', 'full-day', 'scheduled', '11111111-1111-1111-1111-111111111111'),
('sch10101-1010-1010-1010-101010101010', '55555555-5555-5555-5555-555555555555', CURRENT_DATE + INTERVAL '7 days', '09:00', '17:00', 'full-day', 'scheduled', '11111111-1111-1111-1111-111111111111');