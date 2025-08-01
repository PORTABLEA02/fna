import React, { useState } from 'react';
import { X, Edit, CreditCard, Printer, User, Calendar, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { PatientService } from '../../services/patients';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  invoice_items?: Database['public']['Tables']['invoice_items']['Row'][];
};
type Patient = Database['public']['Tables']['patients']['Row'];

interface InvoiceDetailProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onPay: () => void;
}

export function InvoiceDetail({ invoice, onClose, onEdit, onPay }: InvoiceDetailProps) {
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

  const handlePrint = () => {
    // Créer le contenu d'impression
    const printContent = generatePrintContent();
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour imprimer la facture');
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Fermer la fenêtre après impression (optionnel)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture - ${invoice.id}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.4;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
              font-size: 14px;
            }
            
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .clinic-name {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 8px;
            }
            
            .clinic-subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 15px;
            }
            
            .clinic-info {
              font-size: 14px;
              color: #666;
              line-height: 1.6;
            }
            
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 30px;
            }
            
            .invoice-info, .patient-info {
              flex: 1;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            
            .info-title {
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-item {
              margin-bottom: 8px;
              font-size: 14px;
            }
            
            .info-label {
              font-weight: bold;
              color: #555;
            }
            
            .invoice-number {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .items-table th {
              background: #2563eb;
              color: white;
              padding: 15px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
            }
            
            .items-table td {
              padding: 12px 15px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            
            .items-table tr:nth-child(even) {
              background: #f8f9fa;
            }
            
            .items-table tr:hover {
              background: #e3f2fd;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .totals-section {
              background: #f8f9fa;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
              max-width: 400px;
              margin-left: auto;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            
            .total-row.final {
              border-top: 2px solid #2563eb;
              padding-top: 15px;
              margin-top: 15px;
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
            }
            
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-paid {
              background: #d1fae5;
              color: #065f46;
            }
            
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-overdue {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
              margin-top: 40px;
            }
            
            .footer-item {
              margin-bottom: 5px;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
              
              .items-table {
                break-inside: avoid;
              }
              
              .totals-section {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">CliniCare</div>
            <div class="clinic-subtitle">Système de Gestion Médicale</div>
            <div class="clinic-info">
              Yaoundé, Cameroun<br>
              Tél: +237 690 000 000 | Email: contact@clinicare.cm
            </div>
          </div>

          <div class="invoice-header">
            <div class="invoice-info">
              <div class="info-title">Informations Facture</div>
              <div class="invoice-number">${invoice.id}</div>
              <div class="info-item">
                <span class="info-label">Date d'émission:</span> ${new Date(invoice.date).toLocaleDateString('fr-FR')}
              </div>
              ${invoice.appointmentId ? `
                <div class="info-item">
                  <span class="info-label">Rendez-vous:</span> ${invoice.appointmentId}
                </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">Statut:</span> 
                <span class="status-badge status-${invoice.status}">${getStatusLabel(invoice.status)}</span>
              </div>
              ${invoice.paidAt ? `
                <div class="info-item">
                  <span class="info-label">Payée le:</span> ${new Date(invoice.paidAt).toLocaleDateString('fr-FR')}
                </div>
              ` : ''}
              ${invoice.paymentMethod ? `
                <div class="info-item">
                  <span class="info-label">Mode de paiement:</span> ${getPaymentMethodLabel(invoice.paymentMethod)}
                </div>
              ` : ''}
            </div>
            
            <div class="patient-info">
              <div class="info-title">Informations Patient</div>
              <div class="info-item">
                <span class="info-label">Nom complet:</span> ${patient?.first_name} ${patient?.last_name}
              </div>
              <div class="info-item">
                <span class="info-label">Téléphone:</span> ${patient?.phone}
              </div>
              ${patient?.email ? `
                <div class="info-item">
                  <span class="info-label">Email:</span> ${patient.email}
                </div>
              ` : ''}
              ${patient?.address ? `
                <div class="info-item">
                  <span class="info-label">Adresse:</span> ${patient.address}
                </div>
              ` : ''}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Quantité</th>
                <th class="text-right">Prix unitaire</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.invoice_items?.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${item.unit_price.toLocaleString()} FCFA</td>
                  <td class="text-right">${item.total.toLocaleString()} FCFA</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="total-row">
              <span>Sous-total:</span>
              <span>${invoice.subtotal.toLocaleString()} FCFA</span>
            </div>
            ${invoice.tax > 0 ? `
              <div class="total-row">
                <span>Taxes:</span>
                <span>${invoice.tax.toLocaleString()} FCFA</span>
              </div>
            ` : ''}
            <div class="total-row final">
              <span>TOTAL:</span>
              <span>${invoice.total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div class="footer">
            <div class="footer-item">Facture générée le ${currentDate} à ${currentTime}</div>
            <div class="footer-item">CliniCare - Système de Gestion Médicale</div>
            <div class="footer-item">Merci de votre confiance</div>
          </div>
        </body>
      </html>
    `;
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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Détail de la Facture</h2>
              <p className="text-sm text-gray-600">{invoice.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={onPay}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Enregistrer paiement</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Modifier</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations facture */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800">Informations Facture</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Numéro:</span>
                  <p className="text-gray-900 font-medium">{invoice.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Date d'émission:</span>
                  <p className="text-gray-900">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                </div>
                {invoice.appointmentId && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Rendez-vous:</span>
                    <p className="text-gray-900">{invoice.appointmentId}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-700">Statut:</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1">{getStatusLabel(invoice.status)}</span>
                    </span>
                  </div>
                </div>
                {invoice.paidAt && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Payée le:</span>
                    <p className="text-gray-900">{new Date(invoice.paidAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mode de paiement:</span>
                    <p className="text-gray-900">{getPaymentMethodLabel(invoice.paymentMethod)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations patient */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">Informations Patient</h3>
              </div>
              
              {patient && (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nom complet:</span>
                    <p className="text-gray-900 font-medium">{patient?.first_name} {patient?.last_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Téléphone:</span>
                    <p className="text-gray-900">{patient?.phone}</p>
                  </div>
                  {patient?.email && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{patient.email}</p>
                    </div>
                  )}
                  {patient?.address && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Adresse:</span>
                      <p className="text-gray-900">{patient.address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Services et prestations */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Services et Prestations</h3>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantité</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Prix unitaire</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.invoice_items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.unit_price.toLocaleString()} FCFA</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{item.total.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-4">Récapitulatif des Montants</h3>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200 max-w-md ml-auto">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium text-gray-900">{invoice.subtotal.toLocaleString()} FCFA</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes:</span>
                    <span className="font-medium text-gray-900">{invoice.tax.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">TOTAL:</span>
                    <span className="text-green-600">{invoice.total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Actions Rapides</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer la facture</span>
              </button>
              
              {invoice.status !== 'paid' && (
                <button
                  onClick={onPay}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Enregistrer un paiement</span>
                </button>
              )}
              
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier la facture</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}