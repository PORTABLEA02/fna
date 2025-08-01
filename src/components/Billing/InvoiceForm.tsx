import React, { useState } from 'react';
import { X, Save, Plus, Trash2, User, Calendar, DollarSign, Calculator, Package, Pill, Search, AlertTriangle } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { PatientService } from '../../services/patients';
import { MedicineService } from '../../services/medicines';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  invoice_items?: Database['public']['Tables']['invoice_items']['Row'][];
};
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Medicine = Database['public']['Tables']['medicines']['Row'];

// Services prédéfinis
const PREDEFINED_SERVICES = [
  { description: 'Consultation générale', unitPrice: 15000 },
  { description: 'Consultation spécialisée', unitPrice: 25000 },
  { description: 'Consultation cardiologique', unitPrice: 30000 },
  { description: 'Consultation pédiatrique', unitPrice: 20000 },
  { description: 'ECG', unitPrice: 15000 },
  { description: 'Échographie', unitPrice: 25000 },
  { description: 'Radiographie', unitPrice: 20000 },
  { description: 'Analyses sanguines', unitPrice: 20000 },
  { description: 'Test de glycémie', unitPrice: 5000 },
  { description: 'Vaccination', unitPrice: 10000 },
  { description: 'Pansement', unitPrice: 3000 },
  { description: 'Injection', unitPrice: 2000 }
];

const CATEGORY_LABELS = {
  medication: 'Médicaments',
  'medical-supply': 'Fournitures médicales',
  equipment: 'Équipements',
  consumable: 'Consommables',
  diagnostic: 'Matériel diagnostic'
};

interface InvoiceFormProps {
  invoice?: Invoice;
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
}

export function InvoiceForm({ invoice, onClose, onSave }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    patient_id: invoice?.patient_id || '',
    date: invoice?.date || new Date().toISOString().split('T')[0],
    status: invoice?.status || 'pending',
    tax: invoice?.tax || 0
  });

  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]>(
    invoice?.invoice_items || []
  );

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unit_price: 0,
    total: 0,
    medicine_id: null as string | null
  });

  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsData, medicinesData] = await Promise.all([
        PatientService.getAll(),
        MedicineService.getAll()
      ]);
      setPatients(patientsData);
      setMedicines(medicinesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits médicaux
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + (formData.tax || 0);
    
    // Déterminer le type de consultation basé sur les services facturés
    const consultationType = items.some(item => 
      item.description.toLowerCase().includes('spécialisée') || 
      item.description.toLowerCase().includes('cardiologique') ||
      item.description.toLowerCase().includes('pédiatrique')
    ) ? 'specialist' : 'general';
    
    onSave({
      ...formData,
      items: items,
      subtotal,
      total,
      consultationType
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'tax' ? (parseFloat(value) || 0) : value 
    });
  };

  const handleItemChange = (field: keyof InvoiceItem, value: string | number) => {
    const updatedItem = { ...newItem, [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
    }
    
    setNewItem(updatedItem);
  };

  const addItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.unit_price > 0) {
      setItems([...items, { 
        ...newItem, 
        total: newItem.quantity * newItem.unit_price 
      }]);
      setNewItem({
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
        medicine_id: null
      });
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const selectPredefinedService = (service: typeof PREDEFINED_SERVICES[0]) => {
    setNewItem({
      ...newItem,
      description: service.description,
      unit_price: service.unitPrice,
      total: newItem.quantity * service.unitPrice
    });
  };

  const selectMedicalProduct = (product: Medicine) => {
    setNewItem({
      ...newItem,
      description: `${product.name} (${product.unit})`,
      unit_price: product.unit_price,
      total: newItem.quantity * product.unit_price,
      medicine_id: product.id
    });
  };

  const getPatientInfo = (patient_id: string) => {
    return patients.find(p => p.id === patient_id);
  };

  const selectedPatient = getPatientInfo(formData.patient_id);
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + formData.tax;

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${month}${random}`;
  };

  // Vérifier les produits avec stock faible
  const getLowStockWarning = (productName: string) => {
    const product = medicines.find(m => productName.includes(m.name));
    if (product && product.current_stock <= product.min_stock) {
      return `⚠️ Stock faible: ${product.current_stock} ${product.unit} restant(s)`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {invoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
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
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-4">Informations Générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient *
                </label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de facturation *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {selectedPatient && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center space-x-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm flex-1">
                    <div>
                      <span className="font-medium text-gray-700">Patient: </span>
                      <span className="text-gray-900">{selectedPatient?.first_name} {selectedPatient?.last_name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Téléphone: </span>
                      <span className="text-gray-900">{selectedPatient.phone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email: </span>
                      <span className="text-gray-900">{selectedPatient.email || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Services et prestations existants */}
          {items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-4">Services et Produits Facturés</h3>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qté</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prix unitaire</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => {
                      const lowStockWarning = getLowStockWarning(item.description);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              {item.description}
                              {lowStockWarning && (
                                <div className="text-xs text-orange-600 mt-1 flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {lowStockWarning}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.unit_price.toLocaleString()} FCFA</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.total.toLocaleString()} FCFA</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ajouter des éléments */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-4">Ajouter des Éléments à la Facture</h3>

            {/* Onglets */}
            <div className="flex space-x-1 mb-4 bg-white rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                  activeTab === 'services'
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Services Médicaux</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                  activeTab === 'products'
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Produits & Médicaments</span>
              </button>
            </div>

            {activeTab === 'services' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services prédéfinis
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {PREDEFINED_SERVICES.map((service, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectPredefinedService(service)}
                        className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900">{service.description}</div>
                        <div className="text-xs text-gray-500">{service.unitPrice.toLocaleString()} FCFA</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Filtres pour produits */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit ou médicament..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Toutes catégories</option>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Liste des produits */}
                <div className="bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {filteredMedicines.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredMedicines.map((product) => {
                        const isLowStock = product.current_stock <= product.min_stock;
                        const categoryIcon = product.category === 'medication' ? Pill : Package;
                        const CategoryIcon = categoryIcon;
                        
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => selectMedicalProduct(product)}
                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <CategoryIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-600">{product.description}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {CATEGORY_LABELS[product.category]} • {product.manufacturer}
                                  </div>
                                  {isLowStock && (
                                    <div className="text-xs text-orange-600 mt-1 flex items-center">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Stock faible: {product.current_stock} {product.unit}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  {product.unit_price.toLocaleString()} FCFA
                                </div>
                                <div className="text-xs text-gray-500">
                                  par {product.unit}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Stock: {product.current_stock}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun produit trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formulaire d'ajout manuel */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-gray-800 mb-3">Ou ajouter manuellement</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Description du service/produit"
                    value={newItem.description}
                    onChange={(e) => handleItemChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Quantité"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => handleItemChange('quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Prix unitaire (FCFA)"
                    min="0"
                    value={newItem.unit_price}
                    onChange={(e) => handleItemChange('unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-medium">{(newItem.quantity * newItem.unit_price).toLocaleString()} FCFA</span>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!newItem.description || newItem.quantity <= 0 || newItem.unit_price <= 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Calculs et totaux */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Calculs et Totaux
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxes (FCFA)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes:</span>
                  <span className="font-medium">{formData.tax.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-green-600">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques des éléments */}
            {items.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {items.filter(item => !item.description.includes('(') || item.description.includes('Consultation')).length}
                  </div>
                  <div className="text-xs text-blue-600">Services</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {items.filter(item => item.description.includes('(') && !item.description.includes('Consultation')).length}
                  </div>
                  <div className="text-xs text-purple-600">Produits</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600">{items.length}</div>
                  <div className="text-xs text-green-600">Total éléments</div>
                </div>
              </div>
            )}
          </div>

          {/* Résumé de la facture */}
          {formData.patient_id && items.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Résumé de la Facture</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Patient:</strong> {selectedPatient?.first_name} {selectedPatient?.last_name}</p>
                <p><strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Éléments:</strong> {items.length} élément{items.length > 1 ? 's' : ''}</p>
                <p><strong>Montant total:</strong> {total.toLocaleString()} FCFA</p>
                {!invoice && (
                  <p><strong>Numéro de facture:</strong> {generateInvoiceNumber()}</p>
                )}
              </div>
            </div>
          )}

          {/* Alertes stock */}
          {items.some(item => getLowStockWarning(item.description)) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-800">Alertes Stock</h4>
              </div>
              <p className="text-sm text-orange-700">
                Certains produits facturés ont un stock faible. Pensez à vérifier les niveaux de stock 
                et à commander si nécessaire.
              </p>
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
              disabled={!formData.patient_id || items.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{invoice ? 'Mettre à jour' : 'Créer la facture'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}