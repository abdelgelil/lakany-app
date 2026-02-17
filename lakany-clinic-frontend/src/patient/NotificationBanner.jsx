import React from 'react';
import { X, AlertTriangle, Info, OctagonX } from 'lucide-react';

const translations = {
  en: {
    clinicClosed: 'The clinic is currently marked as closed by the doctor. Please try again later.',
    dismiss: 'Dismiss',
  },
  ar: {
    clinicClosed: 'تم إغلاق العيادة حاليًا من قبل الطبيب. يرجى المحاولة مرة أخرى لاحقًا.',
    dismiss: 'إغلاق',
  },
};

const NotificationBanner = ({ notifications = [], isClinicClosed, onDismiss, language = 'en' }) => {
  const t = translations[language] || translations.en;
  const isArabic = language === 'ar';

  const renderIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-3 mb-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* ✅ TRIGGERS ONLY IF DOCTOR CLOSED THE APP */}
      {isClinicClosed && (
        <div className="bg-red-50 border-s-4 border-red-500 text-red-700 p-4 rounded-xl flex justify-between items-center shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <OctagonX size={24} />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight">
                {isArabic ? 'تنبيه: العيادة مغلقة' : 'Attention: Clinic Closed'}
              </p>
              <p className="text-xs mt-1 font-medium opacity-90">{t.clinicClosed}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic System Notifications */}
      {notifications.map((n) => (
        <div key={n.id} className="bg-white border border-slate-100 border-s-4 border-s-blue-500 p-4 rounded-xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            {renderIcon(n.type)}
            <p className="text-sm font-semibold text-slate-700">{n.message}</p>
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            className="text-slate-300 hover:text-slate-600 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;