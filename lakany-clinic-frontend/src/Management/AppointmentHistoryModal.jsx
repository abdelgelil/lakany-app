import React from 'react';
import { X, Calendar, Clock, CheckSquare, XSquare, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentHistoryModal = ({ isOpen, onClose, appointments, onFinish, onCancel, onNoShow }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-white rounded-t-2xl shadow-lg fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Appointment History</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt._id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-bold ${apt.status === 'Finished' ? 'text-green-600' : 'text-blue-600'}`}>{apt.status}</p>
                    <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(apt.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.status === 'Upcoming' && (
                      <>
                        <button onClick={() => onFinish(apt._id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                          <CheckSquare size={14} className="inline mr-1"/> Mark as Finished
                        </button>
                        <button onClick={() => onCancel(apt._id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                          <XSquare size={14} className="inline mr-1"/> Cancel
                        </button>
                        <button onClick={() => onNoShow(apt._id)} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">
                          <AlertTriangle size={14} className="inline mr-1"/> No-Show
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppointmentHistoryModal;
