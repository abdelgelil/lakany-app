import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../axios';
import { LanguageContext } from './LanguageContext';
import AuthLayout from './AuthLayout';
import InputField from './InputField';

const ResetPassword = () => {
    const { language } = useContext(LanguageContext);
    const isArabic = language === 'ar';
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const text = {
        en: {
            title: 'Reset Your Password',
            password: 'New Password',
            passwordConfirm: 'Confirm New Password',
            resetButton: 'Reset Password',
            processing: 'Processing...',
            success: 'Password reset successful! Redirecting to login...',
            error: 'Failed to reset password. The token might be invalid or expired.',
            passwordMismatch: 'Passwords do not match.',
            backToLogin: 'Back to Login',
        },
        ar: {
            title: 'إعادة تعيين كلمة المرور',
            password: 'كلمة المرور الجديدة',
            passwordConfirm: 'تأكيد كلمة المرور الجديدة',
            resetButton: 'إعادة تعيين كلمة المرور',
            processing: 'جاري المعالجة...',
            success: 'تمت إعادة تعيين كلمة المرور بنجاح! جارٍ إعادة توجيهك لتسجيل الدخول...',
            error: 'فشل إعادة تعيين كلمة المرور. قد يكون الرمز غير صالح أو منتهي الصلاحية.',
            passwordMismatch: 'كلمتا المرور غير متطابقتين.',
            backToLogin: 'العودة لتسجيل الدخول',
        }
    };
    const t = text[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            toast.error(t.passwordMismatch);
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading(t.processing);

        try {
            await api.patch(`/users/resetPassword/${token}`, { password, passwordConfirm });
            toast.success(t.success, { id: toastId });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t.error;
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title={t.title} isArabic={isArabic}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    isArabic={isArabic}
                    icon={<Lock size={20} />}
                    placeholder={t.password}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <InputField
                    isArabic={isArabic}
                    icon={<Lock size={20} />}
                    placeholder={t.passwordConfirm}
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />

                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.99 }}
                    className="w-full py-4 text-base font-bold text-white rounded-2xl shadow-xl shadow-blue-100 bg-[#1e40af] hover:bg-blue-800 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? t.processing : t.resetButton}
                </motion.button>
            </form>
             <div className="mt-8 text-center">
                <Link
                    to="/login"
                    className="text-sm text-blue-700 font-bold hover:underline underline-offset-4 decoration-2"
                >
                    {t.backToLogin}
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;