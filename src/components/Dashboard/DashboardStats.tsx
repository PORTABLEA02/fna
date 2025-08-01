import React from 'react';
import { Users, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { AppointmentService } from '../../services/appointments';
import { PatientService } from '../../services/patients';
import { InvoiceService } from '../../services/invoices';
import { MedicineService } from '../../services/medicines';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-sm mt-2 ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const [stats, setStats] = React.useState([
    {
      title: 'Patients Total',
      value: '0',
      change: 'Chargement...',
      changeType: 'increase' as const,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'RDV Aujourd\'hui',
      value: '0',
      change: 'Chargement...',
      changeType: 'increase' as const,
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Revenus Mensuel',
      value: '0 FCFA',
      change: 'Chargement...',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Stock Critique',
      value: '0',
      change: 'Chargement...',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: 'bg-red-500'
    }
  ]);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('🔍 DashboardStats.loadStats() - Début du chargement des statistiques du tableau de bord');
      const [
        appointmentStats,
        billingStats,
        inventoryStats,
        patientsData
      ] = await Promise.all([
        AppointmentService.getStats(),
        InvoiceService.getBillingStats(),
        MedicineService.getInventoryStats(),
        PatientService.getAll()
      ]);

      console.log('✅ DashboardStats.loadStats() - Toutes les statistiques chargées avec succès');
      console.log('📊 DashboardStats.loadStats() - Résumé des statistiques:', {
        patients: patientsData.length,
        appointmentsToday: appointmentStats.today.total,
        monthlyRevenue: billingStats.monthlyRevenue,
        lowStockItems: inventoryStats.lowStockItems
      });
      setStats([
        {
          title: 'Patients Total',
          value: patientsData.length.toString(),
          change: '+12% ce mois',
          changeType: 'increase' as const,
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: 'RDV Aujourd\'hui',
          value: appointmentStats.today.total.toString(),
          change: `${appointmentStats.today.pending} en attente`,
          changeType: 'increase' as const,
          icon: Calendar,
          color: 'bg-green-500'
        },
        {
          title: 'Revenus Mensuel',
          value: `${Math.round(billingStats.monthlyRevenue / 1000).toLocaleString()}K FCFA`,
          change: '+8% vs mois dernier',
          changeType: 'increase' as const,
          icon: DollarSign,
          color: 'bg-purple-500'
        },
        {
          title: 'Stock Critique',
          value: inventoryStats.lowStockItems.toString(),
          change: 'Réappro. urgente',
          changeType: 'decrease' as const,
          icon: AlertTriangle,
          color: 'bg-red-500'
        }
      ]);
    } catch (error) {
      console.error('❌ DashboardStats.loadStats() - Erreur lors du chargement des statistiques:', error);
      console.error('Error loading dashboard stats:', error);
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}