/*
  # Ajout du champ invoice_type à la table invoices

  1. Modifications
    - Ajout de la colonne `invoice_type` à la table `invoices`
    - Valeurs possibles: 'ordinary', 'general-consultation', 'gynecological-consultation'
    - Valeur par défaut: 'ordinary'

  2. Sécurité
    - Aucune modification des politiques RLS nécessaire
*/

-- Ajouter le champ invoice_type à la table invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'invoice_type'
  ) THEN
    ALTER TABLE invoices ADD COLUMN invoice_type TEXT DEFAULT 'ordinary' CHECK (invoice_type IN ('ordinary', 'general-consultation', 'gynecological-consultation'));
  END IF;
END $$;

-- Mettre à jour les factures existantes avec le type par défaut
UPDATE invoices SET invoice_type = 'ordinary' WHERE invoice_type IS NULL;