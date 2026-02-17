import axios from 'axios';

const doctorApi = axios.create({
  baseURL: 'http://localhost:5000/api',
});

doctorApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doctor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
doctorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('doctor_token');
      localStorage.removeItem('doctor_user');
      // Redirect to login
      if (window.location.pathname.startsWith('/doctor')) {
        window.location.href = '/doctor-login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const loginEnterprise = (data) => doctorApi.post('/enterprise/login', data);
export const registerEnterprise = (data) => doctorApi.post('/enterprise/signup', data);

// --- Appointments ---
// Get doctor's daily schedule (today's appointments)
export const getDoctorDailySchedule = async () => {
  try {
    const res = await doctorApi.get('/appointments/doctor-daily');
    return res.data;
  } catch (err) {
    console.error('Error fetching daily schedule:', err);
    throw err;
  }
};

// Get all doctor's appointments (for appointments page)
export const getDoctorAppointments = async () => {
  try {
    const res = await doctorApi.get('/appointments/doctor-schedule');
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await doctorApi.get('/enterprise/appointments');
      return fallback.data;
    }
    throw err;
  }
};
export const updateAppointment = (id, data) => doctorApi.patch(`/enterprise/appointments/${id}`, data);

// --- Patients ---
export const getDoctorPatients = async () => {
  try {
    const res = await doctorApi.get('/enterprise/patients/all');
    return res.data;
  } catch (err) {
    console.error('Error fetching patients:', err);
    throw err;
  }
};
export const getPatientDetails = (id) => doctorApi.get(`/enterprise/patients/${id}`).then(res => res.data?.data);
export const createPatient = (data) => doctorApi.post('/enterprise/patients', data);
export const addMedicalRecord = (patientId, recordData) => 
  doctorApi.post(`/enterprise/patients/${patientId}/history`, recordData)
    .then(res => res.data?.data?.history || []);

// --- Profile ---
export const getDoctorProfile = () => doctorApi.get('/enterprise/doctor/me').then(res => res.data?.data);
export const updateAvailability = (isAvailable) => 
  doctorApi.patch('/enterprise/doctor/availability', { isAvailable }).then(res => res.data);

// --- Finance ---
export const getFinanceStats = async () => {
  try {
    const res = await doctorApi.get('/enterprise/finance-stats');
    return res.data;
  } catch (err) {
    console.error('Error fetching finance stats:', err);
    throw err;
  }
};

export default doctorApi;