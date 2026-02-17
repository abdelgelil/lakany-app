import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowLeft, 
  Users, 
  Activity, 
  Calendar, 
  Receipt,
  User 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mgmtApi from '../Management/mgmtApi'; 
import toast, { Toaster } from 'react-hot-toast';

const DoctorFinance = () => {
  // ✅ Defensive initial state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    statusCounts: [],
    monthlyBreakdown: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        setLoading(true);
        // 🔥 Calling the management-synced aggregation route
        const res = await mgmtApi.get('/enterprise/finance-stats');
        
        if (res.data?.success) {
          setStats({
            totalRevenue: res.data.data?.totalRevenue || 0,
            statusCounts: res.data.data?.statusCounts || [],
            monthlyBreakdown: res.data.data?.monthlyBreakdown || [],
            recentTransactions: res.data.data?.recentTransactions || []
          });
        }
      } catch (err) {
        console.error("Finance Sync Error:", err);
        toast.error("Failed to sync financial data from management");
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-slate-900 tracking-widest text-xs uppercase italic">Syncing Revenue Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans antialiased">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-bold text-xs mb-2 tracking-widest">
               <ArrowLeft size={14} /> BACK TO CLINIC
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Performance</h1>
          </div>
          <div className="hidden md:flex bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black items-center gap-2 shadow-xl shadow-blue-200 uppercase tracking-widest">
            <Activity size={14} className="animate-pulse" /> Live Management Sync
          </div>
        </div>

        {/* --- HERO STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Main Revenue Card */}
          <div className="md:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Total Consultation Revenue
            </p>
            <h2 className="text-7xl font-black tracking-tighter italic">
              {stats?.totalRevenue?.toLocaleString() || 0} 
              <span className="text-xl font-normal opacity-40 not-italic ml-2">EGP</span>
            </h2>
            <DollarSign size={180} className="absolute -right-10 -bottom-10 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
          </div>

          {/* Sessions Count Card */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Users size={28} />
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Completed Sessions</p>
            <h3 className="text-5xl font-black text-slate-900">
              {stats?.statusCounts?.find(s => s._id === 'completed')?.count || 0}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* --- RECENT ACTIVITY (WITH PATIENT NAMES) --- */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-3">
              <Receipt size={20} className="text-blue-600" />
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Verified Billing History</h4>
            </div>
            <div className="divide-y divide-slate-50">
              {stats?.recentTransactions?.length > 0 ? (
                stats.recentTransactions.map((t) => (
                  <div key={t._id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      {/* Patient Avatar Circle */}
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        {t.patientName ? (
                           <span className="font-black text-sm uppercase">{t.patientName.charAt(0)}</span>
                        ) : (
                           <User size={18} />
                        )}
                      </div>
                      <div>
                        {/* ✅ Patient Name from $lookup */}
                        <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                          {t.patientName || 'Private Patient'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-blue-600">
                         +{t.price || t.fee || 0} <span className="text-xs font-normal">EGP</span>
                       </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-slate-300 font-bold italic">No recent billed sessions</div>
              )}
            </div>
          </div>

          {/* --- MONTHLY REVENUE TREND --- */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
            <div className="flex items-center gap-3 font-black text-slate-800 uppercase tracking-widest text-xs mb-10">
              <Calendar size={20} className="text-blue-600" /> Monthly Revenue Trend
            </div>
            <div className="space-y-8">
              {stats?.monthlyBreakdown?.length > 0 ? (
                stats.monthlyBreakdown.map((month, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <span className="font-black text-xs">{month._id?.month || '??'}</span>
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight">
                          {new Date(0, month._id?.month - 1).toLocaleString('default', { month: 'long' })}, {month._id?.year}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{month.sessions} Appointments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 italic text-lg">
                        {month.revenue?.toLocaleString() || 0} <span className="text-[10px] not-italic opacity-30">EGP</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-300 italic">No trend data available</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorFinance;