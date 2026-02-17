import React, { useState, useContext, useEffect } from 'react';
import { Plus, AlertCircle, XCircle } from 'lucide-react';
import { LanguageContext } from './LanguageContext';
import { useAvailability } from '../context/AvailabilityContext';
import toast from 'react-hot-toast';
import api from '../axios';
import BookingModal from './BookingModal';
import ConfirmationModal from './ConfirmationModal';

const BookAppointment = () => {
    const { language } = useContext(LanguageContext);
    const { availability } = useAvailability();
    const isDoctorAvailable = availability !== false;
    const isArabic = language === 'ar';

    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);

    const t = {
        en: {
            bookAppointment: 'Book Appointment',
            bookNewAppointment: 'Book a New Appointment',
            upcomingAppointments: 'Upcoming Appointments',
            noAppointments: 'No upcoming appointments.',
            cancel: 'Cancel',
            appointmentCancelled: 'Appointment cancelled successfully.',
            cancelFailed: 'Failed to cancel appointment.',
            loading: 'Loading...',
            confirmCancelTitle: 'Cancel Appointment?',
            confirmCancelMessage: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
            confirmCancelButton: 'Yes, Cancel',
            keepAppointmentButton: 'No, Keep it',
            doctorUnavailableTitle: 'Clinic Closed',
            doctorUnavailableMessage: 'The doctor is currently not accepting new appointments.',
        },
        ar: {
            bookAppointment: 'حجز موعد',
            bookNewAppointment: 'حجز موعد جديد',
            upcomingAppointments: 'المواعيد القادمة',
            noAppointments: 'لا توجد مواعيد قادمة.',
            cancel: 'إلغاء',
            appointmentCancelled: 'تم إلغاء الموعد بنجاح.',
            cancelFailed: 'فشل إلغاء الموعد.',
            loading: 'تحميل...',
            confirmCancelTitle: 'إلغاء الموعد؟',
            confirmCancelMessage: 'هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.',
            confirmCancelButton: 'نعم، إلغاء',
            keepAppointmentButton: 'لا، احتفظ به',
            doctorUnavailableTitle: 'العيادة مغلقة',
            doctorUnavailableMessage: 'الطبيب لا يقبل الحجوزات في الوقت الحالي.',
        },
    }[language];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const appointmentsRes = await api.get('/appointments/my-appointments');
                setAppointments(appointmentsRes.data?.data || []);
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to fetch appointments.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBookingSuccess = (newAppointment) => {
        setAppointments(prev => [newAppointment, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    const handleCancelClick = (id) => {
        setAppointmentToCancel(id);
        setIsConfirmModalOpen(true);
    };

    // Corrected cancellation handler
    const handleConfirmCancel = async () => {
        if (!appointmentToCancel) return;
        setIsConfirmModalOpen(false);

        // The API call to the correct, patient-authorized endpoint
        const promise = api.put(`/appointments/cancel/${appointmentToCancel}`);

        toast.promise(promise, {
            loading: 'Cancelling appointment...',
            success: (res) => {
                // Update UI optimistically based on the successful response
                setAppointments(prev => prev.map(apt => 
                    apt._id === appointmentToCancel ? res.data.data : apt
                ));
                setAppointmentToCancel(null);
                return t.appointmentCancelled;
            },
            error: (err) => {
                // The backend provides a specific error message for 403, 404, etc.
                return err.response?.data?.message || t.cancelFailed;
            },
        });
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">{t.bookAppointment}</h2>
                    <button
                        onClick={() => setIsBookingModalOpen(true)}
                        disabled={!isDoctorAvailable}
                        className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all ${!isDoctorAvailable ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        <Plus size={18} />
                        {t.bookNewAppointment}
                    </button>
                </div>

                {!isDoctorAvailable && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle size={20} />
                        <div>
                            <p className="font-bold">{t.doctorUnavailableTitle}</p>
                            <p className="text-sm">{t.doctorUnavailableMessage}</p>
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold mb-2">{t.upcomingAppointments}</h3>
                    {isLoading ? <p className="text-gray-500">{t.loading}</p>
                    : error ? <p className="text-red-500">{error}</p>
                    : appointments.filter(a => a.status === 'upcoming').length > 0 ? (
                        <ul className="space-y-3">
                            {appointments.filter(a => a.status === 'upcoming').map(apt => (
                                <li key={apt._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-gray-50 border border-gray-200 rounded-lg gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-800">{new Date(apt.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-sm text-gray-600">{new Date(apt.date).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {/* Updated Cancel Button */}
                                    <button
                                        onClick={() => handleCancelClick(apt._id)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 hover:text-red-700 transition-colors self-end sm:self-center"
                                        aria-label="Cancel Appointment"
                                    >
                                        <XCircle size={18} />
                                        <span>{t.cancel}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500">{t.noAppointments}</p>}
                </div>
            </div>

            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} onBookingSuccess={handleBookingSuccess} />
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmCancel} title={t.confirmCancelTitle} message={t.confirmCancelMessage} confirmText={t.confirmCancelButton} cancelText={t.keepAppointmentButton} isArabic={isArabic} />
        </>
    );
};

export default BookAppointment;