import React, { useState } from 'react';
import { Settings, User, Shield, Database, Bell, Palette, Globe, Save, AlertCircle } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { UserManagement } from './UserManagement';

const SETTINGS_TABS = [
  { id: 'general', label: 'Général', icon: Settings },
  { id: 'users', label: 'Utilisateurs', icon: User },
];

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings onSettingsChange={() => setHasUnsavedChanges(true)} />;
      case 'users':
        return <UserManagement />;
      default:
        return <GeneralSettings onSettingsChange={() => setHasUnsavedChanges(true)} />;
    }
  };

  const handleSaveAll = () => {
    // Logique pour sauvegarder tous les paramètres
    console.log('Sauvegarde de tous les paramètres...');
    setHasUnsavedChanges(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Paramètres du Système</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configuration et administration de la clinique
          </p>
        </div>
        
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Modifications non sauvegardées</span>
            </div>
            <button
              onClick={handleSaveAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Sidebar des onglets */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <nav className="p-4 space-y-2">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}