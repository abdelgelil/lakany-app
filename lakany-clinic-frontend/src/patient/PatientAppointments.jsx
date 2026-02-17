import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, X, Inbox } from 'lucide-react';

import api from '../axios'; // Using the generic axios instance
import LoadingSpinner from '../components/LoadingSpinner';

// --- Helper Components ---

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

const InfoRow = ({ icon: Icon, text }) => (
    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
        <Icon size={14} />
        {text}
    </p>
);

const AppointmentCard = ({ appointment, onCancel }) => {
    const isCancellable = !['completed', 'done', 'cancelled', 'no-show'].includes(appointment.status);
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const appointmentTime = new Date(appointment.date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-500 transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start">
                <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadgeStyle(appointment.status)}`}>
                        {appointment.status}
                    </span>
                    <h3 className="font-bold text-xl text-gray-800 mt-2">
                        Dr. {appointment.doctorId?.username || 'N/A'}
                    </h3>
                </div>
                {isCancellable && (
                    <button
                        onClick={() => onCancel(appointment._id)}
                        className="flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        aria-label="Cancel Appointment"
                    >
                        <X size={16} />
                        Cancel
                    </button>
                )}
            </div>
            <div className="mt-4 border-t pt-4">
                <InfoRow icon={Calendar} text={appointmentDate} />
                <InfoRow icon={Clock} text={appointmentTime} />
            </div>
        </div>
    );
};

const EmptyState = () => (
    <div className="text-center bg-white p-12 rounded-lg shadow-sm border border-dashed">
        <Inbox size={48} className="mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-700">No Appointments Found</h3>
        <p className="mt-1 text-gray-500">You have no upcoming or past appointments scheduled.</p>
    </div>
);


// --- Main Component ---

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments/my-appointments');
            setAppointments(response.data.data || []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Could not fetch appointments.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCancel = async (appointmentId) => {
        const promise = api.put(`/appointments/cancel/${appointmentId}`);

        toast.promise(promise, {
            loading: 'Cancelling appointment...',
            success: () => {
                // Update state locally for a faster UI response
                setAppointments(prev =>
                    prev.map(apt =>
                        apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
                    )
                );
                return 'Appointment cancelled successfully!';
            },
            error: (err) => err.response?.data?.message || 'Could not cancel appointment.',
        });
    };

    if (loading) {
        return <div className="p-8"><LoadingSpinner message="Loading your appointments..." /></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-50 p-4 sm:p-6 md:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-black text-slate-800 mb-8">My Appointments</h1>
                {appointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments.map(apt => (
                            <AppointmentCard key={apt._id} appointment={apt} onCancel={handleCancel} />
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};

export default PatientAppointments;
