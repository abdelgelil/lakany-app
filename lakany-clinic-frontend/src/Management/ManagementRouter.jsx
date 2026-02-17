import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ManagementLayout from './ManagementLayout';
import Auth from './Auth';
import ManagementPatientsPage from './ManagementPatientsPage';
import PatientProfilePage from './PatientProfilePage';
import AppointmentsPage from './AppointmentsPage';
import Collection from './Collection';
import Finance from './Finance';

// Placeholder for Dashboard if not yet created
const Dashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Dashboard</h1></div>;

const ProtectedRoute = () => {
  const token = localStorage.getItem('management_token');
  return token ? <Outlet /> : <Navigate to="/management/auth" replace />;
};

const ManagementRouter = () => {
  return (
    <Routes>
      <Route path="auth" element={<Auth />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<ManagementLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<ManagementPatientsPage />} />
          <Route path="patients/:patientId" element={<PatientProfilePage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="collection" element={<Collection />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default ManagementRouter;