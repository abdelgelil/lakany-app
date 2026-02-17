import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Globe, LogOut } from 'lucide-react';
import { LanguageContext } from '../patient/LanguageContext';

const ManagementHeader = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  const headerTranslations = {
    en: {
      dashboard: 'Dashboard',
      collection: 'Collection',
      finance: 'Finance',
      addPatient: 'Add Patient',
      logout: 'Logout'
    },
    ar: {
      dashboard: 'لوحة التحكم',
      collection: 'التحصيل',
      finance: 'المالية',
      addPatient: 'إضافة مريض',
      logout: 'تسجيل الخروج'
    }
  };
  const t = headerTranslations[language];

  const handleLogout = () => {
    localStorage.removeItem('management_token');
    localStorage.removeItem('management_user');
    localStorage.removeItem('management_userRole');
    navigate('/management-login');
  };

  return (
    <header className="bg-slate-50 shadow-md rounded-2xl p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/src/assets/logo-removebg-preview.png" alt="Dr. Lakany" className="h-10 mr-4" />
        <span className="text-2xl font-bold text-blue-600">Dr. Lakany</span>
      </div>
      <nav className="flex items-center space-x-4">
        <NavLink to="/management/dashboard" className={({ isActive }) => (isActive ? "text-blue-600" : "text-slate-900")}>
          {t.dashboard}
        </NavLink>
        <NavLink to="/management/add-patient" className={({ isActive }) => (isActive ? "text-blue-600" : "text-slate-900")}>
          {t.addPatient}
        </NavLink>
        <NavLink to="/management/collection" className={({ isActive }) => (isActive ? "text-blue-600" : "text-slate-900")}>
          {t.collection}
        </NavLink>
        <NavLink to="/management/finance" className={({ isActive }) => (isActive ? "text-blue-600" : "text-slate-900")}>
          {t.finance}
        </NavLink>
      </nav>
      <div className="flex items-center space-x-4">
        <button onClick={toggleLanguage} className="flex items-center text-slate-900">
          <Globe size={20} className="mr-1" />
          {language === 'en' ? 'AR' : 'EN'}
        </button>
        <button onClick={handleLogout} className="flex items-center text-red-600">
          <LogOut size={20} className="mr-1" />
          {t.logout}
        </button>
      </div>
    </header>
  );
};

export default ManagementHeader;
