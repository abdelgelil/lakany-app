import React from 'react';
import { useParams } from 'react-router-dom';

const PatientProfilePage = () => {
  const { patientId } = useParams();

  // Fetch patient data using patientId

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Patient Profile</h1>
      <p>Patient ID: {patientId}</p>
      {/* Display other patient details here */}
    </div>
  );
};

export default PatientProfilePage;