import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Power, ShieldAlert, CheckCircle, LogOut, Loader2 } from 'lucide-react';
import { LanguageContext } from '../patient/LanguageContext';
import BackButton from '../patient/BackButton';
import DoctorNavbar from './DoctorNavbar';
import { Toaster, toast } from 'react-hot-toast';

import DrLakanyImage from '../assets/DrLakany-removebg-preview (1).png';
import { updateAvailability, getDoctorProfile } from './doctorApi';

const DoctorProfile = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Initialize as null so we don't default to "Terminated" while loading
  const [isDoctorAvailable, setIsDoctorAvailable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = {
    en: {
      profileTitle: "Doctor's Profile",
      liveStatus: "Clinic Booking Status",
      clinicOpen: "Clinic Open (Accepting Bookings)",
      clinicClosed: "Clinic Terminated (Bookings Blocked)",
      terminateAppointments: "Terminate Bookings",
      enableAppointments: "Enable Bookings",
      terminateConfirmation: "This will block all new patient bookings. Continue?",
      yes: "Yes", no: "No", logout: "Logout",
      clinicTerminated: 'Clinic Terminated',
      clinicEnabled: 'Clinic Enabled',
      syncing: 'Syncing...',
    },
    ar: {
      profileTitle: "ملف الطبيب",
      liveStatus: "حالة حجوزات العيادة",
      clinicOpen: "العيادة مفتوحة",
      clinicClosed: "العيادة مغلقة",
      terminateAppointments: "إغلاق الحجوزات",
      enableAppointments: "فتح الحجوزات",
      terminateConfirmation: "سيتم منع الحجوزات الجديدة. هل ترغب في الاستمرار؟",
      yes: "نعم", no: "لا", logout: "خروج",
      clinicTerminated: 'تم إغلاق العيادة',
      clinicEnabled: 'تم فتح العيادة',
      syncing: 'جاري المزامنة...',
    }
  }[language];

  const isArabic = language === 'ar';

  // --- 1. Fetch REAL status from Database ---
  useEffect(() => {
    const syncStatus = async () => {
      try {
        const response = await getDoctorProfile();
        // Fallback to true if isAvailable isn't set yet
        const status = response?.data?.isAvailable ?? true;
        setIsDoctorAvailable(status);
      } catch (error) {
        console.error("Sync Error:", error);
        setIsDoctorAvailable(true); // Fail-safe to Open
      } finally {
        setIsLoading(false);
      }
    };
    syncStatus();
  }, []);

  // --- 2. Manual Update ---
  const handleToggle = async (target) => {
    const toastId = toast.loading(target ? "Activating..." : "Terminating...");
    setIsLoading(true);
    try {
      await updateAvailability(target);
      setIsDoctorAvailable(target);
      toast.success(target ? t.clinicEnabled : t.clinicTerminated, { id: toastId });
    } catch (err) {
      toast.error("Error updating status", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmTerminate = () => {
    toast((tost) => (
      <div className="flex flex-col gap-4">
        <p className="font-bold text-slate-800">{t.terminateConfirmation}</p>
        <div className="flex gap-2">
          <button onClick={() => { toast.dismiss(tost.id); handleToggle(false); }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold"> {t.yes} </button>
          <button onClick={() => toast.dismiss(tost.id)} className="bg-slate-100 px-4 py-2 rounded-lg"> {t.no} </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <Toaster position="top-center" />
      <DoctorNavbar currentPath={location.pathname} />
      
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-4xl font-black text-slate-900">{t.profileTitle}</h1>
          </div>
          <button onClick={() => navigate('/doctor-login')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border font-bold hover:text-red-600 transition-all">
            <LogOut size={18} /> {t.logout}
          </button>
        </header>

        {/* Profile Info Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 border border-white">
          <div className="relative">
            <img src={DrLakanyImage} className="w-32 h-32 rounded-[2rem] object-cover border-4 border-slate-50" alt="Doctor" />
            {/* Status Indicator Badge */}
            <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-white text-white shadow-lg ${
              isLoading ? 'bg-slate-300' : isDoctorAvailable ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : isDoctorAvailable ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
            </div>
          </div>
          
          <div className="text-center md:text-start flex-1">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Dr. Mohamed Ellakany</h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm ${
              isLoading ? 'bg-slate-100 text-slate-400' : isDoctorAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? t.syncing : (isDoctorAvailable ? t.clinicOpen : t.clinicClosed)}
            </div>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-slate-900 rounded-lg text-white"><Power size={20} /></div>
            <h2 className="text-xl font-black text-slate-900">{t.liveStatus}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Terminate Button */}
            <button
              onClick={confirmTerminate}
              disabled={isLoading || isDoctorAvailable === false}
              className={`flex flex-col items-center gap-4 p-10 rounded-[2.5rem] border-2 transition-all ${
                isDoctorAvailable === false || isLoading ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-red-500 hover:shadow-2xl group'
              }`}
            >
              <div className="p-5 rounded-2xl bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"><ShieldAlert size={40} /></div>
              <span className="font-black text-lg">{t.terminateAppointments}</span>
            </button>

            {/* Activate Button */}
            <button
              onClick={() => handleToggle(true)}
              disabled={isLoading || isDoctorAvailable === true}
              className={`flex flex-col items-center gap-4 p-10 rounded-[2.5rem] border-2 transition-all ${
                isDoctorAvailable === true || isLoading ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-green-500 hover:shadow-2xl group'
              }`}
            >
              <div className="p-5 rounded-2xl bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all"><CheckCircle size={40} /></div>
              <span className="font-black text-lg">{t.enableAppointments}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;