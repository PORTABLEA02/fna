import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];
type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

export class InvoiceService {
  // Récupérer toutes les factures
  static async getAll(): Promise<Invoice[]> {
    console.log('🔍 InvoiceService.getAll() - Début de la récupération des factures');
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        patient:patients(first_name, last_name, phone),
        appointment:appointments(reason),
        invoice_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ InvoiceService.getAll() - Erreur lors de la récupération des factures:', error);
      console.error('Error fetching invoices:', error);
      throw error;
    }

    console.log('✅ InvoiceService.getAll() - Factures récupérées avec succès:', data?.length || 0, 'factures');
    return data || [];
  }

  // Récupérer une facture par ID
  static async getById(id: string): Promise<Invoice | null> {
    console.log('🔍 InvoiceService.getById() - Récupération de la facture ID:', id);
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        patient:patients(first_name, last_name, phone, email, address),
        appointment:appointments(reason),
        invoice_items(*),
        payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ InvoiceService.getById() - Erreur lors de la récupération de la facture:', error);
      console.error('Error fetching invoice:', error);
      return null;
    }

    console.log('✅ InvoiceService.getById() - Facture récupérée avec succès:', data.id, 'montant:', data.total);
    return data;
  }

  // Créer une nouvelle facture
  static async create(
    invoiceData: Omit<InvoiceInsert, 'id'>, 
    items: Omit<InvoiceItemInsert, 'invoice_id'>[]
  ): Promise<Invoice> {
    console.log('🔍 InvoiceService.create() - Création d\'une nouvelle facture:', invoiceData);
    console.log('🔍 InvoiceService.create() - Éléments de facture:', items.length, 'éléments');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔍 InvoiceService.create() - Utilisateur actuel:', user?.id);
    
    // Générer un ID de facture
    const invoiceId = await this.generateInvoiceId();
    console.log('🔍 InvoiceService.create() - ID de facture généré:', invoiceId);
    
    // Créer la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        id: invoiceId,
        created_by: user?.id
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('❌ InvoiceService.create() - Erreur lors de la création de la facture:', invoiceError);
      console.error('Error creating invoice:', invoiceError);
      throw invoiceError;
    }

    console.log('✅ InvoiceService.create() - Facture créée avec succès:', invoice.id);
    // Ajouter les éléments de facture
    console.log('🔍 InvoiceService.create() - Ajout des éléments de facture');
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(
        items.map(item => ({
          ...item,
          invoice_id: invoiceId
        }))
      );

    if (itemsError) {
      console.error('❌ InvoiceService.create() - Erreur lors de la création des éléments de facture:', itemsError);
      console.error('Error creating invoice items:', itemsError);
      throw itemsError;
    }

    console.log('✅ InvoiceService.create() - Éléments de facture ajoutés avec succès:', items.length, 'éléments');
    return invoice;
  }

  // Mettre à jour une facture
  static async update(id: string, updates: InvoiceUpdate): Promise<Invoice> {
    console.log('🔍 InvoiceService.update() - Mise à jour de la facture ID:', id, 'avec les données:', updates);
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ InvoiceService.update() - Erreur lors de la mise à jour de la facture:', error);
      console.error('Error updating invoice:', error);
      throw error;
    }

    console.log('✅ InvoiceService.update() - Facture mise à jour avec succès:', data.id);
    return data;
  }

  // Supprimer une facture
  static async delete(id: string): Promise<void> {
    console.log('🔍 InvoiceService.delete() - Suppression de la facture ID:', id);
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ InvoiceService.delete() - Erreur lors de la suppression de la facture:', error);
      console.error('Error deleting invoice:', error);
      throw error;
    }
    
    console.log('✅ InvoiceService.delete() - Facture supprimée avec succès:', id);
  }

  // Ajouter un paiement
  static async addPayment(payment: PaymentInsert): Promise<Payment> {
    console.log('🔍 InvoiceService.addPayment() - Ajout d\'un paiement:', payment);
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔍 InvoiceService.addPayment() - Utilisateur actuel:', user?.id);
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...payment,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('❌ InvoiceService.addPayment() - Erreur lors de l\'ajout du paiement:', error);
      console.error('Error adding payment:', error);
      throw error;
    }

    console.log('✅ InvoiceService.addPayment() - Paiement ajouté avec succès:', data.id, 'montant:', data.amount);
    // Mettre à jour le statut de la facture si entièrement payée
    console.log('🔍 InvoiceService.addPayment() - Vérification du statut de la facture');
    const { data: invoice } = await supabase
      .from('invoices')
      .select('total')
      .eq('id', payment.invoice_id)
      .single();

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', payment.invoice_id);

    const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);
    console.log('🔍 InvoiceService.addPayment() - Total payé:', totalPaid, 'Total facture:', invoice?.total);
    
    if (invoice && totalPaid >= invoice.total) {
      console.log('🔍 InvoiceService.addPayment() - Facture entièrement payée, mise à jour du statut');
      await supabase
        .from('invoices')
        .update({ 
          status: 'paid', 
          payment_method: payment.payment_method,
          paid_at: new Date().toISOString()
        })
        .eq('id', payment.invoice_id);
      console.log('✅ InvoiceService.addPayment() - Statut de la facture mis à jour: payée');
    }

    return data;
  }

  // Générer un ID de facture unique
  static async generateInvoiceId(): Promise<string> {
    console.log('🔍 InvoiceService.generateInvoiceId() - Génération d\'un nouvel ID de facture');
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Récupérer le dernier numéro de facture pour ce mois
    const { data, error } = await supabase
      .from('invoices')
      .select('id')
      .like('id', `INV-${year}-${month}%`)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ InvoiceService.generateInvoiceId() - Erreur lors de la récupération du dernier ID:', error);
    }
    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastId = data[0].id;
      const lastNumber = parseInt(lastId.split('-')[3]) || 0;
      nextNumber = lastNumber + 1;
    }

    const newId = `INV-${year}-${month}${String(nextNumber).padStart(3, '0')}`;
    console.log('✅ InvoiceService.generateInvoiceId() - Nouvel ID généré:', newId);
    return newId;
  }

  // Récupérer les statistiques de facturation
  static async getBillingStats() {
    console.log('🔍 InvoiceService.getBillingStats() - Récupération des statistiques de facturation');
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('total, status, created_at');

    if (error) {
      console.error('❌ InvoiceService.getBillingStats() - Erreur lors de la récupération des statistiques de facturation:', error);
      console.error('Error fetching billing stats:', error);
      throw error;
    }

    const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0;
    const paidAmount = invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0) || 0;
    const pendingAmount = invoices?.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0) || 0;
    const overdueAmount = invoices?.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0) || 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = invoices?.filter(inv => {
      const invDate = new Date(inv.created_at);
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
    }).reduce((sum, inv) => sum + inv.total, 0) || 0;

    const stats = {
      totalRevenue,
      paidAmount,
      pendingAmount,
      overdueAmount,
      monthlyRevenue,
      totalInvoices: invoices?.length || 0,
      paidInvoices: invoices?.filter(inv => inv.status === 'paid').length || 0
    };
    
    console.log('✅ InvoiceService.getBillingStats() - Statistiques de facturation récupérées:', stats);
    return stats;
  }
}