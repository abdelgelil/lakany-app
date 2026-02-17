import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; // Import the new Footer
import { LanguageContext } from './LanguageContext';

const DashboardLayout = () => {
  const { language } = useContext(LanguageContext);
  const location = useLocation();

  const text = {
    en: {
      overview: 'Overview',
      bookAppointment: 'Book Appointment',
      medicalRecords: 'Medical Records',
      about: 'About',
    },
    ar: {
      overview: 'نظرة عامة',
      bookAppointment: 'حجز موعد',
      medicalRecords: 'السجلات الطبية',
      about: 'عن العيادة',
    },
  };
  const t = text[language];
  const isArabic = language === 'ar';

  const navTabs = [
    { id: 'overview', label: t.overview, path: '/patient/dashboard' },
    { id: 'book', label: t.bookAppointment, path: '/patient/book' },
    { id: 'records', label: t.medicalRecords, path: '/patient/records' },
    { id: 'about', label: t.about, path: '/patient/about' },
  ];

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'} 
      className="min-h-screen flex flex-col bg-slate-100"
    >
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full overflow-x-auto scrollbar-hide pb-2 mb-6">
            <div className="bg-white p-2 flex gap-1 rounded-lg shadow-sm border border-gray-200 w-fit mx-auto">
              {navTabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    location.pathname.startsWith(tab.path)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;