import React, { useState } from 'react';
import { X, Save, TrendingUp, TrendingDown, Package, AlertCircle } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Medicine = Database['public']['Tables']['medicines']['Row'];
type StockMovement = Database['public']['Tables']['stock_movements']['Row'];

interface StockMovementFormProps {
  product: Medicine;
  onClose: () => void;
  onSave: (movement: Partial<StockMovement>) => void;
}

export function StockMovementForm({ product, onClose, onSave }: StockMovementFormProps) {
  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'out',
    quantity: 1,
    reason: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0';
    }
    
    if (formData.type === 'out' && formData.quantity > product.currentStock) {
      newErrors.quantity = 'Quantité insuffisante en stock';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Le motif est requis';
    }
    
    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave({
        medicine_id: product.id,
        type: formData.type,
        quantity: formData.quantity,
        reason: formData.reason,
        reference: formData.reference || undefined,
        date: formData.date
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const newStock = formData.type === 'in' 
    ? product.current_stock + formData.quantity 
    : product.current_stock - formData.quantity;

  const reasonSuggestions = {
    in: [
      'Réception commande',
      'Retour patient',
      'Transfert interne',
      'Correction inventaire',
      'Don/Échantillon'
    ],
    out: [
      'Dispensation patient',
      'Utilisation service',
      'Transfert externe',
      'Péremption',
      'Casse/Perte'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Mouvement de Stock</h2>
              <p className="text-sm text-gray-600">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-3">Informations Produit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Produit:</span>
                <p className="text-gray-900">{product.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Stock actuel:</span>
                <p className="text-gray-900 font-bold">{product.current_stock} {product.unit}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Emplacement:</span>
                <p className="text-gray-900">{product.location}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Stock minimum:</span>
                <p className="text-gray-900">{product.min_stock} {product.unit}</p>
              </div>
            </div>
          </div>

          {/* Movement Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Détails du Mouvement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de mouvement *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type === 'in' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="in"
                      checked={formData.type === 'in'}
                      onChange={handleChange}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Entrée</span>
                  </label>
                  
                  <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type === 'out' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="out"
                      checked={formData.type === 'out'}
                      onChange={handleChange}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-gray-900">Sortie</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité ({product.unit}) *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max={formData.type === 'out' ? product.current_stock : undefined}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.quantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.quantity && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{errors.quantity}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{errors.date}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif *
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reason ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un motif</option>
                  {reasonSuggestions[formData.type].map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                  <option value="Autre">Autre (préciser en référence)</option>
                </select>
                {errors.reason && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.reason}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence (optionnel)
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Numéro de bon, facture, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stock Preview */}
          <div className={`rounded-lg p-4 ${
            formData.type === 'in' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <h3 className={`font-medium mb-3 ${
              formData.type === 'in' ? 'text-green-800' : 'text-red-800'
            }`}>
              Aperçu du Stock
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-3">
                <div className="text-lg font-bold text-gray-900">{product.currentStock}</div>
                <div className="text-sm text-gray-600">Stock actuel</div>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <div className={`text-lg font-bold ${
                  formData.type === 'in' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.type === 'in' ? '+' : '-'}{formData.quantity}
                </div>
                <div className="text-sm text-gray-600">Mouvement</div>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <div className={`text-lg font-bold ${
                  newStock <= product.minStock ? 'text-red-600' : 'text-green-600'
                }`}>
                  {newStock}
                </div>
                <div className="text-sm text-gray-600">Nouveau stock</div>
              </div>
            </div>

            {newStock <= product.min_stock && (
              <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Attention: Le stock sera en dessous du minimum après ce mouvement
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                formData.type === 'in' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer le mouvement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}