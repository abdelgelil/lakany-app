import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LanguageContext } from './LanguageContext';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useContext(LanguageContext);

  // Paths where the back button should not be shown
  const noBackPaths = ['/', '/login', '/welcome'];

  if (noBackPaths.includes(location.pathname)) {
    return null;
  }

  const isArabic = language === 'ar';
  const Icon = isArabic ? ArrowRight : ArrowLeft;

  const buttonStyle = {
    position: 'absolute',
    top: '1.5rem', // 24px
    [isArabic ? 'right' : 'left']: '1.5rem', // 24px
    zIndex: 10,
  };

  return (
    <button
      onClick={() => navigate(-1)}
      style={buttonStyle}
      className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-md border border-gray-200"
      aria-label={isArabic ? 'العودة' : 'Go back'}
    >
      <Icon size={22} />
    </button>
  );
};

export default BackButton;
