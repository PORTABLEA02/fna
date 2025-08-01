import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type VitalSigns = Database['public']['Tables']['vital_signs']['Row'];
type VitalSignsInsert = Database['public']['Tables']['vital_signs']['Insert'];
type VitalSignsUpdate = Database['public']['Tables']['vital_signs']['Update'];

export class VitalSignsService {
  // Récupérer les constantes vitales d'un patient
  static async getByPatient(patientId: string): Promise<VitalSigns[]> {
    console.log('🔍 VitalSignsService.getByPatient() - Récupération des constantes vitales pour le patient:', patientId);
    const { data, error } = await supabase
      .from('vital_signs')
      .select(`
        *,
        recorded_by_profile:profiles!recorded_by(first_name, last_name)
      `)
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('❌ VitalSignsService.getByPatient() - Erreur lors de la récupération des constantes vitales:', error);
      throw error;
    }

    console.log('✅ VitalSignsService.getByPatient() - Constantes vitales récupérées:', data?.length || 0, 'enregistrements');
    return data || [];
  }

  // Récupérer les dernières constantes vitales d'un patient
  static async getLatestByPatient(patientId: string): Promise<VitalSigns | null> {
    console.log('🔍 VitalSignsService.getLatestByPatient() - Récupération des dernières constantes vitales pour le patient:', patientId);
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ VitalSignsService.getLatestByPatient() - Erreur lors de la récupération des dernières constantes vitales:', error);
      throw error;
    }

    console.log('✅ VitalSignsService.getLatestByPatient() - Dernières constantes vitales récupérées:', data ? 'trouvées' : 'aucune');
    return data || null;
  }

  // Créer de nouvelles constantes vitales
  static async create(vitalSigns: VitalSignsInsert): Promise<VitalSigns> {
    console.log('🔍 VitalSignsService.create() - Création de nouvelles constantes vitales:', vitalSigns);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('vital_signs')
      .insert({
        ...vitalSigns,
        recorded_by: user?.id || vitalSigns.recorded_by
      })
      .select()
      .single();

    if (error) {
      console.error('❌ VitalSignsService.create() - Erreur lors de la création des constantes vitales:', error);
      throw error;
    }

    console.log('✅ VitalSignsService.create() - Constantes vitales créées avec succès:', data.id);
    return data;
  }

  // Mettre à jour des constantes vitales
  static async update(id: string, updates: VitalSignsUpdate): Promise<VitalSigns> {
    console.log('🔍 VitalSignsService.update() - Mise à jour des constantes vitales ID:', id);
    const { data, error } = await supabase
      .from('vital_signs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ VitalSignsService.update() - Erreur lors de la mise à jour des constantes vitales:', error);
      throw error;
    }

    console.log('✅ VitalSignsService.update() - Constantes vitales mises à jour avec succès:', data.id);
    return data;
  }

  // Supprimer des constantes vitales
  static async delete(id: string): Promise<void> {
    console.log('🔍 VitalSignsService.delete() - Suppression des constantes vitales ID:', id);
    const { error } = await supabase
      .from('vital_signs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ VitalSignsService.delete() - Erreur lors de la suppression des constantes vitales:', error);
      throw error;
    }
    
    console.log('✅ VitalSignsService.delete() - Constantes vitales supprimées avec succès:', id);
  }

  // Calculer l'IMC (Indice de Masse Corporelle)
  static calculateBMI(weight: number, height: number): number {
    if (weight <= 0 || height <= 0) return 0;
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }

  // Interpréter l'IMC
  static interpretBMI(bmi: number): string {
    if (bmi < 18.5) return 'Insuffisance pondérale';
    if (bmi < 25) return 'Poids normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }

  // Interpréter la tension artérielle
  static interpretBloodPressure(systolic: number, diastolic: number): string {
    if (systolic < 90 || diastolic < 60) return 'Hypotension';
    if (systolic < 120 && diastolic < 80) return 'Normale';
    if (systolic < 130 && diastolic < 80) return 'Élevée';
    if (systolic < 140 || diastolic < 90) return 'Hypertension stade 1';
    return 'Hypertension stade 2';
  }
}