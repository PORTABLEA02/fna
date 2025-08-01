import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, CreditCard, Printer, Filter, DollarSign, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { InvoiceService } from '../../services/invoices';
import { PatientService } from '../../services/patients';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];

interface InvoiceListProps {
  onSelectInvoice: (invoice: Invoice) => void;
  onNewInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onPayInvoice: (invoice: Invoice) => void;
}

export function InvoiceList({ onSelectInvoice, onNewInvoice, onEditInvoice, onPayInvoice }: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 InvoiceList.loadData() - Début du chargement des données de facturation');
      setLoading(true);
      const [invoicesData, patientsData] = await Promise.all([
        InvoiceService.getAll(),
        PatientService.getAll()
      ]);
      console.log('✅ InvoiceList.loadData() - Données de facturation chargées:', {
        invoices: invoicesData.length,
        patients: patientsData.length
      });
      setInvoices(invoicesData);
      setPatients(patientsData);
    } catch (error) {
      console.error('❌ InvoiceList.loadData() - Erreur lors du chargement des données de facturation:', error);
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const patient = patients.find(p => p.id === invoice.patient_id);
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : '';
    
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    
    let matchesPeriod = true;
    if (selectedPeriod !== 'all') {
      const invoiceDate = new Date(invoice.date);
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24));
      
      switch (selectedPeriod) {
        case 'today':
          matchesPeriod = daysDiff === 0;
          break;
        case 'week':
          matchesPeriod = daysDiff <= 7;
          break;
        case 'month':
          matchesPeriod = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getPatientInfo = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        console.log('🔍 InvoiceList.handleDeleteInvoice() - Suppression de la facture:', invoiceId);
        await InvoiceService.delete(invoiceId);
        console.log('✅ InvoiceList.handleDeleteInvoice() - Facture supprimée, rechargement des données');
        await loadData();
      } catch (error) {
        console.error('❌ InvoiceList.handleDeleteInvoice() - Erreur lors de la suppression de la facture:', error);
        console.error('Error deleting invoice:', error);
        alert('Erreur lors de la suppression de la facture');
      }
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Logique d'impression
    window.print();
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      paid: 'Payée',
      overdue: 'En retard'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    const labels = {
      cash: 'Espèces',
      card: 'Carte bancaire',
      'mobile-money': 'Mobile Money'
    };
    return method ? labels[method as keyof typeof labels] || method : '';
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0);
  const pendingAmount = filteredInvoices.filter(i => i.status === 'pending').reduce((sum, invoice) => sum + invoice.total, 0);
  const overdueAmount = filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestion des Factures</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérer les factures et les paiements des patients
            </p>
          </div>
          <button
            onClick={onNewInvoice}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <div className="col-span-4 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des statistiques...</p>
            </div>
          ) : (
            <>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Factures</p>
                <p className="text-2xl font-bold text-blue-900">{filteredInvoices.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Payées</p>
                <p className="text-2xl font-bold text-green-900">{paidAmount.toLocaleString()} FCFA</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingAmount.toLocaleString()} FCFA</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">En retard</p>
                <p className="text-2xl font-bold text-red-900">{overdueAmount.toLocaleString()} FCFA</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro de facture ou nom du patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="paid">Payées</option>
                <option value="overdue">En retard</option>
              </select>
            </div>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement des factures...</p>
          </div>
        ) : (
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facture
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => {
              const patient = getPatientInfo(invoice.patient_id);
              
              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.id}
                      </div>
                      {invoice.appointment_id && (
                        <div className="text-sm text-gray-500">
                          RDV: {invoice.appointment_id}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient?.first_name} {patient?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient?.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(invoice.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.total.toLocaleString()} FCFA
                    </div>
                    {invoice.payment_method && (
                      <div className="text-sm text-gray-500">
                        {getPaymentMethodLabel(invoice.payment_method)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1">{getStatusLabel(invoice.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onSelectInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Voir la facture"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditInvoice(invoice)}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => onPayInvoice(invoice)}
                          className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                          title="Enregistrer un paiement"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handlePrintInvoice(invoice)}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded transition-colors"
                        title="Imprimer"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune facture trouvée</p>
          <p className="text-sm text-gray-400 mt-1">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </div>
  );
}