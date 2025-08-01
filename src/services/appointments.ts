import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export class AppointmentService {
  // Récupérer tous les rendez-vous
  static async getAll(): Promise<Appointment[]> {
    console.log('🔍 AppointmentService.getAll() - Début de la récupération des rendez-vous');
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        doctor:profiles!doctor_id(first_name, last_name, speciality)
      `)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      console.error('❌ AppointmentService.getAll() - Erreur lors de la récupération des rendez-vous:', error);
      console.error('Error fetching appointments:', error);
      throw error;
    }

    console.log('✅ AppointmentService.getAll() - Rendez-vous récupérés avec succès:', data?.length || 0, 'rendez-vous');
    return data || [];
  }

  // Récupérer les rendez-vous par date
  static async getByDate(date: string): Promise<Appointment[]> {
    console.log('🔍 AppointmentService.getByDate() - Récupération des rendez-vous pour la date:', date);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        doctor:profiles!doctor_id(first_name, last_name, speciality)
      `)
      .eq('date', date)
      .order('time', { ascending: true });

    if (error) {
      console.error('❌ AppointmentService.getByDate() - Erreur lors de la récupération des rendez-vous par date:', error);
      console.error('Error fetching appointments by date:', error);
      throw error;
    }

    console.log('✅ AppointmentService.getByDate() - Rendez-vous récupérés pour', date, ':', data?.length || 0, 'rendez-vous');
    return data || [];
  }

  // Récupérer les rendez-vous d'un médecin
  static async getByDoctor(doctorId: string, date?: string): Promise<Appointment[]> {
    console.log('🔍 AppointmentService.getByDoctor() - Récupération des rendez-vous du médecin:', doctorId, date ? `pour la date: ${date}` : '');
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(first_name, last_name, phone)
      `)
      .eq('doctor_id', doctorId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      console.error('❌ AppointmentService.getByDoctor() - Erreur lors de la récupération des rendez-vous du médecin:', error);
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }

    console.log('✅ AppointmentService.getByDoctor() - Rendez-vous du médecin récupérés:', data?.length || 0, 'rendez-vous');
    return data || [];
  }

  // Récupérer les rendez-vous d'un patient
  static async getByPatient(patientId: string): Promise<Appointment[]> {
    console.log('🔍 AppointmentService.getByPatient() - Récupération des rendez-vous du patient:', patientId);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!doctor_id(first_name, last_name, speciality)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ AppointmentService.getByPatient() - Erreur lors de la récupération des rendez-vous du patient:', error);
      console.error('Error fetching patient appointments:', error);
      throw error;
    }

    console.log('✅ AppointmentService.getByPatient() - Rendez-vous du patient récupérés:', data?.length || 0, 'rendez-vous');
    return data || [];
  }

  // Créer un nouveau rendez-vous
  static async create(appointment: AppointmentInsert): Promise<Appointment> {
    console.log('🔍 AppointmentService.create() - Création d\'un nouveau rendez-vous:', appointment);
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔍 AppointmentService.create() - Utilisateur actuel:', user?.id);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointment,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('❌ AppointmentService.create() - Erreur lors de la création du rendez-vous:', error);
      console.error('Error creating appointment:', error);
      throw error;
    }

    console.log('✅ AppointmentService.create() - Rendez-vous créé avec succès:', data.id, 'pour le', data.date, 'à', data.time);
    return data;
  }

  // Mettre à jour un rendez-vous
  static async update(id: string, updates: AppointmentUpdate): Promise<Appointment> {
    console.log('🔍 AppointmentService.update() - Mise à jour du rendez-vous ID:', id, 'avec les données:', updates);
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ AppointmentService.update() - Erreur lors de la mise à jour du rendez-vous:', error);
      console.error('Error updating appointment:', error);
      throw error;
    }

    console.log('✅ AppointmentService.update() - Rendez-vous mis à jour avec succès:', data.id);
    return data;
  }

  // Supprimer un rendez-vous
  static async delete(id: string): Promise<void> {
    console.log('🔍 AppointmentService.delete() - Suppression du rendez-vous ID:', id);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ AppointmentService.delete() - Erreur lors de la suppression du rendez-vous:', error);
      console.error('Error deleting appointment:', error);
      throw error;
    }
    
    console.log('✅ AppointmentService.delete() - Rendez-vous supprimé avec succès:', id);
  }

  // Vérifier la disponibilité d'un créneau
  static async checkAvailability(
    doctorId: string, 
    date: string, 
    time: string, 
    duration: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    console.log('🔍 AppointmentService.checkAvailability() - Vérification de disponibilité:', { doctorId, date, time, duration, excludeAppointmentId });
    let query = supabase
      .from('appointments')
      .select('id, time, duration')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .neq('status', 'cancelled');

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ AppointmentService.checkAvailability() - Erreur lors de la vérification de disponibilité:', error);
      console.error('Error checking availability:', error);
      return false;
    }

    console.log('🔍 AppointmentService.checkAvailability() - Rendez-vous existants trouvés:', data?.length || 0);
    // Vérifier les conflits d'horaires
    const requestedStart = new Date(`2000-01-01T${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    for (const appointment of data || []) {
      const existingStart = new Date(`2000-01-01T${appointment.time}`);
      const existingEnd = new Date(existingStart.getTime() + appointment.duration * 60000);

      // Vérifier le chevauchement
      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        console.log('❌ AppointmentService.checkAvailability() - Conflit détecté avec le rendez-vous:', appointment.id);
        return false;
      }
    }

    console.log('✅ AppointmentService.checkAvailability() - Créneau disponible');
    return true;
  }

  // Récupérer les statistiques des rendez-vous
  static async getStats() {
    console.log('🔍 AppointmentService.getStats() - Récupération des statistiques des rendez-vous');
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('date', today);

    const { data: totalAppointments, error: totalError } = await supabase
      .from('appointments')
      .select('id, status');

    if (todayError || totalError) {
      console.error('❌ AppointmentService.getStats() - Erreur lors de la récupération des statistiques:', todayError || totalError);
      console.error('Error fetching appointment stats:', todayError || totalError);
      throw todayError || totalError;
    }

    console.log('✅ AppointmentService.getStats() - Statistiques récupérées:', {
      today: todayAppointments?.length || 0,
      total: totalAppointments?.length || 0
    });
    return {
      today: {
        total: todayAppointments?.length || 0,
        confirmed: todayAppointments?.filter(a => a.status === 'confirmed').length || 0,
        pending: todayAppointments?.filter(a => a.status === 'scheduled').length || 0,
        completed: todayAppointments?.filter(a => a.status === 'completed').length || 0
      },
      total: {
        all: totalAppointments?.length || 0,
        thisMonth: totalAppointments?.filter(a => 
          new Date(a.created_at).getMonth() === new Date().getMonth()
        ).length || 0
      }
    };
  }
}