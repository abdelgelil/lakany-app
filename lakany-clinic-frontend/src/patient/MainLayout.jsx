import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Import the new Header
import Footer from './Footer'; // Import the new Footer
import { LanguageContext } from './LanguageContext';

const MainLayout = () => {
  const { language } = useContext(LanguageContext);
  const isArabic = language === 'ar';
  
  // Dynamic font switching based on language
  const fontFamily = isArabic ? "'Cairo', 'Tahoma', sans-serif" : "'Roboto', 'Arial', sans-serif";

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'} 
      style={{ fontFamily }}
      className="min-h-screen flex flex-col bg-slate-100"
    >
      <Header />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Consistent Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;