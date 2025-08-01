import React, { useState } from 'react';
import { X, Save, Package, AlertCircle } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Medicine = Database['public']['Tables']['medicines']['Row'];

interface ProductFormProps {
  product?: Medicine;
  onClose: () => void;
  onSave: (product: Partial<Medicine>) => void;
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'medication',
    manufacturer: product?.manufacturer || '',
    batch_number: product?.batch_number || '',
    expiry_date: product?.expiry_date || '',
    current_stock: product?.current_stock || 0,
    min_stock: product?.min_stock || 0,
    unit_price: product?.unit_price || 0,
    location: product?.location || '',
    unit: product?.unit || '',
    description: product?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du produit est requis';
    }
    
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Le fabricant est requis';
    }
    
    if (!formData.batch_number.trim()) {
      newErrors.batch_number = 'Le numéro de lot est requis';
    }
    
    if (!formData.expiry_date) {
      newErrors.expiry_date = 'La date d\'expiration est requise';
    } else {
      const expiryDate = new Date(formData.expiry_date);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.expiry_date = 'La date d\'expiration doit être dans le futur';
      }
    }
    
    if (formData.current_stock < 0) {
      newErrors.current_stock = 'Le stock actuel ne peut pas être négatif';
    }
    
    if (formData.min_stock < 0) {
      newErrors.min_stock = 'Le stock minimum ne peut pas être négatif';
    }
    
    if (formData.unit_price <= 0) {
      newErrors.unit_price = 'Le prix unitaire doit être supérieur à 0';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'L\'emplacement est requis';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'L\'unité de mesure est requise';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...formData,
        current_stock: Number(formData.current_stock),
        min_stock: Number(formData.min_stock),
        unit_price: Number(formData.unit_price)
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

  const generateBatchNumber = () => {
    const prefix = formData.manufacturer.substring(0, 2).toUpperCase() || 'XX';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const batch_number = `${prefix}${year}${random}`;
    setFormData({ ...formData, batch_number });
  };

  const categoryOptions = [
    { value: 'medication', label: 'Médicaments' },
    { value: 'medical-supply', label: 'Fournitures médicales' },
    { value: 'equipment', label: 'Équipements' },
    { value: 'consumable', label: 'Consommables' },
    { value: 'diagnostic', label: 'Matériel de diagnostic' }
  ];

  const unitOptions = {
    medication: ['comprimé', 'gélule', 'boîte', 'flacon', 'ampoule', 'tube', 'sachet'],
    'medical-supply': ['pièce', 'boîte', 'paquet', 'rouleau', 'set', 'kit'],
    equipment: ['pièce', 'unité', 'appareil'],
    consumable: ['litre', 'ml', 'kg', 'g', 'paquet', 'flacon', 'tube'],
    diagnostic: ['boîte', 'test', 'kit', 'cassette', 'bandelette']
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {product ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Informations Générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Paracétamol 500mg"
                />
                {errors.name && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabricant *
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.manufacturer ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Pharma Cameroun"
                />
                {errors.manufacturer && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.manufacturer}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de lot *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="batch_number"
                    value={formData.batch_number}
                    onChange={handleChange}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.batch_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: PC2024001"
                  />
                  <button
                    type="button"
                    onClick={generateBatchNumber}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Générer
                  </button>
                </div>
                {errors.batch_number && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.batch_number}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description du produit, indications, etc."
              />
            </div>
          </div>

          {/* Stock et prix */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Stock et Prix</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock actuel *
                </label>
                <input
                  type="number"
                  name="current_stock"
                  value={formData.current_stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.current_stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.current_stock && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.current_stock}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock minimum *
                </label>
                <input
                  type="number"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.min_stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.min_stock && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.min_stock}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix unitaire (FCFA) *
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.unit_price ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.unit_price && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.unit_price}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité de mesure *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.unit ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner</option>
                  {unitOptions[formData.category as keyof typeof unitOptions]?.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                {errors.unit && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.unit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Localisation et expiration */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Localisation et Expiration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emplacement *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Pharmacie - Étagère A1"
                />
                {errors.location && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.location}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration *
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.expiry_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.expiry_date && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.expiry_date}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Résumé */}
          {formData.name && formData.current_stock > 0 && formData.unit_price > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Résumé</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Produit:</strong> {formData.name}</p>
                <p><strong>Stock:</strong> {formData.current_stock} {formData.unit}</p>
                <p><strong>Valeur totale:</strong> {(formData.current_stock * formData.unit_price).toLocaleString()} FCFA</p>
                {formData.current_stock <= formData.min_stock && (
                  <p className="text-orange-600"><strong>⚠️ Stock en dessous du minimum recommandé</strong></p>
                )}
              </div>
            </div>
          )}

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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{product ? 'Mettre à jour' : 'Ajouter le produit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}