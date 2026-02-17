import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Calendar, Clock, CheckCircle } from 'lucide-react';
import mgmtApi, { finalizeAppointment } from './mgmtApi';
import toast, { Toaster } from 'react-hot-toast';

const Collection = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await mgmtApi.get('/enterprise/appointments');
      // Filter for appointments that need collection
      const pendingCollection = (response.data?.data || []).filter(apt => apt.status === 'done');
      setAppointments(pendingCollection);
    } catch (error) {
      toast.error('Failed to load appointments for collection.');
      if (error.response?.status === 401) {
        localStorage.removeItem('management_token');
        navigate('/management-login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('management_token');
    if (!token) {
      navigate('/management-login', { replace: true });
      return;
    }
    fetchAppointments();
  }, [navigate]);

  const handleFinalize = async (id, fee) => {
    if (!fee || fee <= 0) {
      toast.error("Cannot collect payment with a zero or negative amount.");
      return;
    }
    try {
      await finalizeAppointment(id, fee);
      toast.success('Payment collected and appointment finalized!');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to collect payment.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <Toaster position="top-center" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Collections</h1>
        <p className="text-slate-500">Confirm collection for appointments marked as 'Done'.</p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading collections...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <CheckCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            No pending collections.
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{apt.patientId?.username || 'Unknown Patient'}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(apt.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <div className="text-sm text-slate-500">Amount</div>
                  <div className="font-bold text-lg text-slate-800">EGP {apt.price?.toLocaleString() || 0}</div>
                </div>
                <button
                  onClick={() => handleFinalize(apt._id, apt.price)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                >
                  <DollarSign size={18} />
                  <span>Collect</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Collection;