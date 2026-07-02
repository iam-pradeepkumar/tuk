import React from 'react';
import { X, Quote, Sparkles } from 'lucide-react';
import { Leader } from '../types';
import { LEADERS } from '../data';

export default function LeaderDetailsModal({
  isOpen,
  onClose,
  leaderId,
  lang
}: {
  isOpen: boolean;
  onClose: () => void;
  leaderId?: string;
  lang: 'ta' | 'en';
}) {
  if (!isOpen || !leaderId) return null;

  const leader = LEADERS.find(l => l.id === leaderId);
  if (!leader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay with blur */}
      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Card container */}
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-brand-gold/20 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Brand colors */}
        <div className="bg-brand-blue p-6 shrink-0 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/5 rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-brand-gold font-extrabold uppercase tracking-widest">{lang === 'ta' ? 'வழிகாட்டி தலைவர்' : 'Guiding Leader'}</p>
              <h2 className="text-lg sm:text-xl font-black text-white">{lang === 'ta' ? leader.name : leader.name_en}</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/10 hover:bg-white/25 hover:text-brand-gold text-white rounded-full transition-colors cursor-pointer relative z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 w-full flex-1">
          {/* Picture and Title Block */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left border-b border-slate-100 pb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-brand-gold shadow-md bg-slate-50 shrink-0">
              <img 
                src={leader.imageUrl} 
                alt={lang === 'ta' ? leader.name : leader.name_en} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-2 py-1">
              <h3 className="text-base sm:text-lg font-black text-brand-blue leading-tight">
                {lang === 'ta' ? leader.name : leader.name_en}
              </h3>
              <p className="inline-block py-1 px-3 bg-brand-blue/5 text-brand-blue border border-brand-blue/10 rounded-full text-xs font-extrabold uppercase tracking-wide">
                {lang === 'ta' ? leader.title : leader.title_en}
              </p>
            </div>
          </div>

          {/* Inspirational Quote Block */}
          <div className="bg-slate-50 border-l-4 border-brand-gold rounded-r-2xl p-5 relative shadow-inner">
            <Quote className="absolute top-2 right-3 text-slate-200/80 w-10 h-10 -scale-x-100 pointer-events-none" />
            <p className="text-sm md:text-base font-serif italic font-bold leading-relaxed text-slate-800 relative z-10 pt-1">
              {lang === 'ta' ? leader.quote : leader.quote_en}
            </p>
          </div>

          {/* Biography Content / Detailed ideology description */}
          { (leader.bio || leader.bio_en) && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">
                {lang === 'ta' ? 'அணிவகுப்பு வரலாறு / கொள்கை' : 'Legacy & Ideology'}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-sans font-medium">
                {lang === 'ta' ? leader.bio : leader.bio_en}
              </p>
            </div>
          )}

          {/* Footer banner of modal */}
          <div className="bg-brand-blue/5 border border-brand-blue/10 p-4 rounded-2xl text-center select-none">
            <p className="text-[10px] text-brand-blue font-extrabold uppercase tracking-widest">
              {lang === 'ta' ? 'தேசிய உரிமைகள் களம்' : 'National Rights Forum'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
