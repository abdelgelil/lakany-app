import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- CONTEXT PROVIDERS ---
import { LanguageProvider } from './patient/LanguageContext';
import { AvailabilityProvider } from './context/AvailabilityContext';

// --- LAYOUTS ---
import MainLayout from './patient/MainLayout';
import PatientDashboardLayout from './patient/DashboardLayout'; // Renamed for clarity

// --- AUTH & PROTECTION ---
import PatientAuth from './patient/PatientAuth';
import ProtectedRoute from './patient/ProtectedRoute'; 
import RoleProtectedRoute from './components/ProtectedRoute'; 
import ManagementAuth from './management/ManagementAuth';
import DoctorAuth from './Doctor/DoctorAuth';

// --- PUBLIC PAGES ---
import ForgotPassword from './patient/ForgotPassword';
import ResetPassword from './patient/ResetPassword';
import WelcomePage from './patient/WelcomePage';
import About from './patient/About';

// --- PATIENT PAGES ---
import PatientDashboard from './patient/PatientDashboard';
import BookAppointment from './patient/BookAppointment';
import MedicalRecords from './patient/MedicalRecords';
import RecordDetail from './patient/RecordDetail';

// --- DOCTOR PAGES ---
import DoctorDashboard from './Doctor/DoctorDashboard';
import PatientAccount from './Doctor/PatientAccount';
import FinancePage from './Doctor/FinancePage';
import DoctorPatientsPage from './Doctor/DoctorPatientsPage';
import DoctorAppointmentsPage from './Doctor/DoctorAppointmentsPage';
import PatientRecordDetail from './Doctor/PatientRecordDetail';
import DoctorProfile from './Doctor/DoctorProfile';

// --- MANAGEMENT PAGES ---
import ManagementDashboard from './management/ManagementDashboard';
import Collection from './management/Collection';
import Finance from './management/Finance';
import ManagementPatientsPage from './management/ManagementPatientsPage';
import ManagementLayout from './management/ManagementLayout';

function App() {
  return (
    <AvailabilityProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* =========================================
                1. ROOT, PUBLIC & AUTH ROUTES
               ========================================= */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/about" element={<MainLayout><About /></MainLayout>} />
            
            {/* Login Pages */}
            <Route path="/login" element={<PatientAuth />} />
            <Route path="/doctor-login" element={<DoctorAuth />} />
            <Route path="/management-login" element={<ManagementAuth />} />

            {/* Password Recovery */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* =========================================
                2. PATIENT PORTAL
               ========================================= */}
            {/* Patient routes are now nested under /patient and protected by role */}
            <Route 
              path="/patient"
              element={ // Using RoleProtectedRoute for strict role checking
                <RoleProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="book" element={<BookAppointment />} />
              <Route path="records" element={<MedicalRecords />} />
              <Route path="records/:id" element={<RecordDetail />} />
              <Route path="about" element={<About />} />
            </Route>

            {/* =========================================
                3. DOCTOR PORTAL
               ========================================= */}
            <Route path="/doctor" element={<RoleProtectedRoute allowedRoles={['doctor']} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="record/:id" element={<PatientAccount />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="patients" element={<DoctorPatientsPage />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="patient-record-details/:id" element={<PatientRecordDetail />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Route>
            
            {/* =========================================
                4. MANAGEMENT PORTAL
               ========================================= */}
            <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['management', 'admin']} />}>
              <Route element={<ManagementLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ManagementDashboard />} />
                <Route path="collection" element={<Collection />} />
                <Route path="finance" element={<Finance />} />
                <Route path="patients" element={<ManagementPatientsPage />} />
              </Route>
            </Route>

            {/* =========================================
                5. FALLBACKS
               ========================================= */}
            {/* Redirect old /dashboard URLs to the new /patient path for bookmarks */}
            <Route path="/dashboard" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/management/*" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        
        <Toaster position="top-center" reverseOrder={false} />
      </LanguageProvider>
    </AvailabilityProvider>
  );
}

export default App;