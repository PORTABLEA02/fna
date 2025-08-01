/*
  # Trigger automatique pour créer le workflow de consultation

  1. Fonctionnalité
    - Créer automatiquement un workflow quand une facture est payée
    - Seulement pour les factures avec invoice_type différent de 'ordinary'
    - Attribution automatique du médecin selon la spécialité

  2. Logique d'attribution
    - general-consultation -> Médecine générale
    - gynecological-consultation -> Gynécologie
    - Autres types -> Premier médecin disponible
*/

-- Fonction pour créer automatiquement un workflow de consultation
CREATE OR REPLACE FUNCTION create_consultation_workflow()
RETURNS TRIGGER AS $$
DECLARE
  assigned_doctor_id UUID;
  consultation_type_mapped TEXT;
BEGIN
  -- Vérifier si la facture vient d'être payée et n'est pas de type 'ordinary'
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.invoice_type != 'ordinary' THEN
    
    -- Mapper le type de facture vers le type de consultation
    CASE NEW.invoice_type
      WHEN 'general-consultation' THEN
        consultation_type_mapped := 'general';
      WHEN 'gynecological-consultation' THEN
        consultation_type_mapped := 'specialist';
      ELSE
        consultation_type_mapped := 'general';
    END CASE;
    
    -- Trouver le médecin approprié selon la spécialité
    CASE NEW.invoice_type
      WHEN 'general-consultation' THEN
        SELECT id INTO assigned_doctor_id
        FROM profiles 
        WHERE role = 'doctor' 
          AND is_active = true 
          AND (speciality ILIKE '%générale%' OR speciality ILIKE '%general%')
        ORDER BY created_at ASC
        LIMIT 1;
        
      WHEN 'gynecological-consultation' THEN
        SELECT id INTO assigned_doctor_id
        FROM profiles 
        WHERE role = 'doctor' 
          AND is_active = true 
          AND (speciality ILIKE '%gynéco%' OR speciality ILIKE '%gyneco%' OR speciality ILIKE '%obstétrique%')
        ORDER BY created_at ASC
        LIMIT 1;
        
      ELSE
        -- Pour les autres types, prendre le premier médecin disponible
        SELECT id INTO assigned_doctor_id
        FROM profiles 
        WHERE role = 'doctor' 
          AND is_active = true
        ORDER BY created_at ASC
        LIMIT 1;
    END CASE;
    
    -- Si aucun médecin spécialisé n'est trouvé, prendre n'importe quel médecin actif
    IF assigned_doctor_id IS NULL THEN
      SELECT id INTO assigned_doctor_id
      FROM profiles 
      WHERE role = 'doctor' 
        AND is_active = true
      ORDER BY created_at ASC
      LIMIT 1;
    END IF;
    
    -- Créer le workflow de consultation
    INSERT INTO consultation_workflows (
      patient_id,
      invoice_id,
      doctor_id,
      consultation_type,
      status,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      NEW.patient_id,
      NEW.id,
      assigned_doctor_id,
      consultation_type_mapped,
      'payment-completed',
      NEW.created_by,
      now(),
      now()
    );
    
    -- Log pour debug
    RAISE NOTICE 'Workflow créé pour facture % avec médecin % (type: %)', NEW.id, assigned_doctor_id, NEW.invoice_type;
    
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS create_workflow_on_invoice_payment ON invoices;

-- Créer le nouveau trigger
CREATE TRIGGER create_workflow_on_invoice_payment
  AFTER UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION create_consultation_workflow();

-- Supprimer l'ancienne fonction qui n'est plus utilisée
DROP FUNCTION IF EXISTS update_workflow_on_payment();