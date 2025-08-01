import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Shield, User, Mail, Phone, Calendar, Clock, UserCheck, UserX } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { ProfileService } from '../../services/profiles';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface StaffListProps {
  onSelectStaff: (staff: Profile) => void;
  onNewStaff: () => void;
  onEditStaff: (staff: Profile) => void;
}

export function StaffList({ onSelectStaff, onNewStaff, onEditStaff }: StaffListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [staff, setStaff] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  React.useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      console.log('🔍 StaffList.loadStaff() - Début du chargement de la liste du personnel');
      setLoading(true);
      const data = await ProfileService.getAll();
      console.log('✅ StaffList.loadStaff() - Personnel chargé avec succès:', data.length, 'membres');
      setStaff(data);
    } catch (error) {
      console.error('❌ StaffList.loadStaff() - Erreur lors du chargement du personnel:', error);
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && member.is_active) ||
      (selectedStatus === 'inactive' && !member.is_active);
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(staff.map(s => s.department).filter(Boolean))];

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrateur',
      doctor: 'Médecin',
      secretary: 'Personnel soignant'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      doctor: 'bg-blue-100 text-blue-800',
      secretary: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const handleToggleStatus = (staffId: string) => {
    const updateStatus = async () => {
      try {
        console.log('🔍 StaffList.handleToggleStatus() - Changement de statut pour le personnel:', staffId);
        const member = staff.find(s => s.id === staffId);
        if (member) {
          console.log('🔍 StaffList.handleToggleStatus() - Nouveau statut:', !member.is_active);
          await ProfileService.update(staffId, { is_active: !member.is_active });
          console.log('✅ StaffList.handleToggleStatus() - Statut mis à jour, rechargement de la liste');
          await loadStaff();
        }
      } catch (error) {
        console.error('❌ StaffList.handleToggleStatus() - Erreur lors de la mise à jour du statut:', error);
        console.error('Error updating staff status:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    };
    updateStatus();
  };

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
      const deleteStaff = async () => {
        try {
          console.log('🔍 StaffList.handleDeleteStaff() - Désactivation du personnel (suppression logique):', staffId);
          // Note: Dans un vrai système, on désactiverait plutôt que de supprimer
          await ProfileService.update(staffId, { is_active: false });
          console.log('✅ StaffList.handleDeleteStaff() - Personnel désactivé, rechargement de la liste');
          await loadStaff();
        } catch (error) {
          console.error('❌ StaffList.handleDeleteStaff() - Erreur lors de la suppression du personnel:', error);
          console.error('Error deleting staff:', error);
          alert('Erreur lors de la suppression du personnel');
        }
      };
      deleteStaff();
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('fr-FR').format(salary) + ' FCFA';
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

  const handleCreateStaff = async (staffData: any) => {
    try {
      // Cette fonction sera appelée depuis StaffForm
      // L'implémentation dépendra de la création d'utilisateurs via Supabase Auth
      console.log('Creating staff:', staffData);
    } catch (error) {
      console.error('Error creating staff:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestion du Personnel</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérer les employés de la clinique et leurs informations
            </p>
          </div>
          <button
            onClick={onNewStaff}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Personnel</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <div className="col-span-4 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des statistiques...</p>
            </div>
          ) : (
            <>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Personnel</p>
                <p className="text-2xl font-bold text-blue-900">{staff.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Actifs</p>
                <p className="text-2xl font-bold text-green-900">
                  {staff.filter(s => s.is_active).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Médecins</p>
                <p className="text-2xl font-bold text-blue-900">
                  {staff.filter(s => s.role === 'doctor').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Inactifs</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {staff.filter(s => !s.is_active).length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="doctor">Médecins</option>
              <option value="secretary">Personnel soignant</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="on-leave">En congé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement du personnel...</p>
          </div>
        ) : (
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Département
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {member.first_name[0]}{member.last_name[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                      {member.speciality && (
                        <div className="text-sm text-gray-500">
                          {member.speciality}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Embauché le {member.hire_date ? new Date(member.hire_date).toLocaleDateString('fr-FR') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{member.department || 'Non défini'}</div>
                    <div className="text-xs text-gray-500">{member.work_schedule || 'Temps plein'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(member.id)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {member.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{member.updated_at ? formatLastLogin(member.updated_at) : 'Jamais'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectStaff(member)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                      title="Voir le profil"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditStaff(member)}
                      className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(member.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun membre du personnel trouvé</p>
          <p className="text-sm text-gray-400 mt-1">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </div>
  );
}