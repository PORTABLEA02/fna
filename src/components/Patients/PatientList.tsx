import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Phone, Mail, Trash2 } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { useAuth } from '../../context/AuthContext';
import { PatientService } from '../../services/patients';
import { PatientForm } from './PatientForm';
import { PatientDetail } from './PatientDetail';

type Patient = Database['public']['Tables']['patients']['Row'];

interface PatientListProps {
  onSelectPatient: (patient: Patient | null) => void;
  onAddPatient: () => void;
}

export function PatientList({ onSelectPatient, onAddPatient }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const { user } = useAuth();

  // Charger les patients au montage du composant
  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      console.log('🔍 PatientList.loadPatients() - Début du chargement de la liste des patients');
      setLoading(true);
      const data = await PatientService.getAll();
      console.log('✅ PatientList.loadPatients() - Patients chargés avec succès:', data.length, 'patients');
      setPatients(data);
    } catch (error) {
      console.error('❌ PatientList.loadPatients() - Erreur lors du chargement des patients:', error);
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleViewPatient = (patient: Patient) => {
    // Seuls les médecins et administrateurs peuvent voir le dossier complet
    if (user?.role === 'doctor' || user?.role === 'admin') {
      setSelectedPatient(patient);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowPatientForm(true);
  };

  const handleCloseDetail = () => {
    setSelectedPatient(null);
  };

  const handleEditFromDetail = () => {
    if (selectedPatient) {
      setEditingPatient(selectedPatient);
      setSelectedPatient(null);
      setShowPatientForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
  };

  const handleSavePatient = (patientData: Partial<Patient>) => {
    const savePatient = async () => {
      try {
        console.log('🔍 PatientList.handleSavePatient() - Sauvegarde du patient:', patientData);
        if (editingPatient) {
          console.log('🔍 PatientList.handleSavePatient() - Mise à jour du patient existant:', editingPatient.id);
          await PatientService.update(editingPatient.id, patientData);
        } else {
          console.log('🔍 PatientList.handleSavePatient() - Création d\'un nouveau patient');
          await PatientService.create(patientData as any);
        }
        console.log('✅ PatientList.handleSavePatient() - Patient sauvegardé, rechargement de la liste');
        await loadPatients();
        setShowPatientForm(false);
        setEditingPatient(null);
      } catch (error) {
        console.error('❌ PatientList.handleSavePatient() - Erreur lors de la sauvegarde du patient:', error);
        console.error('Error saving patient:', error);
        alert('Erreur lors de la sauvegarde du patient');
      }
    };
    savePatient();
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.')) {
      try {
        console.log('🔍 PatientList.handleDeletePatient() - Suppression du patient:', patientId);
        await PatientService.delete(patientId);
        console.log('✅ PatientList.handleDeletePatient() - Patient supprimé, rechargement de la liste');
        await loadPatients();
      } catch (error) {
        console.error('❌ PatientList.handleDeletePatient() - Erreur lors de la suppression du patient:', error);
        console.error('Error deleting patient:', error);
        alert('Erreur lors de la suppression du patient');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des Patients</h2>
          <button
            onClick={handleAddPatient}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Patient</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Âge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groupe Sanguin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.gender === 'M' ? 'Masculin' : 'Féminin'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {calculateAge(patient.date_of_birth)} ans
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {patient.blood_type || 'Non défini'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {(user?.role === 'doctor' || user?.role === 'admin') && (
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Voir le dossier médical"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                      title={user?.role === 'secretary' ? "Modifier les informations de contact" : "Modifier"}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun patient trouvé</p>
        </div>
      )}
    </div>

      {/* Patient Form Modal */}
      {showPatientForm && (
        <PatientForm
          patient={editingPatient || undefined}
          onClose={handleCloseForm}
          onSave={handleSavePatient}
        />
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          onClose={handleCloseDetail}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}