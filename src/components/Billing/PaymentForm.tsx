import React, { useState } from 'react';
import { X, Save, CreditCard, DollarSign, Calendar, User, CheckCircle } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { PatientService } from '../../services/patients';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];

interface PaymentFormProps {
  invoice: Invoice;
  onClose: () => void;
  onSave: (paymentData: any) => void;
}

export function PaymentForm({ invoice, onClose, onSave }: PaymentFormProps) {
  const [paymentData, setPaymentData] = useState({
    amount: invoice.total,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  const [partialPayment, setPartialPayment] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadPatientInfo();
  }, [invoice.patient_id]);

  const loadPatientInfo = async () => {
    try {
      setLoading(true);
      const patientData = await PatientService.getById(invoice.patient_id);
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...paymentData,
      invoiceId: invoice.id,
      invoiceTotal: invoice.total,
      patientId: invoice.patient_id,
      isPartial: partialPayment && paymentData.amount < invoice.total
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const remainingAmount = invoice.total - paymentData.amount;

  const paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: '💵' },
    { value: 'card', label: 'Carte bancaire', icon: '💳' },
    { value: 'mobile-money', label: 'Mobile Money', icon: '📱' },
    { value: 'bank-transfer', label: 'Virement bancaire', icon: '🏦' },
    { value: 'check', label: 'Chèque', icon: '📝' }
  ];

  const generateReference = () => {
    const method = paymentData.paymentMethod.toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${method}-${date}-${random}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Enregistrer un Paiement</h2>
              <p className="text-sm text-gray-600">Facture: {invoice.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations facture */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Informations de la Facture</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Patient:</span>
                <p className="text-gray-900 font-medium">{patient?.first_name} {patient?.last_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Montant total:</span>
                <p className="text-gray-900 font-bold text-lg">{invoice.total.toLocaleString()} FCFA</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Date facture:</span>
                <p className="text-gray-900">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Statut actuel:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status === 'paid' ? 'Payée' : 
                   invoice.status === 'overdue' ? 'En retard' : 'En attente'}
                </span>
              </div>
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-4">Détails du Paiement</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant à payer (FCFA) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleChange}
                    min="1"
                    max={invoice.total}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partialPayment"
                      checked={partialPayment}
                      onChange={(e) => setPartialPayment(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="partialPayment" className="text-sm text-gray-600">
                      Autoriser le paiement partiel
                    </label>
                  </div>
                  {paymentData.amount < invoice.total && (
                    <p className="text-sm text-orange-600 mt-1">
                      Reste à payer: {remainingAmount.toLocaleString()} FCFA
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de paiement *
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={paymentData.paymentDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        paymentData.paymentMethod === method.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentData.paymentMethod === method.value}
                        onChange={handleChange}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-lg">{method.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence de transaction
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="reference"
                    value={paymentData.reference}
                    onChange={handleChange}
                    placeholder="Numéro de transaction, chèque, etc."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, reference: generateReference() })}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Générer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes complémentaires
                </label>
                <textarea
                  name="notes"
                  value={paymentData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Informations supplémentaires sur le paiement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-3">Récapitulatif du Paiement</h3>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant facture:</span>
                  <span className="font-medium">{invoice.total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant à payer:</span>
                  <span className="font-medium text-green-600">{paymentData.amount.toLocaleString()} FCFA</span>
                </div>
                {paymentData.amount < invoice.total && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reste à payer:</span>
                    <span className="font-medium text-orange-600">{remainingAmount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mode de paiement:</span>
                  <span className="font-medium">
                    {paymentMethods.find(m => m.value === paymentData.paymentMethod)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(paymentData.paymentDate).toLocaleDateString('fr-FR')}</span>
                </div>
                {paymentData.reference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Référence:</span>
                    <span className="font-medium font-mono">{paymentData.reference}</span>
                  </div>
                )}
              </div>
            </div>

            {paymentData.amount >= invoice.total && (
              <div className="mt-3 p-3 bg-green-100 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Cette facture sera marquée comme entièrement payée
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!paymentData.amount || paymentData.amount <= 0 || (!partialPayment && paymentData.amount > invoice.total)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer le paiement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}