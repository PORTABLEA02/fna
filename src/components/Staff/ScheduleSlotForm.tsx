import React, { useState } from 'react';
import { X, Save, Calendar, Clock, User, AlertCircle } from 'lucide-react';

interface ScheduleSlotData {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  shift: 'morning' | 'afternoon' | 'night' | 'full-day';
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
}

interface ScheduleSlotFormProps {
  onClose: () => void;
  onSave: (slotData: ScheduleSlotData) => void;
  selectedDate?: string;
}

// Mock staff data
const MOCK_STAFF = [
  { id: '1', name: 'Dr. Marie Durand', role: 'admin', department: 'Administration' },
  { id: '2', name: 'Dr. Paul Martin', role: 'doctor', department: 'Médecine', speciality: 'Cardiologie' },
  { id: '3', name: 'Sophie Mbala', role: 'secretary', department: 'Accueil' },
  { id: '4', name: 'Dr. Jean Kouam', role: 'doctor', department: 'Médecine', speciality: 'Médecine générale' },
  { id: '5', name: 'Claire Nkomo', role: 'secretary', department: 'Soins infirmiers' }
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

const SHIFT_PRESETS = {
  morning: { start: '07:30', end: '15:30', label: 'Matin (7h30 - 15h30)' },
  afternoon: { start: '15:00', end: '23:00', label: 'Après-midi (15h00 - 23h00)' },
  night: { start: '23:00', end: '07:00', label: 'Nuit (23h00 - 7h00)' },
  'full-day': { start: '08:00', end: '18:00', label: 'Journée complète (8h00 - 18h00)' }
};

export function ScheduleSlotForm({ onClose, onSave, selectedDate }: ScheduleSlotFormProps) {
  const [formData, setFormData] = useState<ScheduleSlotData>({
    staffId: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    shift: 'full-day',
    status: 'scheduled'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.staffId) {
      newErrors.staffId = 'Veuillez sélectionner un membre du personnel';
    }
    
    if (!formData.date) {
      newErrors.date = 'La date est requise';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'La date ne peut pas être dans le passé';
      }
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'L\'heure de début est requise';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'L\'heure de fin est requise';
    }
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      // Handle night shift (end time next day)
      if (formData.shift === 'night' && end < start) {
        end.setDate(end.getDate() + 1);
      }
      
      if (end <= start && formData.shift !== 'night') {
        newErrors.endTime = 'L\'heure de fin doit être après l\'heure de début';
      }
      
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (duration > 12) {
        newErrors.endTime = 'Un créneau ne peut pas dépasser 12 heures';
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleShiftChange = (shift: keyof typeof SHIFT_PRESETS) => {
    const preset = SHIFT_PRESETS[shift];
    setFormData({
      ...formData,
      shift,
      startTime: preset.start,
      endTime: preset.end
    });
  };

  const getStaffInfo = (staffId: string) => {
    return MOCK_STAFF.find(s => s.id === staffId);
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      // Handle night shift
      if (formData.shift === 'night' && end < start) {
        end.setDate(end.getDate() + 1);
      }
      
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return Math.max(0, duration);
    }
    return 0;
  };

  const selectedStaff = getStaffInfo(formData.staffId);
  const duration = calculateDuration();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Ajouter un Créneau</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection du personnel */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-4">Personnel</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membre du personnel *
              </label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.staffId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un membre du personnel</option>
                {MOCK_STAFF.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.department}
                    {staff.speciality && ` (${staff.speciality})`}
                  </option>
                ))}
              </select>
              {errors.staffId && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{errors.staffId}</span>
                </div>
              )}
            </div>

            {selectedStaff && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{selectedStaff.name}</span>
                    <span className="text-gray-600 ml-2">
                      {selectedStaff.role === 'admin' ? 'Administrateur' : 
                       selectedStaff.role === 'doctor' ? 'Médecin' : 'Personnel soignant'}
                    </span>
                    <span className="text-gray-500 ml-2">• {selectedStaff.department}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date et créneau */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-4">Date et Horaires</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.date}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de créneau
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={(e) => handleShiftChange(e.target.value as keyof typeof SHIFT_PRESETS)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(SHIFT_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Heure de début *
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.startTime && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.startTime}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Heure de fin *
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.endTime && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{errors.endTime}</span>
                  </div>
                )}
              </div>
            </div>

            {duration > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Durée du créneau: </span>
                  <span className="text-gray-900">{duration.toFixed(1)} heures</span>
                  {formData.shift === 'night' && formData.endTime < formData.startTime && (
                    <span className="text-orange-600 ml-2">(se termine le lendemain)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-4">Statut</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut du créneau
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Planifié</option>
                <option value="confirmed">Confirmé</option>
                <option value="completed">Terminé</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Résumé */}
          {formData.staffId && formData.date && formData.startTime && formData.endTime && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Résumé du Créneau</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Personnel:</strong> {selectedStaff?.name}</p>
                <p><strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Horaires:</strong> {formData.startTime} - {formData.endTime}</p>
                <p><strong>Durée:</strong> {duration.toFixed(1)} heures</p>
                <p><strong>Type:</strong> {SHIFT_PRESETS[formData.shift].label}</p>
                <p><strong>Statut:</strong> {
                  formData.status === 'scheduled' ? 'Planifié' :
                  formData.status === 'confirmed' ? 'Confirmé' :
                  formData.status === 'completed' ? 'Terminé' : 'Absent'
                }</p>
              </div>
            </div>
          )}

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
              <span>Ajouter le créneau</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}