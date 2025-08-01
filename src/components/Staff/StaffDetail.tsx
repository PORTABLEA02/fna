import React from 'react';
import { X, Edit, User, Mail, Phone, MapPin, Calendar, DollarSign, Shield, Clock, Building, Users } from 'lucide-react';
import { User as UserType } from '../../types';

// Mock extended data
const EXTENDED_STAFF_DATA = {
  '1': {
    department: 'Administration',
    hireDate: '2023-01-15',
    salary: 2500000,
    workSchedule: 'Temps plein',
    emergencyContact: '+237 690 000 011',
    address: 'Yaoundé, Quartier Bastos',
    status: 'active',
    lastLogin: '2024-01-20T08:30:00Z',
    totalPatients: 0,
    totalConsultations: 0,
    performance: 95
  },
  '2': {
    department: 'Médecine',
    hireDate: '2023-03-01',
    salary: 3000000,
    workSchedule: 'Temps plein',
    emergencyContact: '+237 690 000 012',
    address: 'Yaoundé, Quartier Melen',
    status: 'active',
    lastLogin: '2024-01-20T07:45:00Z',
    totalPatients: 45,
    totalConsultations: 128,
    performance: 92
  },
  '3': {
    department: 'Accueil',
    hireDate: '2023-06-15',
    salary: 800000,
    workSchedule: 'Temps plein',
    emergencyContact: '+237 690 000 013',
    address: 'Yaoundé, Quartier Nlongkak',
    status: 'active',
    lastLogin: '2024-01-19T17:30:00Z',
    totalPatients: 0,
    totalConsultations: 0,
    performance: 88
  }
};

interface StaffDetailProps {
  staff: UserType;
  onClose: () => void;
  onEdit: () => void;
}

export function StaffDetail({ staff, onClose, onEdit }: StaffDetailProps) {
  const extendedData = EXTENDED_STAFF_DATA[staff.id as keyof typeof EXTENDED_STAFF_DATA];

  const calculateTenure = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} jours`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `et ${months} mois` : ''}`;
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrateur',
      doctor: 'Médecin',
      secretary: 'Personnel soignant'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      'on-leave': 'En congé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      'on-leave': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {staff.firstName} {staff.lastName}
              </h2>
              <p className="text-gray-600">Profil du Personnel - ID: {staff.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations Personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom complet</label>
                  <p className="text-gray-900 font-medium">{staff.firstName} {staff.lastName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{staff.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Téléphone</label>
                    <p className="text-gray-900">{staff.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {extendedData && (
                  <>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Adresse</label>
                        <p className="text-gray-900">{extendedData.address}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact d'urgence</label>
                      <p className="text-gray-900">{extendedData.emergencyContact}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Inscrit le</label>
                  <p className="text-gray-900">{new Date(staff.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      extendedData ? getStatusColor(extendedData.status) : 'bg-green-100 text-green-800'
                    }`}>
                      {extendedData ? getStatusLabel(extendedData.status) : 'Actif'}
                    </span>
                  </div>
                </div>
                {extendedData && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dernière connexion</label>
                      <p className="text-gray-900">{formatLastLogin(extendedData.lastLogin)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Informations Professionnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Rôle</label>
                  <p className="text-gray-900 font-medium">{getRoleLabel(staff.role)}</p>
                </div>
                {staff.speciality && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Spécialité</label>
                    <p className="text-gray-900">{staff.speciality}</p>
                  </div>
                )}
                {extendedData && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Département</label>
                      <p className="text-gray-900">{extendedData.department}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {extendedData && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date d'embauche</label>
                        <p className="text-gray-900">{new Date(extendedData.hireDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ancienneté</label>
                      <p className="text-gray-900">{calculateTenure(extendedData.hireDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Horaire</label>
                      <p className="text-gray-900">{extendedData.workSchedule}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                {extendedData && (
                  <>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Salaire mensuel</label>
                        <p className="text-gray-900 font-medium">{extendedData.salary.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Performance</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              extendedData.performance >= 90 ? 'bg-green-500' :
                              extendedData.performance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${extendedData.performance}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getPerformanceColor(extendedData.performance)}`}>
                          {extendedData.performance}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques d'activité */}
          {staff.role === 'doctor' && extendedData && (
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Statistiques d'Activité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{extendedData.totalPatients}</div>
                  <div className="text-sm text-gray-600">Patients suivis</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{extendedData.totalConsultations}</div>
                  <div className="text-sm text-gray-600">Consultations</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {extendedData.totalConsultations > 0 ? Math.round(extendedData.totalConsultations / 30) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Consultations/mois</div>
                </div>
              </div>
            </div>
          )}

          {/* Informations système */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Informations Système
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Compte créé le</label>
                <p className="text-gray-900">{new Date(staff.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ID utilisateur</label>
                <p className="text-gray-900 font-mono">{staff.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Compte actif</label>
                <p className="text-gray-900">{staff.isActive ? 'Oui' : 'Non'}</p>
              </div>
              {extendedData && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Salaire annuel</label>
                  <p className="text-gray-900 font-medium">{(extendedData.salary * 12).toLocaleString()} FCFA</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}