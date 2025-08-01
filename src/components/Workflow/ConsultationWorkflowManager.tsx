import React, { useState, useEffect } from 'react';
import { Users, Clock, Stethoscope, CheckCircle, AlertCircle, User, Calendar, DollarSign, Activity } from 'lucide-react';
import { ConsultationWorkflowService } from '../../services/consultation-workflow';
import { VitalSignsService } from '../../services/vital-signs';
import { PatientService } from '../../services/patients';
import { ProfileService } from '../../services/profiles';
import { VitalSignsForm } from './VitalSignsForm';
import { DoctorAssignmentForm } from './DoctorAssignmentForm';
import { ConsultationQueue } from './ConsultationQueue';
import { Database } from '../../lib/database.types';

type ConsultationWorkflow = Database['public']['Tables']['consultation_workflows']['Row'];
type VitalSigns = Database['public']['Tables']['vital_signs']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export function ConsultationWorkflowManager() {
  const [workflows, setWorkflows] = useState<ConsultationWorkflow[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ConsultationWorkflow | null>(null);
  const [showVitalSignsForm, setShowVitalSignsForm] = useState(false);
  const [showDoctorAssignment, setShowDoctorAssignment] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'ready' | 'progress' | 'completed'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 ConsultationWorkflowManager.loadData() - Chargement des données du workflow');
      setLoading(true);
      const [workflowsData, patientsData, doctorsData] = await Promise.all([
        ConsultationWorkflowService.getAll(),
        PatientService.getAll(),
        ProfileService.getDoctors()
      ]);
      
      console.log('✅ ConsultationWorkflowManager.loadData() - Données chargées:', {
        workflows: workflowsData.length,
        patients: patientsData.length,
        doctors: doctorsData.length
      });
      setWorkflows(workflowsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('❌ ConsultationWorkflowManager.loadData() - Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeVitalSigns = (workflow: ConsultationWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowVitalSignsForm(true);
  };

  const handleAssignDoctor = (workflow: ConsultationWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowDoctorAssignment(true);
  };

  const handleSaveVitalSigns = async (vitalSignsData: any) => {
    try {
      if (!selectedWorkflow) return;
      
      console.log('🔍 ConsultationWorkflowManager.handleSaveVitalSigns() - Sauvegarde des constantes vitales');
      // Créer les constantes vitales
      const vitalSigns = await VitalSignsService.create({
        patient_id: selectedWorkflow.patient_id,
        ...vitalSignsData
      });

      // Mettre à jour le workflow
      const nextStatus = selectedWorkflow.doctor_id ? 'consultation-ready' : 'doctor-assignment';
      await ConsultationWorkflowService.update(selectedWorkflow.id, {
        vital_signs_id: vitalSigns.id,
        status: nextStatus
      });

      console.log('✅ ConsultationWorkflowManager.handleSaveVitalSigns() - Constantes vitales sauvegardées et workflow mis à jour');
      await loadData();
      setShowVitalSignsForm(false);
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('❌ ConsultationWorkflowManager.handleSaveVitalSigns() - Erreur:', error);
      alert('Erreur lors de la sauvegarde des constantes vitales');
    }
  };

  const handleSaveDoctorAssignment = async (doctorId: string) => {
    try {
      if (!selectedWorkflow) return;
      
      console.log('🔍 ConsultationWorkflowManager.handleSaveDoctorAssignment() - Attribution du médecin:', doctorId);
      await ConsultationWorkflowService.assignDoctor(selectedWorkflow.id, doctorId);
      
      console.log('✅ ConsultationWorkflowManager.handleSaveDoctorAssignment() - Médecin attribué avec succès');
      await loadData();
      setShowDoctorAssignment(false);
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('❌ ConsultationWorkflowManager.handleSaveDoctorAssignment() - Erreur:', error);
      alert('Erreur lors de l\'attribution du médecin');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'payment-pending': 'Paiement en attente',
      'payment-completed': 'Paiement effectué',
      'vitals-pending': 'Constantes à prendre',
      'doctor-assignment': 'Attribution médecin',
      'consultation-ready': 'Prêt pour consultation',
      'in-progress': 'Consultation en cours',
      'completed': 'Consultation terminée'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'payment-pending': 'bg-red-100 text-red-800',
      'payment-completed': 'bg-blue-100 text-blue-800',
      'vitals-pending': 'bg-yellow-100 text-yellow-800',
      'doctor-assignment': 'bg-purple-100 text-purple-800',
      'consultation-ready': 'bg-green-100 text-green-800',
      'in-progress': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'payment-pending':
        return <DollarSign className="h-4 w-4" />;
      case 'payment-completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'vitals-pending':
        return <Activity className="h-4 w-4" />;
      case 'doctor-assignment':
        return <User className="h-4 w-4" />;
      case 'consultation-ready':
        return <Clock className="h-4 w-4" />;
      case 'in-progress':
        return <Stethoscope className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Patient inconnu';
  };

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return 'Non assigné';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin inconnu';
  };

  const getConsultationTypeLabel = (type: string) => {
    const types = {
      general: 'Générale',
      specialist: 'Spécialisée',
      emergency: 'Urgence',
      followup: 'Suivi',
      preventive: 'Préventive',
      other: 'Autre'
    };
    return types[type as keyof typeof types] || type;
  };

  const filteredWorkflows = workflows.filter(workflow => {
    switch (activeTab) {
      case 'pending':
        return ['payment-completed', 'vitals-pending'].includes(workflow.status);
      case 'ready':
        return workflow.status === 'consultation-ready';
      case 'progress':
        return workflow.status === 'in-progress';
      case 'completed':
        return workflow.status === 'completed';
      default:
        return true;
    }
  });

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending':
        return workflows.filter(w => ['payment-completed', 'vitals-pending'].includes(w.status)).length;
      case 'ready':
        return workflows.filter(w => w.status === 'consultation-ready').length;
      case 'progress':
        return workflows.filter(w => w.status === 'in-progress').length;
      case 'completed':
        return workflows.filter(w => w.status === 'completed').length;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement du workflow de consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Workflow de Consultation</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestion de la prise en charge des patients depuis la facturation jusqu'à la consultation
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-900">{getTabCount('pending')}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Prêts</p>
                  <p className="text-2xl font-bold text-green-900">{getTabCount('ready')}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">En cours</p>
                  <p className="text-2xl font-bold text-blue-900">{getTabCount('progress')}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-gray-900">{getTabCount('completed')}</p>
                </div>
                <Users className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'pending', label: 'En attente', count: getTabCount('pending') },
              { id: 'ready', label: 'Prêts', count: getTabCount('ready') },
              { id: 'progress', label: 'En cours', count: getTabCount('progress') },
              { id: 'completed', label: 'Terminées', count: getTabCount('completed') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {filteredWorkflows.length > 0 ? (
            <div className="space-y-4">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {getPatientName(workflow.patient_id)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(workflow.created_at).toLocaleDateString('fr-FR')} à {new Date(workflow.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(workflow.status)}`}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1">{getStatusLabel(workflow.status)}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type de consultation:</span>
                          <p className="font-medium text-gray-900">{getConsultationTypeLabel(workflow.consultation_type)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Facture:</span>
                          <p className="font-medium text-gray-900">{workflow.invoice_id}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Médecin assigné:</span>
                          <p className="font-medium text-gray-900">
                            {workflow.doctor_id ? getDoctorName(workflow.doctor_id) : 'Attribution automatique'}
                          </p>
                          {workflow.doctor && (
                            <p className="text-xs text-gray-500">
                              Spécialité: {workflow.doctor.speciality}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {workflow.status === 'payment-completed' && !workflow.vital_signs_id && (
                        <button
                          onClick={() => handleTakeVitalSigns(workflow)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                        >
                          <Activity className="h-4 w-4" />
                          <span>Prendre constantes</span>
                        </button>
                      )}
                      
                      {workflow.status === 'vitals-pending' && !workflow.doctor_id && (
                        <button
                          onClick={() => handleAssignDoctor(workflow)}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1"
                        >
                          <User className="h-4 w-4" />
                          <span>Assigner médecin</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                {activeTab === 'pending' && <Clock className="h-8 w-8 text-gray-400" />}
                {activeTab === 'ready' && <CheckCircle className="h-8 w-8 text-gray-400" />}
                {activeTab === 'progress' && <Stethoscope className="h-8 w-8 text-gray-400" />}
                {activeTab === 'completed' && <Users className="h-8 w-8 text-gray-400" />}
              </div>
              <p className="text-gray-500">
                {activeTab === 'pending' && 'Aucune consultation en attente de prise en charge'}
                {activeTab === 'ready' && 'Aucune consultation prête'}
                {activeTab === 'progress' && 'Aucune consultation en cours'}
                {activeTab === 'completed' && 'Aucune consultation terminée aujourd\'hui'}
              </p>
              {activeTab === 'pending' && (
                <p className="text-sm text-gray-400 mt-2">
                  Les workflows sont créés automatiquement lors du paiement des factures de consultation
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showVitalSignsForm && selectedWorkflow && (
        <VitalSignsForm
          workflow={selectedWorkflow}
          onClose={() => {
            setShowVitalSignsForm(false);
            setSelectedWorkflow(null);
          }}
          onSave={handleSaveVitalSigns}
        />
      )}

      {showDoctorAssignment && selectedWorkflow && (
        <DoctorAssignmentForm
          workflow={selectedWorkflow}
          doctors={doctors}
          onClose={() => {
            setShowDoctorAssignment(false);
            setSelectedWorkflow(null);
          }}
          onSave={handleSaveDoctorAssignment}
        />
      )}
    </div>
  );
}