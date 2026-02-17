import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ArrowLeft, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mgmtApi from './mgmtApi';

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await mgmtApi.get('/appointments/all');
        // Only sum appointments that have been billed (completed)
        const billed = (res.data?.data || []).filter(a => a.status === 'completed');
        setTransactions(billed);
      } catch (err) {
        console.error("Finance Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.price) || 0), 0);

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-blue-500">Calculating Finances...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 transition-colors font-bold text-sm">
          <ArrowLeft size={16} /> BACK TO DASHBOARD
        </button>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <TrendingUp size={14} /> Global Clinic Revenue
            </p>
            <h2 className="text-6xl font-black tracking-tighter italic">
              {totalRevenue.toLocaleString()} <span className="text-xl font-normal opacity-40 not-italic">EGP</span>
            </h2>
          </div>
          <DollarSign size={180} className="absolute -right-10 -bottom-10 opacity-5 rotate-12" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3 font-black text-slate-800 uppercase tracking-widest text-sm">
            <Receipt size={18} className="text-blue-600" /> Billed History
          </div>
          <div className="divide-y divide-slate-50">
            {transactions.map(t => (
              <div key={t._id} className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{t.patientId?.username || 'Patient'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(t.date).toDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-600">+{t.price} <span className="text-xs">EGP</span></p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;