import React from 'react';
import { X, Printer, User, Calendar, FileText, Pill, Phone, Stethoscope } from 'lucide-react';
import { MedicalRecord } from '../../types';

// Mock data
const MOCK_PATIENTS = [
  { id: '1', firstName: 'Jean', lastName: 'Nguema', phone: '+237 690 123 456', dateOfBirth: '1985-03-15' },
  { id: '2', firstName: 'Marie', lastName: 'Atangana', phone: '+237 690 987 654', dateOfBirth: '1992-07-22' }
];

const MOCK_DOCTORS = [
  { id: '2', firstName: 'Dr. Paul', lastName: 'Martin', speciality: 'Cardiologie' },
  { id: '3', firstName: 'Dr. Sophie', lastName: 'Dubois', speciality: 'Médecine générale' }
];

interface PrescriptionDetailProps {
  consultation: MedicalRecord;
  onClose: () => void;
  onPrint: () => void;
}

export function PrescriptionDetail({ consultation, onClose, onPrint }: PrescriptionDetailProps) {
  const getPatientInfo = (patientId: string) => {
    return MOCK_PATIENTS.find(p => p.id === patientId);
  };

  const getDoctorInfo = (doctorId: string) => {
    return MOCK_DOCTORS.find(d => d.id === doctorId);
  };

  const patient = getPatientInfo(consultation.patientId);
  const doctor = getDoctorInfo(consultation.doctorId);

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
    // Appeler la fonction de print passée en props
    onPrint();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Pill className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Détail de l'Ordonnance</h2>
              <p className="text-sm text-gray-600">
                Consultation du {new Date(consultation.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
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
          {/* Informations Patient et Médecin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800">Informations Patient</h3>
              </div>
              
              {patient && (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nom complet:</span>
                    <p className="text-gray-900 font-medium">{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Âge:</span>
                    <p className="text-gray-900">{calculateAge(patient.dateOfBirth)} ans</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{patient.phone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Médecin */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Stethoscope className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-purple-800">Médecin Prescripteur</h3>
              </div>
              
              {doctor && (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nom:</span>
                    <p className="text-gray-900 font-medium">{doctor.firstName} {doctor.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Spécialité:</span>
                    <p className="text-gray-900">{doctor.speciality}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(consultation.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-800">Diagnostic</h3>
            </div>
            <p className="text-gray-900 bg-white p-3 rounded border font-medium">
              {consultation.diagnosis}
            </p>
            {consultation.reason && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Motif de consultation:</span>
                <p className="text-gray-900 mt-1">{consultation.reason}</p>
              </div>
            )}
          </div>

          {/* Ordonnance */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">
                  Ordonnance ({consultation.prescription.length} médicament{consultation.prescription.length > 1 ? 's' : ''})
                </h3>
              </div>
              <div className="text-sm text-green-700">
                ID: {consultation.id}
              </div>
            </div>
            
            <div className="space-y-4">
              {consultation.prescription.map((prescription, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">{prescription.medication}</h4>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Dosage</span>
                      <p className="text-gray-900 font-medium mt-1">{prescription.dosage}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Fréquence</span>
                      <p className="text-gray-900 font-medium mt-1">{prescription.frequency}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Durée</span>
                      <p className="text-gray-900 font-medium mt-1">{prescription.duration}</p>
                    </div>
                  </div>
                  
                  {prescription.instructions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <span className="text-sm font-medium text-yellow-800">Instructions particulières:</span>
                      <p className="text-yellow-900 mt-1">{prescription.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes du médecin */}
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

          {/* Informations d'impression */}
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Cette ordonnance peut être imprimée et remise au patient</p>
              <p className="mt-1">
                Émise le {new Date(consultation.date).toLocaleDateString('fr-FR')} par {doctor?.firstName} {doctor?.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}