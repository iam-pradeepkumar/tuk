import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserPlus } from 'lucide-react';
import { Wing, Officer } from '../types';
import { WINGS, getStoredOfficers } from '../data';
import WingIcon from './WingIcon';
import { dbService } from '../lib/dbService';

export default function WingDetailsModal({ 
  isOpen, 
  onClose, 
  wingId, 
  lang,
  onJoinClick
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  wingId?: string;
  lang: 'ta' | 'en';
  onJoinClick: (wingId: string) => void;
}) {
  const [officers, setOfficers] = useState<Officer[]>([]);

  useEffect(() => {
    if (!isOpen || !wingId) return;
    
    setOfficers(getStoredOfficers().filter(o => o.wingId === wingId));
    
    // Subscribe to live officers updates
    const unsubOfficers = dbService.subscribeToCollection('officers', (data) => {
      if (data && data.length > 0) {
        localStorage.setItem('tuk_officers', JSON.stringify(data));
        setOfficers(data.filter(o => o.wingId === wingId));
      }
    });

    return () => {
      unsubOfficers();
    };
  }, [isOpen, wingId]);

  if (!isOpen || !wingId) return null;

  const wing = WINGS.find(w => w.id === wingId);
  if (!wing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-brand-blue p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shadow-inner text-brand-gold">
              <WingIcon name={wing.icon} className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{lang === 'ta' ? wing.name : wing.name_en}</h2>
              <p className="text-xs text-brand-gold font-bold tracking-widest uppercase">{lang === 'ta' ? 'அணி விவரங்கள்' : 'Wing Details'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto w-full">
          <div className="border-b border-slate-100 pb-2 mb-4 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {lang === 'ta' ? 'முக்கிய நிர்வாகிகள்' : 'Executive Members'}
            </h3>
            <button 
              onClick={() => {
                onClose();
                onJoinClick(wing.id);
              }}
              className="px-3 py-1.5 bg-brand-gold text-brand-blue text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> {lang === 'ta' ? 'இணைய பதிவு செய்' : 'Join Wing'}
            </button>
          </div>

          {officers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {officers.map(officer => (
                <div key={officer.id} className="flex gap-4 items-center bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-brand-gold shadow-sm bg-slate-100">
                    {officer.imageUrl ? (
                      <img src={officer.imageUrl} alt={officer.name} className="w-full h-full object-cover" />
                    ) : (
                      <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${officer.name.replace(/\s+/g, '')}`} alt={officer.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{lang === 'ta' ? officer.name : officer.name_en}</h4>
                    <p className="text-xs font-semibold text-brand-blue mt-0.5">{lang === 'ta' ? officer.role : officer.role_en}</p>
                    {(officer.district || officer.district_en) && (
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">{lang === 'ta' ? officer.district : officer.district_en}</p>
                    )}
                    {officer.phone && (
                      <p className="text-[10px] font-mono font-bold text-slate-500 mt-1">{officer.phone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">
                {lang === 'ta' ? 'நிர்வாகிகள் விரைவில் நியமிக்கப்படுவார்கள்' : 'Office bearers will be appointed soon'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
