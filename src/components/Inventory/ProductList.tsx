import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { MedicineService } from '../../services/medicines';

type Medicine = Database['public']['Tables']['medicines']['Row'];

interface ProductListProps {
  onSelectProduct: (product: Medicine) => void;
  onNewProduct: () => void;
  onEditProduct: (product: Medicine) => void;
  onStockMovement: (product: Medicine) => void;
}

export function ProductList({ onSelectProduct, onNewProduct, onEditProduct, onStockMovement }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('🔍 ProductList.loadProducts() - Début du chargement de la liste des produits');
      setLoading(true);
      const data = await MedicineService.getAll();
      console.log('✅ ProductList.loadProducts() - Produits chargés avec succès:', data.length, 'produits');
      setProducts(data);
    } catch (error) {
      console.error('❌ ProductList.loadProducts() - Erreur lors du chargement des produits:', error);
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        console.log('🔍 ProductList.handleDeleteProduct() - Suppression du produit:', productId);
        await MedicineService.delete(productId);
        console.log('✅ ProductList.handleDeleteProduct() - Produit supprimé, rechargement de la liste');
        await loadProducts();
      } catch (error) {
        console.error('❌ ProductList.handleDeleteProduct() - Erreur lors de la suppression du produit:', error);
        console.error('Error deleting product:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryLabel = (category: string) => {
    const categories = {
      medication: 'Médicament',
      'medical-supply': 'Fourniture médicale',
      equipment: 'Équipement',
      consumable: 'Consommable',
      diagnostic: 'Diagnostic'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      medication: 'bg-blue-100 text-blue-800',
      'medical-supply': 'bg-green-100 text-green-800',
      equipment: 'bg-purple-100 text-purple-800',
      consumable: 'bg-yellow-100 text-yellow-800',
      diagnostic: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isLowStock = (product: Medicine) => {
    return product.current_stock <= product.min_stock;
  };

  const isExpiringSoon = (product: Medicine) => {
    const expiryDate = new Date(product.expiry_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Inventaire des Produits</h2>
          <button
            onClick={onNewProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Produit</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, fabricant ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement des produits...</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(product.category)}`}>
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Fabricant:</span>
                      <p className="font-medium text-gray-900">{product.manufacturer}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stock actuel:</span>
                      <p className={`font-medium ${isLowStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.current_stock} {product.unit}
                        {isLowStock(product) && (
                          <AlertTriangle className="inline h-4 w-4 ml-1 text-red-500" />
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Prix unitaire:</span>
                      <p className="font-medium text-gray-900">{product.unit_price} FCFA</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Expiration:</span>
                      <p className={`font-medium ${isExpiringSoon(product) ? 'text-orange-600' : 'text-gray-900'}`}>
                        {new Date(product.expiry_date).toLocaleDateString('fr-FR')}
                        {isExpiringSoon(product) && (
                          <Calendar className="inline h-4 w-4 ml-1 text-orange-500" />
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{product.location}</span>
                    </div>
                    <div>
                      <span>Lot: {product.batch_number}</span>
                    </div>
                  </div>

                  {(isLowStock(product) || isExpiringSoon(product)) && (
                    <div className="mt-3 flex space-x-2">
                      {isLowStock(product) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stock faible
                        </span>
                      )}
                      {isExpiringSoon(product) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expire bientôt
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStockMovement(product);
                    }}
                    className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                    title="Mouvement de stock"
                  >
                    <Package className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
}