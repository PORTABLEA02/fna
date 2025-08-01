import React from 'react';
import { X, User, Calendar, FileText, Pill, Printer, Edit, Tag } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { PatientService } from '../../services/patients';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'] & {
  prescriptions?: Database['public']['Tables']['prescriptions']['Row'][];
};
type Patient = Database['public']['Tables']['patients']['Row'];

interface ConsultationDetailProps {
  consultation: MedicalRecord;
  onClose: () => void;
  onEdit: () => void;
}

export function ConsultationDetail({ consultation, onClose, onEdit }: ConsultationDetailProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadPatientInfo();
  }, [consultation.patient_id]);

  const loadPatientInfo = async () => {
    try {
      setLoading(true);
      const patientData = await PatientService.getById(consultation.patient_id);
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient info:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePrint = () => {
    window.print();
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

  const getConsultationTypeLabel = (type: string) => {
    const types = {
      general: 'Consultation générale',
      specialist: 'Consultation spécialisée',
      emergency: 'Consultation d\'urgence',
      followup: 'Consultation de suivi',
      preventive: 'Consultation préventive',
      other: 'Autre consultation'
    };
    return types[type as keyof typeof types] || 'Type non défini';
  };

  const getConsultationTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      specialist: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800',
      followup: 'bg-green-100 text-green-800',
      preventive: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Détail de la Consultation</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Imprimer"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              title="Modifier"
            >
              <Edit className="h-5 w-5" />
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
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Informations Patient</h3>
            </div>
            
            {patient && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Nom complet:</span>
                  <p className="text-gray-900">{patient?.first_name} {patient?.last_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Âge:</span>
                  <p className="text-gray-900">{patient ? calculateAge(patient.date_of_birth) : 'N/A'} ans</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Groupe sanguin:</span>
                  <p className="text-gray-900">{patient?.blood_type || 'Non défini'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Téléphone:</span>
                  <p className="text-gray-900">{patient?.phone}</p>
                </div>
                {patient?.allergies && patient.allergies.length > 0 && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <span className="text-sm font-medium text-red-700">Allergies connues:</span>
                    <p className="text-red-600">{patient.allergies.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Consultation Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-800">Informations de Consultation</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <p className="text-gray-900">{new Date(consultation.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConsultationTypeColor(consultation.type)}`}>
                    <Tag className="h-3 w-3 mr-1" />
                    {getConsultationTypeLabel(consultation.type)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Motif:</span>
                <p className="text-gray-900">{consultation.reason}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Symptômes observés:</span>
                <p className="text-gray-900 mt-1 p-3 bg-white rounded border">
                  {consultation.symptoms || 'Aucun symptôme particulier noté'}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Diagnostic:</span>
                <p className="text-gray-900 mt-1 p-3 bg-white rounded border font-medium">
                  {consultation.diagnosis}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Traitement recommandé:</span>
                <p className="text-gray-900 mt-1 p-3 bg-white rounded border">
                  {consultation.treatment || 'Aucun traitement spécifique prescrit'}
                </p>
              </div>
            </div>
          </div>

          {/* Prescription */}
          {consultation.prescriptions && consultation.prescriptions.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Pill className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">Ordonnance</h3>
              </div>
              
              <div className="space-y-3">
                {consultation.prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-lg">{prescription.medication}</h4>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Dosage:</span>
                        <p className="text-gray-900">{prescription.dosage}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Fréquence:</span>
                        <p className="text-gray-900">{prescription.frequency}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Durée:</span>
                        <p className="text-gray-900">{prescription.duration}</p>
                      </div>
                    </div>
                    
                    {prescription.instructions && (
                      <div className="mt-3 pt-3 border-t border-green-100">
                        <span className="font-medium text-gray-700">Instructions:</span>
                        <p className="text-gray-900 mt-1">{prescription.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {consultation.notes && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Notes du Médecin</h3>
              </div>
              <p className="text-gray-900 bg-white p-3 rounded border">
                {consultation.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <p>Consultation créée le {new Date(consultation.date).toLocaleDateString('fr-FR')}</p>
              <p>ID: {consultation.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}