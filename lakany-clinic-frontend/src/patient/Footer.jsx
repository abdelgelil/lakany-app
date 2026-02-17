import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from './LanguageContext';
import { MapPin, Phone, Facebook, Instagram, ChevronUp } from 'lucide-react';

const Footer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { language } = useContext(LanguageContext);
    const isRtl = language === 'ar';
    const footerRef = useRef(null);

    const t = {
        en: {
            // Details for the expanded view
            janakleesTitle: "Janaklees Clinic",
            janakleesAddress: "5 Dr. Mohamed Sabry St, above Fathalla Family Mall, next to Tag Dental, Janaklees Tram Station.",
            ramlTitle: "Mahatet al Raml Clinic",
            ramlAddress: "23 Saad Zaghloul Square, above El-Ezaby Pharmacy, Town Clinic.",
            contactTitle: "Contact Us",
            followTitle: "Follow Us",
            // New strings for the collapsible footer
            copyright: `© ${new Date().getFullYear()} Dr. Mohamed El-Lakany`,
            toggleMore: "More Details",
            toggleClose: "Close",
        },
        ar: {
            // Details for the expanded view
            janakleesTitle: "عيادة جناكليس",
            janakleesAddress: "٥ شارع الدكتور محمد صبرى ، أعلى فتح الله فاملى مول بجوار تاج للاسنان ، محطة ترام جناكليس",
            ramlTitle: "عيادة محطة الرمل",
            ramlAddress: "٢٣ ميدان سعد زغلول - أعلى صيدلية العزبى - عيادات تاون كلينيك",
            contactTitle: "تواصل معنا",
            followTitle: "تابعنا",
            // New strings for the collapsible footer
            copyright: `© ${new Date().getFullYear()} د. محمد اللقاني`,
            toggleMore: "تفاصيل أكثر",
            toggleClose: "إغلاق",
        }
    };
    
    const translations = t[language];

    const links = {
        janakleesMap: "https://maps.app.goo.gl/MV2SFokfqvKxRDcH6",
        ramlMap: "https://maps.apple.com/?ll=31.201669,29.900786",
        phone: "tel:01200906079",
        facebook: "https://www.facebook.com/share/1FXjUwgHkB/?mibextid=wwXIfr",
        instagram: "https://www.instagram.com/dr.mohamedellakany2024?igsh=MWU5c2NmbTBncTJtZQ=="
    };

    const footerVariants = {
        closed: { height: '3.5rem' }, // h-14
        open: { height: 'auto' }
    };

    const contentVariants = {
        closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
        open: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }
    };

    const toggleFooter = () => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);

        // If we are OPENING it, wait for animation to start, then scroll
        if (nextIsOpen) {
            setTimeout(() => {
                footerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 300); // Matches the feel of the spring animation
        }
    };

    return (
        <motion.footer
            ref={footerRef}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="w-full mt-16 bg-slate-900 text-slate-300 border-t border-slate-700/50 shadow-lg"
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            variants={footerVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* --- Collapsed Bar --- */}
                <div className="flex justify-between items-center h-14">
                    <p className="text-xs text-slate-400">{translations.copyright}</p>
                    <button
                        onClick={toggleFooter}
                        className="flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                        aria-expanded={isOpen}
                    >
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                            <ChevronUp size={20} />
                        </motion.div>
                        <span>{isOpen ? translations.toggleClose : translations.toggleMore}</span>
                    </button>
                </div>

                {/* --- Expanded Content --- */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            variants={contentVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="overflow-y-auto pb-6"
                            style={{ maxHeight: 'calc(60vh - 3.5rem)' }} // 60vh minus footer bar height
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                                {/* Janaklees Clinic */}
                                <div className="space-y-2">
                                    <h3 className="text-base font-bold text-white">{translations.janakleesTitle}</h3>
                                    <a href={links.janakleesMap} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm transition-colors hover:text-blue-400">
                                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                        <span>{translations.janakleesAddress}</span>
                                    </a>
                                </div>

                                {/* Mahatet al Raml Clinic */}
                                <div className="space-y-2">
                                    <h3 className="text-base font-bold text-white">{translations.ramlTitle}</h3>
                                    <a href={links.ramlMap} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm transition-colors hover:text-blue-400">
                                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                        <span>{translations.ramlAddress}</span>
                                    </a>
                                </div>

                                {/* Contact & Socials */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-2">{translations.contactTitle}</h3>
                                        <a href={links.phone} className="flex items-center gap-3 text-sm transition-colors hover:text-blue-400">
                                            <Phone className="w-4 h-4" />
                                            <span className="font-semibold text-base">01200906079</span>
                                        </a>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-2">{translations.followTitle}</h3>
                                        <div className="flex items-center gap-3">
                                            <a href={links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-1 transition-colors hover:text-blue-400">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                            <a href={links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-1 transition-colors hover:text-pink-400">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.footer>
    );
};

export default Footer;