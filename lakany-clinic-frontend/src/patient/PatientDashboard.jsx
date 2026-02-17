import React, { useContext, useState } from 'react';
import { 
  CalendarDays, 
  History, 
  Info, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react'; // Added navigation icons
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import useNotification from '../hooks/useNotification';
import NotificationBanner from './NotificationBanner';

const getInitialName = () => {
  const userData = localStorage.getItem('user') || localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    return user.username || 'Patient';
  }
  return 'Patient';
};

const translations = {
  en: {
    overview: 'Overview',
    bookAppointment: 'Book Appointment',
    medicalRecords: 'Medical Records',
    about: 'About',
    aboutDesc: 'Learn more about Dr. Lakany',
    welcome: (name) => `Welcome, ${name}`,
    welcomeSub: 'Manage your health journey with ease.',
  },
  ar: {
    overview: 'نظرة عامة',
    bookAppointment: 'حجز موعد',
    medicalRecords: 'السجلات الطبية',
    about: 'عن العيادة',
    aboutDesc: 'تعرف أكثر على د. الأكاني',
    welcome: (name) => `مرحبًا بك، ${name}`,
    welcomeSub: 'إدارة رحلتك الصحية بكل سهولة.',
  },
};

const PatientDashboard = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [patientName] = useState(getInitialName);

  // ✅ The hook should now return 'isClinicClosed' based on a database flag, 
  // not just the local clock.
  const { notifications, isClinicClosed, dismissNotification } = useNotification();

  const t = translations[language];
  const isArabic = language === 'ar';

  return (
    <div className={`space-y-6 ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* ✅ Notification Update: Pass current clinic status */}
      <NotificationBanner 
        notifications={notifications} 
        isClinicClosed={isClinicClosed} // Triggers only if Doctor toggled "Closed"
        onDismiss={dismissNotification}
        language={language}
      />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">{t.welcome(patientName)}</h1>
          <p className="opacity-90 text-sm font-medium">{t.welcomeSub}</p>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <button 
          onClick={() => navigate('/patient/book')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all text-start group flex flex-col justify-between h-40"
        >
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <CalendarDays size={24} />
          </div>
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg text-gray-900">{t.bookAppointment}</h3>
            {isArabic ? <ChevronLeft size={20} className="text-gray-300" /> : <ChevronRight size={20} className="text-gray-300" />}
          </div>
        </button>

        <button 
          onClick={() => navigate('/patient/records')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all text-start group flex flex-col justify-between h-40"
        >
          <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <History size={24} />
          </div>
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg text-gray-900">{t.medicalRecords}</h3>
            {isArabic ? <ChevronLeft size={20} className="text-gray-300" /> : <ChevronRight size={20} className="text-gray-300" />}
          </div>
        </button>

        <button 
          onClick={() => navigate('/patient/about')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-cyan-400 hover:shadow-xl hover:-translate-y-1 transition-all text-start group flex flex-col justify-between h-40"
        >
          <div className="bg-cyan-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
            <Info size={24} />
          </div>
          <div className="flex justify-between items-end w-full">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{t.about}</h3>
              <p className="text-gray-400 text-xs font-medium mt-1">{t.aboutDesc}</p>
            </div>
            {isArabic ? <ChevronLeft size={20} className="text-gray-300" /> : <ChevronRight size={20} className="text-gray-300" />}
          </div>
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;