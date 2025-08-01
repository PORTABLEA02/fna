import React, { useState, useEffect } from 'react';
import { Clock, User, Activity, Stethoscope, CheckCircle, Play, Square } from 'lucide-react';
import { ConsultationWorkflowService } from '../../services/consultation-workflow';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../lib/database.types';

type ConsultationWorkflow = Database['public']['Tables']['consultation_workflows']['Row'];

export function ConsultationQueue() {
  const [consultations, setConsultations] = useState<ConsultationWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'doctor') {
      loadDoctorConsultations();
    }
  }, [user]);

  const loadDoctorConsultations = async () => {
    try {
      if (!user?.id) return;
      
      console.log('🔍 ConsultationQueue.loadDoctorConsultations() - Chargement des consultations du médecin');
      setLoading(true);
      const data = await ConsultationWorkflowService.getByDoctor(user.id);
      console.log('✅ ConsultationQueue.loadDoctorConsultations() - Consultations chargées:', data.length);
      setConsultations(data);
    } catch (error) {
      console.error('❌ ConsultationQueue.loadDoctorConsultations() - Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (workflowId: string) => {
    try {
      console.log('🔍 ConsultationQueue.handleStartConsultation() - Début de consultation:', workflowId);
      await ConsultationWorkflowService.startConsultation(workflowId);
      console.log('✅ ConsultationQueue.handleStartConsultation() - Consultation démarrée');
      await loadDoctorConsultations();
    } catch (error) {
      console.error('❌ ConsultationQueue.handleStartConsultation() - Erreur:', error);
      alert('Erreur lors du démarrage de la consultation');
    }
  };

  const handleCompleteConsultation = async (workflowId: string) => {
    try {
      console.log('🔍 ConsultationQueue.handleCompleteConsultation() - Fin de consultation:', workflowId);
      await ConsultationWorkflowService.completeConsultation(workflowId);
      console.log('✅ ConsultationQueue.handleCompleteConsultation() - Consultation terminée');
      await loadDoctorConsultations();
    } catch (error) {
      console.error('❌ ConsultationQueue.handleCompleteConsultation() - Erreur:', error);
      alert('Erreur lors de la finalisation de la consultation');
    }
  };

  const getWaitingTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}min`;
    }
  };

  if (user?.role !== 'doctor') {
    return null; // Ce composant n'est visible que pour les médecins
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement de votre file d'attente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Ma File d'Attente</h2>
            <p className="text-sm text-gray-600 mt-1">
              Consultations qui vous sont assignées
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {consultations.length} consultation{consultations.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {consultations.length > 0 ? (
          consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {consultation.patient?.first_name} {consultation.patient?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Attente: {getWaitingTime(consultation.created_at)}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      consultation.status === 'consultation-ready' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {consultation.status === 'consultation-ready' ? 'Prêt' : 'En cours'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium text-gray-900">
                        {consultation.consultation_type === 'general' ? 'Générale' :
                         consultation.consultation_type === 'specialist' ? 'Spécialisée' :
                         consultation.consultation_type === 'emergency' ? 'Urgence' :
                         consultation.consultation_type}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Téléphone:</span>
                      <p className="font-medium text-gray-900">{consultation.patient?.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Constantes:</span>
                      <p className="font-medium text-gray-900">
                        {consultation.vital_signs_id ? (
                          <span className="text-green-600 flex items-center">
                            <Activity className="h-4 w-4 mr-1" />
                            Prises
                          </span>
                        ) : (
                          <span className="text-orange-600">Non prises</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Informations patient importantes */}
                  {consultation.patient && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {consultation.patient.blood_type && (
                          <div>
                            <span className="font-medium text-blue-700">Groupe sanguin: </span>
                            <span className="text-blue-900">{consultation.patient.blood_type}</span>
                          </div>
                        )}
                        {consultation.patient.allergies && consultation.patient.allergies.length > 0 && (
                          <div>
                            <span className="font-medium text-red-700">Allergies: </span>
                            <span className="text-red-600">{consultation.patient.allergies.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  {consultation.status === 'consultation-ready' && (
                    <button
                      onClick={() => handleStartConsultation(consultation.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Commencer</span>
                    </button>
                  )}
                  
                  {consultation.status === 'in-progress' && (
                    <button
                      onClick={() => handleCompleteConsultation(consultation.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Terminer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune consultation en attente</p>
            <p className="text-sm text-gray-400 mt-1">
              Les nouvelles consultations apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}