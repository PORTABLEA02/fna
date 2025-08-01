import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Package, 
  BarChart3, 
  Settings, 
  Stethoscope,
  UserCheck,
  LogOut,
  Heart,
  Pill,
  GitBranch
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
        { id: 'workflow', label: 'Workflow Consultation', icon: GitBranch },
        { id: 'consultations', label: 'Consultations', icon: Stethoscope },
        { id: 'prescriptions', label: 'Ordonnances', icon: Pill },
        { id: 'billing', label: 'Facturation', icon: DollarSign },
        { id: 'staff', label: 'Personnel', icon: UserCheck },
        { id: 'inventory', label: 'Stock', icon: Package },
        { id: 'reports', label: 'Rapports', icon: FileText },
        { id: 'settings', label: 'Paramètres', icon: Settings },
      ];
    } else if (user?.role === 'doctor') {
      return [
        ...baseItems,
        { id: 'patients', label: 'Mes Patients', icon: Users },
        { id: 'appointments', label: 'Mes RDV', icon: Calendar },
        { id: 'consultations', label: 'Consultations', icon: Stethoscope },
      ];
    } else {
      return [
        ...baseItems,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
        { id: 'workflow', label: 'Workflow Consultation', icon: GitBranch },
        { id: 'prescriptions', label: 'Ordonnances', icon: Pill },
        { id: 'billing', label: 'Facturation', icon: DollarSign },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">CliniCare</h1>
            <p className="text-sm text-gray-500">Gestion Médicale</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 rounded-full p-2">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500 capitalize">
              {user?.role === 'admin' ? 'Administrateur' : 
               user?.role === 'doctor' ? 'Médecin' : 'Secrétaire'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}