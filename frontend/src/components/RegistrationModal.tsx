import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { X, CheckCircle, CreditCard, ChevronRight, Sparkles, User, GraduationCap, MapPin, KeyRound, Scale, Printer, Download, Smartphone, CalendarDays, Image as ImageIcon, AlertTriangle, Camera } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { Wing, MemberApplication } from '../types';
import { DISTRICTS, WINGS } from '../data';
import { TRANSLATIONS } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import WingIcon from './WingIcon';
import SearchableSelect from './SearchableSelect';
import { dbService } from '../lib/dbService';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ta' | 'en';
  preselectedWingId?: string;
}



// Image Base64 Cache
const imageCache: Record<string, string> = {};

const getBase64Image = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) return url;
  if (imageCache[url]) return imageCache[url];
  try {
    const proxyUrl = url.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url;
    const res = await fetch(proxyUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        imageCache[url] = base64;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to preload image', err);
    return url;
  }
};

const calculateAge = (dobString: string): number => {
  if (!dobString) return 25;
  let dateObj: Date | null = null;
  if (dobString.includes('/')) {
    const parts = dobString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      dateObj = new Date(year, month, day);
    }
  } else if (dobString.includes('-')) {
    const parts = dobString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        dateObj = new Date(dobString);
      } else {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        dateObj = new Date(year, month, day);
      }
    }
  } else {
    dateObj = new Date(dobString);
  }
  if (!dateObj || isNaN(dateObj.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

export default function RegistrationModal({ isOpen, onClose, lang, preselectedWingId }: RegistrationModalProps) {
  const t = TRANSLATIONS[lang];

  const cardRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  
  const [bgs, setBgs] = useState({ front: 'https://i.ibb.co/20qxy4NV/image.png', back: 'https://i.ibb.co/0RmGfYgq/image.png', letter: 'https://i.ibb.co/6Rnrxb1Q/le.png' });
  const [dicebearB64, setDicebearB64] = useState('');

  useEffect(() => {
    getBase64Image('https://i.ibb.co/20qxy4NV/image.png').then(res => setBgs(b => ({ ...b, front: res })));
    getBase64Image('https://i.ibb.co/0RmGfYgq/image.png').then(res => setBgs(b => ({ ...b, back: res })));
    getBase64Image('https://i.ibb.co/6Rnrxb1Q/le.png').then(res => setBgs(b => ({ ...b, letter: res })));
  }, []);

  const [cardScale, setCardScale] = useState(1);
  const [letterScale, setLetterScale] = useState(1);
  const [activeTab, setActiveTab] = useState<'card' | 'letter'>('card');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    return dbService.subscribeToCollection('memberships', (data) => {
      setExistingMembers(data);
    });
  }, []);

  const [formData, setFormData] = useState<MemberApplication>({
    name: '',
    phone: '',
    age: 25,
    district: DISTRICTS[0],
    wingId: preselectedWingId || WINGS[0].id,
    constituency: '',
    union: '',
    dob: '',
    bloodGroup: 'O +ve',
    memberId: ''
  });

  useEffect(() => {
    if (isOpen) {
      const nrfNumbers = existingMembers
        .map((m: any) => {
          const id = m.cardId || m.memberId || '';
          const match = id.match(/^NRF-(\d+)$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((n): n is number => n !== null);

      let nextNumber = 7001;
      if (nrfNumbers.length > 0) {
        const maxNum = Math.max(...nrfNumbers);
        nextNumber = Math.max(7001, maxNum + 1);
      }

      const uniqueId = `NRF-${nextNumber}`;

      setFormData(prev => {
        const isDefaultOrEmpty = !prev.memberId || prev.memberId === 'NRF-7001' || /^NRF-\d+$/.test(prev.memberId);
        if (isDefaultOrEmpty) {
          return {
            ...prev,
            memberId: uniqueId,
            dob: prev.dob || '',
            bloodGroup: prev.bloodGroup || 'O +ve'
          };
        }
        return prev;
      });
    }
  }, [isOpen, existingMembers]);

  const [memberPhoto, setMemberPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof MemberApplication | 'photo', string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [isDownloadingLetter, setIsDownloadingLetter] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<{
    id: string;
    issueDate: string;
    validDate: string;
    avatarSeed: string;
    photo?: string;
  } | null>(null);

  useEffect(() => {
    if (generatedCard?.avatarSeed && !memberPhoto) {
      getBase64Image(`https://api.dicebear.com/7.x/bottts/svg?seed=${generatedCard.avatarSeed}`).then(setDicebearB64);
    }
  }, [generatedCard?.avatarSeed, memberPhoto]);

  useEffect(() => {
    if (!isOpen || !generatedCard) return;
    
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        // Subtract modal padding / boundary safety (32px)
        const availableWidth = width - 40;
        setCardScale(Math.min(1, Math.max(0.4, availableWidth / 500)));
        setLetterScale(Math.min(1, Math.max(0.3, availableWidth / 595)));
      }
    };
    
    // Slight delay to allow modal layout of success step to render and measure correctly
    const timer = setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [isOpen, generatedCard]);

  useEffect(() => {
    if (preselectedWingId) {
      setFormData(prev => ({ ...prev, wingId: preselectedWingId }));
    }
  }, [preselectedWingId]);

  const selectedWingDetail = WINGS.find(w => w.id === formData.wingId);

  if (!isOpen) return null;

  const validate = () => {
    const tempErrors: Partial<Record<keyof MemberApplication | 'photo', string>> = {};
    if (!formData.name.trim()) {
      tempErrors.name = t.regNameError;
    }
    if (!formData.phone.trim()) {
      tempErrors.phone = t.regPhoneError;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      tempErrors.phone = t.regPhoneError;
    }
    if (!formData.dob || !formData.dob.trim()) {
      tempErrors.dob = lang === 'ta' ? 'பிறந்த தேதி தேவைப்படுகிறது' : 'Date of Birth is required';
    }
    if (!formData.bloodGroup || !formData.bloodGroup.trim()) {
      tempErrors.bloodGroup = lang === 'ta' ? 'இரத்த வகை தேவைப்படுகிறது' : 'Blood Group is required';
    }
    if (!formData.constituency.trim()) {
      tempErrors.constituency = t.regConstituencyError;
    }
    if (!formData.memberId || !formData.memberId.trim()) {
      tempErrors.memberId = lang === 'ta' ? 'உறுப்பினர் எண் தேவைப்படுகிறது' : 'Member ID is required';
    }
    if (!formData.union.trim()) {
      tempErrors.union = t.regUnionError;
    }
    if (!memberPhoto) {
      tempErrors.photo = lang === 'ta' 
        ? 'உறுப்பினர் புகைப்படம் தேவை (கட்டாயம்)' 
        : 'Member photograph is required to generate card';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const resizeImage = (dataUrl: string, maxDim = 300): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async () => {
        const rawDataUrl = reader.result as string;
        try {
          const resizedDataUrl = await resizeImage(rawDataUrl, 300);
          setMemberPhoto(resizedDataUrl);
        } catch (err) {
          console.log('Image resize error, applying raw dataurl:', err);
          setMemberPhoto(rawDataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Check if the phone number is already registered
    const existingMember = existingMembers.find((m: any) => m.phone === formData.phone);
    
    if (existingMember) {
      // Determine if they still have active validity
      let stillValid = true;
      if (existingMember.validUntilTimestamp) {
        stillValid = existingMember.validUntilTimestamp > Date.now();
      } else if (existingMember.validUntil) {
        // Fallback checks for string validity
        const yearMatch = existingMember.validUntil.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0], 10);
          const currentYear = new Date().getFullYear();
          stillValid = year >= currentYear;
        }
      }

      if (stillValid) {
        const dateString = existingMember.validUntil || (lang === 'ta' ? 'குறிப்பிட்ட தேதி' : 'the validity date');
        setErrors({
          phone: lang === 'ta'
            ? `இந்த கைப்பேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது! உங்களுக்கு ${dateString} வரை செல்லுபடியாகும் உறுப்பினர் அட்டை உள்ளது.`
            : `This number is already registered! You already have an active membership valid until ${dateString}.`
        });
        return;
      }
    }

    const updatedFormData = {
      ...formData,
      name: formData.name.trim(),
      constituency: formData.constituency.trim(),
      union: formData.union.trim(),
    };
    
    // Auto-translate to Tamil if needed
    setIsTranslating(true);
    try {
      const response = await fetch('https://api.theasiyaurimaigalkalam.in/api/translate-member-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: updatedFormData.name, 
          constituency: updatedFormData.constituency, 
          union: updatedFormData.union 
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.tamilName) updatedFormData.name = data.tamilName;
        if (data.tamilConstituency) updatedFormData.constituency = data.tamilConstituency;
        if (data.tamilUnion) updatedFormData.union = data.tamilUnion;
      }
    } catch (e) {
      console.log('Translation failed', e);
    } finally {
      setIsTranslating(false);
    }

    if (updatedFormData.district.includes('(')) {
        updatedFormData.district = updatedFormData.district.split('(')[0].trim();
    }

    setFormData(updatedFormData);

    const nrfNumbers = existingMembers
      .map((m: any) => {
        const id = m.cardId || m.memberId || '';
        const match = id.match(/^NRF-(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);

    let nextNumber = 7001;
    if (nrfNumbers.length > 0) {
      const maxNum = Math.max(...nrfNumbers);
      nextNumber = Math.max(7001, maxNum + 1);
    }
    const assignedId = formData.memberId?.trim() || `NRF-${nextNumber}`;
    const currentDate = new Date().toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const now = new Date();
    const expiryDateObj = new Date(now.setFullYear(now.getFullYear() + 2));
    const validDate = expiryDateObj.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setGeneratedCard({
      id: assignedId,
      issueDate: currentDate,
      validDate: validDate,
      avatarSeed: updatedFormData.name.replace(/\s+/g, ''),
      photo: memberPhoto || undefined
    });
    setIsSubmitted(true);

    // Save to Firestore
    await dbService.saveItem('memberships', formData.phone, { 
      ...updatedFormData, 
      cardId: assignedId, 
      date: currentDate, 
      validUntil: validDate, 
      validUntilTimestamp: expiryDateObj.getTime(),
      photo: memberPhoto 
    });
  };

  const handleDownloadBothSides = async () => {
    if (!cardRef.current || !cardBackRef.current || isDownloadingCard) return;
    setIsDownloadingCard(true);
    setDownloadError(null);

    try {
      // 1. Download Front Side
      const frontDataUrl = await htmlToImage.toPng(cardRef.current, { pixelRatio: 2, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const frontLink = document.createElement('a');
      frontLink.download = `TUK_MemberCard_FRONT_${formData.name.replace(/\s+/g, '_')}.png`;
      frontLink.href = frontDataUrl;
      frontLink.click();

      // Small tick between downloads to prevent race conditions on browser download manager
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 2. Download Back Side
      const backDataUrl = await htmlToImage.toPng(cardBackRef.current, { pixelRatio: 2, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const backLink = document.createElement('a');
      backLink.download = `TUK_MemberCard_BACK_${formData.name.replace(/\s+/g, '_')}.png`;
      backLink.href = backDataUrl;
      backLink.click();
    } catch (err) {
      console.log('Render stream failed:', err);
      // Fallback with slightly lower pixel ratio to bypass potential heavy rendering memory boundary
      try {
        const frontDataUrl = await htmlToImage.toPng(cardRef.current, { pixelRatio: 1.5, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const frontLink = document.createElement('a');
        frontLink.download = `TUK_MemberCard_FRONT_${formData.name.replace(/\s+/g, '_')}.png`;
        frontLink.href = frontDataUrl;
        frontLink.click();

        await new Promise((resolve) => setTimeout(resolve, 150));

        const backDataUrl = await htmlToImage.toPng(cardBackRef.current, { pixelRatio: 1.5, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const backLink = document.createElement('a');
        backLink.download = `TUK_MemberCard_BACK_${formData.name.replace(/\s+/g, '_')}.png`;
        backLink.href = backDataUrl;
        backLink.click();
      } catch (retryErr) {
        console.log('All render streams failed:', retryErr);
        setDownloadError(
          lang === 'ta'
            ? 'அட்டை பதிவிறக்கம் செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : 'Unable to download card. Please give it a moment and try again.'
        );
      }
    } finally {
      setIsDownloadingCard(false);
    }
  };

  const handleDownloadLetter = async () => {
    if (!letterRef.current || isDownloadingLetter) return;
    setIsDownloadingLetter(true);
    setDownloadError(null);
    
    try {
      const dataUrl = await htmlToImage.toPng(letterRef.current, { pixelRatio: 2.5, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const link = document.createElement('a');
      link.download = `TUK_RegistrationLetter_${formData.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.log('Letter download retry path initiated:', err);
      try {
        const dataUrl = await htmlToImage.toPng(letterRef.current, { pixelRatio: 1.8, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const link = document.createElement('a');
        link.download = `TUK_RegistrationLetter_${formData.name.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (retryErr) {
        console.log('All letter exports failed:', retryErr);
        setDownloadError(
          lang === 'ta'
            ? 'அனுமதி கடிதம் பதிவிறக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : 'Unable to download registration letter. Please try again.'
        );
      }
    } finally {
      setIsDownloadingLetter(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 my-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-brand-blue to-brand-blue-light text-white">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-gold" />
              <h3 className="font-display font-bold text-base md:text-lg tracking-wide">
                {t.regTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              id="close-registration-btn"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-slate-500 leading-relaxed border-b border-dashed border-slate-100 pb-3">
                {t.regSubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-blue" /> {t.regFormName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                    placeholder={lang === 'ta' ? 'உங்கள் முழுப் பெயர்' : 'Your full name'}
                  />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-brand-blue" /> {t.regFormPhone} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-brand-blue" /> {lang === 'ta' ? 'பிறந்த தேதி' : 'Date of Birth'} *
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={e => {
                      const dobVal = e.target.value;
                      const calculatedAge = calculateAge(dobVal);
                      setFormData({ ...formData, dob: dobVal, age: calculatedAge });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.dob ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                  />
                  {errors.dob && <p className="text-xs text-red-500 font-medium">{errors.dob}</p>}
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="text-red-650 font-bold">♥</span> {lang === 'ta' ? 'இரத்த வகை' : 'Blood Group'} *
                  </label>
                  <select
                    value={formData.bloodGroup || 'O +ve'}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.bloodGroup ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                  >
                    {['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  {errors.bloodGroup && <p className="text-xs text-red-500 font-medium">{errors.bloodGroup}</p>}
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue" /> {t.regFormDistrict}
                  </label>
                  <SearchableSelect
                    options={DISTRICTS.map(d => ({ label: d, value: d }))}
                    value={formData.district}
                    onChange={(val) => setFormData({ ...formData, district: val })}
                    placeholder={t.regFormDistrict}
                    lang={lang}
                  />
                </div>

                {/* Select Wing */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    {t.regFormWing}
                  </label>
                  <SearchableSelect
                    options={WINGS.map(w => ({ label: `${w.name} (${w.name_en})`, value: w.id }))}
                    value={formData.wingId}
                    onChange={(val) => setFormData({ ...formData, wingId: val })}
                    placeholder={t.regFormWing}
                    lang={lang}
                  />
                </div>

                {/* Member ID */}
                <div className="space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 animate-pulse" /> {lang === 'ta' ? 'உறுப்பினர் அடையாள எண் (தானியங்கி)' : 'Member ID (Auto-generated)'}
                    </span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {lang === 'ta' ? 'தானியங்கி' : 'Auto'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.memberId || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-slate-100/80 text-sm font-mono text-slate-500 cursor-not-allowed font-bold"
                    placeholder="NRF-7001"
                  />
                  {errors.memberId && <p className="text-xs text-red-500 font-medium">{errors.memberId}</p>}
                </div>
              </div>

              {/* Selected Wing Target Info */}
              {selectedWingDetail && (
                <div className="p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex items-start gap-3.5 text-xs text-brand-blue leading-relaxed">
                  <WingIcon name={selectedWingDetail.icon} className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">
                      {lang === 'ta' ? selectedWingDetail.name : selectedWingDetail.name_en}:
                    </span>{' '}
                    {lang === 'ta' ? selectedWingDetail.description : selectedWingDetail.description_en}
                  </div>
                </div>
              )}

              {/* Photo Upload Zone (Responsive Drag-and-Drop) */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-705 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-brand-blue" /> {lang === 'ta' ? 'உறுப்பினர் புகைப்படம்' : 'Member Photo'} *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    errors.photo
                      ? 'border-red-500 bg-red-50/10'
                      : isDragging
                      ? 'border-amber-400 bg-amber-400/5'
                      : memberPhoto
                      ? 'border-indigo-200 bg-indigo-50/10'
                      : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                  onClick={() => document.getElementById('photo-upload-input')?.click()}
                >
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  {memberPhoto ? (
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img src={memberPhoto} alt="Upload Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-slate-800">
                          {lang === 'ta' ? 'புகைப்படம் வெற்றிகரமாக இணைக்கப்பட்டது' : 'Photo attached successfully'}
                        </p>
                        <p className="text-[10px] text-slate-405">
                          {lang === 'ta' ? 'மாற்ற கிளிக் செய்யவும் அல்லது கோப்பை இழுத்து விடவும்' : 'Click to change or drag and drop another file'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMemberPhoto(null);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-650 font-sans text-[11px] font-bold transition-all border border-red-100 shrink-0"
                      >
                        {lang === 'ta' ? 'நீக்கு' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 py-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-bold">
                          {lang === 'ta' ? 'புகைப்படத்தை பதிவேற்றவும்' : 'Upload image'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          PNG, JPG (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {errors.photo && <p className="text-xs text-red-500 font-medium mt-1">{errors.photo}</p>}
              </div>

              {/* Constituency and Union */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t.regFormConstituency} *</label>
                  <input
                    type="text"
                    value={formData.constituency}
                    onChange={e => setFormData({ ...formData, constituency: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.constituency ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                  />
                  {errors.constituency && <p className="text-xs text-red-500 font-medium">{errors.constituency}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t.regFormUnion} *</label>
                  <input
                    type="text"
                    value={formData.union}
                    onChange={e => setFormData({ ...formData, union: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.union ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                  />
                  {errors.union && <p className="text-xs text-red-500 font-medium">{errors.union}</p>}
                </div>
              </div>

              {/* Submit Section */}
              <button
                type="submit"
                disabled={isTranslating}
                id="submit-registration-btn"
                className={`w-full py-3 px-6 mt-2 rounded-xl bg-brand-blue hover:bg-slate-950 text-brand-gold font-semibold transition-all shadow-md flex items-center justify-center gap-2 border border-brand-gold/20 text-base font-sans ${isTranslating ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                {isTranslating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></span>
                    {lang === 'ta' ? 'மொழிபெயர்க்கப்படுகிறது...' : 'Translating details...'}
                  </span>
                ) : (
                  <>
                    {t.regBtnSubmit}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success & Membership Card Display */
            <div className="p-6 md:p-8 flex flex-col items-center space-y-6 text-slate-850 text-center">
              <div className="p-3 bg-emerald-50 rounded-full border border-emerald-200">
                <CheckCircle className="w-12 h-12 text-emerald-600 animate-bounce" />
              </div>

              <div className="space-y-1 max-w-md">
                <h4 className="font-sans font-bold text-xl text-slate-900 leading-tight">
                  {t.regSuccessTitle}
                </h4>
                <p className="text-slate-550 text-sm mt-1">
                  {t.regSuccessDesc}
                </p>
              </div>

              {/* Dynamic Switcher between Card and Letter */}
              <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`flex-1 py-2 px-3 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'card'
                      ? 'bg-[#1E1250] text-[#FFC72C] shadow-md'
                      : 'text-slate-600 hover:text-[#1E1250]'
                  }`}
                >
                  {lang === 'ta' ? 'உறுப்பினர் அட்டை' : 'Membership Card'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('letter')}
                  className={`flex-1 py-2 px-3 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'letter'
                      ? 'bg-[#1E1250] text-[#FFC72C] shadow-md'
                      : 'text-slate-600 hover:text-[#1E1250]'
                  }`}
                >
                  {lang === 'ta' ? 'அனுமதி கடிதம்' : 'Welcome Letter'}
                </button>
              </div>

              {/* Tab 1: Membership Card Layout */}
              {generatedCard && (
                <div className={activeTab === 'card' ? 'w-full block relative' : 'w-0 h-0 overflow-hidden absolute opacity-0 pointer-events-none'}>
                  <p className="text-[11px] font-sans text-amber-600 font-bold mb-3 flex items-center justify-center gap-1.5 animate-pulse">
                    <span>🔄</span>
                    {lang === 'ta' ? 'அட்டையைத் திருப்ப அதன் மேல் நகர்த்தவும் / தொடவும்' : 'Move cursor or tap card to flip & view backside'}
                  </p>
                  
                  <motion.div
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    ref={containerRef}
                    className="w-full overflow-hidden py-4 flex justify-center items-center"
                  >
                    {/* Perspective container */}
                    <div 
                      style={{
                        width: '500px',
                        height: '315px',
                        transform: `scale(${cardScale})`,
                        transformOrigin: 'center center',
                        margin: `${(cardScale - 1) * 315 / 2}px ${(cardScale - 1) * 500 / 2}px`,
                        perspective: '1000px'
                      }}
                      className="shrink-0 relative cursor-pointer"
                      onMouseEnter={() => setIsFlipped(true)}
                      onMouseLeave={() => setIsFlipped(false)}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      {/* Flip Animator Element */}
                      <div 
                        className="w-full h-full relative transition-transform duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'none'
                        }}
                      >
                        {/* Front Side */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden text-left font-sans"
                          style={{
                            color: '#1E1250',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            backfaceVisibility: 'hidden',
                            zIndex: 2,
                            transform: 'rotateY(0deg)'
                          }}
                        >
                          <img
                            src={bgs.front}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover -z-10"
                            
                            alt="Background Front"
                          />
                          {/* User dynamic photo overlay */}
                          <div className="absolute left-[30px] top-[102px] w-[96px] h-[116px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-[#1E1250] bg-white">
                            {memberPhoto ? (
                              <img
                                src={memberPhoto}
                                alt="ID Avatar"
                                className="w-full h-full object-cover"
                                
                              />
                            ) : (
                              <img
                            src={dicebearB64 || `https://api.dicebear.com/7.x/bottts/svg?seed=${generatedCard.avatarSeed || 'tuk'}`}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                                alt="ID Avatar"
                                className="w-full h-full object-cover"
                                
                              />
                            )}
                          </div>

                          {/* ACTIVE Badge under photo */}
                          <div className="absolute left-[30px] top-[223px] w-[96px] flex justify-center">
                            <span className="text-[7.5px] font-black tracking-widest px-2 py-0.5 rounded-md text-white bg-[#1E1250]">
                              ACTIVE
                            </span>
                          </div>

                          {/* Member details absolutely positioned over the gold template */}
                          {/* Name */}
                          <div className="absolute left-[142px] top-[95px] right-[130px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பெயர்</p>
                            <p className="font-extrabold text-[#1E1250] uppercase mt-0.5 truncate text-[14px] leading-tight">
                              {formData.name}
                            </p>
                          </div>

                          {/* Member ID */}
                          <div className="absolute right-[30px] top-[95px] text-right">
                            <span className="text-[7.5px] font-bold text-[#1E1250]/75 tracking-wider">அட்டை எண்</span>
                            <p className="font-mono font-black text-[12px] text-[#1E1250] mt-0.5">{generatedCard.id}</p>
                          </div>

                          {/* Row 2: Role & District */}
                          <div className="absolute left-[142px] top-[130px] w-[150px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பதவி</p>
                            <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3 stroke-[2.5]" style={{ stroke: '#1E1250' }} />
                              <span className="truncate">உறுப்பினர்</span>
                            </p>
                          </div>

                          <div className="absolute left-[305px] top-[130px] right-[30px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">மாவட்டம்</p>
                            <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{formData.district}</p>
                          </div>

                          {/* Row 3: Phone Number & Constituency */}
                          <div className="absolute left-[142px] top-[165px] w-[150px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">கைப்பேசி</p>
                            <p className="font-mono font-bold text-[10.5px] text-[#1E1250] mt-0.5">{formData.phone}</p>
                          </div>

                          <div className="absolute left-[305px] top-[165px] right-[30px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">தொகுதி</p>
                            <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{formData.constituency}</p>
                          </div>

                          {/* Row 4: DOB & Union */}
                          <div className="absolute left-[142px] top-[200px] w-[150px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பிறந்த தேதி</p>
                            <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5">{formData.dob}</p>
                          </div>

                          <div className="absolute left-[305px] top-[200px] right-[30px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">ஒன்றியம்</p>
                            <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{formData.union}</p>
                          </div>

                          {/* Row 5: Blood Group & Issued */}
                          <div className="absolute left-[142px] top-[235px] w-[150px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">இரத்த வகை</p>
                            <p className="font-black text-[10.5px] text-red-650 mt-0.5 text-red-600">{formData.bloodGroup}</p>
                          </div>

                          <div className="absolute left-[305px] top-[235px] right-[30px]">
                            <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">வழங்கிய தேதி</p>
                            <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5">{generatedCard.issueDate}</p>
                          </div>

                          {/* Validity Date inside the template's "Validity" pill */}
                          <div 
                            className="absolute flex items-center justify-end text-white font-sans font-black text-[8px] select-none tracking-tight whitespace-nowrap"
                            style={{
                              top: '71px',
                              right: '24px',
                              width: '75px',
                              height: '20px',
                              paddingRight: '5px',
                              textShadow: '0 1px 1.5px rgba(0,0,0,0.7)'
                            }}
                          >
                            {generatedCard.validDate}
                          </div>
                        </div>

                        {/* Back Side */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
                          style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            zIndex: 1
                          }}
                        >
                          <img
                            src={bgs.back}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover"
                            
                            alt="Background Back"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Offscreen flat render fields exclusively for clean distortion-free downloads */}
                  <div className="absolute pointer-events-none" style={{ top: 0, left: 0, zIndex: -9999 }}>
<div 
                        ref={letterRef}
                        className="w-[595px] h-[842px] shrink-0 relative overflow-hidden text-left font-sans"
                        style={{
                          color: '#1E1250',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        <img
                            src={bgs.letter}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover -z-10"
                          
                          alt="Welcome Letter Background"
                        />
                        {/* Content Body */}
                        <div className="absolute inset-0 z-10">
                          {/* Image placed exactly in the template's portrait frame */}
                          <div className="absolute top-[323px] left-[191px] w-[168px] h-[182px] rounded-2xl overflow-hidden shrink-0">
                            {memberPhoto ? (
                              <img src={memberPhoto} className="w-full h-full object-cover mt-[3px] -mr-[4px]" alt="Member" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                            ) : (
                              <img src={dicebearB64 || `https://api.dicebear.com/7.x/bottts/svg?seed=${generatedCard?.avatarSeed || 'tuk'}`} crossOrigin="anonymous" referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover mt-[3px] -mr-[4px]" />
                            )}
                          </div>
                          
                          {/* Role in first line */}
                          <div className="absolute top-[564px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                            <p className="text-[20px] font-black text-[#1E1250] tracking-wide">
                              உறுப்பினர்
                            </p>
                          </div>
                          
                          {/* Name in second line */}
                          <div className="absolute top-[596px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                            <h2 className="text-[24px] font-black text-[#1E1250] leading-tight" style={{ fontSize: '20px', marginBottom: '-11px', paddingBottom: '-8px', marginRight: '-9px', marginTop: '6px' }}>{formData.name}</h2>
                          </div>
                        </div>
                      </div>

                    {/* Flat Front */}
                    <div 
                      ref={cardRef}
                      className="w-[500px] h-[315px] rounded-3xl relative overflow-hidden text-left font-sans"
                      style={{
                        color: '#1E1250'
                      }}
                    >
                      <img
                            src={bgs.front}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover -z-10"
                        
                        alt="Background Front"
                      />
                      <div className="absolute left-[30px] top-[102px] w-[96px] h-[116px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-[#1E1250] bg-white">
                        {memberPhoto ? (
                          <img
                            src={memberPhoto}
                            alt="ID Avatar"
                            className="w-full h-full object-cover"
                            
                          />
                        ) : (
                          <img
                            src={dicebearB64 || `https://api.dicebear.com/7.x/bottts/svg?seed=${generatedCard.avatarSeed || 'tuk'}`}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            alt="ID Avatar"
                            className="w-full h-full object-cover"
                            
                          />
                        )}
                      </div>
                      <div className="absolute left-[30px] top-[223px] w-[96px] flex justify-center">
                        <span className="text-[7.5px] font-black tracking-widest px-2 py-0.5 rounded-md text-white bg-[#1E1250]">
                          உறுப்பினர்
                        </span>
                      </div>
                      <div className="absolute left-[142px] top-[95px] right-[130px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பெயர்</p>
                        <p className="font-extrabold text-[#1E1250] uppercase mt-0.5 truncate text-[14px] leading-tight">
                          {formData.name}
                        </p>
                      </div>
                      <div className="absolute right-[30px] top-[95px] text-right">
                        <span className="text-[7.5px] font-bold text-[#1E1250]/75 tracking-wider">அட்டை எண்</span>
                        <p className="font-mono font-black text-[12px] text-[#1E1250] mt-0.5">{generatedCard.id}</p>
                      </div>

                      {/* Row 2: Role & District */}
                      <div className="absolute left-[142px] top-[130px] w-[150px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பதவி</p>
                        <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 stroke-[2.5]" style={{ stroke: '#1E1250' }} />
                          <span className="truncate">உறுப்பினர்</span>
                        </p>
                      </div>

                      <div className="absolute left-[305px] top-[130px] right-[30px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">மாவட்டம்</p>
                        <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{formData.district}</p>
                      </div>

                      {/* Row 3: Phone Number & Constituency */}
                      <div className="absolute left-[142px] top-[165px] w-[150px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">கைப்பேசி</p>
                        <p className="font-mono font-bold text-[10.5px] text-[#1E1250] mt-0.5">{formData.phone}</p>
                      </div>

                      <div className="absolute left-[305px] top-[165px] right-[30px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">தொகுதி</p>
                        <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{formData.constituency}</p>
                      </div>

                      {/* Row 4: DOB & Union */}
                      <div className="absolute left-[142px] top-[200px] w-[150px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பிறந்த தேதி</p>
                        <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5">{formData.dob}</p>
                      </div>

                      <div className="absolute left-[305px] top-[200px] right-[30px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">ஒன்றியம்</p>
                        <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{formData.union}</p>
                      </div>

                      {/* Row 5: Blood Group & Issued */}
                      <div className="absolute left-[142px] top-[235px] w-[150px]">
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">இரத்த வகை</p>
                        <p className="font-black text-[10.5px] text-red-650 mt-0.5 text-red-600">{formData.bloodGroup}</p>
                      </div>

                      <div className="absolute left-[305px] top-[235px] right-[30px]" style={{ paddingRight: '-4px', marginRight: '-13px' }}>
                        <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">வழங்கிய தேதி</p>
                        <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5">{generatedCard.issueDate}</p>
                      </div>

                      <div 
                        className="absolute flex items-center justify-end text-white font-sans font-black text-[8px] select-none tracking-tight whitespace-nowrap"
                        style={{
                          top: '71px',
                          right: '24px',
                          width: '75px',
                          height: '20px',
                          paddingRight: '5px',
                          textShadow: '0 1px 1.5px rgba(0,0,0,0.7)'
                        }}
                      >
                        {generatedCard.validDate}
                      </div>
                    </div>

                    {/* Flat Back */}
                    <div 
                      ref={cardBackRef}
                      className="w-[500px] h-[315px] rounded-3xl relative overflow-hidden"
                    >
                      <img
                            src={bgs.back}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover"
                        
                        alt="Background Back"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Membership Letter Layout */}
              {generatedCard && (
                <div className={activeTab === 'letter' ? 'w-full block relative' : 'w-0 h-0 overflow-hidden absolute opacity-0 pointer-events-none'}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full overflow-hidden py-2 flex justify-center items-center"
                  >
                    <div 
                      style={{
                        width: '595px',
                        height: '842px',
                        transform: `scale(${letterScale})`,
                        transformOrigin: 'center center',
                        margin: `${(letterScale - 1) * 842 / 2}px ${(letterScale - 1) * 595 / 2}px`,
                      }}
                      className="shrink-0 relative transition-all duration-300 bg-white"
                    >
                      <div 
                        
                        className="w-[595px] h-[842px] shrink-0 relative overflow-hidden text-left font-sans"
                        style={{
                          color: '#1E1250',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        <img
                            src={bgs.letter}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover -z-10"
                          
                          alt="Welcome Letter Background"
                        />
                        {/* Content Body */}
                        <div className="absolute inset-0 z-10">
                          {/* Image placed exactly in the template's portrait frame */}
                          <div className="absolute top-[323px] left-[191px] w-[168px] h-[182px] rounded-2xl overflow-hidden shrink-0">
                            {memberPhoto ? (
                              <img src={memberPhoto} className="w-full h-full object-cover mt-[3px] -mr-[4px]" alt="Member" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                            ) : (
                              <img src={dicebearB64 || `https://api.dicebear.com/7.x/bottts/svg?seed=${generatedCard?.avatarSeed || 'tuk'}`} crossOrigin="anonymous" referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover mt-[3px] -mr-[4px]" />
                            )}
                          </div>
                          
                          {/* Role in first line */}
                          <div className="absolute top-[564px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                            <p className="text-[20px] font-black text-[#1E1250] tracking-wide">
                              உறுப்பினர்
                            </p>
                          </div>
                          
                          {/* Name in second line */}
                          <div className="absolute top-[596px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                            <h2 className="text-[24px] font-black text-[#1E1250] leading-tight" style={{ fontSize: '20px', marginBottom: '-11px', paddingBottom: '-8px', marginRight: '-9px', marginTop: '6px' }}>{formData.name}</h2>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {downloadError && (
                <p className="text-xs text-red-500 font-bold text-center mt-2 px-4 max-w-sm flex items-center justify-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> {downloadError}
                </p>
              )}

              {/* Action Buttons depending on Active Tab */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center pt-3">
                {activeTab === 'card' ? (
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-center">
                    {/* Unified Both Sides Download Button */}
                    <button
                      type="button"
                      onClick={handleDownloadBothSides}
                      disabled={isDownloadingCard}
                      className={`py-3 px-6 rounded-xl border border-brand-blue/30 text-white bg-[#1E1250] hover:bg-[#1E1250]/90 transition-all text-xs font-black flex items-center justify-center gap-1.5 shadow-sm flex-1 ${
                        isDownloadingCard ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isDownloadingCard ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin shrink-0"></span>
                          <span>{lang === 'ta' ? 'அட்டை பதிவிறக்கம் செய்யப்படுகிறது...' : 'Downloading Card...'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 shrink-0 text-brand-gold" />{' '}
                          <span>{lang === 'ta' ? 'அட்டை பதிவிறக்கு (முகப்பு & பின்புறம்)' : 'Download Member Card (Front & Back)'}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadLetter}
                    disabled={isDownloadingLetter}
                    id="print-letter-btn"
                    className={`py-2.5 px-5 rounded-xl border border-brand-gold/50 text-brand-gold transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto ${
                      isDownloadingLetter 
                        ? 'bg-brand-gold/5 opacity-70 cursor-not-allowed scale-[0.98]' 
                        : 'bg-brand-gold/10 hover:bg-brand-gold/20 cursor-pointer'
                    }`}
                  >
                    {isDownloadingLetter ? (
                      <>
                        <span className="w-4.5 h-4.5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin shrink-0"></span>
                        <span>{lang === 'ta' ? 'தரவிறக்கப் படுகிறது...' : 'Downloading...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 shrink-0" />{' '}
                        <span>{lang === 'ta' ? 'கடிதத்தை தரவிறக்க (Letter)' : 'Download Letter'}</span>
                      </>
                    )}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDownloadingCard || isDownloadingLetter}
                  id="close-success-btn"
                  className={`py-2.5 px-6 rounded-xl bg-brand-blue text-white hover:bg-slate-900 transition-colors text-xs font-semibold cursor-pointer shadow-md w-full sm:w-auto ${
                    (isDownloadingCard || isDownloadingLetter) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {lang === 'ta' ? 'முடிக்க' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
