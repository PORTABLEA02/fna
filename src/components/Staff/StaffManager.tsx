import React, { useState } from 'react';
import { StaffList } from './StaffList';
import { StaffForm } from './StaffForm';
import { StaffDetail } from './StaffDetail';
import { StaffSchedule } from './StaffSchedule';
import { StaffStats } from './StaffStats';
import { Database } from '../../lib/database.types';
import { ProfileService } from '../../services/profiles';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function StaffManager() {
  const [activeView, setActiveView] = useState<'list' | 'schedule' | 'stats'>('list');
  const [selectedStaff, setSelectedStaff] = useState<Profile | null>(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Profile | null>(null);

  const handleSelectStaff = (staff: Profile) => {
    setSelectedStaff(staff);
  };

  const handleNewStaff = () => {
    setEditingStaff(null);
    setShowStaffForm(true);
  };

  const handleEditStaff = (staff: Profile) => {
    setEditingStaff(staff);
    setSelectedStaff(null);
    setShowStaffForm(true);
  };

  const handleSaveStaff = (staffData: Partial<Profile>) => {
    const saveStaff = async () => {
      try {
        if (editingStaff) {
          await ProfileService.update(editingStaff.id, staffData);
        } else {
          // Pour créer un nouveau staff, il faudrait utiliser l'API d'authentification
          // Cette partie nécessite une implémentation plus complexe
          console.log('Creating new staff member:', staffData);
        }
        setShowStaffForm(false);
        setEditingStaff(null);
      } catch (error) {
        console.error('Error saving staff:', error);
        alert('Erreur lors de la sauvegarde du personnel');
      }
    };
    saveStaff();
  };

  const handleCloseForm = () => {
    setShowStaffForm(false);
    setEditingStaff(null);
  };

  const handleCloseDetail = () => {
    setSelectedStaff(null);
  };

  const handleEditFromDetail = () => {
    if (selectedStaff) {
      setEditingStaff(selectedStaff);
      setSelectedStaff(null);
      setShowStaffForm(true);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'list':
        return (
          <StaffList
            onSelectStaff={handleSelectStaff}
            onNewStaff={handleNewStaff}
            onEditStaff={handleEditStaff}
          />
        );
      case 'schedule':
        return <StaffSchedule />;
      case 'stats':
        return <StaffStats />;
      default:
        return (
          <StaffList
            onSelectStaff={handleSelectStaff}
            onNewStaff={handleNewStaff}
            onEditStaff={handleEditStaff}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveView('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Liste du Personnel
            </button>
            <button
              onClick={() => setActiveView('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistiques
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      {selectedStaff && (
        <StaffDetail
          staff={selectedStaff}
          onClose={handleCloseDetail}
          onEdit={handleEditFromDetail}
        />
      )}

      {showStaffForm && (
        <StaffForm
          staff={editingStaff || undefined}
          onClose={handleCloseForm}
          onSave={handleSaveStaff}
        />
      )}
    </div>
  );
}