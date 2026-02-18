import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../axios'; // Uses your baseURL: '/api' configuration
import { LanguageContext } from './LanguageContext';
import AuthLayout from './AuthLayout';
import InputField from './InputField';

const ForgotPassword = () => {
    const { language } = useContext(LanguageContext);
    const isArabic = language === 'ar';
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const text = {
        en: {
            title: 'Forgot Password?',
            description: 'Enter your email address to receive a reset token.',
            email: 'Email Address',
            sendToken: 'Send Token',
            sending: 'Sending...',
            backToLogin: 'Back to Login',
            success: 'Token sent to your email!',
            error: 'Failed to send token. Please check the email and try again.',
            validationEmail: 'Please enter a valid email address.',
        },
        ar: {
            title: 'هل نسيت كلمة المرور؟',
            description: 'أدخل عنوان بريدك الإلكتروني لتلقي رمز إعادة التعيين.',
            email: 'البريد الإلكتروني',
            sendToken: 'إرسال الرمز',
            sending: 'جار الإرسال...',
            backToLogin: 'العودة لتسجيل الدخول',
            success: 'تم إرسال الرمز إلى بريدك الإلكتروني!',
            error: 'فشل إرسال الرمز. يرجى التأكد من البريد والمحاولة مرة أخرى.',
            validationEmail: 'يرجى إدخال عنوان بريد إلكتروني صالح.',
        }
    };
    const t = text[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !email.includes('@')) {
            toast.error(t.validationEmail);
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading(t.sending);

        try {
            /** * IMPORTANT: 
             * We use /users/forgot-password (kebab-case) as it is the 
             * standard for most backend route definitions.
             */
           await api.post('/patient/forgotPassword', { email });
           
            toast.success(t.success, { id: toastId });
            setEmail('');
        } catch (err) {
            // Log the error for debugging
            console.error("Forgot Password Error:", err);
            
            // Extract message from backend or use the default translation
            const errorMessage = err.response?.data?.message || t.error;
            toast.error(errorMessage, { id: toastId });
        } finally {
            // ✅ THE FIX: Button resets regardless of success or failure
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title={t.title} isArabic={isArabic}>
            <p className="text-center text-slate-500 mb-8">
                {t.description}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    isArabic={isArabic}
                    icon={<Mail size={20} />}
                    placeholder={t.email}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autocomplete="email"
                />

                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.99 }}
                    className="w-full py-4 text-base font-bold text-white rounded-2xl shadow-xl shadow-blue-100 bg-[#1e40af] hover:bg-blue-800 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? t.sending : t.sendToken}
                </motion.button>
            </form>

            <div className="mt-8 text-center">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-blue-700 font-bold hover:underline underline-offset-4 decoration-2"
                >
                    <ArrowLeft size={16} className={isArabic ? 'rotate-180' : ''} />
                    {t.backToLogin}
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;