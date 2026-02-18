import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- CONTEXT PROVIDERS ---
import { LanguageProvider } from './patient/LanguageContext';
import { AvailabilityProvider } from './context/AvailabilityContext';

// --- LAYOUTS ---
import MainLayout from './patient/MainLayout';
import PatientDashboardLayout from './patient/DashboardLayout'; 

// --- AUTH & PROTECTION ---
import PatientAuth from './patient/PatientAuth';
import RoleProtectedRoute from './components/ProtectedRoute'; 
import ManagementAuth from './Management/ManagementAuth';
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
import ManagementDashboard from './Management/ManagementDashboard';
import Collection from './Management/Collection';
import Finance from './Management/Finance';
import ManagementPatientsPage from './Management/ManagementPatientsPage';
import ManagementLayout from './Management/ManagementLayout';

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
            <Route element={<MainLayout />}>
              <Route path="/about" element={<About />} />
            </Route>
            
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
            <Route 
              path="/patient"
              element={
                <RoleProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="book" element={<BookAppointment />} />
              <Route path="records" element={<MedicalRecords />} />
              <Route path="records/:id" element={<RecordDetail />} />
              <Route path="about" element={<About />} />
            </Route>

            {/* =========================================
                3. DOCTOR PORTAL
               ========================================= */}
            <Route 
              path="/doctor" 
              element={<RoleProtectedRoute allowedRoles={['doctor']} />}
            >
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
                4. MANAGEMENT PORTAL (Unified to /admin)
               ========================================= */}
            <Route 
              path="/admin" 
              element={<RoleProtectedRoute allowedRoles={['management', 'admin']} />}
            >
              <Route element={<ManagementLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ManagementDashboard />} />
                <Route path="collection" element={<Collection />} />
                <Route path="finance" element={<Finance />} />
                <Route path="patients" element={<ManagementPatientsPage />} />
              </Route>
            </Route>

            {/* =========================================
                5. FALLBACKS & REDIRECTS
               ========================================= */}
            {/* Redirect /management to /admin to avoid confusion */}
            <Route path="/management" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/management/*" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Legacy Dashboard Redirects */}
            <Route path="/dashboard" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/patient/dashboard" replace />} />
            
            {/* 404 Redirect to Home */}
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        
        <Toaster 
            position="top-center" 
            reverseOrder={false} 
            toastOptions={{
                duration: 5000,
                style: {
                    borderRadius: '12px',
                    background: '#333',
                    color: '#fff',
                },
            }}
        />
      </LanguageProvider>
    </AvailabilityProvider>
  );
}

export default App;