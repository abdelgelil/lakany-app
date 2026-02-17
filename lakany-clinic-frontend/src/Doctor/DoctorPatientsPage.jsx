import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../patient/LanguageContext';
import { Search, User, Phone, PlusCircle, RefreshCw } from 'lucide-react';
import DoctorNavbar from './DoctorNavbar';
import AddPatientModal from './AddPatientModal';
import { Toaster, toast } from 'react-hot-toast';
import { getDoctorPatients } from './doctorApi'; 

const DoctorPatientsPage = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allPatients, setAllPatients] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isArabic = language === 'ar';
  const t = {
    en: { title: "My Patients", loading: "Loading...", view: "View Record" },
    ar: { title: "مرضاي", loading: "جاري التحميل...", view: "عرض السجل" }
  }[language];

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getDoctorPatients();
      // Handle different possible response shapes
      const data = response?.data || response || [];
      setAllPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = useMemo(() => {
    return allPatients.filter(p => 
      (p.username || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone || '').includes(searchQuery)
    );
  }, [searchQuery, allPatients]);

  return (
    <div className="min-h-screen bg-slate-50" dir={isArabic ? 'rtl' : 'ltr'}>
      <DoctorNavbar />
      <Toaster />
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t.title} ({allPatients.length})</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2">
            <PlusCircle size={20}/> Add Patient
          </button>
        </header>

        <div className="relative mb-6">
          <input 
            className="w-full p-3 pl-10 rounded-xl border border-slate-200"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPatients.map(patient => (
              <div key={patient._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg">{patient.username || patient.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{patient.phone}</p>
                <button 
                  onClick={() => navigate(`/doctor/patient-record-details/${patient._id}`)}
                  className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-medium"
                >
                  {t.view}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPatientAdded={fetchPatients} />
    </div>
  );
};

export default DoctorPatientsPage;