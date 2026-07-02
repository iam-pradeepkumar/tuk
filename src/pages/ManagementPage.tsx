import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, User, Phone, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredOfficers } from '../data';
import { Officer } from '../types';
import { TRANSLATIONS } from '../translations';
import { dbService } from '../lib/dbService';

export default function ManagementPage() {
  const [lang] = useState<'ta' | 'en'>('ta');
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  
  const [officersList, setOfficersList] = useState<Officer[]>(() => getStoredOfficers());

  useEffect(() => {
    // 1. Live subscribe to Firestore 'officers' collection
    const unsub = dbService.subscribeToCollection('officers', (data) => {
      if (data && data.length > 0) {
        setOfficersList(data);
        localStorage.setItem('tuk_officers', JSON.stringify(data));
      }
    });

    // 2. Local Storage events fallback
    const handleUpdate = () => {
      setOfficersList(getStoredOfficers());
    };
    window.addEventListener('officers_updated', handleUpdate);
    return () => {
      unsub();
      window.removeEventListener('officers_updated', handleUpdate);
    };
  }, []);

  const stateOfficers = officersList.filter(o => o.level === 'state');

  const filteredOfficers = stateOfficers.filter(o => 
    o?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.role_en?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-slate-950 text-white py-8 px-6 sticky top-0 z-20 shadow-xl overflow-hidden border-b border-brand-gold/45">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <Link 
              to="/home" 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight gold-shine-text">Executive Management</h1>
              <p className="text-brand-gold/80 text-sm font-medium mt-1 uppercase tracking-widest">{t.management}</p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-brand-gold/50">
              <Search className="w-5 h-5 group-focus-within:text-white transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search officers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-2xl py-3 pl-10 pr-4 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white/20 transition-all placeholder:text-brand-gold/30"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredOfficers.map((officer, idx) => (
              <motion.div
                key={officer.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group"
              >
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {officer.imageUrl ? (
                    <img 
                      src={officer.imageUrl} 
                      alt={officer.name_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <User className="w-24 h-24 stroke-1" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <div className="flex items-center gap-3 text-white text-sm font-medium">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {officer.district_en}
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 border border-brand-gold/20">
                      {officer.role_en}
                    </span>
                    <h3 className="text-xl font-display font-bold text-slate-900 leading-tight group-hover:text-brand-blue transition-colors">
                      {officer.name_en}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">{officer.name}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-blue/5 transition-colors">
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-brand-blue" />
                      </div>
                      <span className="text-sm font-medium">{officer.district} / {officer.district_en}</span>
                    </div>
                    {officer.phone && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-blue/5 transition-colors">
                          <Phone className="w-4 h-4 text-slate-400 group-hover:text-brand-blue" />
                        </div>
                        <span className="text-sm font-mono font-medium">{officer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredOfficers.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-block p-6 bg-slate-100 rounded-full mb-6">
              <Search className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No officers found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search terms</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 pt-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10 px-6 pb-12">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">National Rights Forum Management Directory</p>
        </div>
        <img src="https://i.ibb.co/bMp8mVWF/image.png" referrerPolicy="no-referrer" alt="Footer Details" className="w-full h-auto block relative z-10" />
      </footer>
    </div>
  );
}
