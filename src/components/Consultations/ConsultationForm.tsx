import React, { useState } from 'react';
import { X, Save, Plus, Trash2, User, Calendar, FileText, Pill } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { PatientService } from '../../services/patients';
import { useAuth } from '../../context/AuthContext';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Prescription = Database['public']['Tables']['prescriptions']['Row'];

interface ConsultationFormProps {
  consultation?: MedicalRecord;
  onClose: () => void;
  onSave: (consultation: Partial<MedicalRecord>) => void;
}

export function ConsultationForm({ consultation, onClose, onSave }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    patient_id: consultation?.patient_id || '',
    date: consultation?.date || new Date().toISOString().split('T')[0],
    type: consultation?.type || 'general',
    reason: consultation?.reason || '',
    symptoms: consultation?.symptoms || '',
    diagnosis: consultation?.diagnosis || '',
    treatment: consultation?.treatment || '',
    notes: consultation?.notes || ''
  });

  const [prescriptions, setPrescriptions] = useState<Omit<Prescription, 'id' | 'medical_record_id' | 'created_at'>[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await PatientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      doctor_id: user?.id || '',
      prescriptions
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addPrescription = () => {
    if (newPrescription.medication && newPrescription.dosage) {
      setPrescriptions([...prescriptions, newPrescription]);
      setNewPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    }
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const getPatientInfo = (patient_id: string) => {
    return patients.find(p => p.id === patient_id);
  };

  const selectedPatient = getPatientInfo(formData.patient_id);

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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {consultation ? 'Modifier la Consultation' : 'Nouvelle Consultation'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Informations Patient</h3>
            </div>
            
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
                  Date de consultation *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de consultation *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">Consultation générale</option>
                  <option value="specialist">Consultation spécialisée</option>
                  <option value="emergency">Consultation d'urgence</option>
                  <option value="followup">Consultation de suivi</option>
                  <option value="preventive">Consultation préventive</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            {selectedPatient && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Âge: </span>
                    <span className="text-gray-900">
                      {new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} ans
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Groupe sanguin: </span>
                    <span className="text-gray-900">{selectedPatient.blood_type || 'Non défini'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Téléphone: </span>
                    <span className="text-gray-900">{selectedPatient.phone}</span>
                  </div>
                </div>
                {selectedPatient.allergies.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium text-red-700">Allergies: </span>
                    <span className="text-red-600">{selectedPatient.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Consultation Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-800">Détails de la Consultation</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de consultation *
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Douleurs abdominales, Contrôle de routine..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptômes observés
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrire les symptômes du patient..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnostic *
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                  rows={2}
                  placeholder="Diagnostic médical..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traitement recommandé
                </label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Plan de traitement, recommandations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Pill className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Ordonnance</h3>
            </div>

            {/* Existing Prescriptions */}
            {prescriptions.length > 0 && (
              <div className="space-y-3 mb-4">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{prescription.medication}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Dosage:</span> {prescription.dosage} - 
                          <span className="font-medium"> Fréquence:</span> {prescription.frequency} - 
                          <span className="font-medium"> Durée:</span> {prescription.duration}
                        </div>
                        {prescription.instructions && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Instructions:</span> {prescription.instructions}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePrescription(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Prescription */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <h4 className="font-medium text-gray-800 mb-3">Ajouter un médicament</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nom du médicament"
                  value={newPrescription.medication}
                  onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Dosage (ex: 500mg)"
                  value={newPrescription.dosage}
                  onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Fréquence (ex: 3 fois/jour)"
                  value={newPrescription.frequency}
                  onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Durée (ex: 7 jours)"
                  value={newPrescription.duration}
                  onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Instructions particulières"
                  value={newPrescription.instructions}
                  onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={addPrescription}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes du médecin
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Notes complémentaires, observations particulières..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}