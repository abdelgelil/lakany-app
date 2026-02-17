import React, { useContext } from 'react';
import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom'; // 'useNavigate' is defined but never used.
import { LanguageContext } from './LanguageContext';
// FIXED: Removed 'Run', Added 'Footprints'
import { Facebook, Instagram, School, Flame, Disc, Brain, Syringe, Footprints } from 'lucide-react';
import logo from '../assets/logo-removebg-preview.png';
import doctorPhoto from '../assets/DrLakany-removebg-preview (1).png';

const About = () => {
  // const navigate = useNavigate(); // 'useNavigate' is defined but never used.
  const { language } = useContext(LanguageContext);
  const isRtl = language === 'ar';

  const t = {
    en: {
      name: "Prof. Dr. Mohamed El-Lakany",
      title: "Professor & Head of Spinal and Joint Pain Management Department",
      institution: "Alexandria University",
      bio: "A leading consultant in non-surgical pain treatment, dedicated to providing advanced care for spinal and joint conditions.",
      expertiseTitle: "Areas of Expertise",
      appointmentButton: "Book Your Appointment",
      followButton: "Follow on Instagram",
    },
    ar: {
      name: "الأستاذ الدكتور/ محمد اللقاني",
      title: "أستاذ ورئيس قسم علاج آلام العمود الفقري والمفاصل",
      institution: "جامعة الإسكندرية",
      bio: "رائد في علاج الألم التداخلي بدون جراحة، نكرس خبراتنا الطبية والعلمية لتوفير حياة خالية من الألم لمرضانا.",
      expertiseTitle: "أبرز التخصصات",
      appointmentButton: "احجز موعدك الآن",
      followButton: "تابعنا على إنستجرام",
    }
  };

  const specialties = [
    { nameEn: 'Radiofrequency Ablation', nameAr: 'التردد الحراري', Icon: Flame },
    { nameEn: 'Herniated Disc', nameAr: 'الانزلاق الغضروفي', Icon: Disc },
    { nameEn: 'Facial Nerve (7th Nerve)', nameAr: 'العصب السابع', Icon: Brain },
    { nameEn: 'Sciatica', nameAr: 'عرق النسا', Icon: Footprints }, // FIXED: Using Footprints icon
    { nameEn: 'Joint Injections', nameAr: 'حقن المفاصل', Icon: Syringe },
  ];

  const translations = t[language];

  const socialLinks = {
    facebook: "https://www.facebook.com/share/1FXjUwgHkB/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/dr.mohamedellakany2024?igsh=MWU5c2NmbTBncTJtZQ=="
  };

  return (
    <div className={`relative min-h-screen bg-[#f8fafc] py-12 px-6 overflow-hidden ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[120px] -z-0" />

      <div className="max-w-6xl mx-auto z-10 relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Photo & Socials */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
              <img 
                src={doctorPhoto} 
                alt="Dr. Mohamed Ellakany"
                className="w-full h-auto object-contain"
              />
            </div>
            
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3 p-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white">
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="p-3 text-blue-700 hover:bg-blue-50 rounded-xl transition-all">
                <Facebook size={22} />
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="p-3 text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                <Instagram size={22} />
              </a>
            </div>

            <div className="absolute -bottom-6 -right-6 w-full h-full bg-blue-100 rounded-[3rem] -z-10" />
          </motion.div>

          {/* Right Column: Bio & Detailed Credentials */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-blue-700 mb-2">
                {translations.name}
              </h1>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-700">
                {translations.title}
              </h2>
              <div className="mt-2 flex items-center justify-center lg:justify-start gap-2 text-gray-500">
                <School size={20} />
                <p className="text-lg font-semibold">
                  {translations.institution}
                </p>
              </div>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {translations.bio}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <motion.button
                onClick={() => { /* navigate('/login') */ }} // Removed unused navigate
                whileHover={{ scale: 1.02 }}
                className="flex-1 px-10 py-4 bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-800 transition-all text-center"
              >
                {translations.appointmentButton}
              </motion.button>
              
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <Instagram size={18} className="text-pink-600" />
                {translations.followButton}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Specialties & Expertise Section */}
        <div className="mt-20">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">{translations.expertiseTitle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {specialties.map((spec, index) => (
                    <motion.div 
                        key={index}
                        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <spec.Icon className="w-12 h-12 text-blue-600 mb-4" />
                        <h4 className="font-semibold text-gray-700">{isRtl ? spec.nameAr : spec.nameEn}</h4>
                    </motion.div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default About;