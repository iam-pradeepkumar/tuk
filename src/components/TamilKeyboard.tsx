import React from 'react';
import { Delete, Keyboard, Trash2, X } from 'lucide-react';

interface TamilKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose: () => void;
  lang: 'ta' | 'en';
}

export default function TamilKeyboard({
  onKeyPress,
  onBackspace,
  onClear,
  onClose,
  lang,
}: TamilKeyboardProps) {
  // Define Gboard-like integrated rows containing all vowels, consonants, and modifiers together
  const row1 = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'];
  const row2 = ['க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம'];
  const row3 = ['ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', 'ஜ', 'ஷ'];
  const row4 = ['ஸ', 'ஹ', 'க்ஷ', '்', 'ா', 'ி', 'ீ', 'ு', 'ூ'];
  const row5 = ['ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ'];

  const renderKeyRow = (keys: string[], isModifierRow = false) => {
    return (
      <div className="flex flex-wrap justify-center gap-1">
        {keys.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => onKeyPress(char)}
            className={`h-9 flex-1 min-w-[28px] sm:min-w-[34px] max-w-[42px] flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${
              isModifierRow 
                ? 'bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-900/50 hover:border-indigo-750 text-indigo-300 hover:text-[#FFC72C]'
                : 'bg-slate-800 hover:bg-indigo-950 hover:text-[#FFC72C] hover:border-indigo-800 border border-slate-750 text-slate-100'
            }`}
          >
            {char}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-3 font-sans w-full max-w-lg mx-auto transition-all animate-fadeIn">
      {/* Keyboard Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Keyboard className="w-4 h-4 text-[#FFC72C]" />
          <span className="text-xs font-black text-slate-100 tracking-wide uppercase">
            {lang === 'ta' ? 'தமிழ் விசைப்பலகை' : 'Tamil Keyboard'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
            {lang === 'ta' ? 'ஒரே பலகை' : 'All-in-One'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Integrated Unified Gboard Keys Area */}
      <div className="space-y-2.5">
        {renderKeyRow(row1)}
        {renderKeyRow(row2)}
        {renderKeyRow(row3)}
        {renderKeyRow(row4, true)}
        {renderKeyRow(row5, true)}
      </div>

      {/* Footer Action Keys */}
      <div className="grid grid-cols-12 gap-1.5 border-t border-slate-800 pt-2.5">
        {/* Clear Key */}
        <button
          type="button"
          onClick={onClear}
          className="col-span-3 flex items-center justify-center gap-1 py-1.5 bg-rose-950/40 hover:bg-rose-900/70 border border-rose-900/50 hover:border-rose-750 text-rose-300 text-[10px] font-black rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wider"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{lang === 'ta' ? 'துடை' : 'Clear'}</span>
        </button>

        {/* Space Key */}
        <button
          type="button"
          onClick={() => onKeyPress(' ')}
          className="col-span-5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-300 text-[10px] font-black rounded-xl transition-all cursor-pointer shadow-sm uppercase tracking-wider text-center"
        >
          {lang === 'ta' ? 'இடைவெளி' : 'Space'}
        </button>

        {/* Backspace Key */}
        <button
          type="button"
          onClick={onBackspace}
          className="col-span-4 flex items-center justify-center gap-1.5 py-1.5 bg-[#1E1250] hover:bg-indigo-900 border border-indigo-900 text-[#FFC72C] text-[10px] font-black rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider"
        >
          <Delete className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{lang === 'ta' ? 'அழி' : 'Erase'}</span>
        </button>
      </div>
    </div>
  );
}
