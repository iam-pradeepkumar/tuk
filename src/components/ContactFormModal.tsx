import { useState, FormEvent } from 'react';
import { X, CheckCircle, Mail, Send, User } from 'lucide-react';
import { ContactMessage } from '../types';
import { TRANSLATIONS } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ta' | 'en';
}

export default function ContactFormModal({ isOpen, onClose, lang }: ContactFormModalProps) {
  const t = TRANSLATIONS[lang];

  const [formData, setFormData] = useState<ContactMessage>({
    name: '',
    phone: '',
    email: '',
    subject: lang === 'ta' ? 'நுகர்வோர் புகார்' : 'Consumer Complaint',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactMessage, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const tempErrors: Partial<Record<keyof ContactMessage, string>> = {};
    if (!formData.name.trim()) {
      tempErrors.name = t.regNameError;
    }
    if (!formData.phone.trim()) {
      tempErrors.phone = t.regPhoneError;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      tempErrors.phone = t.regPhoneError;
    }
    if (!formData.message.trim()) {
      tempErrors.message = lang === 'ta' ? 'தகவல் விவரம் தேவை' : 'Message content is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Save inquiry to localStorage
    const existing = JSON.parse(localStorage.getItem('tuk_contacts') || '[]');
    existing.push({ ...formData, date: new Date().toISOString() });
    localStorage.setItem('tuk_contacts', JSON.stringify(existing));

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-brand-blue to-brand-blue-light text-white">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-gold" />
              <h3 className="font-display font-bold text-base md:text-lg tracking-wide">
                {t.contactTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              id="close-contact-btn"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.contactSubtitle}
              </p>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-blue" /> {t.regFormName} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border ${
                    errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50`}
                  placeholder={lang === 'ta' ? 'உங்கள் பெயர்' : 'Your name'}
                />
                {errors.name && <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="text-sm">📞</span> {t.regFormPhone} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border ${
                      errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 font-medium">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="text-sm">✉️</span> {t.regFormEmail}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t.contactSubject}</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50"
                >
                  <option value={lang === 'ta' ? 'நுகர்வோர் புகார்' : 'Consumer Complaint'}>
                    {t.subjComplaint}
                  </option>
                  <option value={lang === 'ta' ? 'அமைப்பில் இணைய விருப்பம்' : 'Membership Interest'}>
                    {t.subjMember}
                  </option>
                  <option value={lang === 'ta' ? 'ஆலோசனைகள்' : 'Strategic Suggestions'}>
                    {t.subjSugg}
                  </option>
                  <option value={lang === 'ta' ? 'இதர கருத்துகள்' : 'Other Inquiries'}>
                    {t.subjOther}
                  </option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t.contactMsgLabel} *</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border ${
                    errors.message ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50`}
                  placeholder={lang === 'ta' ? 'தகவலை விரிவாக எழுதவும்...' : 'Write message details here...'}
                  rows={3}
                />
                {errors.message && <p className="text-[11px] text-red-500 font-medium">{errors.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-contact-btn"
                className="w-full py-3 px-6 rounded-xl bg-brand-blue hover:bg-slate-950 text-brand-gold font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-brand-gold/20"
              >
                <Send className="w-4 h-4" /> {t.contactSend}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center flex flex-col items-center space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-600 animate-pulse" />
              <div>
                <h4 className="font-sans font-bold text-lg text-slate-900">{t.contactSuccess}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {t.contactSuccessDesc}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="py-2.5 px-6 rounded-xl bg-brand-blue text-white hover:bg-slate-900 transition-colors text-xs font-bold cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
