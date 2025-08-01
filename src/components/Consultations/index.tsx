import React, { useState } from 'react';
import { ConsultationList } from './ConsultationList';
import { ConsultationForm } from './ConsultationForm';
import { ConsultationDetail } from './ConsultationDetail';
import { MedicalRecordService } from '../../services/medical-records';
import { Database } from '../../lib/database.types';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];

export function ConsultationsManager() {
  const [selectedConsultation, setSelectedConsultation] = useState<MedicalRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<MedicalRecord | null>(null);

  const handleSelectConsultation = (consultation: MedicalRecord) => {
    setSelectedConsultation(consultation);
  };

  const handleNewConsultation = () => {
    setEditingConsultation(null);
    setShowForm(true);
  };

  const handleEditConsultation = () => {
    if (selectedConsultation) {
      setEditingConsultation(selectedConsultation);
      setSelectedConsultation(null);
      setShowForm(true);
    }
  };

  const handleSaveConsultation = (consultationData: Partial<MedicalRecord>) => {
    const saveConsultation = async () => {
      try {
        const { prescriptions, ...recordData } = consultationData as any;
        
        if (editingConsultation) {
          await MedicalRecordService.update(editingConsultation.id, recordData);
        } else {
          await MedicalRecordService.create(recordData as any, prescriptions || []);
        }
        
        setShowForm(false);
        setEditingConsultation(null);
      } catch (error) {
        console.error('Error saving consultation:', error);
        alert('Erreur lors de la sauvegarde de la consultation');
      }
    };
    saveConsultation();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingConsultation(null);
  };

  const handleCloseDetail = () => {
    setSelectedConsultation(null);
  };

  return (
    <div className="space-y-6">
      <ConsultationList
        onSelectConsultation={handleSelectConsultation}
        onNewConsultation={handleNewConsultation}
      />

      {showForm && (
        <ConsultationForm
          consultation={editingConsultation || undefined}
          onClose={handleCloseForm}
          onSave={handleSaveConsultation}
        />
      )}

      {selectedConsultation && (
        <ConsultationDetail
          consultation={selectedConsultation}
          onClose={handleCloseDetail}
          onEdit={handleEditConsultation}
        />
      )}
    </div>
  );
}