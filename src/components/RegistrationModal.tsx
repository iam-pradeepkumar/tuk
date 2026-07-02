import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { X, CheckCircle, CreditCard, ChevronRight, Sparkles, User, GraduationCap, MapPin, KeyRound, Scale, Printer, Download, Smartphone, CalendarDays, Image as ImageIcon, AlertTriangle, Camera, Keyboard } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { Wing, MemberApplication } from '../types';
import { DISTRICTS, WINGS } from '../data';
import { TRANSLATIONS } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import WingIcon from './WingIcon';
import SearchableSelect from './SearchableSelect';
import { dbService } from '../lib/dbService';
import TamilKeyboard from './TamilKeyboard';

const filterTamilInput = (val: string): string => {
  // Allow Tamil characters, English letters, spaces, and dots so phonetic transliteration keyboards can function during input!
  return val.replace(/[^a-zA-Z \u0B80-\u0BFF\.]/g, '');
};

const hasTamil = (val: string): boolean => {
  return /[\u0B80-\u0BFF]/.test(val);
};

const hasEnglish = (val: string): boolean => {
  return /[a-zA-Z]/.test(val);
};

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
    if (!res.ok) {
      throw new Error(`Proxy returned status ${res.status}`);
    }
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
    console.warn('Failed to preload image, using original url:', url, err);
    return url;
  }
};

const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  
  let dateObj: Date | null = null;
  
  // Try standard parsing first
  const timestamp = Date.parse(dobString);
  if (!isNaN(timestamp)) {
    dateObj = new Date(timestamp);
  } else {
    // Fallback manual parsing for different formats
    if (dobString.includes('/')) {
      const parts = dobString.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        dateObj = new Date(year, month, day);
      }
    } else if (dobString.includes('-')) {
      const parts = dobString.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          dateObj = new Date(year, month, day);
        } else {
          // DD-MM-YYYY
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          dateObj = new Date(year, month, day);
        }
      }
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) return 0;
  
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const constituencyInputRef = useRef<HTMLInputElement | null>(null);
  const unionInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTamilField, setActiveTamilField] = useState<'name' | 'constituency' | 'union' | null>(null);

  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
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

  const [isExistingMembersLoaded, setIsExistingMembersLoaded] = useState(false);

  useEffect(() => {
    return dbService.subscribeToCollection('memberships', (data) => {
      setExistingMembers(data);
      setIsExistingMembersLoaded(true);
    });
  }, []);

  const [formData, setFormData] = useState<MemberApplication>({
    name: '',
    phone: '',
    age: 25,
    district: DISTRICTS[0],
    wingId: preselectedWingId || '',
    constituency: '',
    union: '',
    dob: '',
    bloodGroup: 'O +ve',
    memberId: ''
  });

  const [assignedSessionId, setAssignedSessionId] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAssignedSessionId('');
      setIsSubmitted(false);
      setIsAlreadyRegistered(false);
      setErrors({});
      setFormData({
        name: '',
        phone: '',
        age: 25,
        district: DISTRICTS[0],
        wingId: preselectedWingId || '',
        constituency: '',
        union: '',
        dob: '',
        bloodGroup: 'O +ve',
        memberId: ''
      });
      setMemberPhoto(null);
      setGeneratedCard(null);
      return;
    }

    if (isOpen && isExistingMembersLoaded && !assignedSessionId) {
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

      // Safeguard: Ensure this exact ID is not already used
      const existingIds = new Set(
        existingMembers.map((m: any) => (m.cardId || m.memberId || '').trim())
      );
      while (existingIds.has(`NRF-${nextNumber}`)) {
        nextNumber++;
      }

      const uniqueId = `NRF-${nextNumber}`;
      setAssignedSessionId(uniqueId);
      
      setFormData(prev => ({
        ...prev,
        memberId: uniqueId,
        dob: prev.dob || '',
        bloodGroup: prev.bloodGroup || 'O +ve'
      }));
    }
  }, [isOpen, existingMembers, isExistingMembersLoaded, assignedSessionId]);

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
    formattedDate: string;
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
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        tempErrors.dob = lang === 'ta' ? 'பிறந்த தேதி எதிர்கால தேதியாக இருக்கக்கூடாது' : 'Date of Birth cannot be a future date';
      }
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

  const handleTamilKeyPress = (char: string) => {
    if (!activeTamilField) return;
    
    let inputRef: React.RefObject<HTMLInputElement | null>;
    if (activeTamilField === 'name') inputRef = nameInputRef;
    else if (activeTamilField === 'constituency') inputRef = constituencyInputRef;
    else inputRef = unionInputRef;

    const input = inputRef.current;
    if (!input) {
      setFormData(prev => ({
        ...prev,
        [activeTamilField]: filterTamilInput(prev[activeTamilField] + char)
      }));
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const originalText = formData[activeTamilField] || '';
    const before = originalText.substring(0, start);
    const after = originalText.substring(end);
    const newText = filterTamilInput(before + char + after);

    setFormData(prev => ({
      ...prev,
      [activeTamilField]: newText
    }));

    setTimeout(() => {
      input.focus();
      const newCursorPos = start + char.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleTamilBackspace = () => {
    if (!activeTamilField) return;

    let inputRef: React.RefObject<HTMLInputElement | null>;
    if (activeTamilField === 'name') inputRef = nameInputRef;
    else if (activeTamilField === 'constituency') inputRef = constituencyInputRef;
    else inputRef = unionInputRef;

    const input = inputRef.current;
    if (!input) {
      setFormData(prev => ({
        ...prev,
        [activeTamilField]: prev[activeTamilField].slice(0, -1)
      }));
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const originalText = formData[activeTamilField] || '';
    
    if (start === 0 && end === 0) return;

    let before = '';
    let after = '';
    let newCursorPos = 0;

    if (start !== end) {
      before = originalText.substring(0, start);
      after = originalText.substring(end);
      newCursorPos = start;
    } else {
      before = originalText.substring(0, start - 1);
      after = originalText.substring(start);
      newCursorPos = Math.max(0, start - 1);
    }

    setFormData(prev => ({
      ...prev,
      [activeTamilField]: filterTamilInput(before + after)
    }));

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleTamilClear = () => {
    if (!activeTamilField) return;

    let inputRef: React.RefObject<HTMLInputElement | null>;
    if (activeTamilField === 'name') inputRef = nameInputRef;
    else if (activeTamilField === 'constituency') inputRef = constituencyInputRef;
    else inputRef = unionInputRef;

    setFormData(prev => ({
      ...prev,
      [activeTamilField]: ''
    }));

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Error playing video:", err));
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let errMsg = "Unable to access the camera. Please check your permissions.";
      if (err.name === 'NotAllowedError') {
        errMsg = "Camera access denied. Please grant permission in your browser settings.";
      } else if (err.name === 'NotFoundError') {
        errMsg = "No camera found on your device.";
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sx = (video.videoWidth - size) / 2;
          const sy = (video.videoHeight - size) / 2;
          ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
          
          const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const resized = await resizeImage(rawDataUrl, 300);
          setMemberPhoto(resized);
          if (errors.photo) {
            setErrors(prev => ({ ...prev, photo: undefined }));
          }
        }
      } catch (err) {
        console.error("Failed to capture photo:", err);
      } finally {
        stopCamera();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!memberPhoto) {
        startCamera();
      }
    } else {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

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
      setIsAlreadyRegistered(true);
      
      const currentVal = existingMember.validUntil || (lang === 'ta' ? 'குறிப்பிட்ட தேதி' : 'the validity date');
      const currentDate = existingMember.date || new Date().toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedLetterDate = existingMember.formattedDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

      setFormData({
        ...formData,
        ...existingMember
      });
      
      if (existingMember.photo) {
        setMemberPhoto(existingMember.photo);
      }
      
      setGeneratedCard({
        id: existingMember.cardId || existingMember.memberId || 'NRF-7001',
        issueDate: currentDate,
        formattedDate: formattedLetterDate,
        validDate: currentVal,
        avatarSeed: (existingMember.name || 'Member').replace(/\s+/g, ''),
        photo: existingMember.photo || undefined
      });
      
      setIsSubmitted(true);
      return;
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
      const response = await fetch('/api/translate-member-details', {
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

    let assignedId = 'NRF-7001';
    try {
      const res = await fetch('/api/generate-id', { method: 'POST' });
      const data = await res.json();
      if (data && data.id) {
        assignedId = data.id;
      }
    } catch (e) {
      console.error("Failed to generate ID from API", e);
      // Fallback
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

      const existingIds = new Set(
        existingMembers.map((m: any) => (m.cardId || m.memberId || '').trim())
      );
      while (existingIds.has(`NRF-${nextNumber}`)) {
        nextNumber++;
      }
      assignedId = `NRF-${nextNumber}`;
    }

    updatedFormData.memberId = assignedId; // Force the fresh unique ID into the form data

    setFormData(updatedFormData);

    const currentDate = new Date().toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Explicit DD.MM.YYYY format for the welcome letter
    const formattedLetterDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

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
      formattedDate: formattedLetterDate,
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

  if (!isOpen) return null;

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
                  <div className="relative">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={formData.name}
                      onChange={e => {
                        const val = e.target.value;
                        const filtered = filterTamilInput(val);
                        setFormData({ ...formData, name: filtered });
                        if (filtered.length >= 2 && !hasTamil(filtered) && hasEnglish(filtered)) {
                          setActiveTamilField('name');
                        }
                      }}
                      className={`w-full pl-4 pr-11 py-2.5 rounded-xl border ${
                        errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                      placeholder={lang === 'ta' ? 'உங்கள் முழுப் பெயர் (தமிழ் மட்டும்)' : 'Your full name (Tamil only)'}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTamilField(activeTamilField === 'name' ? null : 'name')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-100 border border-slate-200 bg-white transition-all cursor-pointer shadow-xs flex items-center justify-center"
                      title={lang === 'ta' ? 'ஆன்லைன் விசைப்பலகை காட்டவும்/மறைக்கவும்' : 'Toggle online keyboard'}
                    >
                      <Keyboard className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-sans">
                    <span>💡</span> {lang === 'ta' ? 'உங்கள் தமிழ் விசைப்பலகையைப் பயன்படுத்தலாம் அல்லது ஆன்லைன் விசைப்பலகைக்கு ⌨️ கிளிக் செய்யவும்.' : 'Use your Tamil keyboard or click ⌨️ for online keyboard.'}
                  </p>
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                  {activeTamilField === 'name' && (
                    <div className="pt-2 animate-fadeIn relative z-10">
                      <TamilKeyboard
                        onKeyPress={handleTamilKeyPress}
                        onBackspace={handleTamilBackspace}
                        onClear={handleTamilClear}
                        onClose={() => setActiveTamilField(null)}
                        lang={lang}
                      />
                    </div>
                  )}
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
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => {
                      const dobVal = e.target.value;
                      if (dobVal) {
                        const selectedDate = new Date(dobVal);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (selectedDate > today) {
                          setFormData({ ...formData, dob: '', age: 25 });
                          setErrors({ ...errors, dob: lang === 'ta' ? 'பிறந்த தேதி எதிர்கால தேதியாக இருக்கக்கூடாது' : 'Date of Birth cannot be a future date' });
                          return;
                        }
                      }
                      const calculatedAge = calculateAge(dobVal);
                      setFormData({ ...formData, dob: dobVal, age: calculatedAge });
                      if (errors.dob) {
                        const newErrors = { ...errors };
                        delete newErrors.dob;
                        setErrors(newErrors);
                      }
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



              {/* Photo Upload Zone (Responsive Drag-and-Drop) */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-705 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-brand-blue" /> {lang === 'ta' ? 'உறுப்பினர் புகைப்படம்' : 'Member Photo'} *
                </label>
                
                {cameraError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 font-sans mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {memberPhoto ? (
                  <div className="border-2 border-indigo-200 rounded-2xl p-4 bg-indigo-50/10 flex items-center gap-4 w-full">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img src={memberPhoto} alt="Upload Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-bold text-slate-800">
                        {lang === 'ta' ? 'புகைப்படம் வெற்றிகரமாக இணைக்கப்பட்டது' : 'Photo attached successfully'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'ta' ? 'மாற்ற புதிய புகைப்படத்தை தேர்வு செய்யவும்' : 'Ready for ID Card Generation'}
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
                ) : isCameraActive ? (
                  <div className="border-2 border-indigo-500 rounded-2xl p-4 bg-slate-900 flex flex-col items-center gap-3 w-full">
                    <div className="relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden border-2 border-indigo-400 bg-black">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-600/95 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        {lang === 'ta' ? 'கேமரா நேரலை' : 'Live Camera'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 mt-1 w-full max-w-[240px]">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {lang === 'ta' ? 'படம் பிடி' : 'Capture Photo'}
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-slate-700 hover:bg-slate-605 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {lang === 'ta' ? 'ரத்து' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Method Toggle Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('photo-upload-input')?.click()}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lang === 'ta' ? 'கோப்பிலிருந்து பதிவேற்று' : 'Upload File'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lang === 'ta' ? 'கேமரா மூலம் படம் பிடி' : 'Take Photo'}</span>
                      </button>
                    </div>

                    {/* Standard Drag & Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        errors.photo
                          ? 'border-red-500 bg-red-50/10'
                          : isDragging
                          ? 'border-amber-400 bg-amber-400/5'
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
                      <div className="text-center space-y-1.5 py-1">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500 font-bold">
                            {lang === 'ta' ? 'அல்லது கோப்பை இங்கு இழுத்து விடவும்' : 'Or drag and drop your image here'}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            PNG, JPG (Max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {errors.photo && <p className="text-xs text-red-500 font-medium mt-1">{errors.photo}</p>}
              </div>

              {/* Constituency and Union */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t.regFormConstituency} *</label>
                  <div className="relative">
                    <input
                      ref={constituencyInputRef}
                      type="text"
                      value={formData.constituency}
                      onChange={e => {
                        const val = e.target.value;
                        const filtered = filterTamilInput(val);
                        setFormData({ ...formData, constituency: filtered });
                        if (filtered.length >= 2 && !hasTamil(filtered) && hasEnglish(filtered)) {
                          setActiveTamilField('constituency');
                        }
                      }}
                      className={`w-full pl-4 pr-11 py-2.5 rounded-xl border ${
                        errors.constituency ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                      placeholder={lang === 'ta' ? 'எ.கா. மயிலாப்பூர் (தமிழ் மட்டும்)' : 'e.g. Mylapore (Tamil only)'}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTamilField(activeTamilField === 'constituency' ? null : 'constituency')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-100 border border-slate-200 bg-white transition-all cursor-pointer shadow-xs flex items-center justify-center"
                      title={lang === 'ta' ? 'ஆன்லைன் விசைப்பலகை காட்டவும்/மறைக்கவும்' : 'Toggle online keyboard'}
                    >
                      <Keyboard className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-sans">
                    <span>💡</span> {lang === 'ta' ? 'உங்கள் தமிழ் விசைப்பலகையைப் பயன்படுத்தலாம் அல்லது ஆன்லைன் விசைப்பலகைக்கு ⌨️ கிளிக் செய்யவும்.' : 'Use your Tamil keyboard or click ⌨️ for online keyboard.'}
                  </p>
                  {errors.constituency && <p className="text-xs text-red-500 font-medium">{errors.constituency}</p>}
                  {activeTamilField === 'constituency' && (
                    <div className="pt-2 animate-fadeIn relative z-10">
                      <TamilKeyboard
                        onKeyPress={handleTamilKeyPress}
                        onBackspace={handleTamilBackspace}
                        onClear={handleTamilClear}
                        onClose={() => setActiveTamilField(null)}
                        lang={lang}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t.regFormUnion} *</label>
                  <div className="relative">
                    <input
                      ref={unionInputRef}
                      type="text"
                      value={formData.union}
                      onChange={e => {
                        const val = e.target.value;
                        const filtered = filterTamilInput(val);
                        setFormData({ ...formData, union: filtered });
                        if (filtered.length >= 2 && !hasTamil(filtered) && hasEnglish(filtered)) {
                          setActiveTamilField('union');
                        }
                      }}
                      className={`w-full pl-4 pr-11 py-2.5 rounded-xl border ${
                        errors.union ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-slate-50 text-sm`}
                      placeholder={lang === 'ta' ? 'எ.கா. கிழக்கு ஒன்றியம் (தமிழ் மட்டும்)' : 'e.g. East Union (Tamil only)'}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTamilField(activeTamilField === 'union' ? null : 'union')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-100 border border-slate-200 bg-white transition-all cursor-pointer shadow-xs flex items-center justify-center"
                      title={lang === 'ta' ? 'ஆன்லைன் விசைப்பலகை காட்டவும்/மறைக்கவும்' : 'Toggle online keyboard'}
                    >
                      <Keyboard className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-sans">
                    <span>💡</span> {lang === 'ta' ? 'உங்கள் தமிழ் விசைப்பலகையைப் பயன்படுத்தலாம் அல்லது ஆன்லைன் விசைப்பலகைக்கு ⌨️ கிளிக் செய்யவும்.' : 'Use your Tamil keyboard or click ⌨️ for online keyboard.'}
                  </p>
                  {errors.union && <p className="text-xs text-red-500 font-medium">{errors.union}</p>}
                  {activeTamilField === 'union' && (
                    <div className="pt-2 animate-fadeIn relative z-10">
                      <TamilKeyboard
                        onKeyPress={handleTamilKeyPress}
                        onBackspace={handleTamilBackspace}
                        onClear={handleTamilClear}
                        onClose={() => setActiveTamilField(null)}
                        lang={lang}
                      />
                    </div>
                  )}
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
              <div className={`p-3 rounded-full border ${isAlreadyRegistered ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                {isAlreadyRegistered ? (
                  <AlertTriangle className="w-12 h-12 text-amber-600 animate-pulse" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-emerald-600 animate-bounce" />
                )}
              </div>

              <div className="space-y-1 max-w-md">
                <h4 className="font-sans font-bold text-xl text-slate-900 leading-tight">
                  {isAlreadyRegistered ? (
                    lang === 'ta' ? 'உறுப்பினர் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளார்!' : 'Member Already Registered!'
                  ) : (
                    t.regSuccessTitle
                  )}
                </h4>
                <p className="text-slate-550 text-sm mt-1">
                  {isAlreadyRegistered ? (
                    lang === 'ta' ? 'நீங்கள் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளீர்கள்! உங்களுக்கான உறுப்பினர் அட்டை மற்றும் அனுமதி கடிதம் கீழே தயார் நிலையில் உள்ளது.' : 'This number is already registered! You already have an active membership with us. Your card and welcome letter are displayed below.'
                  ) : (
                    t.regSuccessDesc
                  )}
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
                          className="absolute inset-0 w-full h-full object-cover z-0"
                          
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
                          
                          {/* Date */}
                          <div 
                            className="absolute top-[232px] right-[55px] text-right"
                            style={{ marginRight: '-22px', marginBottom: '0px', marginTop: '5px' }}
                          >
                            <p className="text-[14px] font-black text-[#E21836] inline-block text-right whitespace-nowrap">
                              {generatedCard?.formattedDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}
                            </p>
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
                          className="absolute inset-0 w-full h-full object-cover z-0"
                          
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
                          
                          {/* Date */}
                          <div 
                            className="absolute top-[232px] right-[55px] text-right"
                            style={{ marginRight: '-22px', marginBottom: '0px', marginTop: '5px' }}
                          >
                            <p className="text-[14px] font-black text-[#E21836] inline-block text-right whitespace-nowrap">
                              {generatedCard?.formattedDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}
                            </p>
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
