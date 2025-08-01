import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Medicine = Database['public']['Tables']['medicines']['Row'];
type MedicineInsert = Database['public']['Tables']['medicines']['Insert'];
type MedicineUpdate = Database['public']['Tables']['medicines']['Update'];
type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
type StockMovementInsert = Database['public']['Tables']['stock_movements']['Insert'];

export class MedicineService {
  // Récupérer tous les médicaments
  static async getAll(): Promise<Medicine[]> {
    console.log('🔍 MedicineService.getAll() - Début de la récupération des médicaments');
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ MedicineService.getAll() - Erreur lors de la récupération des médicaments:', error);
      console.error('Error fetching medicines:', error);
      throw error;
    }

    console.log('✅ MedicineService.getAll() - Médicaments récupérés avec succès:', data?.length || 0, 'médicaments');
    return data || [];
  }

  // Récupérer les médicaments par catégorie
  static async getByCategory(category: string): Promise<Medicine[]> {
    console.log('🔍 MedicineService.getByCategory() - Récupération des médicaments de la catégorie:', category);
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ MedicineService.getByCategory() - Erreur lors de la récupération des médicaments par catégorie:', error);
      console.error('Error fetching medicines by category:', error);
      throw error;
    }

    console.log('✅ MedicineService.getByCategory() - Médicaments de la catégorie récupérés:', data?.length || 0, 'médicaments');
    return data || [];
  }

  // Récupérer les médicaments avec stock faible
  static async getLowStock(): Promise<Medicine[]> {
    console.log('🔍 MedicineService.getLowStock() - Récupération des médicaments avec stock faible');
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .filter('current_stock', 'lte', 'min_stock')
      .order('current_stock', { ascending: true });

    if (error) {
      console.error('❌ MedicineService.getLowStock() - Erreur lors de la récupération des médicaments avec stock faible:', error);
      console.error('Error fetching low stock medicines:', error);
      throw error;
    }

    console.log('✅ MedicineService.getLowStock() - Médicaments avec stock faible récupérés:', data?.length || 0, 'médicaments');
    return data || [];
  }

  // Récupérer les médicaments expirant bientôt
  static async getExpiringSoon(days: number = 90): Promise<Medicine[]> {
    console.log('🔍 MedicineService.getExpiringSoon() - Récupération des médicaments expirant dans', days, 'jours');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) {
      console.error('❌ MedicineService.getExpiringSoon() - Erreur lors de la récupération des médicaments expirant bientôt:', error);
      console.error('Error fetching expiring medicines:', error);
      throw error;
    }

    console.log('✅ MedicineService.getExpiringSoon() - Médicaments expirant bientôt récupérés:', data?.length || 0, 'médicaments');
    return data || [];
  }

  // Créer un nouveau médicament
  static async create(medicine: MedicineInsert): Promise<Medicine> {
    console.log('🔍 MedicineService.create() - Création d\'un nouveau médicament:', medicine.name);
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔍 MedicineService.create() - Utilisateur actuel:', user?.id);
    
    const { data, error } = await supabase
      .from('medicines')
      .insert({
        ...medicine,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('❌ MedicineService.create() - Erreur lors de la création du médicament:', error);
      console.error('Error creating medicine:', error);
      throw error;
    }

    console.log('✅ MedicineService.create() - Médicament créé avec succès:', data.id, data.name);
    return data;
  }

  // Mettre à jour un médicament
  static async update(id: string, updates: MedicineUpdate): Promise<Medicine> {
    console.log('🔍 MedicineService.update() - Mise à jour du médicament ID:', id, 'avec les données:', updates);
    const { data, error } = await supabase
      .from('medicines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ MedicineService.update() - Erreur lors de la mise à jour du médicament:', error);
      console.error('Error updating medicine:', error);
      throw error;
    }

    console.log('✅ MedicineService.update() - Médicament mis à jour avec succès:', data.id, data.name);
    return data;
  }

  // Supprimer un médicament
  static async delete(id: string): Promise<void> {
    console.log('🔍 MedicineService.delete() - Suppression du médicament ID:', id);
    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ MedicineService.delete() - Erreur lors de la suppression du médicament:', error);
      console.error('Error deleting medicine:', error);
      throw error;
    }
    
    console.log('✅ MedicineService.delete() - Médicament supprimé avec succès:', id);
  }

  // Rechercher des médicaments
  static async search(query: string): Promise<Medicine[]> {
    console.log('🔍 MedicineService.search() - Recherche de médicaments avec la requête:', query);
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .or(`name.ilike.%${query}%,manufacturer.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ MedicineService.search() - Erreur lors de la recherche de médicaments:', error);
      console.error('Error searching medicines:', error);
      throw error;
    }

    console.log('✅ MedicineService.search() - Recherche terminée:', data?.length || 0, 'médicaments trouvés');
    return data || [];
  }

  // Ajouter un mouvement de stock
  static async addStockMovement(movement: StockMovementInsert): Promise<StockMovement> {
    console.log('🔍 MedicineService.addStockMovement() - Ajout d\'un mouvement de stock:', movement);
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔍 MedicineService.addStockMovement() - Utilisateur actuel:', user?.id);
    
    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        ...movement,
        user_id: user?.id || ''
      })
      .select()
      .single();

    if (error) {
      console.error('❌ MedicineService.addStockMovement() - Erreur lors de l\'ajout du mouvement de stock:', error);
      console.error('Error adding stock movement:', error);
      throw error;
    }

    console.log('✅ MedicineService.addStockMovement() - Mouvement de stock ajouté avec succès:', data.id, data.type, data.quantity);
    return data;
  }

  // Récupérer l'historique des mouvements de stock
  static async getStockMovements(medicineId?: string): Promise<StockMovement[]> {
    console.log('🔍 MedicineService.getStockMovements() - Récupération de l\'historique des mouvements', medicineId ? `pour le médicament: ${medicineId}` : '');
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        medicine:medicines(name),
        user:profiles!user_id(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (medicineId) {
      query = query.eq('medicine_id', medicineId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ MedicineService.getStockMovements() - Erreur lors de la récupération des mouvements de stock:', error);
      console.error('Error fetching stock movements:', error);
      throw error;
    }

    console.log('✅ MedicineService.getStockMovements() - Mouvements de stock récupérés:', data?.length || 0, 'mouvements');
    return data || [];
  }

  // Récupérer les statistiques d'inventaire
  static async getInventoryStats() {
    console.log('🔍 MedicineService.getInventoryStats() - Récupération des statistiques d\'inventaire');
    const { data: medicines, error } = await supabase
      .from('medicines')
      .select('*');

    if (error) {
      console.error('❌ MedicineService.getInventoryStats() - Erreur lors de la récupération des statistiques d\'inventaire:', error);
      console.error('Error fetching inventory stats:', error);
      throw error;
    }

    const totalItems = medicines?.length || 0;
    const lowStockItems = medicines?.filter(m => m.current_stock <= m.min_stock).length || 0;
    const totalValue = medicines?.reduce((sum, m) => sum + (m.current_stock * m.unit_price), 0) || 0;
    
    const expiringSoon = medicines?.filter(m => {
      const daysToExpiry = Math.ceil(
        (new Date(m.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
      return daysToExpiry <= 90 && daysToExpiry > 0;
    }).length || 0;

    const stats = {
      totalItems,
      lowStockItems,
      expiringSoon,
      totalValue
    };
    
    console.log('✅ MedicineService.getInventoryStats() - Statistiques d\'inventaire récupérées:', stats);
    return stats;
  }
}