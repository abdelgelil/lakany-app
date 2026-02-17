import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, Users, CalendarDays, Menu, X, User, Languages } from 'lucide-react'; // Import Menu, X, User and Languages icons
import { LanguageContext } from '../patient/LanguageContext';

const DoctorNavbar = ({ currentPath }) => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useContext(LanguageContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const translations = {
    en: {
      dashboard: "Dashboard",
      finance: "Finance",
      patients: "Patients",
      appointments: "Appointments",
      profile: "Profile", // Add Profile translation
      language: "العربية",
    },
    ar: {
      dashboard: "لوحة القيادة",
      finance: "المالية",
      patients: "المرضى",
      appointments: "المواعيد",
      profile: "الملف الشخصي", // Add Profile translation
      language: "English",
    }
  };
  const t = translations[language];
  const isArabic = language === 'ar';

  const navItems = [
    { name: t.dashboard, icon: LayoutDashboard, path: '/doctor/dashboard' },
    { name: t.finance, icon: Wallet, path: '/doctor/finance' },
    { name: t.patients, icon: Users, path: '/doctor/patients' },
    { name: t.appointments, icon: CalendarDays, path: '/doctor/appointments' },
    { name: t.profile, icon: User, path: '/doctor/profile' }, // Add Profile nav item
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-50 print:hidden ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <button onClick={() => navigate('/doctor/dashboard')} className="text-xl font-bold text-white hover:text-white/80 transition-colors">
          Lakany Pain Clinic
        </button>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                currentPath === item.path ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors duration-200"
          >
            <Languages size={20} />
            <span>{t.language}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu (conditionally rendered) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700 mt-4 py-2 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                toggleMobileMenu(); // Close menu after navigation
              }}
              className="flex items-center gap-2 px-4 py-2 w-full text-left text-white hover:bg-white/10 transition-colors duration-200"
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
          <button
            onClick={() => {
              toggleLanguage();
              toggleMobileMenu();
            }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left text-white hover:bg-white/10 transition-colors duration-200"
          >
            <Languages size={20} />
            <span>{t.language}</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default DoctorNavbar;
