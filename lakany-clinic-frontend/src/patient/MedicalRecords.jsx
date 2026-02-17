import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import toast from 'react-hot-toast';
import api from '../axios';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, X, Calendar, FileText, ChevronRight, Inbox } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LocationModal = ({ isOpen, onClose, isArabic, t }) => {
    // This modal component is well-structured, no changes needed here.
    if (!isOpen) return null;

    const locations = {
        janaklees: 'https://www.google.com/maps/search/?api=1&query=5+Dr+Mohamed+Sabry+St,+Janaklees,+Alexandria,+Egypt',
        raml: 'https://www.google.com/maps/search/?api=1&query=31.201669,29.900786',
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                dir={isArabic ? 'rtl' : 'ltr'}
            >
                <motion.div
                    className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 relative">
                        <button onClick={onClose} className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}>
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">{t.modalTitle}</h3>
                        <div className="space-y-4">
                            <a href={locations.janaklees} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg">{t.janakleesButton}</a>
                            <a href={locations.raml} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg">{t.ramlButton}</a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const getStatusBadgeStyle = (status) => {
    switch (status) {
        case 'completed':
        case 'done':
            return 'bg-green-100 text-green-800';
        case 'upcoming':
        case 'confirmed':
            return 'bg-blue-100 text-blue-800';
        case 'cancelled':
        case 'no-show':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const RecordItem = ({ apt, language, onNavigate }) => {
    const hasRecord = apt.medicalRecord && (apt.medicalRecord.medicalAdvice || apt.medicalRecord.prescription);
    const date = new Date(apt.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <li
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-shadow hover:shadow-md cursor-pointer"
            onClick={() => onNavigate(`/patient/records/${apt._id}`)}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${hasRecord ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FileText size={20} className={hasRecord ? 'text-blue-600' : 'text-gray-500'} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{date}</p>
                        <p className={`text-sm font-semibold capitalize px-2 py-0.5 mt-1 rounded-full inline-block ${getStatusBadgeStyle(apt.status)}`}>
                            {apt.status}
                        </p>
                    </div>
                </div>
                <ChevronRight size={24} className="text-gray-400" />
            </div>
        </li>
    );
};


const MedicalRecords = () => {
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLocationModal, setShowLocationModal] = useState(false);

    const text = {
        en: { medicalRecords: 'Medical Records', noRecords: 'Your medical history will appear here.', loading: 'Loading...', modalTitle: "Clinic Locations", janakleesButton: "Janaklees Clinic", ramlButton: "Mahatet al Raml Clinic" },
        ar: { medicalRecords: 'السجلات الطبية', noRecords: 'سيظهر تاريخك الطبي هنا.', loading: 'تحميل...', modalTitle: "مواقع العيادات", janakleesButton: "عيادة جناكليس", ramlButton: "عيادة محطة الرمل" },
    };
    const t = text[language];

    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/appointments/my-appointments');
                // Filter for appointments that are completed, as they are most likely to have records.
                const records = response.data?.data.filter(apt => ['completed', 'done', 'cancelled'].includes(apt.status)) || [];
                setAppointments(records);
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to fetch medical records.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{t.medicalRecords}</h2>
                    <button onClick={() => setShowLocationModal(true)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600 transition-colors" aria-label="Clinic Locations">
                        <MapPin size={24} />
                    </button>
                </div>
                
                {isLoading ? <LoadingSpinner message={t.loading} />
                : error ? <p className="text-red-500 text-center py-8">{error}</p>
                : appointments.length > 0 ? (
                    <ul className="space-y-3">
                        {appointments.map(apt => (
                            <RecordItem key={apt._id} apt={apt} language={language} onNavigate={navigate} />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <Inbox size={48} className="mx-auto text-gray-300" />
                        <p className="mt-4 text-gray-500">{t.noRecords}</p>
                    </div>
                )}
            </div>
            <LocationModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} isArabic={language === 'ar'} t={t} />
        </>
    );
};

export default MedicalRecords;