import React, { useState } from 'react';
import { X, Save, Activity, Thermometer, Heart, Weight, Ruler, Droplets, Wind, AlertCircle } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { VitalSignsService } from '../../services/vital-signs';

type ConsultationWorkflow = Database['public']['Tables']['consultation_workflows']['Row'];

interface VitalSignsFormProps {
  workflow: ConsultationWorkflow;
  onClose: () => void;
  onSave: (vitalSigns: any) => void;
}

export function VitalSignsForm({ workflow, onClose, onSave }: VitalSignsFormProps) {
  const [formData, setFormData] = useState({
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    weight: '',
    height: '',
    oxygen_saturation: '',
    respiratory_rate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bmi, setBmi] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    // Au moins une constante doit être renseignée
    const hasAnyVital = Object.entries(formData).some(([key, value]) => 
      key !== 'notes' && value.trim() !== ''
    );
    
    if (!hasAnyVital) {
      newErrors.general = 'Au moins une constante vitale doit être renseignée';
    }

    // Validation des valeurs numériques
    if (formData.temperature && (parseFloat(formData.temperature) < 30 || parseFloat(formData.temperature) > 45)) {
      newErrors.temperature = 'Température invalide (30-45°C)';
    }

    if (formData.blood_pressure_systolic && (parseInt(formData.blood_pressure_systolic) < 50 || parseInt(formData.blood_pressure_systolic) > 250)) {
      newErrors.blood_pressure_systolic = 'Tension systolique invalide (50-250 mmHg)';
    }

    if (formData.blood_pressure_diastolic && (parseInt(formData.blood_pressure_diastolic) < 30 || parseInt(formData.blood_pressure_diastolic) > 150)) {
      newErrors.blood_pressure_diastolic = 'Tension diastolique invalide (30-150 mmHg)';
    }

    if (formData.heart_rate && (parseInt(formData.heart_rate) < 30 || parseInt(formData.heart_rate) > 200)) {
      newErrors.heart_rate = 'Fréquence cardiaque invalide (30-200 bpm)';
    }

    if (formData.weight && (parseFloat(formData.weight) < 1 || parseFloat(formData.weight) > 300)) {
      newErrors.weight = 'Poids invalide (1-300 kg)';
    }

    if (formData.height && (parseFloat(formData.height) < 50 || parseFloat(formData.height) > 250)) {
      newErrors.height = 'Taille invalide (50-250 cm)';
    }

    if (formData.oxygen_saturation && (parseInt(formData.oxygen_saturation) < 70 || parseInt(formData.oxygen_saturation) > 100)) {
      newErrors.oxygen_saturation = 'Saturation invalide (70-100%)';
    }

    if (formData.respiratory_rate && (parseInt(formData.respiratory_rate) < 5 || parseInt(formData.respiratory_rate) > 50)) {
      newErrors.respiratory_rate = 'Fréquence respiratoire invalide (5-50/min)';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Convertir les valeurs en nombres
      const vitalSignsData = {
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : null,
        respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
        notes: formData.notes || null
      };
      
      onSave(vitalSignsData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Calculer l'IMC si poids et taille sont renseignés
    if (name === 'weight' || name === 'height') {
      const weight = name === 'weight' ? parseFloat(value) : parseFloat(formData.weight);
      const height = name === 'height' ? parseFloat(value) : parseFloat(formData.height);
      
      if (weight > 0 && height > 0) {
        setBmi(VitalSignsService.calculateBMI(weight, height));
      } else {
        setBmi(null);
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const getBloodPressureInterpretation = () => {
    const systolic = parseInt(formData.blood_pressure_systolic);
    const diastolic = parseInt(formData.blood_pressure_diastolic);
    
    if (systolic > 0 && diastolic > 0) {
      return VitalSignsService.interpretBloodPressure(systolic, diastolic);
    }
    return null;
  };

  const getBMIInterpretation = () => {
    return bmi ? VitalSignsService.interpretBMI(bmi) : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Prise des Constantes Vitales</h2>
              <p className="text-sm text-gray-600">Patient: {workflow.patient?.first_name} {workflow.patient?.last_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Constantes principales */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Constantes Principales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="inline h-4 w-4 mr-1" />
                  Température (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  step="0.1"
                  min="30"
                  max="45"
                  placeholder="36.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.temperature ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.temperature && (
                  <span className="text-sm text-red-600">{errors.temperature}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="inline h-4 w-4 mr-1" />
                  Fréquence cardiaque (bpm)
                </label>
                <input
                  type="number"
                  name="heart_rate"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  min="30"
                  max="200"
                  placeholder="72"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.heart_rate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.heart_rate && (
                  <span className="text-sm text-red-600">{errors.heart_rate}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tension artérielle systolique (mmHg)
                </label>
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  value={formData.blood_pressure_systolic}
                  onChange={handleChange}
                  min="50"
                  max="250"
                  placeholder="120"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.blood_pressure_systolic ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.blood_pressure_systolic && (
                  <span className="text-sm text-red-600">{errors.blood_pressure_systolic}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tension artérielle diastolique (mmHg)
                </label>
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  value={formData.blood_pressure_diastolic}
                  onChange={handleChange}
                  min="30"
                  max="150"
                  placeholder="80"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.blood_pressure_diastolic ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.blood_pressure_diastolic && (
                  <span className="text-sm text-red-600">{errors.blood_pressure_diastolic}</span>
                )}
              </div>
            </div>

            {/* Interprétation tension artérielle */}
            {formData.blood_pressure_systolic && formData.blood_pressure_diastolic && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Interprétation: </span>
                  <span className="text-blue-600 font-medium">
                    {getBloodPressureInterpretation()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mesures physiques */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-4 flex items-center">
              <Weight className="h-5 w-5 mr-2" />
              Mesures Physiques
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Weight className="inline h-4 w-4 mr-1" />
                  Poids (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.1"
                  min="1"
                  max="300"
                  placeholder="70.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.weight ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.weight && (
                  <span className="text-sm text-red-600">{errors.weight}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="inline h-4 w-4 mr-1" />
                  Taille (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  step="0.1"
                  min="50"
                  max="250"
                  placeholder="175"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.height ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.height && (
                  <span className="text-sm text-red-600">{errors.height}</span>
                )}
              </div>
            </div>

            {/* Calcul IMC */}
            {bmi && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">IMC: </span>
                    <span className="text-green-600 font-bold">{bmi}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Interprétation: </span>
                    <span className="text-green-600 font-medium">{getBMIInterpretation()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Constantes respiratoires */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-purple-800 mb-4 flex items-center">
              <Wind className="h-5 w-5 mr-2" />
              Constantes Respiratoires
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="inline h-4 w-4 mr-1" />
                  Saturation en oxygène (%)
                </label>
                <input
                  type="number"
                  name="oxygen_saturation"
                  value={formData.oxygen_saturation}
                  onChange={handleChange}
                  min="70"
                  max="100"
                  placeholder="98"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.oxygen_saturation ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.oxygen_saturation && (
                  <span className="text-sm text-red-600">{errors.oxygen_saturation}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wind className="inline h-4 w-4 mr-1" />
                  Fréquence respiratoire (/min)
                </label>
                <input
                  type="number"
                  name="respiratory_rate"
                  value={formData.respiratory_rate}
                  onChange={handleChange}
                  min="5"
                  max="50"
                  placeholder="16"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.respiratory_rate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.respiratory_rate && (
                  <span className="text-sm text-red-600">{errors.respiratory_rate}</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes complémentaires
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Observations particulières, comportement du patient, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Résumé */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Résumé des Constantes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {formData.temperature && (
                <div className="text-center">
                  <div className="font-bold text-blue-600">{formData.temperature}°C</div>
                  <div className="text-gray-600">Température</div>
                </div>
              )}
              {formData.heart_rate && (
                <div className="text-center">
                  <div className="font-bold text-red-600">{formData.heart_rate} bpm</div>
                  <div className="text-gray-600">Pouls</div>
                </div>
              )}
              {formData.blood_pressure_systolic && formData.blood_pressure_diastolic && (
                <div className="text-center">
                  <div className="font-bold text-purple-600">
                    {formData.blood_pressure_systolic}/{formData.blood_pressure_diastolic}
                  </div>
                  <div className="text-gray-600">Tension</div>
                </div>
              )}
              {bmi && (
                <div className="text-center">
                  <div className="font-bold text-green-600">{bmi}</div>
                  <div className="text-gray-600">IMC</div>
                </div>
              )}
            </div>
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
              <span>Enregistrer les constantes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}