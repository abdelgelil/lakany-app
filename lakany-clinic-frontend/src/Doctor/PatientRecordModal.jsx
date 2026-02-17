import React, { useState, useContext, useEffect } from 'react';
import { FileText, History, Download, X, Save, Printer } from 'lucide-react';
import { LanguageContext } from '../patient/LanguageContext';
import toast from 'react-hot-toast';

const PatientRecordModal = ({ appointment, onClose, onSaveNote }) => {
  const { language } = useContext(LanguageContext);
  const isArabic = language === 'ar';

  const [patientNotes, setPatientNotes] = useState(appointment.currentNotes || '');
  const [clinicalObservations, setClinicalObservations] = useState(appointment.currentObservations || '');

  useEffect(() => {
    setPatientNotes(appointment.currentNotes || '');
    setClinicalObservations(appointment.currentObservations || '');
  }, [appointment]);

  const translations = {
    en: {
      patientRecords: 'Patient Records & Notes',
      patient: 'Patient',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      patientNotes: 'Patient Notes',
      clinicalObservations: 'Clinical Observations',
      medicalRecordHistory: 'Medical Record History',
      pastNotes: 'Past Notes',
      diagnoses: 'Diagnoses',
      prescriptions: 'Prescriptions',
      noPreviousRecords: 'No previous records found.',
      saveNote: 'Save Note',
      downloadPrint: 'Download/Print',
      noteSavedSuccess: 'Note saved successfully!',
      downloadPrintMessage: 'Download/Print feature not implemented in mock environment.',
    },
    ar: {
      patientRecords: 'سجلات وملاحظات المريض',
      patient: 'المريض',
      date: 'التاريخ',
      time: 'الوقت',
      status: 'الحالة',
      patientNotes: 'ملاحظات المريض',
      clinicalObservations: 'الملاحظات السريرية',
      medicalRecordHistory: 'تاريخ السجل الطبي',
      pastNotes: 'ملاحظات سابقة',
      diagnoses: 'التشخيصات',
      prescriptions: 'الوصفات الطبية',
      noPreviousRecords: 'لا توجد سجلات سابقة.',
      saveNote: 'حفظ الملاحظة',
      downloadPrint: 'تحميل/طباعة',
      noteSavedSuccess: 'تم حفظ الملاحظة بنجاح!',
      downloadPrintMessage: 'ميزة التحميل/الطباعة غير مطبقة في البيئة الوهمية.',
    }
  };

  const t = translations[language];

  const handleSave = () => {
    onSaveNote(appointment.id, patientNotes, clinicalObservations);
    toast.success(t.noteSavedSuccess);
  };

  const handleDownloadPrint = () => {
    toast.info(t.downloadPrintMessage);
    // In a real application, implement PDF generation or print functionality here
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className={`bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative ${isArabic ? 'font-arabic' : ''}`} 
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-3">{t.patientRecords}</h2>

        {/* Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <p className="text-slate-700"><span className="font-semibold">{t.patient}:</span> {appointment.name}</p>
          <p className="text-slate-700"><span className="font-semibold">{t.date}:</span> {appointment.date}</p>
          <p className="text-slate-700"><span className="font-semibold">{t.time}:</span> {appointment.time}</p>
          <p className="text-slate-700"><span className="font-semibold">{t.status}:</span> {appointment.status}</p>
        </div>

        {/* Clinical Notes */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <FileText size={20} /> {t.patientNotes}
          </h3>
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
            rows="5"
            placeholder={t.patientNotes}
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <FileText size={20} /> {t.clinicalObservations}
          </h3>
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
            rows="5"
            placeholder={t.clinicalObservations}
            value={clinicalObservations}
            onChange={(e) => setClinicalObservations(e.target.value)}
          ></textarea>
        </div>

        {/* Medical Record History */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <History size={20} /> {t.medicalRecordHistory}
          </h3>
          {appointment.records && appointment.records.length > 0 ? (
            <div className="space-y-4">
              {appointment.records.map((record) => (
                <div key={record.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-blue-700 mb-2">{record.date}</p>
                  <p className="text-slate-700 mb-1"><span className="font-medium">{t.pastNotes}:</span> {record.pastNotes}</p>
                  <p className="text-slate-700 mb-1"><span className="font-medium">{t.diagnoses}:</span> {record.diagnoses.join(', ')}</p>
                  <p className="text-slate-700"><span className="font-medium">{t.prescriptions}:</span> {record.prescriptions.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">{t.noPreviousRecords}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            <Save size={20} /> {t.saveNote}
          </button>
          <button
            onClick={handleDownloadPrint}
            className="flex items-center gap-2 px-5 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition-colors shadow-md border border-blue-200"
          >
            <Printer size={20} /> {t.downloadPrint}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientRecordModal;