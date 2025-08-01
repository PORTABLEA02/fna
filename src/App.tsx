import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardStats } from './components/Dashboard/DashboardStats';
import { PatientList } from './components/Patients/PatientList';
import { PatientForm } from './components/Patients/PatientForm';
import { AppointmentCalendar } from './components/Appointments/AppointmentCalendar';
import { InventoryManager } from './components/Inventory/InventoryManager';
import { ConsultationsManager } from './components/Consultations';
import { PrescriptionList } from './components/Prescriptions';
import { StaffManager } from './components/Staff';
import { ConsultationWorkflowManager } from './components/Workflow';
import { ConsultationQueue } from './components/Workflow/ConsultationQueue';
import { SettingsManager } from './components/Settings';
import { BillingManager } from './components/Billing';
import { AppointmentService } from './services/appointments';
import { Patient } from './types';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            {user?.role === 'doctor' && <ConsultationQueue />}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Les widgets seront ajoutés plus tard avec des données réelles */}
            </div>
          </div>
        );

      case 'patients':
        return (
          <div>
            <PatientList 
              onSelectPatient={setSelectedPatient}
              onAddPatient={() => {}}
            />
          </div>
        );

      case 'appointments':
        return <AppointmentCalendar />;

      case 'consultations':
        return <ConsultationsManager />;

      case 'workflow':
        return <ConsultationWorkflowManager />;

      case 'prescriptions':
        return <PrescriptionList />;

      case 'billing':
        return (
          <BillingManager />
        );

      case 'staff':
        return <StaffManager />;

      case 'inventory':
        return <InventoryManager />;

      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rapports et Analyses</h2>
            <p className="text-gray-600">Module de reporting en cours de développement...</p>
          </div>
        );

      case 'settings':
        return <SettingsManager />;

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800">Tableau de bord</h2>
            <p className="text-gray-600 mt-2">Sélectionnez un module dans le menu de gauche</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header />
      <main className="ml-64 pt-20 p-6">
        {renderContent()}
      </main>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
          <p className="text-sm text-gray-500 mt-2">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;