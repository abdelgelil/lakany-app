import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { translations } from '../translations';
import logo from '../assets/logo-removebg-preview.png';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useContext(LanguageContext);
  const isRtl = language === 'ar';

  const blueFilter = "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3451%) hue-rotate(215deg) brightness(91%) contrast(101%)";

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-6 overflow-hidden ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] -z-0" />
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10 py-10">
        
        {/* Logo Section */}
        <motion.div 
          className="relative order-first lg:order-last flex justify-center lg:justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.img 
            src={logo}
            alt="Clinic Logo"
            style={{ filter: blueFilter }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-72 lg:h-72 object-contain drop-shadow-[0_10px_30px_rgba(30,64,175,0.15)]"
          />
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-start"
        >
          <motion.span 
            className="inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase bg-blue-50/80 rounded-full"
          >
            {isRtl ? "عيادة لاكاني لعلاج الألم" : "Lakany Pain Management"}
          </motion.span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            {isRtl ? "حياة أفضل" : "Better Life"} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
              {isRtl ? "بدون ألم" : "Without Pain"}
            </span>
          </h1>

          <p className="text-base lg:text-lg text-slate-500 mb-10 max-w-md leading-relaxed mx-auto lg:mx-0 font-medium">
            {isRtl 
              ? "نقدم رعاية طبية متطورة مصممة خصيصاً لتلبية احتياجاتك واستعادة حيويتك." 
              : "Experience specialized medical care designed to help you regain your vitality and comfort."}
          </p>
          
          {/* --- MAIN NAVIGATION BAR AREA --- */}
          <div className="flex flex-col gap-3 max-w-sm mx-auto lg:mx-0">
            
            {/* Primary Action */}
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 text-base font-bold text-white rounded-2xl shadow-xl shadow-blue-100 bg-[#1e40af] hover:bg-blue-800 transition-all"
            >
              {translations[language].login}
            </motion.button>

            {/* Secondary Navigation Row */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/About')}
                className="flex-[2] px-4 py-4 text-sm font-bold text-blue-700 bg-white border border-blue-100 hover:bg-blue-50 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {isRtl ? "عن العيادة" : "About the Clinic"}
              </button>

              <button
                onClick={toggleLanguage}
                className="flex-1 px-4 py-4 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all uppercase tracking-tighter"
              >
                {translations[language].switchLanguageButton}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;