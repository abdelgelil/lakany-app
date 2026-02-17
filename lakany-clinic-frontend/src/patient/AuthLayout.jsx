import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo-removebg-preview.png';

const AuthLayout = ({ children, title, isArabic }) => {
    const navigate = useNavigate();
    const blueFilter = "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3451%) hue-rotate(215deg) brightness(91%) contrast(101%)";

    return (
        <div className={`min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
            
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-50 rounded-full blur-[120px] opacity-60" />

            {/* Back Button */}
            <div className={`absolute top-6 lg:top-10 w-full px-6 lg:px-12 flex ${isArabic ? 'justify-end' : 'justify-start'}`}>
                <button 
                onClick={() => navigate('/')}
                className="group flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-blue-700 transition-all"
                >
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                    <ArrowLeft size={18} className={isArabic ? 'rotate-180' : ''} />
                </div>
                <span>{isArabic ? 'العودة للرئيسية' : 'Back to Home'}</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <motion.img 
                        src={logo} 
                        alt="Clinic Logo" 
                        style={{ filter: blueFilter }}
                        className="w-16 h-16 mx-auto mb-3 object-contain" 
                    />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                        {isArabic ? 'عيادة لاكاني' : 'Lakany Pain Clinic'}
                    </h2>
                </div>

                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white p-8 lg:p-10">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
                    </div>
                    {children}
                </div>

                <p className="mt-10 text-center text-[10px] text-slate-400 uppercase tracking-widest">
                    © {new Date().getFullYear()} Lakany Clinic • Secure Access
                </p>
            </motion.div>
        </div>
    );
}

export default AuthLayout;