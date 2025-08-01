import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar, DollarSign, Shield, AlertCircle } from 'lucide-react';
import { User as UserType } from '../../types';

interface StaffFormProps {
  staff?: UserType;
  onClose: () => void;
  onSave: (staff: Partial<UserType>) => void;
}

interface ExtendedStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'doctor' | 'secretary';
  speciality?: string;
  department: string;
  hireDate: string;
  salary: number;
  workSchedule: string;
  emergencyContact: string;
  address: string;
  status: 'active' | 'inactive' | 'on-leave';
  isActive: boolean;
}

export function StaffForm({ staff, onClose, onSave }: StaffFormProps) {
  const [formData, setFormData] = useState<ExtendedStaffData>({
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || 'secretary',
    speciality: staff?.speciality || '',
    department: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: 0,
    workSchedule: 'Temps plein',
    emergencyContact: '',
    address: '',
    status: 'active',
    isActive: staff?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const departments = [
    'Administration',
    'Médecine',
    'Soins infirmiers',
    'Accueil',
    'Pharmacie',
    'Laboratoire',
    'Radiologie',
    'Maintenance',
    'Comptabilité'
  ];

  const workSchedules = [
    'Temps plein',
    'Temps partiel',
    'Garde de nuit',
    'Week-end',
    'Sur appel'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }
    
    if (!formData.department) {
      newErrors.department = 'Le département est requis';
    }
    
    if (formData.role === 'doctor' && !formData.speciality?.trim()) {
      newErrors.speciality = 'La spécialité est requise pour les médecins';
    }
    
    if (!formData.hireDate) {
      newErrors.hireDate = 'La date d\'embauche est requise';
    }
    
    if (formData.salary <= 0) {
      newErrors.salary = 'Le salaire doit être supérieur à 0';
    }
    
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Le contact d\'urgence est requis';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...formData,
        isActive: formData.status === 'active'
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

  const generateEmail = () => {
    if (formData.firstName && formData.lastName) {
      const email = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@clinique.com`;
      setFormData({ ...formData, email });
    }
  };

  const getSalaryRange = (role: string, department: string) => {
    const ranges = {
      admin: { min: 2000000, max: 4000000 },
      doctor: { min: 2500000, max: 5000000 },
      secretary: { min: 600000, max: 1500000 }
    };
    return ranges[role as keyof typeof ranges] || { min: 500000, max: 2000000 };
  };

  const salaryRange = getSalaryRange(formData.role, formData.department);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {staff ? 'Modifier le Personnel' : 'Nouveau Personnel'}
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
          {/* Informations personnelles */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-4">Informations Personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.firstName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.lastName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={generateEmail}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Générer
                  </button>
                </div>
                {errors.email && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+237 690 000 000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact d'urgence *
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="+237 690 000 000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.emergencyContact ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.emergencyContact && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.emergencyContact}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{errors.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-4">Informations Professionnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="secretary">Personnel soignant</option>
                  <option value="doctor">Médecin</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Département *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.department ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.department}</span>
                  </div>
                )}
              </div>

              {formData.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spécialité *
                  </label>
                  <input
                    type="text"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    placeholder="Ex: Cardiologie, Médecine générale..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.speciality ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.speciality && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{errors.speciality}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horaire de travail
                </label>
                <select
                  name="workSchedule"
                  value={formData.workSchedule}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {workSchedules.map(schedule => (
                    <option key={schedule} value={schedule}>{schedule}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'embauche *
                </label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hireDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.hireDate && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.hireDate}</span>
                  </div>
                )}
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
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="on-leave">En congé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Informations salariales */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-4">Informations Salariales</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salaire mensuel (FCFA) *
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.salary ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.salary && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{errors.salary}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Fourchette recommandée pour ce rôle: {salaryRange.min.toLocaleString()} - {salaryRange.max.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          {/* Résumé */}
          {formData.firstName && formData.lastName && formData.department && formData.salary > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Résumé</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Employé:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Poste:</strong> {formData.role === 'admin' ? 'Administrateur' : formData.role === 'doctor' ? 'Médecin' : 'Personnel soignant'} - {formData.department}</p>
                <p><strong>Salaire:</strong> {formData.salary.toLocaleString()} FCFA/mois</p>
                <p><strong>Statut:</strong> {formData.status === 'active' ? 'Actif' : formData.status === 'inactive' ? 'Inactif' : 'En congé'}</p>
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
              <span>{staff ? 'Mettre à jour' : 'Ajouter le personnel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}