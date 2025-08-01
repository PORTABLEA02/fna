import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Users, CreditCard, PieChart, BarChart3, FileText, AlertCircle } from 'lucide-react';

interface BillingMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  averageInvoiceAmount: number;
  collectionRate: number;
}

const MOCK_METRICS: BillingMetrics = {
  totalRevenue: 15750000,
  monthlyRevenue: 2850000,
  pendingAmount: 875000,
  overdueAmount: 425000,
  totalInvoices: 156,
  paidInvoices: 128,
  averageInvoiceAmount: 35000,
  collectionRate: 82.1
};

const MONTHLY_DATA = [
  { month: 'Jan', revenue: 2100000, invoices: 42, paid: 38 },
  { month: 'Fév', revenue: 2350000, invoices: 47, paid: 43 },
  { month: 'Mar', revenue: 2800000, invoices: 56, paid: 52 },
  { month: 'Avr', revenue: 2650000, invoices: 53, paid: 48 },
  { month: 'Mai', revenue: 3100000, invoices: 62, paid: 58 },
  { month: 'Juin', revenue: 2850000, invoices: 57, paid: 51 }
];

const PAYMENT_METHODS_DATA = [
  { method: 'Espèces', amount: 8500000, percentage: 54, color: 'bg-blue-500' },
  { method: 'Carte bancaire', amount: 4200000, percentage: 27, color: 'bg-green-500' },
  { method: 'Mobile Money', amount: 2100000, percentage: 13, color: 'bg-yellow-500' },
  { method: 'Virement', amount: 950000, percentage: 6, color: 'bg-purple-500' }
];

const SERVICE_REVENUE_DATA = [
  { service: 'Consultations générales', revenue: 6800000, count: 340 },
  { service: 'Consultations spécialisées', revenue: 4500000, count: 150 },
  { service: 'Examens médicaux', revenue: 2850000, count: 190 },
  { service: 'Analyses', revenue: 1600000, count: 80 }
];

export function BillingStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(MOCK_METRICS.totalRevenue)}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getGrowthIcon(12.5)}
                <span className={`text-sm ${getGrowthColor(12.5)}`}>+12.5% vs mois dernier</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(MOCK_METRICS.monthlyRevenue)}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getGrowthIcon(8.3)}
                <span className={`text-sm ${getGrowthColor(8.3)}`}>+8.3% vs mois dernier</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant en attente</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(MOCK_METRICS.pendingAmount)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {Math.round((MOCK_METRICS.pendingAmount / MOCK_METRICS.totalRevenue) * 100)}% du total
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de recouvrement</p>
              <p className="text-2xl font-bold text-green-600">{MOCK_METRICS.collectionRate}%</p>
              <div className="flex items-center space-x-1 mt-1">
                {getGrowthIcon(2.1)}
                <span className={`text-sm ${getGrowthColor(2.1)}`}>+2.1% vs mois dernier</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
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
                  <option value="revenue">Revenus</option>
                  <option value="invoices">Factures</option>
                  <option value="collection">Taux de recouvrement</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {MONTHLY_DATA.map((data, index) => {
                const maxValue = Math.max(...MONTHLY_DATA.map(d => 
                  selectedMetric === 'revenue' ? d.revenue :
                  selectedMetric === 'invoices' ? d.invoices :
                  (d.paid / d.invoices) * 100
                ));
                
                const currentValue = selectedMetric === 'revenue' ? data.revenue :
                                  selectedMetric === 'invoices' ? data.invoices :
                                  (data.paid / data.invoices) * 100;
                
                const percentage = (currentValue / maxValue) * 100;
                
                return (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                      <div className="flex-1 w-48">
                        <div className="bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 min-w-[100px] text-right">
                      {selectedMetric === 'revenue' ? formatCurrency(currentValue) :
                       selectedMetric === 'invoices' ? `${currentValue} factures` :
                       `${currentValue.toFixed(1)}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Répartition par mode de paiement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800">Modes de Paiement</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {PAYMENT_METHODS_DATA.map((method, index) => (
                <div key={method.method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${method.color}`}></div>
                      <span className="font-medium text-gray-900">{method.method}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.percentage}%
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${method.color} transition-all duration-300`}
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(method.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenus par service */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Revenus par Type de Service</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICE_REVENUE_DATA.map((service, index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
              const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50'];
              const textColors = ['text-blue-800', 'text-green-800', 'text-yellow-800', 'text-purple-800'];
              
              return (
                <div key={service.service} className={`${bgColors[index]} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-medium ${textColors[index]}`}>{service.service}</h4>
                    <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenus:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(service.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nombre:</span>
                      <span className="font-medium text-gray-900">{service.count} services</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prix moyen:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(Math.round(service.revenue / service.count))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
              <div className="text-2xl font-bold text-blue-600">{MOCK_METRICS.totalInvoices}</div>
              <div className="text-sm text-gray-600">Total factures</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{MOCK_METRICS.paidInvoices}</div>
              <div className="text-sm text-gray-600">Factures payées</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(MOCK_METRICS.averageInvoiceAmount)}
              </div>
              <div className="text-sm text-gray-600">Montant moyen</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((MOCK_METRICS.overdueAmount / MOCK_METRICS.totalRevenue) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Taux d'impayés</div>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Attention</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {formatCurrency(MOCK_METRICS.overdueAmount)} en factures en retard. 
              Considérez des relances pour améliorer le recouvrement.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Excellent</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Le chiffre d'affaires mensuel est en hausse de 12.5%. 
              Continuez sur cette lancée !
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Recommandation</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Diversifiez les modes de paiement pour faciliter les règlements des patients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}