import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User, Phone, Eye, Edit, Trash2 } from 'lucide-react';
import { AppointmentService } from '../../services/appointments';
import { PatientService } from '../../services/patients';
import { ProfileService } from '../../services/profiles';
import { AppointmentForm } from './AppointmentForm';
import { Database } from '../../lib/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 AppointmentCalendar.loadData() - Début du chargement des données du calendrier');
      setLoading(true);
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        AppointmentService.getAll(),
        PatientService.getAll(),
        ProfileService.getDoctors()
      ]);
      
      console.log('✅ AppointmentCalendar.loadData() - Données du calendrier chargées:', {
        appointments: appointmentsData.length,
        patients: patientsData.length,
        doctors: doctorsData.length
      });
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('❌ AppointmentCalendar.loadData() - Erreur lors du chargement des données du calendrier:', error);
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    // Utiliser une méthode qui évite les problèmes de fuseau horaire
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return appointments.filter(apt => apt.date === dateString);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Patient inconnu';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Médecin inconnu';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Planifié',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      'no-show': 'Absent'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    // Utiliser une méthode qui évite les problèmes de fuseau horaire
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    setSelectedDate(dateString);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleSaveAppointment = (appointmentData: Partial<Appointment>) => {
    const saveAppointment = async () => {
      try {
        console.log('🔍 AppointmentCalendar.handleSaveAppointment() - Sauvegarde du rendez-vous:', appointmentData);
        if (editingAppointment) {
          console.log('🔍 AppointmentCalendar.handleSaveAppointment() - Mise à jour du rendez-vous existant:', editingAppointment.id);
          await AppointmentService.update(editingAppointment.id, appointmentData);
        } else {
          console.log('🔍 AppointmentCalendar.handleSaveAppointment() - Création d\'un nouveau rendez-vous');
          await AppointmentService.create(appointmentData as any);
        }
        console.log('✅ AppointmentCalendar.handleSaveAppointment() - Rendez-vous sauvegardé, rechargement des données');
        await loadData();
        setShowAppointmentForm(false);
        setEditingAppointment(null);
      } catch (error) {
        console.error('❌ AppointmentCalendar.handleSaveAppointment() - Erreur lors de la sauvegarde du rendez-vous:', error);
        console.error('Error saving appointment:', error);
        alert('Erreur lors de la sauvegarde du rendez-vous');
      }
    };
    saveAppointment();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        console.log('🔍 AppointmentCalendar.handleDeleteAppointment() - Suppression du rendez-vous:', appointmentId);
        await AppointmentService.delete(appointmentId);
        console.log('✅ AppointmentCalendar.handleDeleteAppointment() - Rendez-vous supprimé, rechargement des données');
        await loadData();
      } catch (error) {
        console.error('❌ AppointmentCalendar.handleDeleteAppointment() - Erreur lors de la suppression du rendez-vous:', error);
        console.error('Error deleting appointment:', error);
        alert('Erreur lors de la suppression du rendez-vous');
      }
    }
  };

  const handleCloseForm = () => {
    setShowAppointmentForm(false);
    setEditingAppointment(null);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const days = getDaysInMonth(currentDate);
  const selectedDateAppointments = appointments.filter(apt => apt.date === selectedDate);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Calendrier des Rendez-vous</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gérer et planifier les consultations
              </p>
            </div>
            <button
              onClick={handleNewAppointment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau RDV</span>
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2 h-24"></div>;
              }
              
              const dayAppointments = getAppointmentsForDate(day);
              // Comparer les dates de manière plus fiable
              const year = day.getFullYear();
              const month = String(day.getMonth() + 1).padStart(2, '0');
              const dayNum = String(day.getDate()).padStart(2, '0');
              const dayString = `${year}-${month}-${dayNum}`;
              const isSelected = dayString === selectedDate;
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`p-2 h-24 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-300' : ''
                  } ${isToday ? 'bg-yellow-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt, aptIndex) => (
                      <div
                        key={aptIndex}
                        className={`text-xs p-1 rounded truncate ${getStatusColor(apt.status)}`}
                        title={`${apt.time} - ${getPatientName(apt.patient_id)}`}
                      >
                        {apt.time} - {getPatientName(apt.patient_id).split(' ')[0]}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="text-sm text-gray-600">
              {selectedDateAppointments.length} rendez-vous
            </div>
          </div>
        </div>

        <div className="p-6">
          {selectedDateAppointments.length > 0 ? (
            <div className="space-y-4">
              {selectedDateAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {appointment.time}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({appointment.duration} min)
                            </span>
                          </div>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="font-medium text-gray-700">Patient: </span>
                              <span className="text-gray-900">{getPatientName(appointment.patient_id)}</span>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-gray-700">Médecin: </span>
                            <span className="text-gray-900">{getDoctorName(appointment.doctor_id)}</span>
                          </div>
                          
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Motif: </span>
                            <span className="text-gray-900">{appointment.reason}</span>
                          </div>
                          
                          {appointment.notes && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Notes: </span>
                              <span className="text-gray-900 italic">{appointment.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rendez-vous pour cette date</p>
              <button
                onClick={handleNewAppointment}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Planifier un rendez-vous
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total RDV</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmés</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-lg mr-3">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment || undefined}
          onClose={handleCloseForm}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
}