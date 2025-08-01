import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export class PatientService {
  // Récupérer tous les patients
  static async getAll(): Promise<Patient[]> {
    console.log('🔍 PatientService.getAll() - Début de la récupération des patients');
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('❌ PatientService.getAll() - Erreur lors de la récupération des patients:', error);
      console.error('Error fetching patients:', error);
      throw error;
    }

    console.log('✅ PatientService.getAll() - Patients récupérés avec succès:', data?.length || 0, 'patients');
    return data || [];
  }

  // Récupérer un patient par ID
  static async getById(id: string): Promise<Patient | null> {
    console.log('🔍 PatientService.getById() - Récupération du patient ID:', id);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ PatientService.getById() - Erreur lors de la récupération du patient:', error);
      console.error('Error fetching patient:', error);
      return null;
    }

    console.log('✅ PatientService.getById() - Patient récupéré avec succès:', data?.first_name, data?.last_name);
    return data;
  }

  // Créer un nouveau patient
  static async create(patient: PatientInsert): Promise<Patient> {
    console.log('🔍 PatientService.create() - Création d\'un nouveau patient:', patient.first_name, patient.last_name);
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔍 PatientService.create() - Utilisateur actuel:', user?.id);
    
    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patient,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('❌ PatientService.create() - Erreur lors de la création du patient:', error);
      console.error('Error creating patient:', error);
      throw error;
    }

    console.log('✅ PatientService.create() - Patient créé avec succès:', data.id, data.first_name, data.last_name);
    return data;
  }

  // Mettre à jour un patient
  static async update(id: string, updates: PatientUpdate): Promise<Patient> {
    console.log('🔍 PatientService.update() - Mise à jour du patient ID:', id, 'avec les données:', updates);
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ PatientService.update() - Erreur lors de la mise à jour du patient:', error);
      console.error('Error updating patient:', error);
      throw error;
    }

    console.log('✅ PatientService.update() - Patient mis à jour avec succès:', data.id, data.first_name, data.last_name);
    return data;
  }

  // Supprimer un patient
  static async delete(id: string): Promise<void> {
    console.log('🔍 PatientService.delete() - Suppression du patient ID:', id);
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ PatientService.delete() - Erreur lors de la suppression du patient:', error);
      console.error('Error deleting patient:', error);
      throw error;
    }
    
    console.log('✅ PatientService.delete() - Patient supprimé avec succès:', id);
  }

  // Rechercher des patients
  static async search(query: string): Promise<Patient[]> {
    console.log('🔍 PatientService.search() - Recherche de patients avec la requête:', query);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('❌ PatientService.search() - Erreur lors de la recherche de patients:', error);
      console.error('Error searching patients:', error);
      throw error;
    }

    console.log('✅ PatientService.search() - Recherche terminée:', data?.length || 0, 'patients trouvés');
    return data || [];
  }

  // Récupérer les patients avec leur historique médical
  static async getWithMedicalHistory(patientId: string) {
    console.log('🔍 PatientService.getWithMedicalHistory() - Récupération de l\'historique médical pour le patient:', patientId);
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        medical_records (
          *,
          prescriptions (*),
          profiles:doctor_id (first_name, last_name, speciality)
        )
      `)
      .eq('id', patientId)
      .single();

    if (error) {
      console.error('❌ PatientService.getWithMedicalHistory() - Erreur lors de la récupération de l\'historique médical:', error);
      console.error('Error fetching patient with medical history:', error);
      throw error;
    }

    console.log('✅ PatientService.getWithMedicalHistory() - Historique médical récupéré avec succès pour:', data?.first_name, data?.last_name);
    return data;
  }
}