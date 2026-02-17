import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../axios';
import { LanguageContext } from './LanguageContext';
import useSyncStatus from '../hooks/useSyncStatus';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from  "react-datepicker";
import { ar } from 'date-fns/locale/ar';

// Register Arabic locale for DatePicker
registerLocale('ar', ar);

const translations = {
    en: {
        bookAppointment: 'Book an Appointment',
        step1: 'Step 1: Select Clinic',
        step2: 'Step 2: Select Date',
        step3: 'Step 3: Select a Time',
        janakleesClinic: 'Janaklees Clinic',
        janakleesSchedule: 'Sat, Mon, Wed (6pm - 10pm)',
        ramlClinic: 'Mahatet al Raml Clinic',
        ramlSchedule: 'Sat, Tue (1pm - 2pm)',
        loadingSlots: 'Loading slots...',
        noSlots: 'No available slots for this day.',
        confirmAppointment: 'Confirm Appointment',
        booking: 'Booking...',
        booked: 'Booked',
        // Toasts
        noDoctorError: 'System Error: No doctors could be loaded.',
        fetchDoctorError: 'System Error: Could not fetch doctor information.',
        fetchSlotsError: 'Failed to fetch available slots.',
        noDoctorSubmitError: 'System Error: Doctor not loaded. Please refresh.',
        allStepsError: 'Please complete all booking steps.',
        bookingInProgress: 'Booking appointment...',
        bookingSuccess: 'Appointment booked successfully!',
        bookingFailed: 'Failed to book appointment.',
        doctorUnavailableTitle: 'Clinic Closed',
        doctorUnavailableMessage: 'The doctor is not accepting appointments at this time. Please check back later.',
    },
    ar: {
        bookAppointment: 'حجز موعد',
        step1: 'الخطوة ١: اختر العيادة',
        step2: 'الخطوة ٢: اختر التاريخ',
        step3: 'الخطوة ٣: اختر الوقت',
        janakleesClinic: 'عيادة جناكليس',
        janakleesSchedule: 'السبت، الإثنين، الأربعاء (٦م - ١٠م)',
        ramlClinic: 'عيادة محطة الرمل',
        ramlSchedule: 'السبت، الثلاثاء (١م - ٢م)',
        loadingSlots: 'جاري تحميل المواعيد...',
        noSlots: 'لا توجد مواعيد متاحة في هذا اليوم.',
        confirmAppointment: 'تأكيد الحجز',
        booking: 'جاري الحجز...',
        booked: 'محجوز',
        // Toasts
        noDoctorError: 'خطأ في النظام: لا يمكن تحميل بيانات الطبيب.',
        fetchDoctorError: 'خطأ في النظام: لا يمكن جلب معلومات الطبيب.',
        fetchSlotsError: 'فشل في جلب المواعيد المتاحة.',
        noDoctorSubmitError: 'خطأ في النظام: لم يتم تحميل الطبيب. يرجى التحديث.',
        allStepsError: 'يرجى إكمال جميع خطوات الحجز.',
        bookingInProgress: 'جاري حجز الموعد...',
        bookingSuccess: 'تم حجز الموعد بنجاح!',
        bookingFailed: 'فشل حجز الموعد.',
        doctorUnavailableTitle: 'العيادة مغلقة',
        doctorUnavailableMessage: 'الطبيب لا يقبل الحجوزات في الوقت الحالي. يرجى المحاولة مرة أخرى في وقت لاحق.',
    }
};

const BookingModal = ({ isOpen, onClose, onBookingSuccess }) => {
    const { language } = useContext(LanguageContext);
    const isArabic = language === 'ar';
    const { isClosed } = useSyncStatus();
    const t = translations[language];

    // Form state
    const [step, setStep] = useState(1);
    const [selectedClinic, setSelectedClinic] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [visitType, setVisitType] = useState('Checkup');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [doctorId, setDoctorId] = useState(null);
    const clinicSchedules = {
        [t.janakleesClinic]: { days: [6, 1, 3] },
        [t.ramlClinic]: { days: [6, 2] },
    };
    
    useEffect(() => {
        const fetchDoctor = async () => {
            // This effect now only fetches the doctor's ID for the booking payload.
            // The availability status is handled globally by AvailabilityContext.
            try {
                const response = await api.get('/users/doctors');
                if (response.data && response.data.data.length > 0) {
                    const doctor = response.data.data[0];
                    setDoctorId(doctor._id);
                } else {
                    toast.error(t.noDoctorError);
                }
            } catch (error) {
                toast.error(t.fetchDoctorError);
                console.error("Failed to fetch doctors:", error);
            }
        };
        if(isOpen) fetchDoctor();
    }, [isOpen, t.noDoctorError, t.fetchDoctorError]);

    useEffect(() => {
        if (selectedClinic && selectedDate && doctorId) {
            const fetchSlots = async () => {
                setSlotsLoading(true);
                setSelectedTime('');
                const clinicApiName = selectedClinic === t.janakleesClinic ? 'Janaklees Clinic' : 'Mahatet al Raml Clinic';
                try {
                    // Fix timezone offset issue to ensure correct date is sent
                    const offset = selectedDate.getTimezoneOffset();
                    const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
                    const dateISO = adjustedDate.toISOString().split('T')[0];
                    const response = await api.get(`/appointments/available-slots?date=${dateISO}&clinicName=${encodeURIComponent(clinicApiName)}&doctorId=${doctorId}`);
                    setAvailableSlots(response.data.data || []);
                } catch (error) {
                    toast.error(t.fetchSlotsError);
                    setAvailableSlots([]);
                } finally {
                    setSlotsLoading(false);
                }
            };
            fetchSlots();
        }
    }, [selectedClinic, selectedDate, doctorId, t]);

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour12 = ((h + 11) % 12 + 1);
        return `${String(hour12).padStart(2, '0')}:${minutes} ${suffix}`;
    };
    
    const handleClinicSelect = (clinic) => {
        setSelectedClinic(clinic);
        setSelectedDate(null);
        setSelectedTime('');
        setAvailableSlots([]);
        setStep(2);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime('');
        setStep(3);
    };

    const isDayDisabled = (date) => {
        const day = date.getDay();
        const schedule = clinicSchedules[selectedClinic];
        if (!schedule) return true;
        return !schedule.days.includes(day);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!doctorId) {
            toast.error(t.noDoctorSubmitError);
            setIsLoading(false);
            return;
        }

        if (!selectedClinic || !selectedDate || !selectedTime || !visitType) {
            toast.error(t.allStepsError);
            setIsLoading(false);
            return;
        }

        const [hours, minutes] = selectedTime.split(':');
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const clinicApiName = selectedClinic === t.janakleesClinic ? 'Janaklees Clinic' : 'Mahatet al Raml Clinic';
        const bookingData = {
            doctorId: doctorId,
            clinicLocation: clinicApiName,
            date: appointmentDate.toISOString(),
            type: visitType,
        };

        const toastId = toast.loading(t.bookingInProgress);
        try {
            const response = await api.post('/appointments', bookingData);
            toast.success(t.bookingSuccess, { id: toastId });
            onBookingSuccess(response.data.data);
            resetAndClose();
        } catch (err) {
            toast.error(err.response?.data?.message || t.bookingFailed, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetAndClose = () => {
        setStep(1);
        setSelectedClinic('');
        setSelectedDate(null);
        setSelectedTime('');
        setAvailableSlots([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={resetAndClose} dir={isArabic ? 'rtl' : 'ltr'}
                >
                    <motion.div
                        className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col min-h-[300px] max-h-screen ${isArabic ? 'font-arabic' : ''}`}
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex-shrink-0 p-6 border-b border-gray-200">
                             <button onClick={resetAndClose} className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} text-gray-400 hover:text-gray-600 transition-colors z-10`}>
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800">{t.bookAppointment}</h2>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-6">
                            {isClosed && (
                                <div className="p-4 mb-6 text-center bg-red-50 text-red-700 border border-red-200 rounded-lg">
                                    <p className="font-bold">{t.doctorUnavailableTitle}</p>
                                    <p className="text-sm">{t.doctorUnavailableMessage}</p>
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <fieldset disabled={isClosed} className="space-y-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><MapPin size={18} className="text-blue-600"/><span>{t.step1}</span></h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <button type="button" onClick={() => handleClinicSelect(t.janakleesClinic)} className={`p-4 border rounded-lg text-left transition-all ${selectedClinic === t.janakleesClinic ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-gray-50 hover:border-gray-300'}`}>
                                                        <p className="font-bold text-gray-800">{t.janakleesClinic}</p>
                                                        <p className="text-sm text-gray-500">{t.janakleesSchedule}</p>
                                                    </button>
                                                    <button type="button" onClick={() => handleClinicSelect(t.ramlClinic)} className={`p-4 border rounded-lg text-left transition-all ${selectedClinic === t.ramlClinic ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-gray-50 hover:border-gray-300'}`}>
                                                        <p className="font-bold text-gray-800">{t.ramlClinic}</p>
                                                        <p className="text-sm text-gray-500">{t.ramlSchedule}</p>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {step >= 2 && selectedClinic && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><Calendar size={18} className="text-blue-600"/><span>{t.step2}</span></h3>
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        onChange={handleDateSelect}
                                                        filterDate={isDayDisabled}
                                                        minDate={new Date()}
                                                        inline
                                                        className="w-full"
                                                        locale={language}
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    {step >= 3 && selectedDate && (
                                    <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }}>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><Clock size={18} className="text-blue-600"/><span>{t.step3}</span></h3>
                                            {slotsLoading ? <p>{t.loadingSlots}</p> : (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                                    {availableSlots.length > 0 ? availableSlots.map(slot => (
                                                        <button
                                                            key={slot.time}
                                                            type="button"
                                                            disabled={slot.available === false}
                                                            onClick={() => slot.available === true && setSelectedTime(slot.time)}
                                                            className={`p-2 border rounded-lg text-sm font-semibold transition-all h-16 flex flex-col items-center justify-center
                                                                ${slot.available === false ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                                                                selectedTime === slot.time ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500' :
                                                                'bg-white hover:bg-blue-50 hover:border-blue-300'}`
                                                            }
                                                        >
                                                            {slot.available === true ? (
                                                                <span>{formatTime(slot.time)}</span>
                                                            ) : (
                                                                <span className="font-bold">{t.booked}</span>
                                                            )}
                                                        </button>
                                                    )) : <p className="col-span-full text-gray-500">{t.noSlots}</p>}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                    
                                    {selectedTime && (
                                        <div className="pt-4 pb-20 md:pb-0">
                                            <motion.button
                                                type="submit"
                                                disabled={isLoading || isClosed}
                                                className="w-full py-3 mt-4 text-base font-bold text-white rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-400"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            >
                                                {isLoading ? t.booking : t.confirmAppointment}
                                            </motion.button>
                                        </div>
                                    )}
                                </fieldset>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
