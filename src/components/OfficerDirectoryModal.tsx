import { useState, useEffect } from 'react';
import { X, Search, Phone, Mail, MapPin, Check, Users, Award, Shield } from 'lucide-react';
import { Officer } from '../types';
import { getStoredOfficers } from '../data';
import { TRANSLATIONS } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../lib/dbService';

interface OfficerDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ta' | 'en';
}

export default function OfficerDirectoryModal({ isOpen, onClose, lang }: OfficerDirectoryModalProps) {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'state' | 'district' | 'branch'>('all');
  const [contactedOfficer, setContactedOfficer] = useState<string | null>(null);

  const [officersList, setOfficersList] = useState<Officer[]>(() => getStoredOfficers());

  useEffect(() => {
    if (isOpen) {
      setOfficersList(getStoredOfficers());

      // Live subscribe to Firestore 'officers' collection
      const unsub = dbService.subscribeToCollection('officers', (data) => {
        if (data && data.length > 0) {
          setOfficersList(data);
          localStorage.setItem('tuk_officers', JSON.stringify(data));
        }
      });
      return () => unsub();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOfficers = officersList.filter(officer => {
    const nameVal = lang === 'ta' ? officer.name : officer.name_en;
    const roleVal = lang === 'ta' ? officer.role : officer.role_en;
    const distVal = lang === 'ta' ? officer?.district : officer?.district_en;

    const matchesSearch =
      nameVal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleVal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distVal?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedLevel === 'all') return matchesSearch;
    return officer.level === selectedLevel && matchesSearch;
  }).sort((a, b) => {
    const isFounderA = (a.role_en?.toLowerCase().includes('founder') || a.role?.includes('நிறுவனத் தலைவர்'));
    const isFounderB = (b.role_en?.toLowerCase().includes('founder') || b.role?.includes('நிறுவனத் தலைவர்'));
    if (isFounderA && !isFounderB) return -1;
    if (!isFounderA && isFounderB) return 1;

    const getStaticOrder = (id: string) => {
      if (typeof id === 'string' && (id.startsWith('s') || id.startsWith('d'))) {
         const num = parseInt(id.slice(1));
         if (!isNaN(num)) {
            return id.startsWith('s') ? num : 1000 + num;
         }
      }
      return 99999;
    };
    
    const orderA = getStaticOrder(a.id);
    const orderB = getStaticOrder(b.id);
    
    if (orderA !== 99999 || orderB !== 99999) {
       if (orderA !== orderB) return orderA - orderB;
    }

    const levelPrecedence = { state: 1, wing: 2, district: 3, constituency: 4, union: 5, branch: 6, ward: 7 };
    const pA = levelPrecedence[a.level as keyof typeof levelPrecedence] || 99;
    const pB = levelPrecedence[b.level as keyof typeof levelPrecedence] || 99;
    if (pA !== pB) return pA - pB;

    return (a.role_en || '').localeCompare(b.role_en || '');
  });
  

  const handleContactClick = (officer: Officer) => {
    setContactedOfficer(officer.id);
    setTimeout(() => {
      setContactedOfficer(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto font-sans">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-950 to-slate-900 text-white font-sans">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-sans font-bold text-base md:text-lg tracking-wide">
                {t.offTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              id="close-directory-btn"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <p className="text-xs md:text-sm text-slate-505 leading-relaxed font-sans">
              {t.offSubtitle}
            </p>

            {/* Filter controls / Tabs */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {/* Level tabs with robust dynamic highlights */}
              <div className="flex flex-wrap gap-1 p-1 bg-slate-200/60 rounded-xl w-full md:w-auto font-sans">
                <button
                  onClick={() => setSelectedLevel('all')}
                  className={`flex-grow md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === 'all' ? 'bg-indigo-950 text-amber-400 shadow' : 'text-slate-700 hover:bg-slate-300/50'
                  }`}
                >
                  {t.levelAll}
                </button>
                <button
                  onClick={() => setSelectedLevel('state')}
                  className={`flex-grow md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === 'state' ? 'bg-indigo-950 text-amber-400 shadow' : 'text-slate-700 hover:bg-slate-300/50'
                  }`}
                >
                  {t.levelState}
                </button>
                <button
                  onClick={() => setSelectedLevel('district')}
                  className={`flex-grow md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === 'district' ? 'bg-indigo-950 text-amber-400 shadow' : 'text-slate-700 hover:bg-slate-300/50'
                  }`}
                >
                  {t.levelDistrict}
                </button>
                <button
                  onClick={() => setSelectedLevel('branch')}
                  className={`flex-grow md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === 'branch' ? 'bg-indigo-950 text-amber-400 shadow' : 'text-slate-700 hover:bg-slate-300/50'
                  }`}
                >
                  {t.levelBranch}
                </button>
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.offSearchPlace}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            {/* Officers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-1">
              {filteredOfficers.length > 0 ? (
                filteredOfficers.map(officer => (
                  <div
                    key={officer.id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-150 hover:bg-indigo-50/10 bg-white transition-all shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-100 flex items-center justify-center font-bold font-sans text-sm shrink-0">
                            {officer.level === 'state' ? (
                              <Award className="w-5 h-5 text-indigo-950 text-center" />
                            ) : officer.level === 'district' ? (
                              <Shield className="w-5 h-5 text-indigo-950 text-center" />
                            ) : (
                              <Users className="w-5 h-5 text-indigo-950 text-center" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">
                              {lang === 'ta' ? officer.name : officer.name_en}
                            </h4>
                            <p className="text-xs text-indigo-900 font-semibold mt-0.5">
                              {lang === 'ta' ? officer.role : officer.role_en}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          officer.level === 'state' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          officer.level === 'district' ? 'bg-indigo-50 text-indigo-950 border border-indigo-100' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {officer.level === 'state' ? t.levelState : officer.level === 'district' ? t.levelDistrict : t.levelBranch}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-605 border-t border-dashed border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {lang === 'ta' ? 'செயல் எல்லை' : 'Region'}: <strong className="text-slate-800">{lang === 'ta' ? officer.district : officer.district_en}</strong>
                          </span>
                        </div>
                        {officer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {lang === 'ta' ? 'தொலைபேசி' : 'Phone'}: <span className="font-mono text-slate-900 font-medium">{officer.phone}</span>
                            </span>
                          </div>
                        )}
                        {officer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                            <span className="truncate">
                              {lang === 'ta' ? 'மின்னஞ்சல்' : 'Email'}: <span className="font-mono text-slate-800">{officer.email}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-105 flex justify-end">
                      <button
                        onClick={() => handleContactClick(officer)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          contactedOfficer === officer.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-950 text-amber-400 hover:bg-slate-900 border border-amber-400/20'
                        }`}
                      >
                        {contactedOfficer === officer.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            {t.offContactSuccess}
                          </>
                        ) : (
                          <>
                            <Phone className="w-3 h-3 text-amber-400" /> {t.offContactBtn}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-400 space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">{t.offNotFound}</p>
                </div>
              )}
            </div>

            {/* Bottom buttons */}
            <div className="pt-3 border-t border-slate-100 flex justify-end font-sans">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-indigo-950 hover:bg-slate-900 text-white font-sans text-xs font-bold shadow transition-all cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
