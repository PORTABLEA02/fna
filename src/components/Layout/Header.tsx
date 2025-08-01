import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, refreshAuth } = useAuth();

  // Fonction pour rafraîchir l'authentification en cas de problème
  const handleRefreshAuth = async () => {
    try {
      await refreshAuth();
    } catch (error) {
      console.error('Error refreshing auth:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un patient, RDV..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.speciality || 'Équipe médicale'}</p>
            </div>
            <button 
              onClick={handleRefreshAuth}
              className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors"
              title="Actualiser la session"
            >
              <User className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}