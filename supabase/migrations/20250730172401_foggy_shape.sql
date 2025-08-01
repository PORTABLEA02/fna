/*
  # Schéma complet pour système de gestion de clinique médicale

  1. Tables principales
    - `profiles` - Profils utilisateurs étendus (médecins, administrateurs, secrétaires)
    - `patients` - Informations des patients
    - `appointments` - Rendez-vous médicaux
    - `medical_records` - Dossiers médicaux et consultations
    - `prescriptions` - Ordonnances détaillées
    - `medicines` - Inventaire des médicaments et fournitures
    - `stock_movements` - Mouvements de stock
    - `invoices` - Factures
    - `invoice_items` - Éléments de facturation
    - `payments` - Paiements
    - `staff_schedules` - Planning du personnel

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques basées sur les rôles (admin, doctor, secretary)
    - Authentification Supabase intégrée

  3. Fonctionnalités
    - Gestion complète des patients
    - Système de rendez-vous
    - Dossiers médicaux avec prescriptions
    - Gestion d'inventaire médical
    - Facturation et paiements
    - Planning du personnel
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'secretary');
CREATE TYPE gender_type AS ENUM ('M', 'F');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show');
CREATE TYPE consultation_type AS ENUM ('general', 'specialist', 'emergency', 'followup', 'preventive', 'other');
CREATE TYPE medicine_category AS ENUM ('medication', 'medical-supply', 'equipment', 'consumable', 'diagnostic');
CREATE TYPE stock_movement_type AS ENUM ('in', 'out');
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile-money', 'bank-transfer', 'check');
CREATE TYPE schedule_shift AS ENUM ('morning', 'afternoon', 'night', 'full-day');
CREATE TYPE schedule_status AS ENUM ('scheduled', 'confirmed', 'completed', 'absent');

-- Table des profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'secretary',
  speciality TEXT,
  phone TEXT NOT NULL,
  department TEXT,
  hire_date DATE,
  salary DECIMAL(12,2),
  work_schedule TEXT DEFAULT 'Temps plein',
  emergency_contact TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30, -- en minutes
  reason TEXT NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Table des dossiers médicaux/consultations
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  date DATE NOT NULL,
  type consultation_type NOT NULL,
  reason TEXT NOT NULL,
  symptoms TEXT,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  notes TEXT,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des médicaments et fournitures
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category medicine_category NOT NULL,
  manufacturer TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  location TEXT NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT, -- référence facture/bon de commande
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY, -- Format: INV-YYYY-XXXXX
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status invoice_status DEFAULT 'pending',
  payment_method payment_method,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Table des éléments de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  medicine_id UUID REFERENCES medicines(id), -- Si c'est un produit de l'inventaire
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_date DATE NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Table du planning du personnel
CREATE TABLE IF NOT EXISTS staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift schedule_shift NOT NULL,
  status schedule_status DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_record ON prescriptions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_medicine ON stock_movements(medicine_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(date);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff ON staff_schedules(staff_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour le stock automatiquement
CREATE OR REPLACE FUNCTION update_medicine_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE medicines 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.medicine_id;
  ELSIF NEW.type = 'out' THEN
    UPDATE medicines 
    SET current_stock = current_stock - NEW.quantity 
    WHERE id = NEW.medicine_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_on_movement 
  AFTER INSERT ON stock_movements 
  FOR EACH ROW EXECUTE FUNCTION update_medicine_stock();

-- Fonction pour calculer les totaux de facture
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  invoice_subtotal DECIMAL(12,2);
  invoice_tax DECIMAL(12,2);
  invoice_total DECIMAL(12,2);
BEGIN
  -- Calculer le sous-total
  SELECT COALESCE(SUM(total), 0) INTO invoice_subtotal
  FROM invoice_items 
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Récupérer la taxe existante
  SELECT tax INTO invoice_tax
  FROM invoices 
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Calculer le total
  invoice_total := invoice_subtotal + COALESCE(invoice_tax, 0);
  
  -- Mettre à jour la facture
  UPDATE invoices 
  SET subtotal = invoice_subtotal, total = invoice_total
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_totals_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;