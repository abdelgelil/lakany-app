import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { LanguageContext } from './LanguageContext';
import logo from '../assets/logo-removebg-preview.png';
import BackButton from './BackButton';
import api from '../axios';

const RecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const isArabic = language === 'ar';

  const blueFilter = "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3451%) hue-rotate(215deg) brightness(91%) contrast(101%)";

  const text = {
    en: {
      clinicName: 'Lakany Pain Clinic',
      clinicAddress: 'Alexandria, Egypt',
      clinicPhone: '+20 123 456 7890',
      print: 'Print Record',
      patientInfo: 'Patient Information',
      prescription: 'Prescription',
      advice: 'Medical Advice',
      docs: 'Required Documents',
      date: 'Date',
      drName: 'Dr. Mohamed Lakany'
    },
    ar: {
      clinicName: 'عيادة لاكاني لعلاج الألم',
      clinicAddress: 'الإسكندرية، مصر',
      clinicPhone: '+٢٠ ١٢٣ ٤٥٦ ٧٨٩٠',
      print: 'طباعة السجل',
      patientInfo: 'معلومات المريض',
      prescription: 'الوصفة الطبية',
      advice: 'النصائح الطبية',
      docs: 'المستندات المطلوبة',
      date: 'التاريخ',
      drName: 'د. محمد لاكاني'
    },
  };

  const t = text[language];

  const clinicAddresses = {
    "Janaklees Clinic": "٥ شارع الدكتور محمد صبرى ، أعلى فتح الله فاملى مول بجوار تاج للاسنان ، محطة ترام جناكليس",
    "Mahatet al Raml Clinic": "٢٣ ميدان سعد زغلول- اعلى صيدلية العزبى - عيادات تاون كلينيك",
    "default": "Alexandria, Egypt" // Fallback address
  };

  // --- Data Fetching Snippet ---
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        // The user ID is extracted from the URL using useParams()
        // Now, use it to fetch the specific record from your backend.
        const response = await api.get(`/appointments/${id}`); 
        if (response.data && response.data.success) {
          setRecord(response.data.data);
        } else {
          setError('Record not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch record data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]); // This effect runs whenever the `id` from the URL changes.

  if (loading) return <div className="p-10 text-center">Loading record...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!record) return <div className="p-10 text-center">{text.en.recordNotFound || 'Record not found.'}</div>;

  // Assuming the patient's name is now populated in the record object
  const patientName = record.patientId?.username ?? 'N/A';
  const patientDOB = record.patientId?.dateOfBirth ?? 'N/A'; // Assuming you add DOB to user model
  const doctorName = record.doctorId?.username ?? t.drName;


  return (
    <div className={`relative min-h-screen bg-slate-50 py-10 px-4 ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <BackButton />
      
      {/* 1. SCREEN-ONLY NAVIGATION (Hidden on Print/PDF) */}
      <div className="max-w-4xl mx-auto flex justify-end items-center mb-6 print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#1e40af] text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all"
        >
          <Printer size={18} /> {t.print}
        </button>
      </div>

      {/* 2. OFFICIAL MEDICAL RECORD CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl border border-white print:shadow-none print:border-0 overflow-hidden">
        
        {/* Letterhead Section */}
        <div className="p-8 sm:p-12 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
            <img 
              src={logo} 
              alt="Clinic Logo" 
              style={{ filter: blueFilter }} 
              className="h-16 w-16 object-contain" 
            />
            <div className={isArabic ? 'text-right' : 'text-left'}>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{record.clinicName ?? t.clinicName}</h1>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{clinicAddresses[record?.clinicLocation] || clinicAddresses["default"]}</p>
            </div>
          </div>
          
          <div className={`text-sm font-mono text-slate-400 ${isArabic ? 'text-left' : 'text-right'}`}>
            <p className="font-bold text-slate-900">{t.date}: {new Date(record.date).toLocaleDateString()}</p>
            <p>Ref: #REC-{record._id}</p>
          </div>
        </div>

        {/* Record Body */}
        <div className="p-8 sm:p-12 space-y-8">
          
          {/* Patient Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest">{t.patientInfo}</h2>
              <div className="bg-slate-50 p-5 rounded-2xl space-y-2 text-sm">
                <p><span className="text-slate-400 font-bold">{isArabic ? 'الاسم:' : 'Name:'}</span> <span className="text-slate-900 font-bold">{patientName}</span></p>
                <p><span className="text-slate-400 font-bold">{isArabic ? 'تاريخ الميلاد:' : 'DOB:'}</span> {patientDOB}</p>
                <p className="pt-2 border-t border-slate-200 text-slate-600 italic">Doctor: {doctorName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest">{t.advice}</h2>
              <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-600 leading-relaxed">
                {record.medicalRecord?.medicalAdvice ?? 'No medical advice provided.'}
              </div>
            </div>
          </div>

          {/* Prescription Area */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest">{t.prescription}</h2>
            <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2rem]">
              <p className="text-xl md:text-2xl font-bold text-blue-900 leading-relaxed italic">
                {record.medicalRecord?.prescription ?? 'No prescription provided.'}
              </p>
            </div>
          </div>

          {/* Documents - Also Hidden on Print if you only want the text report */}
          <div className="space-y-4 print:hidden">
            <h2 className="text-xs font-black text-blue-700 uppercase tracking-widest">{t.docs}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(record.medicalRecord?.requiredDocs || []).map((doc, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
                  {doc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Official Print Footer */}
        <div className="hidden print:block mt-12 p-8 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
            {t.clinicName} • {record.clinicPhone ?? t.clinicPhone} • Official Medical Document
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecordDetail;