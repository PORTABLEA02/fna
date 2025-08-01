/*
  # Ajout du workflow de consultation et constantes vitales

  1. Nouvelles Tables
    - `vital_signs` - Constantes vitales des patients
    - `consultation_workflows` - Workflow de prise en charge des consultations

  2. Sécurité
    - RLS activé sur les nouvelles tables
    - Politiques basées sur les rôles existants

  3. Fonctionnalités
    - Gestion des constantes vitales
    - Workflow automatisé de consultation
    - Suivi du statut de prise en charge
*/

-- Table des constantes vitales
CREATE TABLE IF NOT EXISTS vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  temperature DECIMAL(4,1), -- en °C
  blood_pressure_systolic INTEGER, -- en mmHg
  blood_pressure_diastolic INTEGER, -- en mmHg
  heart_rate INTEGER, -- battements par minute
  weight DECIMAL(5,2), -- en kg
  height DECIMAL(5,2), -- en cm
  oxygen_saturation INTEGER, -- en %
  respiratory_rate INTEGER, -- respirations par minute
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table du workflow de consultation
CREATE TABLE IF NOT EXISTS consultation_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  vital_signs_id UUID REFERENCES vital_signs(id),
  doctor_id UUID REFERENCES profiles(id),
  consultation_type consultation_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'payment-pending' CHECK (status IN (
    'payment-pending',
    'payment-completed', 
    'vitals-pending',
    'doctor-assignment',
    'consultation-ready',
    'in-progress',
    'completed'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES profiles(id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_consultation_workflows_patient ON consultation_workflows(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_workflows_doctor ON consultation_workflows(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_workflows_status ON consultation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_consultation_workflows_date ON consultation_workflows(created_at);

-- Trigger pour updated_at
CREATE TRIGGER update_consultation_workflows_updated_at 
  BEFORE UPDATE ON consultation_workflows 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour automatiquement le workflow lors du paiement
CREATE OR REPLACE FUNCTION update_workflow_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le workflow si la facture est payée
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE consultation_workflows 
    SET status = 'payment-completed', updated_at = now()
    WHERE invoice_id = NEW.id AND status = 'payment-pending';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_on_invoice_payment
  AFTER UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_workflow_on_payment();

-- Activer RLS sur les nouvelles tables
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_workflows ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour vital_signs
CREATE POLICY "All authenticated users can read vital signs"
  ON vital_signs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'secretary')
    )
  );

CREATE POLICY "Admins and secretaries can manage vital signs"
  ON vital_signs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Politiques RLS pour consultation_workflows
CREATE POLICY "All authenticated users can read workflows"
  ON consultation_workflows
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'secretary')
    )
  );

CREATE POLICY "Admins and secretaries can manage workflows"
  ON consultation_workflows
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

CREATE POLICY "Doctors can update their assigned workflows"
  ON consultation_workflows
  FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );