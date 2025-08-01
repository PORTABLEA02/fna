import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type ConsultationWorkflow = Database['public']['Tables']['consultation_workflows']['Row'];
type ConsultationWorkflowInsert = Database['public']['Tables']['consultation_workflows']['Insert'];
type ConsultationWorkflowUpdate = Database['public']['Tables']['consultation_workflows']['Update'];

export class ConsultationWorkflowService {
  // Créer un nouveau workflow de consultation
  static async create(workflow: ConsultationWorkflowInsert): Promise<ConsultationWorkflow> {
    console.log('🔍 ConsultationWorkflowService.create() - Création d\'un nouveau workflow de consultation:', workflow);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('consultation_workflows')
      .insert({
        ...workflow,
        created_by: user?.id || workflow.created_by
      })
      .select()
      .single();

    if (error) {
      console.error('❌ ConsultationWorkflowService.create() - Erreur lors de la création du workflow:', error);
      throw error;
    }

    console.log('✅ ConsultationWorkflowService.create() - Workflow de consultation créé avec succès:', data.id);
    return data;
  }

  // Mettre à jour un workflow
  static async update(id: string, updates: ConsultationWorkflowUpdate): Promise<ConsultationWorkflow> {
    console.log('🔍 ConsultationWorkflowService.update() - Mise à jour du workflow ID:', id, 'avec:', updates);
    const { data, error } = await supabase
      .from('consultation_workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ ConsultationWorkflowService.update() - Erreur lors de la mise à jour du workflow:', error);
      throw error;
    }

    console.log('✅ ConsultationWorkflowService.update() - Workflow mis à jour avec succès:', data.id, 'nouveau statut:', data.status);
    return data;
  }

  // Récupérer tous les workflows
  static async getAll(): Promise<ConsultationWorkflow[]> {
    console.log('🔍 ConsultationWorkflowService.getAll() - Récupération de tous les workflows');
    const { data, error } = await supabase
      .from('consultation_workflows')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        invoice:invoices(id, total, status),
        vital_signs:vital_signs(*),
        doctor:profiles!doctor_id(first_name, last_name, speciality)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ ConsultationWorkflowService.getAll() - Erreur lors de la récupération des workflows:', error);
      throw error;
    }

    console.log('✅ ConsultationWorkflowService.getAll() - Workflows récupérés:', data?.length || 0, 'workflows');
    return data || [];
  }

  // Récupérer les workflows par statut
  static async getByStatus(status: string): Promise<ConsultationWorkflow[]> {
    console.log('🔍 ConsultationWorkflowService.getByStatus() - Récupération des workflows avec le statut:', status);
    const { data, error } = await supabase
      .from('consultation_workflows')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        invoice:invoices(id, total, status),
        vital_signs:vital_signs(*),
        doctor:profiles!doctor_id(first_name, last_name, speciality)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ ConsultationWorkflowService.getByStatus() - Erreur lors de la récupération des workflows par statut:', error);
      throw error;
    }

    console.log('✅ ConsultationWorkflowService.getByStatus() - Workflows récupérés pour le statut', status, ':', data?.length || 0, 'workflows');
    return data || [];
  }

  // Récupérer les workflows d'un médecin
  static async getByDoctor(doctorId: string): Promise<ConsultationWorkflow[]> {
    console.log('🔍 ConsultationWorkflowService.getByDoctor() - Récupération des workflows du médecin:', doctorId);
    const { data, error } = await supabase
      .from('consultation_workflows')
      .select(`
        *,
        patient:patients(first_name, last_name, phone, blood_type, allergies),
        invoice:invoices(id, total, status),
        vital_signs:vital_signs(*)
      `)
      .eq('doctor_id', doctorId)
      .in('status', ['consultation-ready', 'in-progress'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ ConsultationWorkflowService.getByDoctor() - Erreur lors de la récupération des workflows du médecin:', error);
      throw error;
    }

    console.log('✅ ConsultationWorkflowService.getByDoctor() - Workflows du médecin récupérés:', data?.length || 0, 'workflows');
    return data || [];
  }

  // Assigner un médecin à un workflow
  static async assignDoctor(workflowId: string, doctorId: string): Promise<ConsultationWorkflow> {
    console.log('🔍 ConsultationWorkflowService.assignDoctor() - Attribution du médecin', doctorId, 'au workflow:', workflowId);
    return this.update(workflowId, {
      doctor_id: doctorId,
      status: 'consultation-ready'
    });
  }

  // Marquer un workflow comme en cours
  static async startConsultation(workflowId: string): Promise<ConsultationWorkflow> {
    console.log('🔍 ConsultationWorkflowService.startConsultation() - Début de la consultation pour le workflow:', workflowId);
    return this.update(workflowId, {
      status: 'in-progress'
    });
  }

  // Marquer un workflow comme terminé
  static async completeConsultation(workflowId: string): Promise<ConsultationWorkflow> {
    console.log('🔍 ConsultationWorkflowService.completeConsultation() - Fin de la consultation pour le workflow:', workflowId);
    return this.update(workflowId, {
      status: 'completed'
    });
  }

  // Récupérer les statistiques des workflows
  static async getStats() {
    console.log('🔍 ConsultationWorkflowService.getStats() - Récupération des statistiques des workflows');
    const { data: workflows, error } = await supabase
      .from('consultation_workflows')
      .select('status, created_at');

    if (error) {
      console.error('❌ ConsultationWorkflowService.getStats() - Erreur lors de la récupération des statistiques:', error);
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayWorkflows = workflows?.filter(w => w.created_at.startsWith(today)) || [];

    const stats = {
      total: workflows?.length || 0,
      today: todayWorkflows.length,
      paymentPending: workflows?.filter(w => w.status === 'payment-pending').length || 0,
      vitalsPending: workflows?.filter(w => w.status === 'vitals-pending').length || 0,
      doctorAssignment: workflows?.filter(w => w.status === 'doctor-assignment').length || 0,
      consultationReady: workflows?.filter(w => w.status === 'consultation-ready').length || 0,
      inProgress: workflows?.filter(w => w.status === 'in-progress').length || 0,
      completed: workflows?.filter(w => w.status === 'completed').length || 0
    };

    console.log('✅ ConsultationWorkflowService.getStats() - Statistiques des workflows récupérées:', stats);
    return stats;
  }

  // Récupérer un workflow par ID de facture
  static async getByInvoiceId(invoiceId: string): Promise<ConsultationWorkflow | null> {
    console.log('🔍 ConsultationWorkflowService.getByInvoiceId() - Récupération du workflow pour la facture:', invoiceId);
    const { data, error } = await supabase
      .from('consultation_workflows')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        vital_signs:vital_signs(*)
      `)
      .eq('invoice_id', invoiceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ ConsultationWorkflowService.getByInvoiceId() - Erreur lors de la récupération du workflow par facture:', error);
      throw error;
    }

    console.log('✅ ConsultationWorkflowService.getByInvoiceId() - Workflow récupéré:', data ? data.id : 'aucun');
    return data || null;
  }
}