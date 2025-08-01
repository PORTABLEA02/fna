import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, User, FileText, Trash2, Eye } from 'lucide-react';
import { MedicalRecordService } from '../../services/medical-records';
import { PatientService } from '../../services/patients';
import { ProfileService } from '../../services/profiles';
import { Database } from '../../lib/database.types';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ConsultationListProps {
  onNewConsultation: () => void;
  onViewConsultation: (consultation: MedicalRecord) => void;
  onEditConsultation: (consultation: MedicalRecord) => void;
}

export function ConsultationList({ onNewConsultation, onViewConsultation, onEditConsultation }: ConsultationListProps) {
  const [consultations, setConsultations] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 ConsultationList.loadData() - Début du chargement des données de consultation');
      setLoading(true);
      const [consultationsData, patientsData, doctorsData] = await Promise.all([
        MedicalRecordService.getAll(),
        PatientService.getAll(),
        ProfileService.getDoctors()
      ]);
      
      console.log('✅ ConsultationList.loadData() - Données de consultation chargées:', {
        consultations: consultationsData.length,
        patients: patientsData.length,
        doctors: doctorsData.length
      });
      setConsultations(consultationsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('❌ ConsultationList.loadData() - Erreur lors du chargement des données de consultation:', error);
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      try {
        console.log('🔍 ConsultationList.handleDelete() - Suppression de la consultation:', id);
        await MedicalRecordService.delete(id);
        console.log('✅ ConsultationList.handleDelete() - Consultation supprimée, rechargement des données');
        await loadData();
      } catch (error) {
        console.error('❌ ConsultationList.handleDelete() - Erreur lors de la suppression de la consultation:', error);
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la consultation');
      }
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Patient inconnu';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin inconnu';
  };

  const filteredConsultations = consultations.filter(consultation => {
    const patientName = getPatientName(consultation.patient_id).toLowerCase();
    const doctorName = getDoctorName(consultation.doctor_id).toLowerCase();
    const diagnosis = consultation.diagnosis?.toLowerCase() || '';
    
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) ||
                         doctorName.includes(searchTerm.toLowerCase()) ||
                         diagnosis.includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || consultation.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Consultations</h2>
          <p className="text-gray-600">Gérer les consultations et dossiers médicaux</p>
        </div>
        <button
          onClick={onNewConsultation}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle consultation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par patient, médecin ou diagnostic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Terminée</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredConsultations.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune consultation trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Aucune consultation ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre première consultation.'
              }
            </p>
            {!searchTerm && selectedStatus === 'all' && (
              <button
                onClick={onNewConsultation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer une consultation
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Médecin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnostic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPatientName(consultation.patient_id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDoctorName(consultation.doctor_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(consultation.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {consultation.diagnosis || 'Non spécifié'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consultation.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : consultation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consultation.status === 'completed' ? 'Terminée' :
                         consultation.status === 'pending' ? 'En attente' : 'Annulée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewConsultation(consultation)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditConsultation(consultation)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Modifier"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(consultation.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total consultations</p>
              <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}