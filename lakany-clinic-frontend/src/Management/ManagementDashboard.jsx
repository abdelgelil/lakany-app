import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCcw, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { getAllAppointments, finalizeAppointment, handleNoShow } from './mgmtApi';
import LoadingSpinner from '../components/LoadingSpinner';

const ManagementDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Upcoming');
  
  // Modal State for Billing
  const [billingModal, setBillingModal] = useState({ isOpen: false, id: null, fee: "500" });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments();
      setAppointments(response.data.data || []);
      setError(null);
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 403 ? "Forbidden: Admin Access Required" : "Failed to sync with server";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // --- Handlers ---

  const openBillingModal = (id) => setBillingModal({ isOpen: true, id, fee: "500" });

  const submitBilling = async () => {
    const { id, fee } = billingModal;
    if (!fee || isNaN(fee)) return toast.error("Please enter a valid amount");

    const toastId = toast.loading("Processing payment...");
    try {
      await finalizeAppointment(id, Number(fee));
      toast.success("Billing completed!", { id: toastId });
      setBillingModal({ isOpen: false, id: null, fee: "500" });
      fetchAppointments();
    } catch (err) {
      toast.error("Billing failed", { id: toastId });
    }
  };

  const onNoShow = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-slate-800">Mark as No-Show?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await handleNoShow(id);
                toast.success("Marked as No-Show");
                fetchAppointments();
              } catch (e) { toast.error("Update failed"); }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
          >
            Confirm
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold">
            Cancel
          </button>
        </div>
      </div>
    ), { position: 'top-center', duration: 5000 });
  };

  // --- Logic ---

  const filteredAppointments = useMemo(() => {
    const groups = {
      Upcoming: ['pending', 'confirmed', 'upcoming'],
      Completed: ['completed'],
      Done: ['done'],
      Cancelled: ['cancelled', 'no-show']
    };
    return appointments.filter(apt => groups[activeTab].includes(apt.status));
  }, [activeTab, appointments]);

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-blue-50 text-blue-600 border-blue-100',
      done: 'bg-amber-50 text-amber-600 border-amber-100',
      completed: 'bg-green-50 text-green-600 border-green-100',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
      'no-show': 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return styles[status] || 'bg-gray-50 text-gray-600';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Management</h1>
          <p className="text-slate-500 font-medium">Clinic Operations & Billing</p>
        </div>
        <button 
          onClick={fetchAppointments} 
          className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 font-bold text-slate-700"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-100">
          {['Upcoming', 'Done', 'Completed', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table/Cards */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">Patient</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">Schedule</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-bold">No records found in {activeTab}</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{apt.patientId?.username || 'Unknown'}</p>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Phone size={12} /> {apt.patientId?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        {new Date(apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border uppercase ${getStatusStyle(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      {apt.status === 'done' && (
                        <button 
                          onClick={() => openBillingModal(apt._id)}
                          className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all inline-flex items-center gap-2"
                        >
                          <Wallet size={14} /> Finalize Billing
                        </button>
                      )}
                      {['pending', 'confirmed', 'upcoming'].includes(apt.status) && (
                        <button 
                          onClick={() => onNoShow(apt._id)}
                          className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                          title="Mark No-Show"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Billing Modal --- */}
      {billingModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-white">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Wallet size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Patient Billing</h2>
            <p className="text-slate-500 font-medium mb-6">Enter the final consultation fee to close this record.</p>
            
            <div className="relative mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">EGP</span>
              <input 
                type="number"
                value={billingModal.fee}
                onChange={(e) => setBillingModal({...billingModal, fee: e.target.value})}
                className="w-full pl-16 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black focus:ring-2 focus:ring-emerald-500/20 outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={submitBilling}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Complete Record
              </button>
              <button 
                onClick={() => setBillingModal({ isOpen: false, id: null, fee: "500" })}
                className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;