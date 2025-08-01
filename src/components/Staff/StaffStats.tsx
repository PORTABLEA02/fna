import React, { useState } from 'react';
import { Users, TrendingUp, Clock, DollarSign, Award, Calendar, BarChart3, PieChart } from 'lucide-react';

interface StaffMetrics {
  totalStaff: number;
  activeStaff: number;
  onLeaveStaff: number;
  newHires: number;
  turnoverRate: number;
  averageTenure: number;
  totalPayroll: number;
  averageSalary: number;
  performanceScore: number;
  attendanceRate: number;
}

const MOCK_METRICS: StaffMetrics = {
  totalStaff: 15,
  activeStaff: 13,
  onLeaveStaff: 2,
  newHires: 3,
  turnoverRate: 8.5,
  averageTenure: 18,
  totalPayroll: 25000000,
  averageSalary: 1666667,
  performanceScore: 87,
  attendanceRate: 94
};

const DEPARTMENT_STATS = [
  { name: 'Médecine', staff: 6, budget: 15000000, performance: 92 },
  { name: 'Administration', staff: 3, budget: 4500000, performance: 88 },
  { name: 'Soins infirmiers', staff: 4, budget: 4000000, performance: 90 },
  { name: 'Accueil', staff: 2, budget: 1500000, performance: 85 }
];

const MONTHLY_DATA = [
  { month: 'Jan', hires: 1, departures: 0, performance: 85 },
  { month: 'Fév', hires: 0, departures: 1, performance: 87 },
  { month: 'Mar', hires: 2, departures: 0, performance: 89 },
  { month: 'Avr', hires: 0, departures: 0, performance: 88 },
  { month: 'Mai', hires: 1, departures: 1, performance: 90 },
  { month: 'Juin', hires: 0, departures: 0, performance: 87 }
];

export function StaffStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('performance');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getMetricColor = (value: number, type: 'performance' | 'attendance' | 'turnover') => {
    switch (type) {
      case 'performance':
      case 'attendance':
        if (value >= 90) return 'text-green-600';
        if (value >= 75) return 'text-yellow-600';
        return 'text-red-600';
      case 'turnover':
        if (value <= 5) return 'text-green-600';
        if (value <= 15) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Personnel Total</p>
              <p className="text-2xl font-bold text-gray-900">{MOCK_METRICS.totalStaff}</p>
              <p className="text-sm text-green-600 mt-1">
                +{MOCK_METRICS.newHires} ce mois
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Performance</p>
              <p className={`text-2xl font-bold ${getMetricColor(MOCK_METRICS.performanceScore, 'performance')}`}>
                {MOCK_METRICS.performanceScore}%
              </p>
              <p className="text-sm text-green-600 mt-1">+2% vs mois dernier</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Présence</p>
              <p className={`text-2xl font-bold ${getMetricColor(MOCK_METRICS.attendanceRate, 'attendance')}`}>
                {MOCK_METRICS.attendanceRate}%
              </p>
              <p className="text-sm text-yellow-600 mt-1">-1% vs mois dernier</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Masse Salariale</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(MOCK_METRICS.totalPayroll / 1000000)}M
              </p>
              <p className="text-sm text-gray-600 mt-1">FCFA/mois</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Évolution Mensuelle</h3>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="performance">Performance</option>
                  <option value="hires">Embauches</option>
                  <option value="departures">Départs</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {MONTHLY_DATA.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: selectedMetric === 'performance' ? `${data.performance}%` :
                                   selectedMetric === 'hires' ? `${(data.hires / 3) * 100}%` :
                                   `${(data.departures / 2) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedMetric === 'performance' ? `${data.performance}%` :
                     selectedMetric === 'hires' ? data.hires :
                     data.departures}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Répartition par département */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800">Répartition par Département</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {DEPARTMENT_STATS.map((dept, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                const percentage = Math.round((dept.staff / MOCK_METRICS.totalStaff) * 100);
                
                return (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                        <span className="font-medium text-gray-900">{dept.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {dept.staff} personnes ({percentage}%)
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Budget: {formatCurrency(dept.budget)}</span>
                      <span>Performance: {dept.performance}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Métriques Détaillées</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{MOCK_METRICS.averageTenure}</div>
              <div className="text-sm text-gray-600">Ancienneté moyenne (mois)</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getMetricColor(MOCK_METRICS.turnoverRate, 'turnover')}`}>
                {MOCK_METRICS.turnoverRate}%
              </div>
              <div className="text-sm text-gray-600">Taux de rotation</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(MOCK_METRICS.averageSalary / 1000)}K
              </div>
              <div className="text-sm text-gray-600">Salaire moyen (FCFA)</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{MOCK_METRICS.activeStaff}</div>
              <div className="text-sm text-gray-600">Personnel actif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Alertes et Recommandations</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Attention</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Le taux de présence a diminué de 1% ce mois. Considérez une analyse des causes d'absence.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Excellent</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              La performance globale de l'équipe s'améliore constamment (+2% ce mois).
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Recommandation</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Envisagez de recruter 1-2 personnes supplémentaires pour le département de soins infirmiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}