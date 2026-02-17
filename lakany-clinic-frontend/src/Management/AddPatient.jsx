import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../patient/LanguageContext';
import { UserPlus, Save, Phone, Lock, User, LogOut, ArrowLeft, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import mgmtApi from './mgmtApi';

const AddPatient = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const translations = {
    en: {
      title: 'Add New Patient',
      subtitle: 'Register a new patient account to the clinic system',
      name: 'Full Name',
      phone: 'Phone Number',
      password: 'Password',
      save: 'Create Account',
      success: 'Patient account created successfully!',
      error: 'Please fill in all fields.',
      back: 'Dashboard',
      logout: 'Logout',
    },
    ar: {
      title: 'إضافة مريض جديد',
      subtitle: 'تسجيل حساب مريض جديد في نظام العيادة',
      name: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      save: 'إنشاء حساب',
      success: 'تم إنشاء حساب المريض بنجاح!',
      error: 'يرجى ملء جميع الحقول.',
      back: 'لوحة التحكم',
      logout: 'تسجيل الخروج',
    }
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error(t.error);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Processing...');
    
    try {
      await mgmtApi.post('/enterprise/patients', {
        username: formData.name,
        phone: formData.phone,
        password: formData.password,
      });
      toast.success(t.success, { id: toastId });
      setFormData({ name: '', phone: '', password: '' });
      setTimeout(() => navigate('/management'), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create patient.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/management')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-bold group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-blue-50">
              <ArrowLeft size={18} className={isArabic ? 'rotate-180' : ''} />
            </div>
            {t.back}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
            >
              <Globe size={16} />
              {language === 'en' ? 'Arabic' : 'English'}
            </button>
            <button
              onClick={() => navigate('/management-login')}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title={t.logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200 mb-6">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {t.title}
          </h1>
          <p className="text-slate-500 font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-400 px-1">
                {t.name}
              </label>
              <div className="relative group">
                <User className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'} text-slate-400 group-focus-within:text-blue-600 transition-colors`} size={20} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700`}
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-400 px-1">
                {t.phone}
              </label>
              <div className="relative group">
                <Phone className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'} text-slate-400 group-focus-within:text-blue-600 transition-colors`} size={20} />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700`}
                  placeholder="01xxxxxxxxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-400 px-1">
                {t.password}
              </label>
              <div className="relative group">
                <Lock className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'} text-slate-400 group-focus-within:text-blue-600 transition-colors`} size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 disabled:bg-slate-300 transition-all flex items-center justify-center gap-3 mt-8 shadow-xl shadow-slate-200 uppercase tracking-widest text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} />
                  {t.save}
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-8 font-medium">
          © {new Date().getFullYear()} Clinic Management System Security Policy
        </p>
      </main>
    </div>
  );
};

export default AddPatient;