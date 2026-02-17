import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Phone, 
  UserCircle,
  CheckCircle2,
  CalendarDays,
  X
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast'; 
import { getDoctorAppointments, updateAppointment } from './doctorApi';
import DoctorNavbar from './DoctorNavbar';
import LoadingSpinner from '../components/LoadingSpinner';

const AllAppointments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await getDoctorAppointments();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Failed to load today's schedule", { duration: 2000 });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // --- 📅 FILTER: ONLY SHOW TODAY'S ACTIVE APPOINTMENTS ---
  const todayData = useMemo(() => {
    const todayStr = new Date().toDateString();
    return appointments.filter(apt => {
      const aptDateStr = new Date(apt.date).toDateString();
      return aptDateStr === todayStr && apt.status !== 'cancelled';
    });
  }, [appointments]);

  // --- ❌ HANDLE CANCELLATION (Confirmation Dialog) ---
  const handleCancel = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <span className="font-semibold text-slate-800 text-sm">Cancel this appointment?</span>
        <div className="flex gap-2">
          <button
            onClick={() => { 
              toast.dismiss(t.id); 
              executeCancellation(id); 
            }}
            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    ), { 
      duration: 2000, // Notification vanishes after 2s if no action is taken
      position: 'top-center' 
    });
  };

  // --- ⚡ EXECUTE API CALL ---
  const executeCancellation = async (id) => {
    toast.promise(
      updateAppointment(id, { status: 'cancelled' }),
      {
        loading: 'Updating...',
        success: () => {
          setAppointments(prev => prev.filter(a => a._id !== id));
          return 'Appointment removed.';
        },
        error: 'Failed to update status.',
      },
      { 
        duration: 2000, // Success/Error messages disappear after 2s
        style: { 
          borderRadius: '16px', 
          background: '#1e293b', 
          color: '#fff',
          fontWeight: 'bold'
        },
        success: { icon: <X size={18} className="text-red-400" /> }
      }
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
      <Toaster position="top-right" />
      <DoctorNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <CalendarDays size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Today's Schedule</h1>
              <p className="text-slate-500 font-medium text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse"></span>
            <span className="text-slate-700 font-bold text-sm">
              {todayData.length} Patients Remaining
            </span>
          </div>
        </div>

        {/* --- TODAY'S APPOINTMENTS GRID --- */}
        {todayData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {todayData.map((apt) => (
              <div key={apt._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {apt.patientId?.username || 'Guest Patient'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                        <Clock size={14} className="text-blue-600" />
                        <span className="text-xs font-black text-blue-700 uppercase">
                          {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/doctor/patient-record-details/${apt.patientId?._id}`)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-inner"
                    title="View Full Profile"
                  >
                    <UserCircle size={22} />
                  </button>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                    <Phone size={18} className="text-slate-300" /> 
                    {apt.patientId?.phone || 'No phone provided'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/doctor/appointment/${apt._id}`)}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Start Session
                  </button>
                  
                  <button
                    onClick={() => handleCancel(apt._id)}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-50 hover:bg-red-500 hover:text-white transition-all group/btn"
                    title="Cancel"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <CalendarDays size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Patients Scheduled</h3>
            <p className="text-slate-400 max-w-xs mx-auto">
              Your schedule for today is currently empty. Relax or check back later.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllAppointments;