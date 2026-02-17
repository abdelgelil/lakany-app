import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../patient/LanguageContext';
import { FileText, History, Printer, ArrowLeft, Save, Stethoscope } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getPatientDetails, addMedicalRecord, updateAppointment } from './doctorApi'; 

const PatientRecordDetail = () => {
  const { id } = useParams(); // Patient ID
  const navigate = useNavigate();
  const location = useLocation(); 
  const { language } = useContext(LanguageContext);
  const isArabic = language === 'ar';

  const isViewOnly = location.state?.viewOnly === true;
  const appointmentId = location.state?.appointmentId;

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [advice, setAdvice] = useState('');
  const [prescription, setPrescription] = useState('');
  const [documents, setDocuments] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPatientDetails(id);
        const data = response.patient || response; 
        setPatient(data);
        setHistory(Array.isArray(data.history) ? data.history : []);
      } catch (err) {
        toast.error("Could not load patient data.");
      } finally { setLoading(false); }
    };
    if (id) fetchData();
  }, [id]);

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!advice && !prescription && !documents) return toast.error("Please fill fields.");

    setSaving(true);
    try {
      // 1. Prepare data - Check if your backend uses these exact keys!
      const recordData = { 
        medicalAdvice: advice, 
        prescription: prescription, 
        requiredDocuments: documents 
      };

      // 2. Add to medical history
      console.log("Saving medical record for patient:", id);
      await addMedicalRecord(id, recordData);

      // 3. Hand-off to Management (Change status to 'done')
      if (appointmentId) {
        console.log("Updating appointment status to 'done':", appointmentId);
        await updateAppointment(appointmentId, { 
          status: 'done', // This signals the Management Dashboard
          medicalRecord: recordData 
        });
      }

      toast.success(isArabic ? "تم الإرسال للمراجعة المالية" : "Record sent for billing!");
      setTimeout(() => navigate('/doctor/dashboard'), 1500);

    } catch (error) {
      // This will now alert the actual server message if it exists
      const serverMessage = error.response?.data?.message || error.message;
      console.error("Submission Error Details:", error.response?.data);
      
      toast.error(`Error: ${serverMessage}`);
      
      // If the error is 404, the appointmentId might be wrong
      if (error.response?.status === 404) {
        console.warn("Check if appointmentId is correct in location.state");
      }
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-bold">Loading...</div>;

  return (
    <div className={`min-h-screen bg-slate-50 p-4 md:p-8 ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} /> {isArabic ? 'رجوع' : 'Back'}
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
          
          {/* History Column */}
          <div className="p-8 border-e border-slate-100 bg-slate-50/30">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800">{patient?.username || patient?.name}</h2>
              <p className="text-sm text-slate-400 font-bold tracking-widest">{patient?.phone}</p>
            </div>
            
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase text-xs tracking-tighter">
              <History size={16} /> Previous Records
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {history.map((record, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-blue-500 mb-1">{new Date(record.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{record.medicalAdvice}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Input Column */}
          {!isViewOnly && (
            <div className="lg:col-span-2 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                  <Stethoscope size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">New Record</h2>
              </div>

              <form onSubmit={handleSaveRecord} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Diagnosis & Advice</label>
                  <textarea 
                    className="w-full p-5 bg-slate-50 border-0 rounded-3xl h-40 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    placeholder="Describe the patient's condition..."
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Prescription</label>
                    <textarea 
                      className="w-full p-5 bg-slate-50 border-0 rounded-3xl h-32 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      placeholder="Medications..."
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Tests / Documents</label>
                    <textarea 
                      className="w-full p-5 bg-slate-50 border-0 rounded-3xl h-32 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                      placeholder="Required X-rays or blood tests..."
                      value={documents}
                      onChange={(e) => setDocuments(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  disabled={saving}
                  className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98]"
                >
                  {saving ? "SAVING RECORD..." : "SUBMIT TO MANAGEMENT"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecordDetail;