/*
  # Politiques RLS pour le système de gestion médicale

  1. Politiques pour profiles
    - Admins: accès complet
    - Doctors: lecture de tous les profils, modification de leur propre profil
    - Secretaries: lecture limitée, modification de leur propre profil

  2. Politiques pour patients
    - Admins et Secretaries: accès complet
    - Doctors: lecture de tous les patients

  3. Politiques pour les autres tables
    - Basées sur les rôles et les relations patient-médecin
*/

-- Politiques pour profiles
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Doctors can read other profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
  );

-- Politiques pour patients
CREATE POLICY "Admins and secretaries can manage patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

CREATE POLICY "Doctors can read all patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
  );

-- Politiques pour appointments
CREATE POLICY "Admins and secretaries can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

CREATE POLICY "Doctors can read their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can update their appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Politiques pour medical_records
CREATE POLICY "Doctors can manage their medical records"
  ON medical_records
  FOR ALL
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretaries can read medical records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Politiques pour prescriptions
CREATE POLICY "Access prescriptions through medical records"
  ON prescriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medical_records mr
      JOIN profiles p ON p.id = auth.uid()
      WHERE mr.id = prescriptions.medical_record_id
      AND (mr.doctor_id = auth.uid() OR p.role IN ('admin', 'secretary'))
    )
  );

-- Politiques pour medicines
CREATE POLICY "All authenticated users can read medicines"
  ON medicines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and secretaries can manage medicines"
  ON medicines
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Politiques pour stock_movements
CREATE POLICY "All authenticated users can read stock movements"
  ON stock_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and secretaries can manage stock movements"
  ON stock_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Politiques pour invoices
CREATE POLICY "Admins and secretaries can manage invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

CREATE POLICY "Doctors can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'secretary')
    )
  );

-- Politiques pour invoice_items
CREATE POLICY "Access invoice items through invoices"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN profiles p ON p.id = auth.uid()
      WHERE i.id = invoice_items.invoice_id
      AND p.role IN ('admin', 'secretary')
    )
  );

-- Politiques pour payments
CREATE POLICY "Admins and secretaries can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

-- Politiques pour staff_schedules
CREATE POLICY "Admins can manage all schedules"
  ON staff_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can read their own schedule"
  ON staff_schedules
  FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );

CREATE POLICY "Secretaries can read all schedules"
  ON staff_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'secretary')
    )
  );