import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../patient/LanguageContext';
import { User, Phone, Mail, Lock } from 'lucide-react';
import logo from '../assets/logo-removebg-preview.png';
import toast from 'react-hot-toast';

// Fixed Import: Using named exports for functions, default for instance
import doctorApi, { loginEnterprise, registerEnterprise } from './doctorApi';

// Helper component
const InputField = ({ icon, placeholder, type = 'text', value, onChange, isArabic, autocomplete }) => (
  <div className="relative group">
    <div className={`absolute inset-y-0 ${isArabic ? 'right-4' : 'left-4'} flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-slate-400`}>
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-slate-700 placeholder:text-slate-400`}
      autoComplete={autocomplete}
    />
  </div>
);

const DoctorAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const blueFilter = "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3451%) hue-rotate(215deg) brightness(91%) contrast(101%)";

  const t = {
    en: {
      login: 'Doctor Login',
      signup: 'Doctor Sign Up',
      phone: 'Phone Number',
      identifier: 'Email',
      loginSuccess: 'Doctor Login Successful!',
      signupSuccess: 'Signup successful! Please log in.',
      loadingLogin: 'Signing in...',
      loadingSignup: 'Creating account...',
      error: 'An error occurred. Please try again.',
      validationIdentifier: 'Please enter your email.',
      validationPassword: 'Password is required.',
      clinicName: 'Lakany Pain Clinic'
    },
    ar: {
      login: 'تسجيل دخول الطبيب',
      signup: 'تسجيل طبيب جديد',
      phone: 'رقم الهاتف',
      identifier: 'البريد الإلكتروني',
      loginSuccess: 'تم تسجيل دخول الطبيب بنجاح!',
      signupSuccess: 'تم التسجيل بنجاح! يرجى تسجيل الدخول.',
      loadingLogin: 'جاري تسجيل الدخول...',
      loadingSignup: 'جاري إنشاء الحساب...',
      error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      validationIdentifier: 'يرجى إدخال بريدك الإلكتروني.',
      validationPassword: 'كلمة المرور مطلوبة.',
      clinicName: 'عيادة لاكاني'
    }
  }[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error(t.validationIdentifier);
    if (!password) return toast.error(t.validationPassword);

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await loginEnterprise({ email: identifier, password });
        const data = response.data;

        if (data?.token) {
          toast.success(t.loginSuccess);
          localStorage.setItem('doctor_token', data.token);
          localStorage.setItem('doctor_user', JSON.stringify(data.data.user));
          navigate('/doctor/dashboard', { replace: true });
        }
      } else {
        const userData = {
          email: identifier,
          password,
          username: identifier.split('@')[0],
          phone,
          role: 'doctor'
        };
        await registerEnterprise(userData);
        toast.success(t.signupSuccess);
        setIsLogin(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || t.error;
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Clinic Logo" style={{ filter: blueFilter }} className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t.clinicName}</h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white p-8 lg:p-10">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>{t.login}</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>{t.signup}</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <InputField isArabic={isArabic} icon={<Phone size={20} />} placeholder={t.phone} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />}
            <InputField isArabic={isArabic} icon={<Mail size={20} />} placeholder={t.identifier} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autocomplete="username" />
            <InputField isArabic={isArabic} icon={<Lock size={20} />} placeholder={t.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autocomplete="current-password" />
            
            <button type="submit" disabled={isLoading} className="w-full py-4 text-base font-bold text-white rounded-2xl bg-[#1e40af] hover:bg-blue-800 transition-all mt-4 disabled:opacity-75">
              {isLoading ? t.loadingLogin : (isLogin ? t.login : t.signup)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorAuth;