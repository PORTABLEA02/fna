import React, { useState } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, Calendar, DollarSign, BarChart3, PieChart } from 'lucide-react';

interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  expiredItems: number;
  averageValue: number;
  topCategories: Array<{ category: string; count: number; value: number }>;
  recentMovements: number;
}

const MOCK_METRICS: InventoryMetrics = {
  totalItems: 156,
  totalValue: 8750000,
  lowStockItems: 12,
  expiringItems: 8,
  expiredItems: 3,
  averageValue: 56089,
  topCategories: [
    { category: 'Médicaments', count: 85, value: 4200000 },
    { category: 'Fournitures médicales', count: 45, value: 2800000 },
    { category: 'Consommables', count: 18, value: 1200000 },
    { category: 'Équipements', count: 8, value: 550000 }
  ],
  recentMovements: 24
};

const MONTHLY_DATA = [
  { month: 'Jan', entries: 45, exits: 38, value: 2100000 },
  { month: 'Fév', entries: 52, exits: 41, value: 2350000 },
  { month: 'Mar', entries: 48, exits: 45, value: 2200000 },
  { month: 'Avr', entries: 55, exits: 42, value: 2500000 },
  { month: 'Mai', exits: 39, entries: 51, value: 2400000 },
  { month: 'Juin', entries: 47, exits: 44, value: 2300000 }
];

const EXPIRY_ALERTS = [
  { name: 'Amoxicilline 250mg', daysLeft: 15, category: 'Médicaments' },
  { name: 'Gants latex stériles', daysLeft: 25, category: 'Fournitures' },
  { name: 'Seringues 5ml', daysLeft: 45, category: 'Fournitures' },
  { name: 'Alcool médical 70°', daysLeft: 60, category: 'Consommables' }
];

const LOW_STOCK_ALERTS = [
  { name: 'Paracétamol 500mg', current: 5, minimum: 20, category: 'Médicaments' },
  { name: 'Compresses stériles', current: 8, minimum: 15, category: 'Fournitures' },
  { name: 'Gants latex', current: 2, minimum: 10, category: 'Fournitures' },
  { name: 'Désinfectant', current: 3, minimum: 8, category: 'Consommables' }
];

export function InventoryStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('movements');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getAlertColor = (daysLeft: number) => {
    if (daysLeft <= 30) return 'text-red-600';
    if (daysLeft <= 60) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getStockColor = (current: number, minimum: number) => {
    const ratio = current / minimum;
    if (ratio <= 0.5) return 'text-red-600';
    if (ratio <= 1) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">{MOCK_METRICS.totalItems}</p>
              <p className="text-sm text-green-600 mt-1">+8 ce mois</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(MOCK_METRICS.totalValue / 1000000)}M FCFA
              </p>
              <p className="text-sm text-green-600 mt-1">+5% vs mois dernier</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-2xl font-bold text-orange-600">{MOCK_METRICS.lowStockItems}</p>
              <p className="text-sm text-orange-600 mt-1">Réappro. urgente</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expire Bientôt</p>
              <p className="text-2xl font-bold text-red-600">{MOCK_METRICS.expiringItems}</p>
              <p className="text-sm text-red-600 mt-1">À surveiller</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mouvements mensuels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Mouvements Mensuels</h3>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="movements">Mouvements</option>
                  <option value="value">Valeur</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {MONTHLY_DATA.map((data, index) => {
                const maxValue = selectedMetric === 'movements' 
                  ? Math.max(...MONTHLY_DATA.map(d => Math.max(d.entries, d.exits)))
                  : Math.max(...MONTHLY_DATA.map(d => d.value));
                
                const entryValue = selectedMetric === 'movements' ? data.entries : data.value;
                const exitValue = selectedMetric === 'movements' ? data.exits : data.value * 0.8;
                
                return (
                  <div key={data.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{data.month}</span>
                      <div className="flex space-x-4">
                        <span className="text-green-600">
                          Entrées: {selectedMetric === 'movements' ? data.entries : formatCurrency(data.value)}
                        </span>
                        <span className="text-red-600">
                          Sorties: {selectedMetric === 'movements' ? data.exits : formatCurrency(data.value * 0.8)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(entryValue / maxValue) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(exitValue / maxValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800">Répartition par Catégorie</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {MOCK_METRICS.topCategories.map((category, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                const percentage = Math.round((category.count / MOCK_METRICS.totalItems) * 100);
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${colors[index]}`}></div>
                        <span className="font-medium text-gray-900">{category.category}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.count} produits ({percentage}%)
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Valeur: {formatCurrency(category.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes d'expiration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Alertes d'Expiration</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {EXPIRY_ALERTS.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium text-gray-900">{alert.name}</div>
                      <div className="text-sm text-gray-600">{alert.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getAlertColor(alert.daysLeft)}`}>
                      {alert.daysLeft} jours
                    </div>
                    <div className="text-xs text-gray-500">restants</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes de stock faible */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Alertes Stock Faible</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {LOW_STOCK_ALERTS.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-gray-900">{alert.name}</div>
                      <div className="text-sm text-gray-600">{alert.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getStockColor(alert.current, alert.minimum)}`}>
                      {alert.current}/{alert.minimum}
                    </div>
                    <div className="text-xs text-gray-500">actuel/min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recommandations</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Urgent</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {MOCK_METRICS.lowStockItems} produits ont un stock critique. 
              Commandez immédiatement pour éviter les ruptures.
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Attention</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              {MOCK_METRICS.expiringItems} produits expirent dans les 90 prochains jours. 
              Planifiez leur utilisation prioritaire.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Optimisation</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              La valeur moyenne par produit est de {formatCurrency(MOCK_METRICS.averageValue)}. 
              Considérez une révision des stocks dormants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}