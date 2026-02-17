import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../patient/LanguageContext';
import { Calendar, CheckCircle, Clock, User, XCircle, Ban, CreditCard, Coins, Flag, AlertCircle, UserX, LogOut, UserPlus, Globe } from 'lucide-react'; // Added XCircle for Cancel and Ban
import toast from 'react-hot-toast';
import mgmtApi, { finalizeAppointment, cancelAppointment, flagNoShow } from './mgmtApi';

const AppointmentCard = ({
  appointment,
  t,
  isManagementUser,
  feesInput,
  handleFeeInputChange,
  handleFinalizePayment,
  handleCancelAppointment,
  isArabic,
  noShowId,
  noShowNote,
  setNoShowNote,
  initiateNoShow,
  cancelNoShow,
  submitNoShow,
  initiateCancel,
}) => {
  const isUpcoming = appointment.status === 'Upcoming';
  const isClinicalDone = appointment.status === 'Clinical Done';
  const isFinished = appointment.status === 'Finished';
  const isCancelled = appointment.status === 'Cancelled';
  const isNoShow = appointment.status === 'No-Show';

  let statusColorClass = 'text-slate-500';
  let statusBgClass = 'bg-slate-100';
  let iconColorClass = 'text-slate-400';

  if (isUpcoming) {
    statusColorClass = 'text-green-600';
    statusBgClass = 'bg-green-50';
    iconColorClass = 'text-blue-600';
  } else if (isClinicalDone) {
    statusColorClass = 'text-blue-600';
    statusBgClass = 'bg-blue-50';
    iconColorClass = 'text-blue-600';
  } else if (isFinished) {
    statusColorClass = 'text-slate-700'; // Darker gray for finished
    statusBgClass = 'bg-slate-200';
    iconColorClass = 'text-slate-500';
  } else if (isCancelled) {
    statusColorClass = 'text-red-600';
    statusBgClass = 'bg-red-50';
    iconColorClass = 'text-red-600';
  } else if (isNoShow) {
    statusColorClass = 'text-red-700';
    statusBgClass = 'bg-red-50 border border-red-200';
    iconColorClass = 'text-red-500';
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isNoShow ? <UserX size={20} className={iconColorClass} /> : <User size={20} className={iconColorClass} />}
          <h3 className="text-lg font-semibold text-slate-900">{appointment.patientName}</h3>
          {isNoShow && appointment.note && (
            <div className="group relative flex items-center ml-2">
              <Flag size={16} className="text-red-500 cursor-help" />
              <div className={`absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10 ${isArabic ? 'right-0' : 'left-0'}`}>
                {appointment.note}
              </div>
            </div>
          )}
        </div>
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${statusBgClass} ${statusColorClass}`}>
          {appointment.status === 'No-Show' 
            ? t.noShowStatus 
            : (t[appointment.status.toLowerCase() + 'Filter'] || appointment.status)
          }
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-slate-600">
        <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
          <Calendar size={16} className={iconColorClass} />
          <span>{t.date}: {appointment.date}</span>
        </div>
        <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
          <Clock size={16} className={iconColorClass} />
          <span>{t.time}: {appointment.time}</span>
        </div>
        {isUpcoming && isManagementUser && noShowId !== appointment.id && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto">
            <button
              onClick={() => initiateNoShow(appointment.id)}
              className="bg-slate-100 text-slate-600 font-bold py-1.5 px-3 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 text-sm"
            >
              <Flag size={16} />
              {t.flagNoShow}
            </button>
            <button
              onClick={() => initiateCancel(appointment.id)}
              className="bg-red-500 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 text-sm"
            >
              <XCircle size={16} />
              {t.cancelAppointment}
            </button>
          </div>
        )}
      </div>

      {noShowId === appointment.id && (
        <div className="mt-3 border-t border-slate-100 pt-3 bg-slate-50 p-3 rounded-lg">
          <label className="block text-xs font-semibold text-slate-700 mb-2">{t.noShowNote}</label>
          <textarea
            value={noShowNote}
            onChange={(e) => setNoShowNote(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md text-sm mb-3 focus:border-blue-500 outline-none"
            rows="2"
            placeholder={t.patientDidNotArrive}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={cancelNoShow} className="text-slate-500 text-sm px-3 py-1 hover:bg-slate-200 rounded transition-colors">{t.cancel}</button>
            <button onClick={() => submitNoShow(appointment.id)} className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition-colors">{t.confirm}</button>
          </div>
        </div>
      )}

      {isClinicalDone && isManagementUser && (
        <div className="mt-4 border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1 w-full flex items-center gap-2">
            <Coins size={20} className="text-blue-600" />
            <input
              type="number"
              placeholder={t.enterFee}
              value={feesInput[appointment.id] || ''}
              onChange={(e) => handleFeeInputChange(appointment.id, e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-md focus:border-blue-500 outline-none transition-colors"
              min="0"
            />
          </div>
          <button
            onClick={() => handleFinalizePayment(appointment.id)}
            className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            {t.finalizePayment}
          </button>
        </div>
      )}

      {isFinished && appointment.fee && (
        <div className="mt-4 border-t border-slate-100 pt-3 flex items-center gap-2 text-slate-700 font-semibold">
          <CheckCircle size={20} className="text-green-600" />
          <span>{t.status}: {t.finishedFilter} - {t.enterFee}: ${appointment.fee.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

const Management = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // Default to all
  const [feesInput, setFeesInput] = useState({});
  const [noShowId, setNoShowId] = useState(null);
  const [noShowNote, setNoShowNote] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Patient Request');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // Try enterprise route first, then fallback to appointments/all
        let response;
        try {
          response = await mgmtApi.get('/enterprise/appointments');
        } catch (err) {
          response = await mgmtApi.get('/appointments/all');
        }
        const data = response.data?.data || response.data || [];
        const mapped = (Array.isArray(data) ? data : []).map(apt => ({
          id: apt._id,
          patientName: apt.patientId?.username || 'Unknown',
          date: new Date(apt.date).toLocaleDateString(),
          time: new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Unknown', // Capitalize status
          fee: apt.fee || apt.price,
          note: apt.note,
        }));
        setAppointments(mapped);
      } catch (error) {
        console.error("Failed to load appointments:", error);
        toast.error("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const translations = {
    en: {
      dashboardTitle: 'Management Dashboard',
      upcomingAppointments: 'Upcoming Appointments',
      finishedAppointments: 'Finished Appointments',
      clinicalDoneAppointments: 'Clinical Done Appointments',
      cancelledAppointments: 'Cancelled Appointments',
      allAppointments: 'All Appointments',
      patientName: 'Patient Name',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      noAppointments: 'No appointments to display.',
      back: 'Back',
      loginRequired: 'You must be logged in to access this page.',
      upcomingFilter: 'Upcoming',
      finishedFilter: 'Finished',
      clinicalDoneFilter: 'Clinical Done',
      cancelledFilter: 'Cancelled',
      allFilter: 'All',
      cancelAppointment: 'Cancel Appointment',
      cancelSuccess: 'Appointment cancelled successfully!',
      cancelError: 'Could not cancel appointment.',
      alreadyCancelled: 'Appointment is already cancelled.',
      enterFee: 'Enter Fee', // Still needed for the Finished appointment display in Management.jsx
      finalizePayment: 'Finalize Payment',
      paymentFinalizedSuccess: 'Payment finalized successfully!',
      invalidFee: 'Please enter a valid fee.',
      flagNoShow: 'Flag as No-Show',
      noShowNote: 'No-Show Note (Optional)',
      patientDidNotArrive: 'Patient did not arrive',
      noShowStatus: 'No-Show',
      confirm: 'Confirm',
      cancel: 'Cancel',
      noShowSuccess: 'Appointment flagged as No-Show',
      logout: 'Logout',
      logoutSuccess: 'Logged out successfully!',
      yes: 'Yes',
      no: 'No',
      selectCancelReason: 'Select Cancellation Reason',
      patientRequest: 'Patient Request',
      doctorOrder: 'Doctor\'s Order',
      addPatient: 'Add Patient',
    },
    ar: {
      dashboardTitle: 'لوحة تحكم الإدارة',
      upcomingAppointments: 'المواعيد القادمة',
      finishedAppointments: 'المواعيد المنتهية',
      clinicalDoneAppointments: 'المواعيد المكتملة سريرياً',
      cancelledAppointments: 'المواعيد الملغاة',
      allAppointments: 'جميع المواعيد',
      patientName: 'اسم المريض',
      date: 'التاريخ',
      time: 'الوقت',
      status: 'الحالة',
      noAppointments: 'لا توجد مواعيد لعرضها.',
      back: 'رجوع',
      loginRequired: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة.',
      upcomingFilter: 'القادمة',
      finishedFilter: 'المنتهية',
      clinicalDoneFilter: 'المكتملة سريرياً',
      cancelledFilter: 'ملغاة',
      allFilter: 'الكل',
      cancelAppointment: 'إلغاء الموعد',
      cancelSuccess: 'تم إلغاء الموعد بنجاح!',
      cancelError: 'تعذر إلغاء الموعد.',
      alreadyCancelled: 'الموعد ملغى بالفعل.',
      enterFee: 'أدخل الرسوم', // Still needed for the Finished appointment display in Management.jsx
      finalizePayment: 'إنهاء الدفع',
      paymentFinalizedSuccess: 'تم إنهاء الدفع بنجاح!',
      invalidFee: 'الرجاء إدخال رسوم صحيحة.',
      flagNoShow: 'تسجيل عدم الحضور',
      noShowNote: 'ملاحظة عدم الحضور (اختياري)',
      patientDidNotArrive: 'المريض لم يحضر',
      noShowStatus: 'لم يحضر',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      noShowSuccess: 'تم تسجيل عدم الحضور',
      logout: 'تسجيل الخروج',
      logoutSuccess: 'تم تسجيل الخروج بنجاح!',
      yes: 'نعم',
      no: 'لا',
      selectCancelReason: 'اختر سبب الإلغاء',
      patientRequest: 'طلب المريض',
      doctorOrder: 'أمر الطبيب',
      addPatient: 'إضافة مريض',
    },
  };
  const t = translations[language];

  const handleLogout = () => {
    localStorage.removeItem('management_token');
    localStorage.removeItem('management_user');
    localStorage.removeItem('management_userRole');
    toast.success(t.logoutSuccess);
    navigate('/management-login', { replace: true });
  };

  // Filter and sort appointments using useMemo
  const filteredAndSortedAppointments = useMemo(() => {
    let currentAppointments = [...appointments];

    // Filter based on activeFilter
    if (activeFilter === 'upcoming') {
      currentAppointments = currentAppointments.filter(apt => apt.status.toLowerCase() === 'upcoming');
    } else if (activeFilter === 'finished') {
      currentAppointments = currentAppointments.filter(apt => apt.status.toLowerCase() === 'finished');
    } else if (activeFilter === 'clinical_done') {
        currentAppointments = currentAppointments.filter(apt => apt.status.toLowerCase() === 'clinical done');
    } else if (activeFilter === 'cancelled') {
        currentAppointments = currentAppointments.filter(apt => apt.status === 'Cancelled');
    }

    // Sort order: Upcoming, Clinical Done, Finished, Cancelled, then by date, then by time
    currentAppointments.sort((a, b) => {
      const statusOrder = { 'Upcoming': 1, 'Clinical Done': 2, 'Finished': 3, 'Cancelled': 4 };
      const statusA = statusOrder[a.status] || 99; // Fallback for unknown statuses
      const statusB = statusOrder[b.status] || 99;

      if (statusA !== statusB) return statusA - statusB;

      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      return a.time.localeCompare(b.time);
    });

    return currentAppointments;
  }, [appointments, activeFilter]);

  const initiateNoShow = (id) => {
    setNoShowId(id);
    setNoShowNote('');
  };

  const cancelNoShow = () => {
    setNoShowId(null);
    setNoShowNote('');
  };

  const submitNoShow = async (id) => {
    try {
      await flagNoShow(id, noShowNote || t.patientDidNotArrive);
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'No-Show', note: noShowNote || t.patientDidNotArrive } : apt));
      toast.success(t.noShowSuccess);
      cancelNoShow();
    } catch (error) {
      toast.error('Failed to flag as No-Show.');
    }
  };

  const initiateCancel = (id) => {
    setCancelId(id);
    setCancelReason('Patient Request'); // Default
  };

  const confirmCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelAppointment(cancelId, cancelReason);
      setAppointments(prev => prev.map(apt => apt.id === cancelId ? { ...apt, status: 'Cancelled', cancellationReason: cancelReason } : apt));
      toast.success(t.cancelSuccess);
      setCancelId(null);
    } catch (error) {
      toast.error('Failed to cancel appointment.');
    }
  };

  const closeCancelModal = () => {
    setCancelId(null);
  };

  const handleFeeInputChange = (id, value) => { // This function is correct
    setFeesInput(prev => ({ ...prev, [id]: value }));
  };

  const handleFinalizePayment = async (appointmentId) => {
    const fee = parseFloat(feesInput[appointmentId]);

    if (isNaN(fee) || fee <= 0) {
      toast.error(t.invalidFee);
      return;
    }

    try {
      await finalizeAppointment(appointmentId, fee);
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'Finished', fee } : apt));
      toast.success(t.paymentFinalizedSuccess);
      setFeesInput(prev => {
          const newState = { ...prev };
          delete newState[appointmentId];
          return newState;
      });
    } catch (error) {
      toast.error('Failed to finalize payment.');
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{t.dashboardTitle}</h1>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={toggleLanguage}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors text-sm sm:text-base"
            >
              <Globe size={20} />
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <button
              onClick={() => navigate('/management/add-patient')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <UserPlus size={20} />
              {t.addPatient}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              <LogOut size={20} />
              {t.logout}
            </button>
          </div>
        </header>

        {/* Filter Buttons */}
        <div className="flex justify-start gap-2 sm:gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.allFilter}
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'upcoming'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.upcomingFilter}
          </button>
          <button
            onClick={() => setActiveFilter('clinical_done')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'clinical_done'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.clinicalDoneFilter}
          </button>
          <button
            onClick={() => setActiveFilter('finished')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'finished'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.finishedFilter}
          </button>
          <button
            onClick={() => setActiveFilter('cancelled')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'cancelled'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.cancelledFilter}
          </button>
        </div>

        <div>
          {loading ? <p className="text-center text-slate-500">{t.loading}</p> : filteredAndSortedAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  t={t}
                  feesInput={feesInput}
                  handleFeeInputChange={handleFeeInputChange}
                  handleFinalizePayment={handleFinalizePayment}
                  isArabic={isArabic}
                  noShowId={noShowId}
                  noShowNote={noShowNote}
                  setNoShowNote={setNoShowNote}
                  initiateCancel={initiateCancel}
                  initiateNoShow={initiateNoShow}
                  cancelNoShow={cancelNoShow}
                  submitNoShow={submitNoShow}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 text-lg font-medium">{t.noAppointments}</p>
            </div>
          )}
        </div>

        {/* Cancellation Modal */}
        {cancelId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{t.selectCancelReason}</h3>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value="Patient Request" 
                    checked={cancelReason === 'Patient Request'}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-slate-700 font-medium">{t.patientRequest}</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value="Doctor's Order" 
                    checked={cancelReason === 'Doctor\'s Order'}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-slate-700 font-medium">{t.doctorOrder}</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={closeCancelModal}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;