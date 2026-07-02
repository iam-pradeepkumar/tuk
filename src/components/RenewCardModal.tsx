import React, { useState, useEffect, FormEvent } from 'react';
import { X, User, Search, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../translations';
import { MemberApplication } from '../types';
import { dbService } from '../lib/dbService';

interface RenewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ta' | 'en';
}

export default function RenewCardModal({ isOpen, onClose, lang }: RenewCardModalProps) {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingMembers, setExistingMembers] = useState<MemberApplication[]>([]);

  // Subscribe to memberships from Firestore
  useEffect(() => {
    if (isOpen) {
      return dbService.subscribeToCollection('memberships', (data) => {
        setExistingMembers(data);
      });
    }
  }, [isOpen]);

  const handleRenew = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !/^\d{10}$/.test(phone)) {
      setError(lang === 'ta' ? 'சரியான பெயர் மற்றும் தொலைபேசி எண்ணை உள்ளிடவும்' : 'Please enter valid name and phone number');
      return;
    }

    const searchName = name.trim().toLowerCase();
    const searchPhone = phone.trim();

    // 1. Find in Firestore synced state
    let matchedMember = existingMembers.find(m => {
      const mName = (m.name || '').trim().toLowerCase();
      const mPhone = (m.phone || '').trim();
      return mName === searchName && mPhone === searchPhone;
    });

    const localMembers: MemberApplication[] = JSON.parse(localStorage.getItem('tuk_memberships') || '[]');

    // 2. Fallback to localStorage
    if (!matchedMember) {
      matchedMember = localMembers.find(m => {
        const mName = (m.name || '').trim().toLowerCase();
        const mPhone = (m.phone || '').trim();
        return mName === searchName && mPhone === searchPhone;
      });
    }

    if (!matchedMember) {
      setError(lang === 'ta' ? 'உறுப்பினர் விவரம் காணப்படவில்லை' : 'Member not found');
      return;
    }

    const member = matchedMember;
    let stillValid = true;
    if (member.validUntilTimestamp) {
      stillValid = member.validUntilTimestamp > Date.now();
    } else if (member.validUntil) {
      const yearMatch = member.validUntil.match(/\d{4}/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        const currentYear = new Date().getFullYear();
        stillValid = year >= currentYear;
      }
    }

    if (stillValid) {
      const dateString = member.validUntil || (lang === 'ta' ? 'குறிப்பிட்ட தேதி' : 'the validity date');
      setError(
        lang === 'ta'
          ? `உங்களுக்கு ஏற்கனவே ${dateString} வரை செல்லுபடியாகும் உறுப்பினர் அட்டை உள்ளது.`
          : `You already have an active membership valid until ${dateString}.`
      );
      return;
    }

    const now = new Date();
    const expiryDateObj = new Date(now.setFullYear(now.getFullYear() + 2));
    const validDate = expiryDateObj.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const updatedMember = {
      ...member,
      validUntil: validDate,
      validUntilTimestamp: expiryDateObj.getTime()
    };

    // Save to Firestore
    const docId = member.phone || searchPhone;
    await dbService.saveItem('memberships', docId, updatedMember);

    // Save to LocalStorage
    const localIndex = localMembers.findIndex(m => {
      const mName = (m.name || '').trim().toLowerCase();
      const mPhone = (m.phone || '').trim();
      return mName === searchName && mPhone === searchPhone;
    });

    if (localIndex !== -1) {
      localMembers[localIndex] = updatedMember;
    } else {
      localMembers.push(updatedMember);
    }
    localStorage.setItem('tuk_memberships', JSON.stringify(localMembers));

    setError('');
    setSuccess(lang === 'ta' ? `வெற்றிகரமாக புதுப்பிக்கப்பட்டது! புதிய தேதி: ${validDate}` : `Successfully renewed! New validity: ${validDate}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 my-8"
        >
          <div className="flex justify-between items-center px-6 py-4 bg-brand-blue text-white">
            <div className="flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-brand-gold" />
              <h3 className="font-display font-bold text-base md:text-lg tracking-wide">
                {lang === 'ta' ? 'அட்டையை புதுப்பிக்கவும்' : 'Renew Member Card'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!success ? (
            <form onSubmit={handleRenew} className="p-6 md:p-8 space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed pb-3">
                {lang === 'ta' 
                  ? 'உங்கள் பெயரையும் தொலைபேசி எண்ணையும் பதிவிட்டு அட்டையை அடுத்த 2 ஆண்டுகளுக்கு புதுப்பித்துக்கொள்ளலாம்.' 
                  : 'Enter your name and phone number to renew your card for 2 more years.'}
              </p>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2">
                  <Search className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-blue" /> {lang === 'ta' ? 'உறுப்பினர் பெயர்' : 'Member Name'} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm"
                    placeholder={lang === 'ta' ? 'உங்கள் பெயர்' : 'Your Name'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="text-xs">📞</span> {t.regFormPhone} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-blue hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {lang === 'ta' ? 'புதுப்பிக்கவும்' : 'Renew'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">
                {lang === 'ta' ? 'வெற்றி!' : 'Success!'}
              </h3>
              <p className="text-sm text-slate-500 font-medium">{success}</p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                {lang === 'ta' ? 'மூடுக' : 'Close'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
