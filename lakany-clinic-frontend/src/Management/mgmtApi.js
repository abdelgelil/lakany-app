import axios from 'axios';

const mgmtApi = axios.create({
  baseURL: 'http://localhost:5000/api',
});

mgmtApi.interceptors.request.use(
  (config) => {
    // Fix: Allow doctors to use the dashboard by checking doctor_token if management_token is missing
    const token = localStorage.getItem('management_token') || localStorage.getItem('doctor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Appointments Management ---
// Matches GET /api/appointments/all (The main list for the dashboard)
export const getAllAppointments = () => mgmtApi.get('/appointments/all');

// Matches PATCH /api/appointments/:id/finalize (The Billing action)
// NOTE: Removed /enterprise/ to match your backend controller structure
export const finalizeAppointment = (id, fee) => 
  mgmtApi.patch(`/appointments/${id}/finalize`, { fee });

export const handleNoShow = (id) => mgmtApi.patch(`/appointments/${id}/no-show`);

// Matches PATCH /api/appointments/:id (For status updates)
export const updateAppointmentStatus = (id, status, reason = '') => 
  mgmtApi.patch(`/appointments/${id}`, { status, cancellationReason: reason });

// --- Finance Specific ---
// Helper to get only completed appointments for revenue calculation
export const getFinanceData = () => mgmtApi.get('/appointments/all?status=completed');
export const getDoctorFinanceStats = (doctorId) => mgmtApi.get(`/enterprise/finance-stats?doctorId=${doctorId}`);

// --- Patient Management ---
export const getAllPatients = () => mgmtApi.get('/enterprise/patients/all');
export const addPatient = (patientData) => mgmtApi.post('/enterprise/patients', patientData);

export default mgmtApi;