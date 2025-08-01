import React, { useState } from 'react';
import { Search, Plus, Eye, Printer, Calendar, User, Pill, FileText, Filter } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import { PatientService } from '../../services/patients';
import { PrescriptionDetail } from './PrescriptionDetail';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];

export function PrescriptionList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [consultations, setConsultations] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<MedicalRecord | null>(null);

  // Charger les données au montage du composant
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [consultationsData, patientsData] = await Promise.all([
        getMedicalRecordsWithPrescriptions(),
        PatientService.getAll()
      ]);
      setConsultations(consultationsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedicalRecordsWithPrescriptions = async () => {
    console.log('🔍 PrescriptionList.getMedicalRecordsWithPrescriptions() - Récupération des dossiers médicaux avec prescriptions');
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        prescriptions(*)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ PrescriptionList.getMedicalRecordsWithPrescriptions() - Erreur lors de la récupération:', error);
      console.error('Error fetching medical records:', error);
      throw error;
    }

    // Filtrer seulement les consultations qui ont des prescriptions
    const recordsWithPrescriptions = (data || []).filter(record => 
      record.prescriptions && record.prescriptions.length > 0
    );
    
    console.log('✅ PrescriptionList.getMedicalRecordsWithPrescriptions() - Dossiers avec prescriptions récupérés:', recordsWithPrescriptions.length, 'dossiers');
    return recordsWithPrescriptions;
  };

  const filteredConsultations = consultations.filter(consultation => {
    const patient = patients.find(p => p.id === consultation.patient_id);
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : '';
    
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPeriod = true;
    if (selectedPeriod !== 'all') {
      const consultationDate = new Date(consultation.date);
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - consultationDate.getTime()) / (1000 * 3600 * 24));
      
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
    
    return matchesSearch && matchesPeriod;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Patient inconnu';
  };

  const getConsultationTypeLabel = (type: string) => {
    const types = {
      general: 'Générale',
      specialist: 'Spécialisée',
      emergency: 'Urgence',
      followup: 'Suivi',
      preventive: 'Préventive',
      other: 'Autre'
    };
    return types[type as keyof typeof types] || 'Non défini';
  };

  const getConsultationTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      specialist: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800',
      followup: 'bg-green-100 text-green-800',
      preventive: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleViewPrescription = (consultation: MedicalRecord) => {
    setSelectedConsultation(consultation);
  };

  const handlePrintPrescription = (consultation: MedicalRecord) => {
    // Créer le contenu d'impression pour l'ordonnance
    const patient = patients.find(p => p.id === consultation.patient_id);
    const printContent = generatePrescriptionPrintContent(consultation, patient);
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour imprimer l\'ordonnance');
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  const generatePrescriptionPrintContent = (consultation: MedicalRecord, patient?: Patient) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ordonnance - ${consultation.id}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
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
            
            .prescription-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 30px;
            }
            
            .patient-info, .doctor-info {
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
            
            .diagnosis-section {
              background: #f0f9ff;
              border: 2px solid #bfdbfe;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
            }
            
            .diagnosis-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 10px;
            }
            
            .diagnosis-text {
              font-size: 16px;
              color: #1f2937;
              font-weight: 500;
            }
            
            .prescriptions-section {
              margin-bottom: 30px;
            }
            
            .prescriptions-title {
              font-size: 20px;
              font-weight: bold;
              color: #059669;
              margin-bottom: 20px;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .prescription-item {
              background: #f0fdf4;
              border: 2px solid #bbf7d0;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            
            .prescription-number {
              background: #059669;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .medication-name {
              font-size: 18px;
              font-weight: bold;
              color: #065f46;
              margin-bottom: 15px;
            }
            
            .prescription-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 15px;
            }
            
            .detail-item {
              background: white;
              padding: 10px;
              border-radius: 6px;
              border: 1px solid #d1fae5;
            }
            
            .detail-label {
              font-size: 12px;
              font-weight: bold;
              color: #065f46;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            
            .detail-value {
              font-size: 14px;
              color: #1f2937;
              font-weight: 500;
            }
            
            .instructions {
              background: #fef3c7;
              border: 1px solid #fbbf24;
              border-radius: 6px;
              padding: 12px;
              margin-top: 10px;
            }
            
            .instructions-label {
              font-size: 12px;
              font-weight: bold;
              color: #92400e;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            
            .instructions-text {
              font-size: 14px;
              color: #451a03;
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
              
              .prescription-item {
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

          <div class="prescription-header">
            <div class="patient-info">
              <div class="info-title">Informations Patient</div>
              <div class="info-item">
                <span class="info-label">Nom complet:</span> ${patient?.first_name} ${patient?.last_name}
              </div>
              <div class="info-item">
                <span class="info-label">Date de naissance:</span> ${patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('fr-FR') : 'Non renseignée'}
              </div>
              <div class="info-item">
                <span class="info-label">Téléphone:</span> ${patient?.phone || 'Non renseigné'}
              </div>
              ${patient?.blood_type ? `
                <div class="info-item">
                  <span class="info-label">Groupe sanguin:</span> ${patient.blood_type}
                </div>
              ` : ''}
            </div>
            
            <div class="doctor-info">
              <div class="info-title">Médecin Prescripteur</div>
              <div class="info-item">
                <span class="info-label">Dr. CliniCare</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span> ${new Date(consultation.date).toLocaleDateString('fr-FR')}
              </div>
              <div class="info-item">
                <span class="info-label">Consultation:</span> ${getConsultationTypeLabel(consultation.type)}
              </div>
            </div>
          </div>

          <div class="diagnosis-section">
            <div class="diagnosis-title">Diagnostic</div>
            <div class="diagnosis-text">${consultation.diagnosis}</div>
          </div>

          <div class="prescriptions-section">
            <div class="prescriptions-title">Ordonnance</div>
            
            ${consultation.prescriptions?.map((prescription: any, index: number) => `
              <div class="prescription-item">
                <div class="prescription-number">${index + 1}</div>
                <div class="medication-name">${prescription.medication}</div>
                
                <div class="prescription-details">
                  <div class="detail-item">
                    <div class="detail-label">Dosage</div>
                    <div class="detail-value">${prescription.dosage}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Fréquence</div>
                    <div class="detail-value">${prescription.frequency}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Durée</div>
                    <div class="detail-value">${prescription.duration}</div>
                  </div>
                </div>
                
                ${prescription.instructions ? `
                  <div class="instructions">
                    <div class="instructions-label">Instructions particulières</div>
                    <div class="instructions-text">${prescription.instructions}</div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <div class="footer-item">Ordonnance générée le ${currentDate} à ${currentTime}</div>
            <div class="footer-item">CliniCare - Système de Gestion Médicale</div>
            <div class="footer-item">Cette ordonnance est valable 30 jours</div>
          </div>
        </body>
      </html>
    `;
  };

  const handleClosePrescriptionDetail = () => {
    setSelectedConsultation(null);
  };

  const handlePrintFromDetail = () => {
    if (selectedConsultation) {
      handlePrintPrescription(selectedConsultation);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Ordonnances</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gérer et consulter les prescriptions médicales
              </p>
            </div>
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
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Ordonnances</p>
                      <p className="text-2xl font-bold text-green-900">{filteredConsultations.length}</p>
                    </div>
                    <Pill className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Cette semaine</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {filteredConsultations.filter(c => {
                          const daysDiff = Math.ceil((new Date().getTime() - new Date(c.date).getTime()) / (1000 * 3600 * 24));
                          return daysDiff <= 7;
                        }).length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Médicaments prescrits</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {filteredConsultations.reduce((total, c) => 
                          total + (c.prescriptions?.length || 0), 0
                        )}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Patients traités</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {new Set(filteredConsultations.map(c => c.patient_id)).size}
                      </p>
                    </div>
                    <User className="h-8 w-8 text-yellow-500" />
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
                placeholder="Rechercher par patient ou diagnostic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des ordonnances...</p>
            </div>
          ) : (
            filteredConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {getPatientName(consultation.patient_id)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(consultation.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConsultationTypeColor(consultation.type)}`}>
                        {getConsultationTypeLabel(consultation.type)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Diagnostic: </span>
                        <span className="text-sm text-gray-900">{consultation.diagnosis}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Pill className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            {consultation.prescriptions?.length || 0} médicament(s) prescrit(s)
                          </span>
                        </div>
                      </div>

                      {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                        <div className="mt-3 bg-green-50 rounded-lg p-3">
                          <div className="text-sm text-green-800 font-medium mb-2">Médicaments prescrits:</div>
                          <div className="space-y-1">
                            {consultation.prescriptions.slice(0, 3).map((prescription: any, index: number) => (
                              <div key={index} className="text-sm text-green-700">
                                • {prescription.medication} - {prescription.dosage}, {prescription.frequency}
                              </div>
                            ))}
                            {consultation.prescriptions.length > 3 && (
                              <div className="text-sm text-green-600 italic">
                                +{consultation.prescriptions.length - 3} autre(s) médicament(s)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewPrescription(consultation)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Voir l'ordonnance"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePrintPrescription(consultation)}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                      title="Imprimer l'ordonnance"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredConsultations.length === 0 && !loading && (
          <div className="text-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune ordonnance trouvée</p>
            <p className="text-sm text-gray-400 mt-1">
              Les ordonnances apparaîtront ici après les consultations
            </p>
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedConsultation && (
        <PrescriptionDetail
          consultation={selectedConsultation}
          onClose={handleClosePrescriptionDetail}
          onPrint={handlePrintFromDetail}
        />
      )}
    </>
  );
}