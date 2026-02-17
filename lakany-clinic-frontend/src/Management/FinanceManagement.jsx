import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../patient/LanguageContext';
import { TrendingUp, ArrowLeft, RefreshCw, Receipt, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import mgmtApi from './mgmtApi'; // Ensure this matches your export

const FinanceManagement = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [stats, setStats] = useState({
    totalRevenue: 0,
    recentTransactions: [],
    monthlyBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  const t = {
    en: {
      dashboard: 'Clinic Finance Overview',
      revenue: 'Total Clinic Revenue',
      history: 'Verified Billing History',
      currency: 'EGP'
    },
    ar: {
      dashboard: 'نظرة عامة على مالية العيادة',
      revenue: 'إجمالي إيرادات العيادة',
      history: 'سجل الفواتير المؤكدة',
      currency: 'ج.م'
    }
  }[language];

  const fetchData = async () => {
    try {
      setLoading(true);
      // 🔥 SYNCED: Using the same aggregation endpoint as the doctor
      const res = await mgmtApi.get('/enterprise/finance-stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error(isArabic ? "خطأ في المزامنة" : "Sync Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <Toaster />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.dashboard}</h1>
          </div>
          <button onClick={fetchData} className={`p-3 rounded-2xl bg-white shadow-sm text-blue-600 ${loading ? 'animate-spin' : ''}`}>
            <RefreshCw size={20} />
          </button>
        </header>

        {/* Hero Revenue Card - Styled like Doctor's Hero */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <TrendingUp size={14} /> {t.revenue}
            </p>
            <h2 className="text-6xl font-black tracking-tighter italic">
              {stats.totalRevenue.toLocaleString()} <span className="text-xl font-normal opacity-40 not-italic">{t.currency}</span>
            </h2>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-5 text-white italic font-black text-[12rem] select-none uppercase pointer-events-none">
            CASH
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-3 font-black text-slate-800 uppercase tracking-widest text-xs">
            <Receipt size={18} className="text-blue-600" /> {t.history}
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentTransactions?.map((record) => (
              <div key={record._id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{record.patientName || 'Private Patient'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {new Date(record.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-600">+{record.price || record.fee} <span className="text-xs font-normal">{t.currency}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;