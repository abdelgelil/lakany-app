import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { User, Phone, Mail, Lock, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo-removebg-preview.png';
import toast from 'react-hot-toast';
import api from '../axios';

// --- 1. MOVE HELPER COMPONENT OUTSIDE ---
// This prevents the "losing focus" issue because the component definition is now stable.
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

const PatientAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const blueFilter = "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3451%) hue-rotate(215deg) brightness(91%) contrast(101%)";

  const text = {
    en: {
      login: 'Login',
      signup: 'Sign Up',
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      password: 'Password',
      identifier: 'Phone or Email',
      loginPrompt: "Don't have an account?",
      signupPrompt: 'Already have an account?',
      back: 'Back to Home',
      clinicName: 'Lakany Pain Clinic',
      loginSuccess: 'Login Successful!',
      signupSuccess: 'Signup Successful!',
      loading: 'Processing...',
      error: 'An error occurred. Please try again.',
      validationName: 'Please enter your full name.',
      validationPhone: 'Please enter your phone number.',
      validationEmail: 'Please enter your email address.',
      validationPassword: 'Password is required.',
      validationIdentifier: 'Please enter your phone or email.',
      forgotPassword: 'Forgot your password?',
    },
    ar: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      name: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      identifier: 'الهاتف أو البريد الإلكتروني',
      loginPrompt: 'ليس لديك حساب؟',
      signupPrompt: 'هل لديك حساب بالفعل؟',
      back: 'العودة للرئيسية',
      clinicName: 'عيادة لاكاني',
      loginSuccess: 'تم تسجيل الدخول بنجاح!',
      signupSuccess: 'تم إنشاء الحساب بنجاح!',
      loading: 'جاري المعالجة...',
      error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      validationName: 'يرجى إدخال اسمك الكامل.',
      validationPhone: 'يرجى إدخال رقم هاتفك.',
      validationEmail: 'يرجى إدخال بريدك الإلكتروني.',
      validationPassword: 'كلمة المرور مطلوبة.',
      validationIdentifier: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني.',
      forgotPassword: 'هل نسيت كلمة المرور؟',
    },
  };

  const t = text[language];

  // --- 2. CLEAR STATE ON MODE TOGGLE ---
  // This improves user experience by resetting the form.
  React.useEffect(() => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setIdentifier('');
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Validation ---
    if (isLogin) {
      if (!identifier) return toast.error(t.validationIdentifier);
      if (!password) return toast.error(t.validationPassword);
    } else {
      if (!name) return toast.error(t.validationName);
      if (!phone) return toast.error(t.validationPhone);
      if (!email) return toast.error(t.validationEmail);
      if (!password) return toast.error(t.validationPassword);
    }

    setIsLoading(true);
    const toastId = toast.loading(t.loading);

    // --- API Call Logic ---
    try {
      let response;
      if (isLogin) {
        const isEmail = identifier.includes('@');
        const loginPayload = {
          [isEmail ? 'email' : 'phone']: identifier,
          password,
        };
        response = await api.post('/patient/login', loginPayload);
      } else {
        const signupPayload = {
          username: name,
          email,
          password,
          phone,
          language,
        };
        response = await api.post('/patient/signup', signupPayload);
      }

      if (response.data && response.data.token && response.data.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        toast.success(isLogin ? t.loginSuccess : t.signupSuccess, { id: toastId });
        navigate('/dashboard');
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (err) {
      let errorMessage = t.error;
      if (!err.response) {
        errorMessage = "Server Connection Error. Please try again later.";
      } else {
        errorMessage = err.response.data?.message || err.message;
      }
      toast.error(errorMessage, { id: toastId });
      console.error("Authentication Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
          <span>{t.back}</span>
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
            {t.clinicName}
          </h2>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white p-8 lg:p-10">
          
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.login}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.signup}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {!isLogin && (
                  <InputField 
                    isArabic={isArabic} 
                    icon={<User size={20} />} 
                    placeholder={t.name} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autocomplete="name"
                  />
                )}
                {!isLogin && (
                  <InputField 
                    isArabic={isArabic} 
                    icon={<Phone size={20} />} 
                    placeholder={t.phone}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autocomplete="tel"
                  />
                )}
                
                <InputField 
                  isArabic={isArabic}
                  icon={<Mail size={20} />} 
                  placeholder={isLogin ? t.identifier : t.email}
                  value={isLogin ? identifier : email}
                  onChange={(e) => isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value)}
                  autocomplete={isLogin ? "username" : "email"}
                />
                
                <InputField 
                  isArabic={isArabic}
                  icon={<Lock size={20} />} 
                  placeholder={t.password} 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autocomplete={isLogin ? "current-password" : "new-password"}
                />
              </motion.div>
            </AnimatePresence>

            {isLogin && (
                <div className="text-right">
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-700 hover:underline">
                        {t.forgotPassword}
                    </Link>
                </div>
            )}
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              className="w-full py-4 text-base font-bold text-white rounded-2xl shadow-xl shadow-blue-100 bg-[#1e40af] hover:bg-blue-800 transition-all mt-4 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? t.loading : (isLogin ? t.login : t.signup)}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {isLogin ? t.loginPrompt : t.signupPrompt}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-700 font-bold hover:underline underline-offset-4 decoration-2"
              >
                {!isLogin ? t.login : t.signup}
              </button>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Lakany Clinic • Secure Access
        </p>
      </motion.div>
    </div>
  );
};

export default PatientAuth;