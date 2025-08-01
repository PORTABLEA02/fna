// Types pour l'application CliniCare

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'secretary';
  speciality?: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  address: string;
  emergencyContact: string;
  bloodType?: string;
  allergies: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  type: 'general' | 'specialist' | 'emergency' | 'followup' | 'preventive' | 'other';
  reason: string;
  symptoms?: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  prescription: Prescription[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: 'medication' | 'medical-supply' | 'equipment' | 'consumable' | 'diagnostic';
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  location: string;
  unit: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface StockMovement {
  id: string;
  medicineId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reference?: string;
  date: string;
  userId: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: 'cash' | 'card' | 'mobile-money' | 'bank-transfer' | 'check';
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  medicineId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'mobile-money' | 'bank-transfer' | 'check';
  paymentDate: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  shift: 'morning' | 'afternoon' | 'night' | 'full-day';
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
  createdAt: string;
  createdBy?: string;
}

// Types pour les constantes vitales
export interface VitalSigns {
  id: string;
  patientId: string;
  temperature?: number; // en °C
  bloodPressureSystolic?: number; // en mmHg
  bloodPressureDiastolic?: number; // en mmHg
  heartRate?: number; // battements par minute
  weight?: number; // en kg
  height?: number; // en cm
  oxygenSaturation?: number; // en %
  respiratoryRate?: number; // respirations par minute
  notes?: string;
  recordedAt: string;
  recordedBy: string;
}

// Types pour le workflow de consultation
export interface ConsultationWorkflow {
  id: string;
  patientId: string;
  invoiceId: string;
  vitalSignsId?: string;
  doctorId?: string;
  consultationType: 'general' | 'specialist' | 'emergency' | 'followup' | 'preventive' | 'other';
  status: 'payment-pending' | 'payment-completed' | 'vitals-pending' | 'doctor-assignment' | 'consultation-ready' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Types pour les statistiques
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  lowStockItems: number;
}

export interface AppointmentStats {
  today: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
  };
  total: {
    all: number;
    thisMonth: number;
  };
}

export interface BillingStats {
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  monthlyRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  expiringSoon: number;
  totalValue: number;
}

// Types pour les formulaires
export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  address: string;
  emergencyContact: string;
  bloodType?: string;
  allergies: string[];
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export interface ConsultationFormData {
  patientId: string;
  date: string;
  type: 'general' | 'specialist' | 'emergency' | 'followup' | 'preventive' | 'other';
  reason: string;
  symptoms?: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  prescriptions: Omit<Prescription, 'id' | 'medicalRecordId' | 'createdAt'>[];
}