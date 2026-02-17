import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import mgmtApi from './mgmtApi';
import AddManagementPatientModal from './AddManagementPatientModal';
import AppointmentHistoryModal from './AppointmentHistoryModal';
import toast from 'react-hot-toast';

const ManagementPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        mgmtApi.get('/enterprise/patients/all'),
        mgmtApi.get('/enterprise/appointments'),
      ]);
      setPatients(patientsRes.data.data || []);
      setAppointments(appointmentsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFinishAppointment = async (appointmentId) => {
    const fee = prompt('Enter the fee for this appointment:');
    if (fee) {
      try {
        await mgmtApi.finalizeAppointment(appointmentId, parseFloat(fee));
        toast.success('Appointment marked as Finished');
        fetchAllData();
      } catch (error) {
        toast.error('Failed to finish appointment');
      }
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const reason = prompt("Enter cancellation reason ('Patient Request' or 'Doctor\\'s Order'):");
    if (reason) {
      try {
        await mgmtApi.cancelAppointment(appointmentId, reason);
        toast.success('Appointment cancelled');
        fetchAllData();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleNoShow = async (appointmentId) => {
    const note = prompt('Add a note for the no-show (optional):');
    try {
      await mgmtApi.flagNoShow(appointmentId, note || '');
      toast.success('Appointment flagged as No-Show');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to flag as No-Show');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const getPatientAppointments = (patientId) => {
    return appointments
      .filter(a => (a.patientId?._id === patientId) || (a.patientId === patientId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const openHistoryModal = (patient) => {
    setSelectedPatient(patient);
    setIsHistoryModalOpen(true);
  };
  
  const getPatientStatus = (patientId) => {
    const patientApts = getPatientAppointments(patientId);
    const lastApt = patientApts[0];
    const hasNoShow = patientApts.some(a => a.status === 'No-Show');

    return { lastApt, hasNoShow };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500">Manage your clinic's patient records</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>Add Patient</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-semibold">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4">Latest Appointment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No patients found</td></tr>
              ) : (
                filteredPatients.map((patient) => {
                  const { lastApt, hasNoShow } = getPatientStatus(patient._id);
                  return (
                  <tr key={patient._id} onClick={() => openHistoryModal(patient)} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-slate-700">{patient.username}</span>
                        {hasNoShow && (
                          <div className="group relative">
                            <AlertCircle size={16} className="text-red-500 cursor-help" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              History of No-Show
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{patient.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.age}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{patient.gender}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {lastApt ? (
                        <div className="text-sm">
                          <div className={`font-medium ${
                            lastApt.status === 'Finished' ? 'text-green-600' : 
                            lastApt.status === 'Upcoming' ? 'text-blue-600' : 'text-slate-500'
                          }`}>
                            {lastApt.status}
                          </div>
                          <div className="text-slate-400 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(lastApt.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> {lastApt.time}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">No history</span>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddManagementPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAllData}
      />

      {selectedPatient && (
        <AppointmentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          appointments={getPatientAppointments(selectedPatient._id)}
          onFinish={handleFinishAppointment}
          onCancel={handleCancelAppointment}
          onNoShow={handleNoShow}
        />
      )}
    </div>
  );
};

export default ManagementPatientsPage;