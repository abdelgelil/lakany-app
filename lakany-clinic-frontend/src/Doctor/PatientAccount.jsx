import React from 'react';
import DoctorNavbar from './DoctorNavbar';

const PatientAccount = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorNavbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-800">Patient Account</h1>
        <p className="text-slate-600 mt-2">This feature is coming soon.</p>
      </div>
    </div>
  );
};

export default PatientAccount;