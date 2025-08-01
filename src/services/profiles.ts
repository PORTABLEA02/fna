import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileService {
  // Récupérer tous les profils
  static async getAll(): Promise<Profile[]> {
    console.log('🔍 ProfileService.getAll() - Début de la récupération des profils');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('❌ ProfileService.getAll() - Erreur lors de la récupération des profils:', error);
      console.error('Error fetching profiles:', error);
      throw error;
    }

    console.log('✅ ProfileService.getAll() - Profils récupérés avec succès:', data?.length || 0, 'profils');
    return data || [];
  }

  // Récupérer les profils par rôle
  static async getByRole(role: 'admin' | 'doctor' | 'secretary'): Promise<Profile[]> {
    console.log('🔍 ProfileService.getByRole() - Récupération des profils pour le rôle:', role);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('❌ ProfileService.getByRole() - Erreur lors de la récupération des profils par rôle:', error);
      console.error('Error fetching profiles by role:', error);
      throw error;
    }

    console.log('✅ ProfileService.getByRole() - Profils récupérés pour le rôle', role, ':', data?.length || 0, 'profils');
    return data || [];
  }

  // Récupérer un profil par ID
  static async getById(id: string): Promise<Profile | null> {
    console.log('🔍 ProfileService.getById() - Récupération du profil ID:', id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ ProfileService.getById() - Erreur lors de la récupération du profil:', error);
      console.error('Error fetching profile:', error);
      return null;
    }

    console.log('✅ ProfileService.getById() - Profil récupéré avec succès:', data.first_name, data.last_name, data.role);
    return data;
  }

  // Mettre à jour un profil
  static async update(id: string, updates: ProfileUpdate): Promise<Profile> {
    console.log('🔍 ProfileService.update() - Mise à jour du profil ID:', id, 'avec les données:', updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ ProfileService.update() - Erreur lors de la mise à jour du profil:', error);
      console.error('Error updating profile:', error);
      throw error;
    }

    console.log('✅ ProfileService.update() - Profil mis à jour avec succès:', data.id, data.first_name, data.last_name);
    return data;
  }

  // Récupérer les médecins avec leurs spécialités
  static async getDoctors(): Promise<Profile[]> {
    console.log('🔍 ProfileService.getDoctors() - Récupération de la liste des médecins');
    const result = await this.getByRole('doctor');
    console.log('✅ ProfileService.getDoctors() - Médecins récupérés:', result.length, 'médecins');
    return result;
  }

  // Récupérer les statistiques des profils
  static async getStats() {
    console.log('🔍 ProfileService.getStats() - Récupération des statistiques des profils');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('role, is_active');

    if (error) {
      console.error('❌ ProfileService.getStats() - Erreur lors de la récupération des statistiques des profils:', error);
      console.error('Error fetching profile stats:', error);
      throw error;
    }

    const total = profiles?.length || 0;
    const active = profiles?.filter(p => p.is_active).length || 0;
    const doctors = profiles?.filter(p => p.role === 'doctor').length || 0;
    const admins = profiles?.filter(p => p.role === 'admin').length || 0;
    const secretaries = profiles?.filter(p => p.role === 'secretary').length || 0;

    const stats = {
      total,
      active,
      inactive: total - active,
      doctors,
      admins,
      secretaries
    };
    
    console.log('✅ ProfileService.getStats() - Statistiques des profils récupérées:', stats);
    return stats;
  }
}