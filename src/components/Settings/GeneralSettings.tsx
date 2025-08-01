import React, { useState } from 'react';
import { Building, MapPin, Phone, Mail, Clock, Globe, Save } from 'lucide-react';

interface GeneralSettingsProps {
  onSettingsChange: () => void;
}

export function GeneralSettings({ onSettingsChange }: GeneralSettingsProps) {
  const [settings, setSettings] = useState({
    clinicName: 'CliniCare',
    address: 'Yaoundé, Quartier Bastos',
    phone: '+237 690 000 000',
    email: 'contact@clinicare.cm',
    website: 'www.clinicare.cm',
    timezone: 'Africa/Douala',
    language: 'fr',
    currency: 'FCFA',
    workingHours: {
      start: '08:00',
      end: '18:00',
      lunchStart: '12:00',
      lunchEnd: '14:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    onSettingsChange();
    setSaveMessage(''); // Clear save message when user makes changes
  };

  const handleWorkingHoursChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [field]: value }
    }));
    onSettingsChange();
    setSaveMessage('');
  };

  const handleWorkingDaysChange = (day: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      workingDays: checked 
        ? [...prev.workingDays, day]
        : prev.workingDays.filter(d => d !== day)
    }));
    onSettingsChange();
    setSaveMessage('');
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would normally make an API call to save the settings
      console.log('Saving clinic settings:', settings);
      
      setSaveMessage('Paramètres sauvegardés avec succès !');
      
      // Clear the message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };
  const dayLabels = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de la Clinique</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline h-4 w-4 mr-1" />
              Nom de la clinique
            </label>
            <input
              type="text"
              value={settings.clinicName}
              onChange={(e) => handleChange('clinicName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Téléphone principal
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email de contact
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline h-4 w-4 mr-1" />
              Site web
            </label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Adresse complète
          </label>
          <textarea
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
        {/* Bouton Enregistrer pour les informations de la clinique */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex-1">
            {saveMessage && (
              <div className={`text-sm font-medium ${
                saveMessage.includes('succès') ? 'text-green-600' : 'text-red-600'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les informations'}</span>
          </button>
        </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration Régionale</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuseau horaire
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Africa/Douala">Afrique/Douala (GMT+1)</option>
              <option value="Africa/Lagos">Afrique/Lagos (GMT+1)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Langue
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="FCFA">FCFA</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar US ($)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <Clock className="inline h-5 w-5 mr-2" />
          Horaires de Travail
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure d'ouverture
            </label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de fermeture
            </label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Début pause déjeuner
            </label>
            <input
              type="time"
              value={settings.workingHours.lunchStart}
              onChange={(e) => handleWorkingHoursChange('lunchStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fin pause déjeuner
            </label>
            <input
              type="time"
              value={settings.workingHours.lunchEnd}
              onChange={(e) => handleWorkingHoursChange('lunchEnd', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Jours d'ouverture
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(dayLabels).map(([day, label]) => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.workingDays.includes(day)}
                  onChange={(e) => handleWorkingDaysChange(day, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Aperçu des paramètres</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Clinique:</strong> {settings.clinicName}</p>
          <p><strong>Horaires:</strong> {settings.workingHours.start} - {settings.workingHours.end}</p>
          <p><strong>Jours ouverts:</strong> {settings.workingDays.length} jours/semaine</p>
          <p><strong>Langue:</strong> {settings.language === 'fr' ? 'Français' : 'English'}</p>
        </div>
      </div>
    </div>
  );
}