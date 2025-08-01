import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
type MedicalRecordInsert = Database['public']['Tables']['medical_records']['Insert'];
type MedicalRecordUpdate = Database['public']['Tables']['medical_records']['Update'];
type Prescription = Database['public']['Tables']['prescriptions']['Row'];
type PrescriptionInsert = Database['public']['Tables']['prescriptions']['Insert'];

export class MedicalRecordService {
  // Récupérer tous les dossiers médicaux
  static async getAll(): Promise<MedicalRecord[]> {
    console.log('🔍 MedicalRecordService.getAll() - Début de la récupération des dossiers médicaux');
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        doctor:profiles!doctor_id(first_name, last_name, speciality),
        prescriptions(*)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ MedicalRecordService.getAll() - Erreur lors de la récupération des dossiers médicaux:', error);
      console.error('Error fetching medical records:', error);
      throw error;
    }

    console.log('✅ MedicalRecordService.getAll() - Dossiers médicaux récupérés avec succès:', data?.length || 0, 'dossiers');
    return data || [];
  }

  // Récupérer les dossiers médicaux d'un patient
  static async getByPatient(patientId: string): Promise<MedicalRecord[]> {
    console.log('🔍 MedicalRecordService.getByPatient() - Récupération des dossiers du patient:', patientId);
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        doctor:profiles!doctor_id(first_name, last_name, speciality),
        prescriptions(*)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ MedicalRecordService.getByPatient() - Erreur lors de la récupération des dossiers du patient:', error);
      console.error('Error fetching patient medical records:', error);
      throw error;
    }

    console.log('✅ MedicalRecordService.getByPatient() - Dossiers du patient récupérés:', data?.length || 0, 'dossiers');
    return data || [];
  }

  // Récupérer les dossiers médicaux d'un médecin
  static async getByDoctor(doctorId: string): Promise<MedicalRecord[]> {
    console.log('🔍 MedicalRecordService.getByDoctor() - Récupération des dossiers du médecin:', doctorId);
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        prescriptions(*)
      `)
      .eq('doctor_id', doctorId)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ MedicalRecordService.getByDoctor() - Erreur lors de la récupération des dossiers du médecin:', error);
      console.error('Error fetching doctor medical records:', error);
      throw error;
    }

    console.log('✅ MedicalRecordService.getByDoctor() - Dossiers du médecin récupérés:', data?.length || 0, 'dossiers');
    return data || [];
  }

  // Créer un nouveau dossier médical avec prescriptions
  static async create(
    recordData: MedicalRecordInsert,
    prescriptions: Omit<PrescriptionInsert, 'medical_record_id'>[] = []
  ): Promise<MedicalRecord> {
    console.log('🔍 MedicalRecordService.create() - Création d\'un nouveau dossier médical:', recordData);
    console.log('🔍 MedicalRecordService.create() - Prescriptions à ajouter:', prescriptions.length);
    const { data: record, error: recordError } = await supabase
      .from('medical_records')
      .insert(recordData)
      .select()
      .single();

    if (recordError) {
      console.error('❌ MedicalRecordService.create() - Erreur lors de la création du dossier médical:', recordError);
      console.error('Error creating medical record:', recordError);
      throw recordError;
    }

    console.log('✅ MedicalRecordService.create() - Dossier médical créé avec succès:', record.id);
    // Ajouter les prescriptions si elles existent
    if (prescriptions.length > 0) {
      console.log('🔍 MedicalRecordService.create() - Ajout des prescriptions au dossier:', record.id);
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(
          prescriptions.map(prescription => ({
            ...prescription,
            medical_record_id: record.id
          }))
        );

      if (prescriptionError) {
        console.error('❌ MedicalRecordService.create() - Erreur lors de la création des prescriptions:', prescriptionError);
        console.error('Error creating prescriptions:', prescriptionError);
        // Ne pas faire échouer la création du dossier médical
      } else {
        console.log('✅ MedicalRecordService.create() - Prescriptions ajoutées avec succès:', prescriptions.length);
      }
    }

    return record;
  }

  // Mettre à jour un dossier médical
  static async update(id: string, updates: MedicalRecordUpdate): Promise<MedicalRecord> {
    console.log('🔍 MedicalRecordService.update() - Mise à jour du dossier médical ID:', id, 'avec les données:', updates);
    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ MedicalRecordService.update() - Erreur lors de la mise à jour du dossier médical:', error);
      console.error('Error updating medical record:', error);
      throw error;
    }

    console.log('✅ MedicalRecordService.update() - Dossier médical mis à jour avec succès:', data.id);
    return data;
  }

  // Supprimer un dossier médical
  static async delete(id: string): Promise<void> {
    console.log('🔍 MedicalRecordService.delete() - Suppression du dossier médical ID:', id);
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ MedicalRecordService.delete() - Erreur lors de la suppression du dossier médical:', error);
      console.error('Error deleting medical record:', error);
      throw error;
    }
    
    console.log('✅ MedicalRecordService.delete() - Dossier médical supprimé avec succès:', id);
  }

  // Ajouter une prescription à un dossier médical
  static async addPrescription(medicalRecordId: string, prescription: Omit<PrescriptionInsert, 'medical_record_id'>): Promise<Prescription> {
    console.log('🔍 MedicalRecordService.addPrescription() - Ajout d\'une prescription au dossier:', medicalRecordId, prescription);
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        ...prescription,
        medical_record_id: medicalRecordId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ MedicalRecordService.addPrescription() - Erreur lors de l\'ajout de la prescription:', error);
      console.error('Error adding prescription:', error);
      throw error;
    }

    console.log('✅ MedicalRecordService.addPrescription() - Prescription ajoutée avec succès:', data.id, data.medication);
    return data;
  }

  // Supprimer une prescription
  static async deletePrescription(prescriptionId: string): Promise<void> {
    console.log('🔍 MedicalRecordService.deletePrescription() - Suppression de la prescription ID:', prescriptionId);
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', prescriptionId);

    if (error) {
      console.error('❌ MedicalRecordService.deletePrescription() - Erreur lors de la suppression de la prescription:', error);
      console.error('Error deleting prescription:', error);
      throw error;
    }
    
    console.log('✅ MedicalRecordService.deletePrescription() - Prescription supprimée avec succès:', prescriptionId);
  }

  // Rechercher dans les dossiers médicaux
  static async search(query: string): Promise<MedicalRecord[]> {
    console.log('🔍 MedicalRecordService.search() - Recherche dans les dossiers médicaux avec la requête:', query);
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        doctor:profiles!doctor_id(first_name, last_name, speciality),
        prescriptions(*)
      `)
      .or(`reason.ilike.%${query}%,diagnosis.ilike.%${query}%,symptoms.ilike.%${query}%`)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ MedicalRecordService.search() - Erreur lors de la recherche dans les dossiers médicaux:', error);
      console.error('Error searching medical records:', error);
      throw error;
    }

    console.log('✅ MedicalRecordService.search() - Recherche terminée:', data?.length || 0, 'dossiers trouvés');
    return data || [];
  }
}