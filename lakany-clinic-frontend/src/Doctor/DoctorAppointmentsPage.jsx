import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../patient/LanguageContext';
import { Search, Calendar, Phone, Clock, XCircle, Filter, Loader2 } from 'lucide-react';
import DoctorNavbar from './DoctorNavbar'; 
import { Toaster, toast } from 'react-hot-toast';

// ✅ Using Named Imports from your doctorApi
import { getDoctorAppointments, updateAppointment } from './doctorApi';

const DoctorAppointmentsPage = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const isArabic = language === 'ar';

  const translations = {
    en: {
      title: "All Appointments",
      searchPlaceholder: 'Search by Name, Phone, or Date...',
      noAppointmentsFound: 'No matching appointments found.',
      all: 'All',
      upcoming: 'Upcoming',
      completed: 'Completed',
      cancelled: 'Cancelled',
      viewDetails: 'View Patient Record',
      cancelAppointment: 'Cancel Appointment',
      appointmentCancelled: 'Appointment Cancelled',
      loading: 'Loading appointments...',
      confirmCancel: 'Are you sure you want to cancel this appointment?',
      cancelling: 'Cancelling...',
      cancelError: 'Failed to cancel appointment.'
    },
    ar: {
      title: 'جميع المواعيد',
      searchPlaceholder: 'البحث بالاسم، الهاتف، أو التاريخ...',
      noAppointmentsFound: 'لم يتم العثور على مواعيد مطابقة.',
      all: 'الكل',
      upcoming: 'قادم',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      viewDetails: 'عرض سجل المريض',
      cancelAppointment: 'إلغاء الموعد',
      appointmentCancelled: 'تم إلغاء الموعد بنجاح',
      loading: 'جاري تحميل المواعيد...',
      confirmCancel: 'هل أنت متأكد من إلغاء هذا الموعد؟',
      cancelling: 'جاري الإلغاء...',
      cancelError: 'فشل في إلغاء الموعد'
    }
  };
  const t = translations[language];

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getDoctorAppointments();
        const data = Array.isArray(response) ? response : (response?.data || []);
        setAppointments(data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(isArabic ? "فشل تحميل المواعيد" : "Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [isArabic]);

  // --- 2. Cancel Action with React Hot Toast Promise ---
  const handleCancel = async (id) => {
    if (!window.confirm(t.confirmCancel)) return;

    // We define the promise logic
    const cancelAction = async () => {
      await updateAppointment(id, { status: 'cancelled' });
      
      // Update local state if successful
      setAppointments(prev =>
        prev.map(apt => apt._id === id ? { ...apt, status: 'cancelled' } : apt)
      );
    };

    // Trigger the toast promise
    toast.promise(cancelAction(), {
      loading: t.cancelling,
      success: t.appointmentCancelled,
      error: t.cancelError,
    });
  };

  // --- 3. Filtering Logic ---
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    if (statusFilter !== 'all') {
      result = result.filter(apt => (apt.status || 'upcoming').toLowerCase() === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(apt => {
        const name = apt.patientId?.username || apt.patientId?.name || 'Unknown';
        const phone = apt.patientId?.phone || '';
        const date = apt.date || '';
        return name.toLowerCase().includes(query) || phone.includes(query) || date.includes(query);
      });
    }

    return [...result].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [searchQuery, statusFilter, appointments]);

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <Toaster position="top-center" />
      <DoctorNavbar />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.title}</h1>
          <p className="text-slate-500 font-medium mt-1">{filteredAppointments.length} {isArabic ? 'مواعيد مسجلة' : 'records found'}</p>
        </header>

        {/* --- Controls Section --- */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm ${isArabic ? 'pr-12' : 'pl-12'}`}
            />
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isArabic ? 'right-4' : 'left-4'}`} />
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap ${
                  statusFilter === tab 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* --- Appointments List --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-400 font-black tracking-widest uppercase text-xs">{t.loading}</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAppointments.map(apt => {
              const dateObj = new Date(apt.date);
              const status = apt.status || 'upcoming';
              const patientName = apt.patientId?.username || apt.patientId?.name || 'Unknown Patient';

              return (
                <div key={apt._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {patientName}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase mt-2 border ${getStatusClasses(status)}`}>
                        {t[status] || status}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 text-slate-900 font-black bg-slate-50 px-3 py-2 rounded-xl text-sm border border-slate-100`}>
                       <Clock size={14} className="text-blue-600" />
                       {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                         <Calendar size={16} />
                      </div>
                      <span className="font-bold text-sm">{dateObj.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <Phone size={16} />
                      </div>
                      <span className="font-bold text-sm">{apt.patientId?.phone || '---'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => {
                        const patientId = apt.patientId?._id;
                        if (patientId) {
                          navigate(`/doctor/patient-record-details/${patientId}`, { 
                            state: { appointmentId: apt._id } 
                          });
                        } else {
                          toast.error(isArabic ? "بيانات المريض ناقصة" : "Patient details missing.");
                        }
                      }}
                      className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                    >
                      {t.viewDetails}
                    </button>
                    
                    {status === 'upcoming' && (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="w-12 flex items-center justify-center text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                        title={t.cancelAppointment}
                      >
                        <XCircle size={22} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
            <Filter size={64} className="mx-auto text-slate-100 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{t.noAppointmentsFound}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;