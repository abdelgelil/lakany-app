import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { translations } from '../translations';
import logo from '../assets/logo-removebg-preview.png';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, X, Menu } from 'lucide-react';

const ContactModal = ({ isOpen, onClose, isArabic }) => {
    const t = translations[isArabic ? 'ar' : 'en'];
    const phoneNumber = "01200906079";
    const phoneLink = `tel:${phoneNumber}`;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    dir={isArabic ? 'rtl' : 'ltr'}
                >
                    <motion.div
                        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 relative">
                            <button onClick={onClose} className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}>
                                <X size={24} />
                            </button>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{t.contactUs}</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-700">{t.janakleesContact}</h4>
                                    <a href={phoneLink} className="flex items-center gap-2 text-blue-600 font-bold text-lg tracking-wider hover:underline">
                                        <Phone size={16} />
                                        <span>{isArabic ? '٠١٢٠٠٩٠٦٠٧٩' : phoneNumber}</span>
                                    </a>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-700">{t.ramlContact}</h4>
                                    <a href={phoneLink} className="flex items-center gap-2 text-blue-600 font-bold text-lg tracking-wider hover:underline">
                                        <Phone size={16} />
                                        <span>{isArabic ? '٠١٢٠٠٩٠٦٠٧٩' : phoneNumber}</span>
                                    </a>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-6 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {t.close}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const MobileMenu = ({ isOpen, onClose, onShowContact, onLogout, onToggleLanguage, language, token }) => {
    const t = translations[language];
    
    const handleContactClick = () => {
        onShowContact();
        onClose();
    }
    
    const handleLanguageClick = () => {
        onToggleLanguage();
        onClose();
    }

    const handleLogoutClick = () => {
        onLogout();
        onClose();
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/30 z-50 md:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="absolute top-0 right-0 bottom-0 w-3/4 max-w-sm bg-white shadow-lg"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 flex flex-col h-full">
                            <button onClick={onClose} className="self-end text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                            <nav className="mt-8 flex flex-col gap-6 text-center">
                                <button
                                    onClick={handleContactClick}
                                    className="text-lg font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                                >
                                    {t.contactUs}
                                </button>
                                <button
                                    onClick={handleLanguageClick}
                                    className="text-lg font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                                >
                                    {language === 'en' ? t.arabic : t.english}
                                </button>
                                {token ? (
                                    <button
                                        onClick={handleLogoutClick}
                                        className="text-lg font-semibold text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        {t.logout}
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={onClose}
                                        className="text-lg font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                                    >
                                        {t.login}
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const Header = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const blueFilter = "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3451%) hue-rotate(215deg) brightness(91%) contrast(101%)";
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') { 
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShow(false); 
      } else {
        setShow(true);  
      }
      setLastScrollY(window.scrollY); 
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-transform duration-300 ${show ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Link to={token ? "/dashboard/overview" : "/"} className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="Logo" 
              style={{ filter: blueFilter }}
              className="h-16 w-16 object-contain"
            />
            <span className="font-bold text-xl text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">
            Lakany Pain Clinic
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setShowContact(true)}
              className="text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors"
            >
              {translations[language].contactUs}
            </button>
            <button 
              onClick={toggleLanguage}
              className="text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors"
            >
              {language === 'en' ? translations.ar.arabic : translations.en.english}
            </button>
            {token ? (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-blue-700 hover:underline underline-offset-4"
              >
                {translations[language].logout}
              </button>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-semibold text-blue-700 hover:underline underline-offset-4"
              >
                {translations[language].login}
              </Link>
            )}
          </div>

          {/* Mobile Nav Trigger */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 hover:text-blue-700">
                <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <ContactModal 
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        isArabic={language === 'ar'}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onShowContact={() => setShowContact(true)}
        onLogout={handleLogout}
        onToggleLanguage={toggleLanguage}
        language={language}
        token={token}
      />
    </>
  );
};

export default Header;