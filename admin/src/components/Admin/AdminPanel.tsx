import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { 
  Users, 
  Search, 
  Trash2, 
  Download, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Edit2,
  Plus,
  X,
  UserPlus,
  Upload,
  MessageSquare,
  Send,
  Save,
  User,
  AlertTriangle
} from 'lucide-react';
import { MemberApplication, Wing, Officer, HistoryItem, MediaItem } from '../../types';
import { WINGS, DISTRICTS, getStoredOfficers, saveStoredOfficers, MEDIA_ITEMS } from '../../data';
import WingIcon from '../WingIcon';
import SearchableSelect from '../SearchableSelect';
import { dbService } from '../../lib/dbService';

interface StoredMember extends MemberApplication {
  id?: string;
  cardId: string;
  date: string;
  photo: string | null;
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

const getMemberAge = (member: any): number => {
  if (member && member.dob) {
    const calc = calculateAge(member.dob);
    if (calc > 0 && calc < 120) return calc;
  }
  return member?.age || 25;
};

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  // Tabs: 'applicants' | 'officers'
  const [activeTab, setActiveTab] = useState<'applicants' | 'officers' | 'history' | 'media'>('applicants');

  const [bgs, setBgs] = useState({
    logo: 'https://i.ibb.co/bYGc84w/image.png',
    front: 'https://i.ibb.co/20qxy4NV/image.png',
    back: 'https://i.ibb.co/0RmGfYgq/image.png',
    letter: 'https://i.ibb.co/6Rnrxb1Q/le.png'
  });
  const [selectedMember, setSelectedMember] = useState<StoredMember | null>(null);
  const [selectedOfficerForDownload, setSelectedOfficerForDownload] = useState<Officer | null>(null);
  const [officerImageB64, setOfficerImageB64] = useState('');
  const [memberImageB64, setMemberImageB64] = useState('');

  useEffect(() => {
    getBase64Image('https://i.ibb.co/bYGc84w/image.png').then(res => setBgs(b => ({ ...b, logo: res })));
    getBase64Image('https://i.ibb.co/20qxy4NV/image.png').then(res => setBgs(b => ({ ...b, front: res })));
    getBase64Image('https://i.ibb.co/0RmGfYgq/image.png').then(res => setBgs(b => ({ ...b, back: res })));
    getBase64Image('https://i.ibb.co/6Rnrxb1Q/le.png').then(res => setBgs(b => ({ ...b, letter: res })));
  }, []);

  useEffect(() => {
    if (selectedMember) {
      if (selectedMember.photo) {
        getBase64Image(selectedMember.photo).then(setMemberImageB64);
      } else {
        getBase64Image(`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedMember.name.replace(/\s+/g, '')}`).then(setMemberImageB64);
      }
    } else {
      setMemberImageB64('');
    }
  }, [selectedMember]);

  useEffect(() => {
    if (selectedOfficerForDownload) {
      if (selectedOfficerForDownload.imageUrl) {
        getBase64Image(selectedOfficerForDownload.imageUrl).then(setOfficerImageB64);
      } else {
        getBase64Image(`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedOfficerForDownload.id}`).then(setOfficerImageB64);
      }
    } else {
      setOfficerImageB64('');
    }
  }, [selectedOfficerForDownload]);
  
  // Members State
  const [members, setMembers] = useState<StoredMember[]>(() => {
    const saved = localStorage.getItem('tuk_memberships');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWing, setFilterWing] = useState('all');
  const [view, setView] = useState<'list' | 'details'>('list');

  // Card & Letter Download & Wing Assignment States
  const adminCardRef = useRef<HTMLDivElement>(null);
  const adminCardBackRef = useRef<HTMLDivElement>(null);
  const adminLetterRef = useRef<HTMLDivElement>(null);
  const [activeMemberTab, setActiveMemberTab] = useState<'card' | 'letter'>('card');
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [isAdminFlipped, setIsAdminFlipped] = useState(false);
  const [isDownloadingLetter, setIsDownloadingLetter] = useState(false);
  const [downloadCardError, setDownloadCardError] = useState<string | null>(null);
  const [downloadLetterError, setDownloadLetterError] = useState<string | null>(null);
  const [assignedWingId, setAssignedWingId] = useState<string>('');
  const [isUpdatingWing, setIsUpdatingWing] = useState(false);
  const [wingUpdateSuccess, setWingUpdateSuccess] = useState(false);
  const [cardScale, setCardScale] = useState(1);
  const [letterScale, setLetterScale] = useState(1);

  // Officer credentials states
  const [activeOfficerTab, setActiveOfficerTab] = useState<'card' | 'letter'>('card');
  const [isDownloadingOfficerCard, setIsDownloadingOfficerCard] = useState(false);
  const [isDownloadingOfficerLetter, setIsDownloadingOfficerLetter] = useState(false);
  const [downloadOfficerCardError, setDownloadOfficerCardError] = useState<string | null>(null);
  const [downloadOfficerLetterError, setDownloadOfficerLetterError] = useState<string | null>(null);
  const [officerCardScale, setOfficerCardScale] = useState(1);
  const [officerLetterScale, setOfficerLetterScale] = useState(1);
  const officerCardRef = useRef<HTMLDivElement>(null);
  const officerLetterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view !== 'details' || !selectedMember) return;
    
    const updateScale = () => {
      const containerElement = document.getElementById('admin-member-preview-column');
      if (containerElement) {
        const width = containerElement.getBoundingClientRect().width;
        if (width > 0) {
          const availableWidth = width - 40;
          setCardScale(Math.min(1, Math.max(0.4, availableWidth / 500)));
          setLetterScale(Math.min(1, Math.max(0.3, availableWidth / 595)));
        }
      }
    };
    
    updateScale();
    const t1 = setTimeout(updateScale, 30);
    const t2 = setTimeout(updateScale, 100);
    const t3 = setTimeout(updateScale, 200);
    const t4 = setTimeout(updateScale, 400);
    const t5 = setTimeout(updateScale, 700);
    
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('resize', updateScale);
    };
  }, [view, selectedMember, activeMemberTab]);

  useEffect(() => {
    if (!selectedOfficerForDownload) return;
    
    const updateOfficerScale = () => {
      const containerElement = document.getElementById('officer-preview-container');
      if (containerElement) {
        const width = containerElement.getBoundingClientRect().width;
        if (width > 0) {
          const availableWidth = width - 48;
          setOfficerCardScale(Math.min(1, Math.max(0.4, availableWidth / 500)));
          setOfficerLetterScale(Math.min(1, Math.max(0.3, availableWidth / 595)));
        }
      }
    };
    
    updateOfficerScale();
    const t1 = setTimeout(updateOfficerScale, 30);
    const t2 = setTimeout(updateOfficerScale, 100);
    const t3 = setTimeout(updateOfficerScale, 200);
    const t4 = setTimeout(updateOfficerScale, 400);
    const t5 = setTimeout(updateOfficerScale, 700);
    
    window.addEventListener('resize', updateOfficerScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('resize', updateOfficerScale);
    };
  }, [selectedOfficerForDownload, activeOfficerTab]);

  const handleUpdateWing = async () => {
    if (!selectedMember) return;
    setIsUpdatingWing(true);
    setWingUpdateSuccess(false);
    try {
      const updatedMember = {
        ...selectedMember,
        wingId: assignedWingId
      };
      await dbService.saveItem('memberships', selectedMember.phone, updatedMember);
      setSelectedMember(updatedMember);
      setWingUpdateSuccess(true);
      setTimeout(() => setWingUpdateSuccess(false), 3000);
    } catch (err) {
      console.log('Failed to update membership wing list:', err);
      alert('Failed to update wing. Please try again.');
    } finally {
      setIsUpdatingWing(false);
    }
  };

  const handleDownloadBothSides = async () => {
    if (!adminCardRef.current || !adminCardBackRef.current || !selectedMember || isDownloadingCard) return;
    setIsDownloadingCard(true);
    setDownloadCardError(null);

    try {
      // 1. Download Front Side
      const frontDataUrl = await htmlToImage.toPng(adminCardRef.current, { pixelRatio: 2, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const frontLink = document.createElement('a');
      frontLink.download = `TUK_MemberCard_FRONT_${selectedMember.name.replace(/\s+/g, '_')}.png`;
      frontLink.href = frontDataUrl;
      frontLink.click();

      // Small tick between downloads to prevent race conditions on browser download manager
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 2. Download Back Side
      const backDataUrl = await htmlToImage.toPng(adminCardBackRef.current, { pixelRatio: 2, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const backLink = document.createElement('a');
      backLink.download = `TUK_MemberCard_BACK_${selectedMember.name.replace(/\s+/g, '_')}.png`;
      backLink.href = backDataUrl;
      backLink.click();
    } catch (err) {
      console.log('Render stream failed:', err);
      // Fallback with slightly lower pixel ratio to bypass potential heavy rendering memory boundary
      try {
        const frontDataUrl = await htmlToImage.toPng(adminCardRef.current, { pixelRatio: 1.5, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const frontLink = document.createElement('a');
        frontLink.download = `TUK_MemberCard_FRONT_${selectedMember.name.replace(/\s+/g, '_')}.png`;
        frontLink.href = frontDataUrl;
        frontLink.click();

        await new Promise((resolve) => setTimeout(resolve, 150));

        const backDataUrl = await htmlToImage.toPng(adminCardBackRef.current, { pixelRatio: 1.5, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const backLink = document.createElement('a');
        backLink.download = `TUK_MemberCard_BACK_${selectedMember.name.replace(/\s+/g, '_')}.png`;
        backLink.href = backDataUrl;
        backLink.click();
      } catch (retryErr) {
        console.log('All render streams failed:', retryErr);
        setDownloadCardError('Unable to download card. Please try again.');
      }
    } finally {
      setIsDownloadingCard(false);
    }
  };

  const handleDownloadLetter = async () => {
    if (!adminLetterRef.current || isDownloadingLetter || !selectedMember) return;
    setIsDownloadingLetter(true);
    setDownloadLetterError(null);
    
    try {
      const dataUrl = await htmlToImage.toPng(adminLetterRef.current, { pixelRatio: 2.5, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const link = document.createElement('a');
      link.download = `TUK_RegistrationLetter_${selectedMember.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.log('Letter export session 1 encountered warning, attempting backup rendering route...', err);
      try {
        const dataUrl = await htmlToImage.toPng(adminLetterRef.current, { pixelRatio: 1.8, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const link = document.createElement('a');
        link.download = `TUK_RegistrationLetter_${selectedMember.name.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (retryErr) {
        console.log('All letter render streams failed:', retryErr);
        setDownloadLetterError('Unable to download welcome letter. Please try again.');
      }
    } finally {
      setIsDownloadingLetter(false);
    }
  };

  const handleDownloadOfficerCard = async () => {
    if (!officerCardRef.current || isDownloadingOfficerCard || !selectedOfficerForDownload) return;
    setIsDownloadingOfficerCard(true);
    setDownloadOfficerCardError(null);
    
    try {
      const dataUrl = await htmlToImage.toPng(officerCardRef.current, { pixelRatio: 3, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const link = document.createElement('a');
      link.download = `TUK_OfficerCard_${selectedOfficerForDownload.name_en.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.log('Card export session 1 encountered warning, attempting backup rendering route...', err);
      try {
        const dataUrl = await htmlToImage.toPng(officerCardRef.current, { pixelRatio: 2, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const link = document.createElement('a');
        link.download = `TUK_OfficerCard_${selectedOfficerForDownload.name_en.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (retryErr) {
        console.log('All officer card render streams failed:', retryErr);
        setDownloadOfficerCardError('Unable to download officer card. Please try again.');
      }
    } finally {
      setIsDownloadingOfficerCard(false);
    }
  };

  const handleDownloadOfficerLetter = async () => {
    if (!officerLetterRef.current || isDownloadingOfficerLetter || !selectedOfficerForDownload) return;
    setIsDownloadingOfficerLetter(true);
    setDownloadOfficerLetterError(null);
    
    try {
      const dataUrl = await htmlToImage.toPng(officerLetterRef.current, { pixelRatio: 2.5, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
      
      const link = document.createElement('a');
      link.download = `TUK_AppointmentLetter_${selectedOfficerForDownload.name_en.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.log('Letter export session 1 encountered warning, attempting backup rendering route...', err);
      try {
        const dataUrl = await htmlToImage.toPng(officerLetterRef.current, { pixelRatio: 1.8, skipFonts: true, cacheBust: true, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        
        const link = document.createElement('a');
        link.download = `TUK_AppointmentLetter_${selectedOfficerForDownload.name_en.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (retryErr) {
        console.log('All officer letter render streams failed:', retryErr);
        setDownloadOfficerLetterError('Unable to download appointment letter. Please try again.');
      }
    } finally {
      setIsDownloadingOfficerLetter(false);
    }
  };

  // Officers State
  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem('tuk_officers');
    return saved ? JSON.parse(saved) : getStoredOfficers();
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('tuk_officer_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [officerSearch, setOfficerSearch] = useState('');
  const [officerLevelFilter, setOfficerLevelFilter] = useState<'all' | 'state' | 'district' | 'constituency' | 'union' | 'branch' | 'ward' | 'wing'>('all');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  
  // Officer Add/Edit States
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  
  // Officer Form Fields
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formRoleEn, setFormRoleEn] = useState('');
  const [formLevel, setFormLevel] = useState<'state' | 'district' | 'constituency' | 'union' | 'branch' | 'ward' | 'wing'>('state');
  const [formDistrict, setFormDistrict] = useState(''); // parsed from DISTRICTS dropdown
  const [formWingId, setFormWingId] = useState('');
  const [formConstituency, setFormConstituency] = useState('');
  const [formConstituencyEn, setFormConstituencyEn] = useState('');
  const [formUnion, setFormUnion] = useState('');
  const [formUnionEn, setFormUnionEn] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formBranchEn, setFormBranchEn] = useState('');
  const [formWard, setFormWard] = useState('');
  const [formWardEn, setFormWardEn] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTamilNameManual, setIsTamilNameManual] = useState(false);
  const [isTamilRoleManual, setIsTamilRoleManual] = useState(false);

  // WhatsApp Share State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppOfficer, setWhatsAppOfficer] = useState<Officer | null>(null);
  const [whatsAppActionType, setWhatsAppActionType] = useState<'add' | 'edit'>('add');
  const [whatsAppPhoneNumber, setWhatsAppPhoneNumber] = useState('');
  const [whatsAppCustomText, setWhatsAppCustomText] = useState('');

  // Media State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('tuk_media');
    return saved ? JSON.parse(saved) : MEDIA_ITEMS;
  });
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  
  // Media Form Fields
  const [isMediaFormOpen, setIsMediaFormOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [mediaFormType, setMediaFormType] = useState<'add' | 'edit'>('add');
  const [formMediaTitle, setFormMediaTitle] = useState('');
  const [formMediaTitleEn, setFormMediaTitleEn] = useState('');
  const [formMediaType, setFormMediaType] = useState<'photo' | 'video'>('photo');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formMediaThumbnailUrl, setFormMediaThumbnailUrl] = useState('');
  const [formMediaTag, setFormMediaTag] = useState('');
  const [formMediaTagEn, setFormMediaTagEn] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState('');

  const cleanAndNormalizePhone = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10) {
      return '91' + digits;
    }
    return digits;
  };

  const generateWhatsAppLetter = (officer: Officer, type: 'add' | 'edit') => {
    const levelText = officer.level === 'state' ? 'மாநிலப் பிரிவு' : 'மாவட்டப் பிரிவு';
    const levelTextEn = officer.level === 'state' ? 'State Level' : 'District Level';
    const districtText = officer.district || 'அனைத்து மாவட்டங்கள்';
    const districtTextEn = officer.district_en || 'All Districts';

    return `*புரட்சி இயக்கம் - ${type === 'add' ? 'பணி நியமன ஆணை' : 'பதவி உயர்வு ஆணை'}*\n` +
           `----------------------------------------\n` +
           `அன்பார்ந்த *${officer.name}* அவர்களுக்கு,\n\n` +
           `வணக்கம். நமது இயக்கத்தின் தலைமை குழு முடிவின்படி, தங்களின் அர்ப்பணிப்புள்ள மக்கள் பணியை அங்கீகரிக்கும் விதமாக, தங்களை பின்வரும் பொறுப்பிற்கு ${type === 'add' ? 'நியமிக்கிறோம்' : 'பதவி உயர்வு வழங்குகிறோம்'}.\n\n` +
           `*பொறுப்பு:* ${officer.role} (${levelText})\n` +
           `*வட்டம்/பகுதி:* ${districtText}\n\n` +
           `தங்கள் புதிய பொறுப்பில் சிறந்து விளங்கி, நமது இயக்கத்தின் கொள்கைகளை மக்களிடம் கொண்டு சேர்க்க வாழ்த்துகிறோம்.\n\n` +
           `*தங்கள் உறுப்பினர் அட்டை மற்றும் நியமன கடிதம் இத்துடன் இணைக்கப்பட்டுள்ளது.*\n\n` +
           `இப்படிக்கு,\n` +
           `*தலைமையகம்*\n` +
           `----------------------------------------\n` +
           `*REVOLUTION MOVEMENT - ${type === 'add' ? 'APPOINTMENT ORDER' : 'PROMOTION ORDER'}*\n` +
           `Dear *${officer.name_en}*,\n\n` +
           `In recognition of your dedication, we are pleased to ${type === 'add' ? 'appoint you to' : 'promote you to'} the following executive role:\n\n` +
           `*Role:* ${officer.role_en} (${levelTextEn})\n` +
           `*District/Region:* ${districtTextEn}\n\n` +
           `Congratulations & wishing you success in your service to the people!\n\n` +
           `*Your membership card and appointment letter are attached.*\n\n` +
           `Regards,\n` +
           `*Headquarters*`;
  };

  // Load Applicants, Officers, and History on Mount
  useEffect(() => {
    const unsubMembers = dbService.subscribeToCollection('memberships', (data) => {
      // Show newest first
      const sorted = [...data].sort((a, b) => b.validUntilTimestamp - a.validUntilTimestamp);
      setMembers(sorted);
    });
    const unsubHistory = dbService.subscribeToCollection('officer_history', (data) => {
      // Show newest history first
      const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(sorted);
    });
    const unsubOfficers = dbService.subscribeToCollection('officers', (data) => {
      if (data.length === 0) {
        // Seed initial OFFICERS to Firestore if empty
        const initial = getStoredOfficers();
        setOfficers(initial);
        localStorage.setItem('tuk_officers', JSON.stringify(initial));
        window.dispatchEvent(new Event('officers_updated'));
        initial.forEach(async (officer) => {
          await dbService.saveItem('officers', officer.id, officer);
        });
      } else {
        // Keep officers state updated in real-time and notify other parts of the client
        setOfficers(data);
        localStorage.setItem('tuk_officers', JSON.stringify(data));
        window.dispatchEvent(new Event('officers_updated'));
      }
    });

    const unsubMedia = dbService.subscribeToCollection('media', (data) => {
      if (data.length === 0) {
        // Seed initial MEDIA to Firestore if empty
        setMediaItems(MEDIA_ITEMS);
        localStorage.setItem('tuk_media', JSON.stringify(MEDIA_ITEMS));
        window.dispatchEvent(new Event('media_updated'));
        MEDIA_ITEMS.forEach(async (item) => {
          await dbService.saveItem('media', item.id, item);
        });
      } else {
        setMediaItems(data);
        localStorage.setItem('tuk_media', JSON.stringify(data));
        window.dispatchEvent(new Event('media_updated'));
      }
    });

    return () => {
      unsubMembers();
      unsubHistory();
      unsubOfficers();
      unsubMedia();
    };
  }, []);

  // Auto-translate English names & roles to Tamil via server-side Gemini API
  useEffect(() => {
    if (!formNameEn.trim() && !formRoleEn.trim()) {
      return;
    }

    // If editing and values equal the starting values, skip translation
    if (formType === 'edit' && editingOfficer && formNameEn === editingOfficer.name_en && formRoleEn === editingOfficer.role_en) {
      return;
    }

    const controller = new AbortController();
    const delayDebounceFn = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const response = await fetch('https://api.theasiyaurimaigalkalam.in/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formNameEn, role: formRoleEn }),
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          // Only update if not manually touched by user
          if (data.tamilName && !isTamilNameManual && formNameEn.trim()) {
            setFormName(data.tamilName);
          }
          if (data.tamilRole && !isTamilRoleManual && formRoleEn.trim()) {
            setFormRole(data.tamilRole);
          }
        }
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          console.log('Auto-translation failed:', error);
        }
      } finally {
        setIsTranslating(false);
      }
    }, 350);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [formNameEn, formRoleEn, formType, editingOfficer, isTamilNameManual, isTamilRoleManual]);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Handle deleting individual applicant
  const handleDelete = (cardId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Member Registration',
      message: 'Are you sure you want to permanently delete this member registration? This cannot be undone.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        const memberToDelete = members.find(m => m.cardId === cardId);
        if (memberToDelete) {
          await dbService.deleteItem('memberships', memberToDelete.id || memberToDelete.phone);
        }
        if (selectedMember?.cardId === cardId) {
          setView('list');
          setSelectedMember(null);
        }
      }
    });
  };

  // Handle deleting executive officer
  const handleDeleteOfficer = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Executive Member',
      message: 'Are you sure you want to remove this executive member? All connected lists on the home and directory pages will be updated immediately.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        const officerToRemove = officers.find(o => o.id === id);
        if (officerToRemove) {
          await addToHistory(officerToRemove, 'removed');
          await dbService.deleteItem('officers', id);
        }
      }
    });
  };

  // Parse districts list for selection helper
  const parsedDistricts = useMemo(() => {
    return DISTRICTS.map(d => {
      const parts = d.split(' (');
      const ta = parts[0];
      const en = parts[1]?.replace(')', '') || parts[0];
      return { ta, en, original: d };
    });
  }, []);

  // Add to History
  const addToHistory = async (officer: Officer, type: 'added' | 'removed') => {
    const newItem: HistoryItem = {
      id: `${officer.id}_${Date.now()}`,
      officer,
      type,
      timestamp: new Date().toISOString()
    };
    await dbService.saveItem('officer_history', newItem.id, newItem);
  };

  // Set up forms for editing / adding
  const openAddOfficer = () => {
    setFormType('add');
    setEditingOfficer(null);
    setFormName('');
    setFormNameEn('');
    setFormRole('');
    setFormRoleEn('');
    setFormLevel('state');
    setIsTamilNameManual(false);
    setIsTamilRoleManual(false);
    // Default to the first district
    const firstDist = parsedDistricts[0] ? parsedDistricts[0].original : '';
    setFormDistrict(firstDist);
    setFormWingId('youth');
    setFormConstituency('');
    setFormConstituencyEn('');
    setFormUnion('');
    setFormUnionEn('');
    setFormBranch('');
    setFormBranchEn('');
    setFormWard('');
    setFormWardEn('');
    setFormPhone('');
    setFormImageUrl('');
    setIsFormModalOpen(true);
  };

  const openEditOfficer = (officer: Officer) => {
    setFormType('edit');
    setEditingOfficer(officer);
    setFormName(officer.name);
    setFormNameEn(officer.name_en);
    setFormRole(officer.role);
    setFormRoleEn(officer.role_en);
    setFormLevel((officer.level === 'state' || officer.level === 'district' || officer.level === 'constituency' || officer.level === 'union' || officer.level === 'branch' || officer.level === 'ward' || officer.level === 'wing') ? officer.level : 'state');
    setIsTamilNameManual(false);
    setIsTamilRoleManual(false);
    
    // Find matching district original string
    const matchingDistrict = parsedDistricts.find(d => d.ta === officer.district || d.en === officer.district_en);
    setFormDistrict(matchingDistrict ? matchingDistrict.original : DISTRICTS[0] || '');
    setFormWingId(officer.wingId || 'youth');
    setFormConstituency(officer.constituency || '');
    setFormConstituencyEn(officer.constituency_en || '');
    setFormUnion(officer.union || '');
    setFormUnionEn(officer.union_en || '');
    setFormBranch(officer.branch || '');
    setFormBranchEn(officer.branch_en || '');
    setFormWard(officer.ward || '');
    setFormWardEn(officer.ward_en || '');
    
    setFormPhone(officer.phone || '');
    setFormImageUrl(officer.imageUrl || '');
    setIsFormModalOpen(true);
  };

  // Submit Officer Add/Edit Form
  const handleOfficerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameEn.trim() || !formRoleEn.trim() || !formDistrict) {
      // Return early instead of alert
      return;
    }

    // Parse the chosen district
    const matchingDistrict = parsedDistricts.find(d => d.original === formDistrict);
    const districtTa = matchingDistrict ? matchingDistrict.ta : '';
    const districtEn = matchingDistrict ? matchingDistrict.en : '';

    const newOfficerData: Officer = {
      id: formType === 'edit' && editingOfficer ? editingOfficer.id : `off_${Date.now()}`,
      name: formName.trim() || formNameEn.trim(),
      name_en: formNameEn.trim(),
      role: formRole.trim() || formRoleEn.trim(),
      role_en: formRoleEn.trim(),
      level: formLevel,
      district: districtTa,
      district_en: districtEn,
      phone: formPhone.trim() || undefined,
      imageUrl: formImageUrl.trim() || undefined,
      wingId: formLevel === 'wing' ? formWingId : undefined,
      constituency: formLevel === 'constituency' ? formConstituency.trim() || undefined : undefined,
      constituency_en: formLevel === 'constituency' ? formConstituencyEn.trim() || undefined : undefined,
      union: formLevel === 'union' ? formUnion.trim() || undefined : undefined,
      union_en: formLevel === 'union' ? formUnionEn.trim() || undefined : undefined,
      branch: formLevel === 'branch' ? formBranch.trim() || undefined : undefined,
      branch_en: formLevel === 'branch' ? formBranchEn.trim() || undefined : undefined,
      ward: formLevel === 'ward' ? formWard.trim() || undefined : undefined,
      ward_en: formLevel === 'ward' ? formWardEn.trim() || undefined : undefined
    };

    // Close the form modal immediately to prevent UI lag/double submit
    setIsFormModalOpen(false);
    setEditingOfficer(null);

    // Save to Firestore directly
    await dbService.saveItem('officers', newOfficerData.id, newOfficerData);
    
    // Log addition into history
    if (formType === 'add') {
      await addToHistory(newOfficerData, 'added');
    }

    // Prepare and open WhatsApp Share Modal
    const initialText = generateWhatsAppLetter(newOfficerData, formType);
    setWhatsAppOfficer(newOfficerData);
    setWhatsAppActionType(formType);
    setWhatsAppPhoneNumber(newOfficerData.phone || '');
    setWhatsAppCustomText(initialText);
    setWhatsAppModalOpen(true);
  };

  // Filter Applicants
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m?.phone?.includes(searchTerm) ||
      m?.cardId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWing = filterWing === 'all' || m.wingId === filterWing;
    return matchesSearch && matchesWing;
  });

  // Filter Officers
  const filteredOfficers = officers.filter(o => {
    const query = officerSearch.toLowerCase();
    const matchesSearch = 
      (o.name || '').toLowerCase().includes(query) ||
      (o.name_en || '').toLowerCase().includes(query) ||
      (o.role || '').toLowerCase().includes(query) ||
      (o.role_en || '').toLowerCase().includes(query) ||
      (o.district || '').toLowerCase().includes(query) ||
      (o.district_en || '').toLowerCase().includes(query) ||
      (o.constituency || '').toLowerCase().includes(query) ||
      (o.constituency_en || '').toLowerCase().includes(query) ||
      (o.union || '').toLowerCase().includes(query) ||
      (o.union_en || '').toLowerCase().includes(query) ||
      (o.branch || '').toLowerCase().includes(query) ||
      (o.branch_en || '').toLowerCase().includes(query) ||
      (o.ward || '').toLowerCase().includes(query) ||
      (o.ward_en || '').toLowerCase().includes(query);
    const matchesLevel = officerLevelFilter === 'all' || o.level === officerLevelFilter;
    return matchesSearch && matchesLevel;
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
  

  // Export Registered Members to CSV
  const exportCSV = () => {
    const headers = ['Card ID', 'Name', 'Phone', 'Email', 'Age', 'Gender', 'Education', 'District', 'Wing', 'Join Date', 'Address'];
    const rows = members.map(m => [
      m.cardId,
      m.name,
      `'${m.phone}`, // Force string in Excel
      m.email || 'N/A',
      getMemberAge(m),
      m.gender,
      m.education,
      m.district,
      WINGS.find(w => w.id === m.wingId)?.name_en || m.wingId,
      m.date,
      m.address.replace(/\n/g, ' ')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tuk_members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHistoryTab = () => {
    const filteredHistory = history.filter(item => {
      const query = historySearchTerm.toLowerCase();
      if (!query) return true;
      const { officer } = item;
      return (
        (officer?.name?.toLowerCase().includes(query) || false) ||
        (officer?.name_en?.toLowerCase().includes(query) || false) ||
        (officer?.role?.toLowerCase().includes(query) || false) ||
        (officer?.role_en?.toLowerCase().includes(query) || false) ||
        (officer?.district?.toLowerCase().includes(query) || false) ||
        (officer?.district_en?.toLowerCase().includes(query) || false)
      );
    });

    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-900">Executive Member History</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search history by name, district, or position..."
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-full sm:w-80 transition-shadow"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Officer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Position</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">District</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
                         {item.officer.name_en.substring(0, 2)}
                      </div>
                      <div>
                        {item.officer.name_en}
                        <p className="text-xs text-slate-500 mt-1 font-normal truncate">{item.officer.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                     <p className="font-bold text-slate-800 text-xs">{item.officer.role_en}</p>
                     <p className="text-xs text-slate-500 mt-0.5 truncate">{item.officer.role}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                     <p className="font-semibold text-slate-700 text-xs">{item.officer.district_en}</p>
                     <p className="text-[10px] text-slate-500 mt-0.5">{item.officer.district}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.type === 'added' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Added
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Removed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {item.type === 'removed' ? (
                      !item.restored ? (
                        <button onClick={() => restoreOfficer(item)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-emerald-200 flex items-center justify-center gap-1.5 ml-auto">Restore</button>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold inline-block">Restored</span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 italic">No Actions</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 font-medium bg-slate-50/50">
                     <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                           <Clock className="w-8 h-8" />
                        </div>
                        <p>No records found in history.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Custom Cards */}
        <div className="block md:hidden divide-y divide-slate-100 bg-white">
          {filteredHistory.length > 0 ? filteredHistory.map(item => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                 <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5 shrink-0 text-slate-400 font-bold uppercase text-xs">
                      {item.officer.name_en.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate leading-tight">{item.officer.name_en}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal truncate">{item.officer.name}</p>
                    </div>
                 </div>
                 <div className="shrink-0 flex items-center gap-1">
                    {item.type === 'removed' ? (
                      !item.restored ? (
                        <button onClick={() => restoreOfficer(item)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors hover:bg-emerald-200">Restore</button>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-bold">Restored</span>
                      )
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold text-green-700 bg-green-50 rounded-full border border-green-200">Added</span>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                 <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Position</p>
                    <p className="font-bold text-slate-800 truncate mt-0.5">{item.officer.role_en}</p>
                 </div>
                 <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">District</p>
                    <p className="font-semibold text-slate-800 truncate mt-0.5">{item.officer.district_en}</p>
                 </div>
                 <div className="col-span-2">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.type === 'added' ? 'Added On' : 'Removed On'}</p>
                    <p className={`font-semibold truncate mt-0.5 ${item.type === 'added' ? 'text-green-600' : 'text-rose-500'}`}>{new Date(item.timestamp).toLocaleString()}</p>
                 </div>
              </div>
            </div>
          )) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500 font-medium">
               <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                    <Clock className="w-8 h-8" />
                  </div>
                  <p>No records found in history.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  const restoreOfficer = async (item: HistoryItem) => {
    const restoredOfficer = { ...item.officer, id: `off_${Date.now()}` };
    await dbService.saveItem('officers', restoredOfficer.id, restoredOfficer);
    
    // Update history
    const updatedHistoryItem = { ...item, restored: true };
    await dbService.saveItem('officer_history', item.id, updatedHistoryItem);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, isThumbnail = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaUploadError('');

    // Check size limit (1MB = 1048576 bytes) for Firestore document limits
    if (file.size > 1048576) {
      setMediaUploadError('File is too large! Please upload a file smaller than 1MB.');
      e.target.value = '';
      return;
    }

    setIsUploadingMedia(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isThumbnail) {
          setFormMediaThumbnailUrl(base64String);
        } else {
          setFormMediaUrl(base64String);
        }
        setIsUploadingMedia(false);
      };
      reader.onerror = () => {
        setMediaUploadError('Failed to read file.');
        setIsUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMediaUploadError('Error uploading file.');
      setIsUploadingMedia(false);
    }
  };

  const handleMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMediaUrl) return;

    try {
      const newItem: MediaItem = {
        id: mediaFormType === 'edit' && editingMedia ? editingMedia.id : `media_${Date.now()}`,
        title: formMediaTitle || 'Untitled',
        title_en: formMediaTitleEn || 'Untitled',
        type: formMediaType,
        url: formMediaUrl,
        thumbnailUrl: formMediaThumbnailUrl || formMediaUrl,
        tag: formMediaTag || 'event',
        tag_en: formMediaTagEn || 'event'
      };

      await dbService.saveItem('media', newItem.id, newItem);
      setIsMediaFormOpen(false);
      
      // Reset form
      setFormMediaTitle('');
      setFormMediaTitleEn('');
      setFormMediaType('photo');
      setFormMediaUrl('');
      setFormMediaThumbnailUrl('');
      setFormMediaTag('');
      setFormMediaTagEn('');
      setEditingMedia(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleMediaDelete = async (id: string) => {
    try {
      await dbService.deleteItem('media', id);
    } catch (err) {
      console.log(err);
    }
  };

  const editMediaItem = (item: MediaItem) => {
    setEditingMedia(item);
    setMediaFormType('edit');
    setFormMediaTitle(item.title);
    setFormMediaTitleEn(item.title_en);
    setFormMediaType(item.type);
    setFormMediaUrl(item.url);
    setFormMediaThumbnailUrl(item.thumbnailUrl);
    setFormMediaTag(item.tag);
    setFormMediaTagEn(item.tag_en);
    setIsMediaFormOpen(true);
  };

  const renderMediaTab = () => {
    const filteredMedia = mediaItems.filter(item => {
      const matchSearch = item.title?.toLowerCase().includes(mediaSearchTerm.toLowerCase()) || 
                          item.title_en?.toLowerCase().includes(mediaSearchTerm.toLowerCase()) ||
                          item.tag?.toLowerCase().includes(mediaSearchTerm.toLowerCase()) ||
                          item.tag_en?.toLowerCase().includes(mediaSearchTerm.toLowerCase());
      const matchType = mediaTypeFilter === 'all' || item.type === mediaTypeFilter;
      return matchSearch && matchType;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search media..."
                value={mediaSearchTerm}
                onChange={(e) => setMediaSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-550 text-xs sm:text-sm"
              />
            </div>
            <select 
              value={mediaTypeFilter}
              onChange={(e) => setMediaTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-550 text-xs sm:text-sm bg-white font-semibold cursor-pointer"
            >
              <option value="all">All Media</option>
              <option value="photo">Photos</option>
              <option value="video">Videos</option>
            </select>
          </div>
          <button 
            onClick={() => {
              setMediaFormType('add');
              setEditingMedia(null);
              setFormMediaTitle('');
              setFormMediaTitleEn('');
              setFormMediaType('photo');
              setFormMediaUrl('');
              setFormMediaThumbnailUrl('');
              setFormMediaTag('');
              setFormMediaTagEn('');
              setIsMediaFormOpen(true);
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Media
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-video bg-slate-100 relative">
                {item.type === 'photo' ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white relative">
                    <img src={item.thumbnailUrl || item.url} alt="" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  {item.type}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{item.title_en}</h4>
                  <p className="text-slate-500 text-xs mt-1">{item.title}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {item.tag_en}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => editMediaItem(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleMediaDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Sidebar / Header */}
      <header className="bg-[#1E1250] text-white px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-xl border border-white/10 backdrop-blur-md w-16 h-16 flex items-center justify-center shrink-0">
            <img
                            src={bgs.logo}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Admin Control Panel</h1>
            <p className="text-xs text-amber-400 font-medium tracking-wider uppercase">Member & Directory Management</p>
          </div>
        </div>

        {/* Tab switch layout with nice high-contrast pills */}
        <div className="flex sm:flex-row bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto sm:overflow-hidden gap-1 sm:gap-0 no-scrollbar">
          <button
            onClick={() => { setActiveTab('applicants'); setView('list'); }}
            className={`flex-1 min-w-max sm:flex-initial px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'applicants' ? 'bg-amber-400 text-slate-900 shadow font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
            <span><span className="hidden sm:inline">Registered </span>Members</span>
          </button>
          <button
            onClick={() => { setActiveTab('officers'); setView('list'); }}
            className={`flex-1 min-w-max sm:flex-initial px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'officers' ? 'bg-amber-400 text-slate-900 shadow font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
            <span><span className="hidden sm:inline">Executive </span>Board</span>
          </button>
          <button
            onClick={() => { setActiveTab('history'); setView('list'); }}
            className={`flex-1 min-w-max sm:flex-initial px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'bg-amber-400 text-slate-900 shadow font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
            <span>History</span>
          </button>
          <button
            onClick={() => { setActiveTab('media'); setView('list'); }}
            className={`flex-1 min-w-max sm:flex-initial px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'media' ? 'bg-amber-400 text-slate-900 shadow font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
            <span>Media</span>
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-white/10 shrink-0 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'media' ? renderMediaTab() : activeTab === 'history' ? renderHistoryTab() : activeTab === 'applicants' ? (
          /* ==================== APPLICANTS TAB ==================== */
          view === 'list' ? (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Active Members</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{members.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">New Registrations (7D)</p>
                    <h3 className="text-3xl font-black text-emerald-600 mt-1">
                      {members.filter(m => {
                        const d = new Date(m.date);
                        const now = new Date();
                        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
                      }).length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">State Reached</p>
                    <h3 className="text-3xl font-black text-indigo-900 mt-1">100%</h3>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search registered members by name, phone or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-550 text-xs sm:text-sm"
                    />
                  </div>
                  <select 
                    value={filterWing}
                    onChange={(e) => setFilterWing(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-550 text-xs sm:text-sm bg-white font-semibold cursor-pointer"
                  >
                    <option value="all">All Wings</option>
                    {WINGS.map(w => (
                      <option key={w.id} value={w.id}>{w.name_en}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={exportCSV}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredMembers.length > 0 ? filteredMembers.map((member, idx) => (
                        <tr key={`${member.cardId || ''}-${member.phone || ''}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                {member.photo ? (
                                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                  <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.name.replace(/\s+/g, '')}`}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer" 
                                    alt={member.name} 
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate leading-none">{member.name}</p>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium truncate">
                                  {member.cardId} • {WINGS.find(w => w.id === member.wingId)?.name_en}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs sm:text-sm">
                            <p className="font-semibold text-slate-700">{member.phone}</p>
                            <p className="text-slate-400 font-medium">{getMemberAge(member)} Yrs</p>
                          </td>
                          <td className="px-6 py-4 text-xs sm:text-sm">
                            <p className="font-semibold text-slate-700">{member.district.split(' ')[0]}</p>
                            <p className="text-slate-400 font-medium line-clamp-1 max-w-[150px]">{member.address}</p>
                          </td>
                          <td className="px-6 py-4 text-xs sm:text-sm">
                            <p className="font-medium text-slate-700">Join: {member.date}</p>
                            {member.validUntil && (
                              <p className={`font-semibold text-[10px] uppercase tracking-wide flex items-center gap-1 ${
                                new Date(member.validUntil) < new Date() ? 'text-red-500' : 'text-emerald-500'
                              }`}>
                                Valid: {member.validUntil}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedMember(member);
                                  setAssignedWingId(member.wingId);
                                  setView('details');
                                }}
                                className="p-2 rounded-lg hover:bg-slate-200 text-slate-650 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(member.cardId)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                                title="Delete Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                                <Users className="w-8 h-8" />
                              </div>
                              <p className="text-slate-505 font-medium">No registered members found matching your search</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Custom Cards */}
                <div className="block md:hidden divide-y divide-slate-100 bg-white">
                  {filteredMembers.length > 0 ? filteredMembers.map((member, idx) => (
                    <div key={`${member.cardId || ''}-${member.phone || ''}-${idx}`} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {member.photo ? (
                              <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.name.replace(/\s+/g, '')}`}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer" 
                                alt={member.name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate leading-none">{member.name}</p>
                            <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wide mt-1">
                              {member.cardId}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => {
                              setSelectedMember(member);
                              setAssignedWingId(member.wingId);
                              setView('details');
                            }}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(member.cardId)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Member Info grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Assigned Wing</p>
                          <p className="font-bold text-slate-800 truncate mt-0.5">
                            {WINGS.find(w => w.id === member.wingId)?.name_en || member.wingId}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">District</p>
                          <p className="font-bold text-slate-800 truncate mt-0.5">
                            {member.district.split(' ')[0]}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Constituency</p>
                          <p className="font-bold text-slate-800 truncate mt-0.5">
                            {member.constituency}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Union</p>
                          <p className="font-bold text-slate-800 truncate mt-0.5">
                            {member.union}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Contact</p>
                          <p className="font-semibold text-slate-700 mt-0.5 font-mono">{member.phone}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Join Date</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{member.date}</p>
                        </div>
                        {member.validUntil && (
                          <div className="col-span-2 pt-1 border-t border-slate-200 mt-1">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Valid Until</p>
                            <p className={`font-semibold font-mono text-[10px] ${
                              new Date(member.validUntil) < new Date() ? 'text-red-500' : 'text-emerald-500'
                            }`}>{member.validUntil}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                          <Users className="w-8 h-8" />
                        </div>
                        <p className="text-slate-505 font-medium">No registered members found matching your search</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : selectedMember && (
            /* Applicants Details view */
            <div className="max-w-4xl mx-auto space-y-6">
              <button 
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to List
              </button>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Header title */}
                <div className="bg-[#1E1250] px-4 py-4 sm:px-8 sm:py-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black">Member Profile Details</h2>
                    <p className="text-[10px] sm:text-xs text-amber-400 font-bold tracking-wider uppercase mt-1">Review & Verify Registration</p>
                  </div>
                  <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none">
                    Active Member
                  </span>
                </div>

                <div className="p-4 sm:p-8">
                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: beautiful Member Card rendering and Welcome Letter */}
                    <div id="admin-member-preview-column" className="lg:col-span-6 flex flex-col items-center space-y-4 bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-150 w-full">
                      
                      {/* Dynamic Tab Switcher */}
                      <div className="flex bg-slate-200/60 p-1 rounded-2xl w-full max-w-xs">
                        <button
                          type="button"
                          onClick={() => setActiveMemberTab('card')}
                          className={`flex-1 py-1.5 px-3 text-[10.5px] font-black rounded-xl transition-all cursor-pointer ${
                            activeMemberTab === 'card'
                              ? 'bg-[#1E1250] text-[#FFC72C] shadow-sm'
                              : 'text-slate-600 hover:text-[#1E1250]'
                          }`}
                        >
                          Membership Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMemberTab('letter')}
                          className={`flex-1 py-1.5 px-3 text-[10.5px] font-black rounded-xl transition-all cursor-pointer ${
                            activeMemberTab === 'letter'
                              ? 'bg-[#1E1250] text-[#FFC72C] shadow-sm'
                              : 'text-slate-600 hover:text-[#1E1250]'
                          }`}
                        >
                          Welcome Letter
                        </button>
                      </div>

                      {/* Card Preview Frame */}
                      <div className={activeMemberTab === 'card' ? 'w-full block relative' : 'w-0 h-0 overflow-hidden absolute opacity-0 pointer-events-none'}>
                        <p className="text-[10px] font-sans text-amber-600 font-bold mb-3 flex items-center justify-center gap-1.5 animate-pulse">
                          <span>🔄</span> Hover or click card to flip backside
                        </p>
                        
                        <div 
                          id="admin-card-container"
                          className="w-full overflow-hidden py-4 flex justify-center items-center"
                        >
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
                            onMouseEnter={() => setIsAdminFlipped(true)}
                            onMouseLeave={() => setIsAdminFlipped(false)}
                            onClick={() => setIsAdminFlipped(!isAdminFlipped)}
                          >
                            {/* Flip Animator Element */}
                            <div 
                              className="w-full h-full relative transition-transform duration-700"
                              style={{
                                transformStyle: 'preserve-3d',
                                transform: isAdminFlipped ? 'rotateY(180deg)' : 'none'
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
                                  {memberImageB64 ? (
                                    <img
                                      src={memberImageB64}
                                      alt="ID Avatar"
                                      className="w-full h-full object-cover"
                                      crossOrigin="anonymous"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                                  )}
                                </div>

                                {/* உறுப்பினர் Badge under photo */}
                                <div className="absolute left-[30px] top-[223px] w-[96px] flex justify-center">
                                  <span className="text-[7.5px] font-black tracking-widest px-2 py-0.5 rounded-md text-white bg-[#1E1250]">
                                    உறுப்பினர்
                                  </span>
                                </div>

                                {/* Name */}
                                <div className="absolute left-[142px] top-[95px] right-[130px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பெயர்</p>
                                  <p className="font-extrabold text-[#1E1250] uppercase mt-0.5 truncate text-[14px] leading-tight font-sans">
                                    {selectedMember.name}
                                  </p>
                                </div>

                                {/* Member ID */}
                                <div className="absolute right-[30px] top-[95px] text-right">
                                  <span className="text-[7.5px] font-bold text-[#1E1250]/75 tracking-wider font-sans">அட்டை எண்</span>
                                  <p className="font-mono font-black text-[12px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.cardId}</p>
                                </div>

                                {/* Row 2: Role & District */}
                                <div className="absolute left-[142px] top-[130px] w-[150px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பதவி</p>
                                  <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 flex items-center gap-1 font-sans">
                                    <User className="w-3 h-3 stroke-[2.5]" style={{ stroke: '#1E1250' }} />
                                    <span className="truncate">உறுப்பினர்</span>
                                  </p>
                                </div>

                                <div className="absolute left-[305px] top-[130px] right-[30px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">மாவட்டம்</p>
                                  <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate font-sans">{selectedMember.district}</p>
                                </div>

                                {/* Row 3: Phone Number & Constituency */}
                                <div className="absolute left-[142px] top-[165px] w-[150px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">கைப்பேசி</p>
                                  <p className="font-mono font-bold text-[10.5px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.phone}</p>
                                </div>

                                <div className="absolute left-[305px] top-[165px] right-[30px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">தொகுதி</p>
                                  <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight font-sans">{selectedMember.constituency || 'N/A'}</p>
                                </div>

                                {/* Row 4: DOB & Union */}
                                <div className="absolute left-[142px] top-[200px] w-[150px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பிறந்த தேதி</p>
                                  <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.dob || 'N/A'}</p>
                                </div>

                                <div className="absolute left-[305px] top-[200px] right-[30px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">ஒன்றியம்</p>
                                  <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight font-sans">{selectedMember.union || 'N/A'}</p>
                                </div>

                                {/* Row 5: Blood Group & Issued */}
                                <div className="absolute left-[142px] top-[235px] w-[150px]">
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">இரத்த வகை</p>
                                  <p className="font-black text-[10.5px] text-red-650 mt-0.5 text-red-600 font-sans">{selectedMember.bloodGroup || 'N/A'}</p>
                                </div>

                                <div className="absolute left-[305px] top-[235px] right-[30px]" style={{ paddingRight: '-4px', marginRight: '-13px' }}>
                                  <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">வழங்கிய தேதி</p>
                                  <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.date}</p>
                                </div>

                                {/* Validity Date inside the template's "Validity" pill */}
                                <div 
                                  className="absolute flex items-center justify-end text-white font-sans font-black text-[8px] select-none tracking-tight whitespace-nowrap"
                                  style={{
                                    top: '71px',
                                    right: '23px',
                                    width: '75px',
                                    height: '20px',
                                    paddingRight: '5px',
                                    textShadow: '0 1px 1.5px rgba(0,0,0,0.7)'
                                  }}
                                >
                                  {selectedMember.validUntil}
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
                        </div>

                        {/* Capture Engine Placeholder - Actual Renderers are persistently mounted at bottom of DOM */}
                        <div className="hidden" />

                        {downloadCardError && (
                          <p className="text-xs text-red-500 font-bold text-center mt-1 font-sans">
                            <AlertTriangle className="w-3.5 h-3.5" /> {downloadCardError}
                          </p>
                        )}

                        <div className="flex w-full">
                          <button
                            onClick={handleDownloadBothSides}
                            disabled={isDownloadingCard}
                            className="w-full flex items-center justify-center gap-2 bg-[#1E1250] text-[#FFC72C] py-3 px-5 rounded-xl text-xs font-black shadow-md cursor-pointer hover:bg-opacity-95 disabled:opacity-50"
                          >
                            {isDownloadingCard ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin shrink-0"></span>
                                <span>Downloading Card...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 shrink-0" /> Download Member Card (Front & Back)
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Welcome Letter Preview Frame */}
                      <div className={activeMemberTab === 'letter' ? 'w-full block relative' : 'w-0 h-0 overflow-hidden absolute opacity-0 pointer-events-none'}>
                        <div 
                          className="w-full overflow-hidden py-4 flex justify-center items-center"
                        >
                          <div 
                            style={{
                              width: '595px',
                              height: '842px',
                              transform: `scale(${letterScale})`,
                              transformOrigin: 'center center',
                              margin: `${(letterScale - 1) * 842 / 2}px ${(letterScale - 1) * 595 / 2}px`,
                            }}
                            className="shrink-0 relative transition-all duration-300"
                          >
                            <div 
                              
                              className="w-[595px] h-[842px] shrink-0 relative overflow-hidden text-left font-sans bg-white"
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
                                
                                alt="Letter Background"
                              />
                              {/* Content Body */}
                              <div className="absolute inset-0 z-10">
                                {/* Image placed exactly in the template's portrait frame */}
                                <div className="absolute top-[323px] left-[191px] w-[168px] h-[182px] rounded-2xl overflow-hidden shrink-0">
                                  {memberImageB64 ? (
                                    <img src={memberImageB64} className="w-full h-full object-cover mt-[3px] -mr-[4px]" alt="Member" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                      <div className="w-4 h-4 border-2 border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
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
                            <h2 className="text-[24px] font-black text-[#1E1250] leading-tight" style={{ fontSize: '20px', marginBottom: '-11px', paddingBottom: '-8px', marginRight: '-9px', marginTop: '6px' }}>{selectedMember.name}</h2>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {downloadLetterError && (
                          <p className="text-xs text-red-500 font-bold text-center mt-1 font-sans">
                            <AlertTriangle className="w-3.5 h-3.5" /> {downloadLetterError}
                          </p>
                        )}

                        <button
                          onClick={handleDownloadLetter}
                          disabled={isDownloadingLetter}
                          className="w-full flex items-center justify-center gap-2 bg-[#1E1250] text-[#FFC72C] px-6 py-3 rounded-xl text-xs sm:text-sm font-black shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] hover:bg-opacity-95 cursor-pointer disabled:opacity-50"
                        >
                          {isDownloadingLetter ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Generating Letter file...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 text-[#FFC72C]" /> Download Registration Letter (PNG)
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Manage Wings & Detailed Profile Information */}
                    <div className="lg:col-span-6 space-y-6">
                      
                      {/* Wing Assignment Control */}
                      <div className="bg-indigo-50/40 border border-indigo-100 p-6 rounded-3xl space-y-4">
                          <div>
                            <h4 className="text-sm font-black text-[#1E1250] flex items-center gap-2">
                               <Users className="w-4 h-4 text-indigo-650" /> Assign Organization Wing
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                               Currently registered/preferred wing: <span className="font-black text-indigo-700">{WINGS.find(w => w.id === selectedMember.wingId)?.name_en}</span>
                            </p>
                          </div>

                        <div className="space-y-3">
                          <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Select Wing Category *</label>
                          <SearchableSelect 
                            options={WINGS.map(w => ({ label: `${w.name_en} — ${w.name}`, value: w.id }))}
                            value={assignedWingId}
                            onChange={setAssignedWingId}
                            placeholder="Select a new wing..."
                            lang="en"
                          />
                        </div>

                        {wingUpdateSuccess && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-bounce font-sans">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Member's assigned Wing updated successfully!
                          </div>
                        )}

                        <button 
                          onClick={handleUpdateWing}
                          disabled={isUpdatingWing || assignedWingId === selectedMember.wingId}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-5 rounded-2xl text-xs sm:text-sm font-black shadow-md hover:shadow-indigo-500/10 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isUpdatingWing ? 'Updating Firestore...' : 'Apply Wing Assignment'}
                        </button>
                      </div>

                      {/* Display Profile Information & Location Details */}
                      <div className="bg-white p-6 border border-slate-100 rounded-3xl space-y-6">
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Profile & Demographics</h4>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Age</p>
                              <p className="text-sm font-bold text-slate-800">{getMemberAge(selectedMember)} Years</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Joined Date</p>
                              <p className="text-sm font-bold text-slate-800">{selectedMember.date}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Gender</p>
                              <p className="text-sm font-bold text-slate-800 capitalize">{selectedMember.gender || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Education</p>
                              <p className="text-sm font-bold text-slate-800">{selectedMember.education || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Date of Birth</p>
                              <p className="text-sm font-bold text-slate-800">{selectedMember.dob || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Blood Group</p>
                              <p className="text-sm font-black text-rose-600 uppercase">{selectedMember.bloodGroup || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Preferred Wing</p>
                              <p className="text-sm font-extrabold text-indigo-600 uppercase">{selectedMember.preferredWing || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact & Territory Details</h4>
                          <div className="space-y-3 mt-3">
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold">Mobile Phone No.</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-800 font-mono">{selectedMember.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold">Jurisdiction District</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-800">{selectedMember.district}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold">Constituency & Union</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-800">{selectedMember.constituency} - {selectedMember.union}</p>
                              </div>
                            </div>
                          </div>
                        </div>


                      </div>

                      {/* Dangerous operations */}
                      <div className="flex justify-between items-center bg-rose-50/50 border border-rose-100 p-5 rounded-3xl">
                        <div>
                          <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">Danger Zone</h4>
                          <p className="text-[10px] text-slate-400 mt-1">Permanently erase this member from database records</p>
                        </div>
                        <button 
                          onClick={() => handleDelete(selectedMember.cardId)}
                          className="flex items-center gap-1.5 text-red-650 hover:bg-red-100/60 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* ==================== OFFICERS / EXECUTIVE MEMBERS TAB ==================== */
          <div className="space-y-6">
            {/* Quick stats for Executive members */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold leading-none uppercase tracking-wide">Total Board</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">{officers.length}</h3>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold leading-none uppercase tracking-wide">State Level</p>
                  <h3 className="text-2xl font-black text-indigo-900 mt-2">
                    {officers.filter(o => o.level === 'state').length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-700">
                  <ShieldCheck className="w-5 h-5 text-indigo-700" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold leading-none uppercase tracking-wide">District Level</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-2">
                    {officers.filter(o => o.level !== 'state').length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="bg-[#1E1250] text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider">Directory Sync</span>
                  <p className="text-xs text-white/80 font-bold leading-tight mt-1">Updates live across all pages.</p>
                </div>
              </div>
            </div>

            {/* Controls panel */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search executive members by name, role, or district..."
                    value={officerSearch}
                    onChange={(e) => setOfficerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-550 text-xs sm:text-sm"
                  />
                </div>
                <select 
                  value={officerLevelFilter}
                  onChange={(e) => setOfficerLevelFilter(e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-550 text-xs sm:text-sm bg-white font-semibold cursor-pointer"
                >
                  <option value="all">All Tiers</option>
                  <option value="state">State Level</option>
                  <option value="district">District Level</option>
                  <option value="constituency">Constituency Level</option>
                  <option value="union">Union Level</option>
                  <option value="branch">Branch Level</option>
                  <option value="ward">Ward Level</option>
                  <option value="wing">Wing Level</option>
                </select>
              </div>
              
              <button
                onClick={openAddOfficer}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Executive Member
              </button>
            </div>            {/* Board Members Table / Grid - with high elegance and visual metrics */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto overflow-y-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Executive Member</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Official Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">District / Jurisdiction</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOfficers.length > 0 ? filteredOfficers.map((officer) => (
                      <tr key={officer.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-205 flex items-center justify-center p-0.5 shrink-0">
                              {officer.imageUrl ? (
                                <img src={officer.imageUrl} alt={officer.name_en} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <div className="text-slate-400 text-xs font-black bg-indigo-50 w-full h-full flex items-center justify-center uppercase rounded-lg">
                                  {officer.name_en.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate">{officer.name_en}</p>
                              <p className="text-xs text-slate-500 mt-1 truncate">{officer.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1 ${
                              officer.level === 'state' 
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                                : officer.level === 'district'
                                ? 'bg-amber-50 text-amber-750 border border-amber-100'
                                : officer.level === 'constituency'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : officer.level === 'union'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : officer.level === 'branch'
                                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                : officer.level === 'ward'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-slate-150 text-slate-700 border border-slate-200'
                            }`}>
                              {officer.level === 'state' ? 'State' : officer.level === 'district' ? 'District' : officer.level}
                            </span>
                            <p className="font-bold text-slate-800 text-xs leading-tight block break-words max-w-[200px]">{officer.role_en}</p>
                            <p className="text-slate-505 text-[10px] mt-0.5 truncate max-w-[200px]">{officer.role}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {officer.district_en}
                            {officer.constituency_en && ` - ${officer.constituency_en}`}
                            {officer.union_en && ` - ${officer.union_en}`}
                            {officer.branch_en && ` - ${officer.branch_en}`}
                            {officer.ward_en && ` - ${officer.ward_en}`}
                          </p>
                          <p className="text-xs text-slate-455 font-medium">
                            {officer.district}
                            {officer.constituency && ` - ${officer.constituency}`}
                            {officer.union && ` - ${officer.union}`}
                            {officer.branch && ` - ${officer.branch}`}
                            {officer.ward && ` - ${officer.ward}`}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-705 font-mono">{officer.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => {
                                setSelectedOfficerForDownload(officer);
                                setActiveOfficerTab('card');
                              }}
                              className="p-2 rounded-lg hover:bg-slate-100 text-[#1E1250] hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Download Member Card & Letterhead"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => openEditOfficer(officer)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-650 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Edit Member Details / Post"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteOfficer(officer.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                              title="Remove Executive Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                              <ShieldCheck className="w-8 h-8" />
                            </div>
                            <p className="text-slate-505 font-medium">No executive members matched your search terms</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Custom Cards */}
              <div className="block md:hidden divide-y divide-slate-100 bg-white">
                {filteredOfficers.length > 0 ? filteredOfficers.map((officer) => (
                  <div key={officer.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-205 flex items-center justify-center p-0.5 shrink-0">
                          {officer.imageUrl ? (
                            <img src={officer.imageUrl} alt={officer.name_en} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="text-slate-400 text-xs font-black bg-indigo-50 w-full h-full flex items-center justify-center uppercase rounded-lg">
                              {officer.name_en.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate leading-tight">{officer.name_en}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{officer.name}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => {
                            setSelectedOfficerForDownload(officer);
                            setActiveOfficerTab('card');
                          }}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-200 text-[#1E1250] hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Download Member Card & Letterhead"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => openEditOfficer(officer)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-650 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Edit Member Details / Post"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOfficer(officer.id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                          title="Remove Executive Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Role & Level Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        officer.level === 'state' 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : officer.level === 'district'
                          ? 'bg-amber-50 text-amber-750 border border-amber-100'
                          : officer.level === 'constituency'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : officer.level === 'union'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : officer.level === 'branch'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : officer.level === 'ward'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-slate-150 text-slate-700 border border-slate-200'
                      }`}>
                        {officer.level === 'state' ? 'State' : officer.level === 'district' ? 'District' : officer.level}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5">
                        {officer.role_en}
                      </span>
                    </div>

                    {/* Officer Detail list */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Role (Tamil)</p>
                        <p className="font-bold text-slate-800 truncate mt-0.5">{officer.role}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Jurisdiction (EN)</p>
                        <p className="font-bold text-slate-800 truncate mt-0.5">
                          {officer.district_en}
                          {officer.constituency_en && ` - ${officer.constituency_en}`}
                          {officer.union_en && ` - ${officer.union_en}`}
                          {officer.branch_en && ` - ${officer.branch_en}`}
                          {officer.ward_en && ` - ${officer.ward_en}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">District (Tamil)</p>
                        <p className="font-bold text-slate-800 truncate mt-0.5">
                          {officer.district}
                          {officer.constituency && ` - ${officer.constituency}`}
                          {officer.union && ` - ${officer.union}`}
                          {officer.branch && ` - ${officer.branch}`}
                          {officer.ward && ` - ${officer.ward}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                        <p className="font-semibold text-slate-700 mt-0.5 font-mono">{officer.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <p className="text-slate-505 font-medium">No executive members matched your search terms</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== OFFICER FORM MODAL ==================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transform transition-all">
            {/* Modal Header */}
            <div className="bg-[#1E1250] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {formType === 'add' ? 'Add Executive Officer' : 'Edit Executive Officer / Post'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleOfficerFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* English Name (Required) */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. K. Prabakaran" 
                    value={formNameEn} 
                    onChange={e => setFormNameEn(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                {/* English Post/Role (Required) */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Official Role *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. District President" 
                    value={formRoleEn} 
                    onChange={e => setFormRoleEn(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                {/* Level / Board Tier */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Organization Level *</label>
                  <select 
                    value={formLevel} 
                    onChange={e => setFormLevel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white cursor-pointer font-semibold"
                  >
                    <option value="state">State Executives (மாநில நிர்வாகிகள்)</option>
                    <option value="district">District Executives (மாவட்ட நிர்வாகிகள்)</option>
                    <option value="constituency">Constituency Executives (தொகுதி நிர்வாகிகள்)</option>
                    <option value="union">Union Executives (ஒன்றிய நிர்வாகிகள்)</option>
                    <option value="branch">Branch Executives (கிளை நிர்வாகிகள்)</option>
                    <option value="ward">Ward Executives (வார்டு நிர்வாகிகள்)</option>
                    <option value="wing">Wing Appointee (அணி நிர்வாகி)</option>
                  </select>
                </div>

                {formLevel === 'constituency' && (
                  <>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Constituency Name (EN) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Madurai West" 
                        value={formConstituencyEn} 
                        onChange={e => setFormConstituencyEn(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Constituency Name (Tamil)</label>
                      <input 
                        type="text" 
                        placeholder="எ.கா. மதுரை மேற்கு" 
                        value={formConstituency} 
                        onChange={e => setFormConstituency(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                  </>
                )}

                {formLevel === 'union' && (
                  <>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Union Name (EN) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Alanganallur" 
                        value={formUnionEn} 
                        onChange={e => setFormUnionEn(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Union Name (Tamil)</label>
                      <input 
                        type="text" 
                        placeholder="எ.கா. அலங்காநல்லூர்" 
                        value={formUnion} 
                        onChange={e => setFormUnion(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                  </>
                )}

                {formLevel === 'branch' && (
                  <>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Branch Name (EN) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Melur Branch" 
                        value={formBranchEn} 
                        onChange={e => setFormBranchEn(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Branch Name (Tamil)</label>
                      <input 
                        type="text" 
                        placeholder="எ.கா. மேலூர் கிளை" 
                        value={formBranch} 
                        onChange={e => setFormBranch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                  </>
                )}

                {formLevel === 'ward' && (
                  <>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Ward Name (EN) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Ward 12" 
                        value={formWardEn} 
                        onChange={e => setFormWardEn(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Ward Name (Tamil)</label>
                      <input 
                        type="text" 
                        placeholder="எ.கா. வார்டு 12" 
                        value={formWard} 
                        onChange={e => setFormWard(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                  </>
                )}

                {formLevel === 'wing' && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Select Wing *</label>
                    <select 
                      value={formWingId} 
                      onChange={e => setFormWingId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white cursor-pointer font-semibold"
                    >
                      {WINGS.map(w => (
                        <option key={w.id} value={w.id}>{w.name} / {w.name_en}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* District Selection -> Auto binds both Tamil and English values */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">District / Jurisdiction *</label>
                  <select 
                    value={formDistrict} 
                    onChange={e => setFormDistrict(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white cursor-pointer font-semibold"
                  >
                    {DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Phone Number (Optional) */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Contact Phone (Optional)</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. 9842400101" 
                    value={formPhone} 
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                {/* Photo File Upload instead of Link */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">
                    Officer Photo (Optional)
                  </label>
                  
                  {formImageUrl ? (
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img 
                          src={formImageUrl} 
                          alt="Officer Preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 truncate">Photo uploaded successfully</p>
                        <p className="text-[10px] text-slate-400">Ready to save</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setFormImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-indigo-550 bg-slate-50 hover:bg-indigo-50/10 rounded-2xl p-5 text-center transition-all relative cursor-pointer group"
                    >
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-indigo-100/50 rounded-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-705 group-hover:text-indigo-650 transition-colors">
                            Click to Upload or Drag & Drop
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            PNG, JPG or JPEG (Max 1MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-slate-500 bg-slate-100 sm:bg-transparent hover:bg-slate-200 sm:hover:bg-slate-50 rounded-xl text-sm font-bold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 hidden sm:block" /> {formType === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ==================== CONFIRMATION MODAL ==================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 transform transition-all">
            <h3 className="font-bold text-lg text-slate-900">{confirmModal.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{confirmModal.message}</p>
            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-slate-500 bg-slate-100 sm:bg-transparent hover:bg-slate-200 sm:hover:bg-slate-100 rounded-xl text-sm font-bold cursor-pointer transition-colors text-center"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  confirmModal.onConfirm();
                }}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-red-600/10 cursor-pointer transition-colors block text-center"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ==================== WHATSAPP SHARE MODAL ==================== */}
      {whatsAppModalOpen && whatsAppOfficer && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-xs overflow-y-auto w-full h-full">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transform transition-all select-none">
            {/* Modal Header */}
            <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-200 animate-pulse shrink-0" />
                <h3 className="font-bold text-base">
                  {whatsAppActionType === 'add' ? 'Officer Appointed Successfully!' : 'Officer Profile Saved!'}
                </h3>
              </div>
              <button 
                onClick={() => setWhatsAppModalOpen(false)}
                className="p-1 text-emerald-100 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Send Appointment Order / Letter</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    You can now send the formal appointment/promotion letter to <strong className="text-emerald-700">{whatsAppOfficer.name}</strong> directly via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-500" /> WhatsApp Number *
                </label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9876543210 (Include country code if outside India)" 
                  value={whatsAppPhoneNumber} 
                  onChange={e => setWhatsAppPhoneNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white font-mono"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  If 10 digits, we will automatically assume country code +91
                </p>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-indigo-500" /> Letter Message Preview & Edit
                </label>
                <textarea 
                  rows={8}
                  value={whatsAppCustomText} 
                  onChange={e => setWhatsAppCustomText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-xs focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white font-sans leading-relaxed resize-none h-48 overflow-y-auto"
                />
              </div>

               {/* Action Buttons */}
               <div className="pt-4 flex flex-col gap-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedOfficerForDownload(whatsAppOfficer);
                        setActiveOfficerTab('card');
                        setWhatsAppModalOpen(false);
                      }}                
                      className="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Card
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedOfficerForDownload(whatsAppOfficer);
                        setActiveOfficerTab('letter');
                        setWhatsAppModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Letter
                    </button>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setWhatsAppModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-slate-500 bg-slate-100 sm:bg-transparent hover:bg-slate-200 sm:hover:bg-slate-50 rounded-xl text-sm font-bold cursor-pointer transition-all text-center"
                    >
                      Skip / Close
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const normalized = cleanAndNormalizePhone(whatsAppPhoneNumber);
                        if (!normalized) {
                          return;
                        }
                        const url = `https://wa.me/${normalized}?text=${encodeURIComponent(whatsAppCustomText)}`;
                        window.open(url, '_blank');
                        setWhatsAppModalOpen(false);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all block text-center"
                    >
                      <Send className="w-4 h-4 text-white shrink-0 hidden sm:block" />
                      <span>Open WhatsApp Chat (Text Only)</span>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== OFFICER CREDENTIALS DOWNLOAD MODAL ==================== */}
      {selectedOfficerForDownload && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-xs overflow-y-auto w-full h-full">
          {/* Dismiss on background tap */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedOfficerForDownload(null)} />
          
          {/* Sticky view-port close button always visible and easy to tap on mobile */}
          <button 
            onClick={() => setSelectedOfficerForDownload(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full cursor-pointer transition-all z-[110] shadow-md backdrop-blur-sm border border-white/10 flex items-center justify-center"
            title="Close panel"
          >
            <X className="w-5 h-5 font-black text-white" />
          </button>

          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 transform transition-all select-none flex flex-col md:flex-row h-auto max-h-[95vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden relative z-10">
            {/* Left side panel: Controls & Metadata */}
            <div className="w-full md:w-80 bg-slate-50 p-6 border-r border-[#1E1250]/10 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-[#1E1250] text-lg">Credentials Hub</h3>
                  <p className="text-xs text-slate-500 mt-1">Download Identity Cards & Appointment Letters for officers.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0">
                      {officerImageB64 ? (
                        <img src={officerImageB64} className="w-full h-full object-cover" alt="Officer Avatar" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-4 h-4 border border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-[#1E1250] text-sm leading-tight">{selectedOfficerForDownload.name_en}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{selectedOfficerForDownload.role_en}</p>
                    </div>
                  </div>
                </div>

                {/* Tab select buttons */}
                <div className="flex bg-slate-200/60 p-1 rounded-2xl w-full">
                  <button
                    type="button"
                    onClick={() => setActiveOfficerTab('card')}
                    className={`flex-1 py-1.5 px-3 text-[10.5px] font-black rounded-xl transition-all cursor-pointer ${
                      activeOfficerTab === 'card'
                        ? 'bg-[#1E1250] text-[#FFC72C] shadow-sm'
                        : 'text-slate-600 hover:text-[#1E1250]'
                    }`}
                  >
                    Identity Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOfficerTab('letter')}
                    className={`flex-1 py-1.5 px-3 text-[10.5px] font-black rounded-xl transition-all cursor-pointer ${
                      activeOfficerTab === 'letter'
                        ? 'bg-[#1E1250] text-[#FFC72C] shadow-sm'
                        : 'text-slate-600 hover:text-[#1E1250]'
                    }`}
                  >
                    Appointment Letter
                  </button>
                </div>

                {/* Download Actions */}
                <div className="space-y-3 pt-2">
                  {activeOfficerTab === 'card' ? (
                    <button
                      onClick={handleDownloadOfficerCard}
                      disabled={isDownloadingOfficerCard}
                      className="w-full flex items-center justify-center gap-2 bg-[#1E1250] text-[#FFC72C] py-3 px-5 rounded-xl text-xs font-black shadow-md cursor-pointer hover:bg-opacity-95 disabled:opacity-50"
                    >
                      {isDownloadingOfficerCard ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin shrink-0"></span>
                          <span>Downloading Card...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 shrink-0" /> Download Officer ID Card
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleDownloadOfficerLetter}
                      disabled={isDownloadingOfficerLetter}
                      className="w-full flex items-center justify-center gap-2 bg-[#1E1250] text-[#FFC72C] py-3 px-5 rounded-xl text-xs font-black shadow-md cursor-pointer hover:bg-opacity-95 disabled:opacity-50"
                    >
                      {isDownloadingOfficerLetter ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin shrink-0"></span>
                          <span>Downloading Letter...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 shrink-0" /> Download Appointment Letter
                        </>
                      )}
                    </button>
                  )}

                  {activeOfficerTab === 'card' && downloadOfficerCardError && (
                    <p className="text-xs text-red-500 font-bold text-center mt-1">
                      {downloadOfficerCardError}
                    </p>
                  )}
                  {activeOfficerTab === 'letter' && downloadOfficerLetterError && (
                    <p className="text-xs text-red-500 font-bold text-center mt-1">
                      {downloadOfficerLetterError}
                    </p>
                  )}
                </div>
              </div>

              {/* Back button */}
              <button
                onClick={() => setSelectedOfficerForDownload(null)}
                className="mt-6 w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Close Hub
              </button>
            </div>

            {/* Right side panel: Dynamic interactive preview frame */}
            <div id="officer-preview-container" className="flex-1 bg-slate-100 p-6 flex items-center justify-center min-h-[360px] md:min-h-[480px] overflow-hidden">
              {activeOfficerTab === 'card' ? (
                /* Card Preview */
                <div className="flex flex-col items-center">
                  <div 
                    id="officer-card-container"
                    style={{
                      width: '500px',
                      height: '315px',
                      transform: `scale(${officerCardScale})`,
                      transformOrigin: 'center center',
                      margin: `${(officerCardScale - 1) * 315 / 2}px ${(officerCardScale - 1) * 500 / 2}px`,
                    }}
                    className="shrink-0 relative rounded-3xl overflow-hidden text-left font-sans shadow-xl"
                  >
                    <img 
                      src={bgs.front} 
                      crossOrigin="anonymous" 
                      referrerPolicy="no-referrer" 
                      className="absolute inset-0 w-full h-full object-cover -z-10" 
                      alt="Officer Background" 
                    />
                    <div className="absolute left-[30px] top-[102px] w-[96px] h-[116px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-[#1E1250] bg-white">
                      {officerImageB64 ? (
                        <img src={officerImageB64} className="w-full h-full object-cover" alt="Avatar" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    <div className="absolute left-[30px] top-[223px] w-[96px] flex justify-center">
                      <span className="text-[7.5px] font-black tracking-widest px-2 py-0.5 rounded-md text-white bg-[#1E1250]">
                        {selectedOfficerForDownload.level === 'state' ? 'மாநிலப் பொறுப்பாளர்' : 'பொறுப்பாளர்'}
                      </span>
                    </div>
                    <div className="absolute left-[142px] top-[95px] right-[130px]">
                      <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பெயர்</p>
                      <p className="font-extrabold text-[#1E1250] uppercase mt-0.5 truncate text-[14px] leading-tight">
                        {selectedOfficerForDownload.name}
                      </p>
                    </div>
                    <div className="absolute right-[30px] top-[95px] text-right">
                      <span className="text-[7.5px] font-bold text-[#1E1250]/75 tracking-wider">அட்டை எண்</span>
                      <p className="font-mono font-black text-[12px] text-[#1E1250] mt-0.5">TUK-OFF-{selectedOfficerForDownload.id.substring(0, 4).toUpperCase()}</p>
                    </div>

                    {/* Row 2: Role & District */}
                    <div className="absolute left-[142px] top-[130px] w-[150px]">
                      <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பதவி</p>
                      <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 flex items-center gap-1">
                        <span className="truncate">{selectedOfficerForDownload.role}</span>
                      </p>
                    </div>

                    <div className="absolute left-[305px] top-[130px] right-[30px]">
                      <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">மாவட்டம்</p>
                      <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate">{selectedOfficerForDownload.district}</p>
                    </div>

                    {/* Row 3: Phone */}
                    <div className="absolute left-[142px] top-[165px] w-[150px]">
                      <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">கைப்பேசி</p>
                      <p className="font-mono font-bold text-[10.5px] text-[#1E1250] mt-0.5">{selectedOfficerForDownload.phone || 'N/A'}</p>
                    </div>

                    <div className="absolute left-[305px] top-[165px] right-[30px]">
                      <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பதவி (ENG)</p>
                      <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{selectedOfficerForDownload.role_en}</p>
                    </div>

                    {/* Row 4: Level */}
                    <div className="absolute left-[142px] top-[200px] w-[150px]">
                      <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">நிலை</p>
                      <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 uppercase">{selectedOfficerForDownload.level}</p>
                    </div>

                    <div className="absolute left-[305px] top-[200px] right-[30px]">
                      <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பெயர் (ENG)</p>
                      <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight">{selectedOfficerForDownload.name_en}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Letter Preview */
                <div className="flex flex-col items-center">
                  <div 
                    style={{
                      width: '595px',
                      height: '842px',
                      transform: `scale(${officerLetterScale})`,
                      transformOrigin: 'center center',
                      margin: `${(officerLetterScale - 1) * 842 / 2}px ${(officerLetterScale - 1) * 595 / 2}px`,
                    }}
                    className="shrink-0 relative overflow-hidden text-left font-sans bg-white shadow-xl"
                  >
                    <img
                      src={bgs.letter}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover -z-10"
                      alt="Officer Letter Background"
                    />
                    <div className="absolute inset-0 z-10">
                      <div className="absolute top-[323px] left-[191px] w-[168px] h-[182px] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
                        {officerImageB64 ? (
                          <img src={officerImageB64} className="w-full h-full object-cover" alt="Officer Avatar" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <div className="w-4 h-4 border-2 border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-[564px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                        <p className="text-[20px] font-black text-[#1E1250] tracking-wide">
                          {selectedOfficerForDownload.role}
                        </p>
                      </div>
                      
                      <div className="absolute top-[596px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                        <h2 className="text-[24px] font-black text-[#1E1250] leading-tight" style={{ fontSize: '20px', marginBottom: '-11px', paddingBottom: '-8px', marginRight: '-9px', marginTop: '6px' }}>{selectedOfficerForDownload.name}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Media Add/Edit Modal */}
      {isMediaFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl flex flex-col my-auto border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
            
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                {mediaFormType === 'add' ? 'Add New Media' : 'Edit Media'}
              </h2>
              <button 
                onClick={() => setIsMediaFormOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="media-form" onSubmit={handleMediaSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title (English) *</label>
                  <input 
                    type="text" required value={formMediaTitleEn} onChange={e => setFormMediaTitleEn(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title (Tamil) *</label>
                  <input 
                    type="text" required value={formMediaTitle} onChange={e => setFormMediaTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
                  <select 
                    value={formMediaType} onChange={e => setFormMediaType(e.target.value as 'photo' | 'video')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Media File *</label>
                  <input 
                    type="file" 
                    accept={formMediaType === 'photo' ? "image/*" : "video/*"}
                    onChange={(e) => handleMediaUpload(e, false)}
                    className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {isUploadingMedia && <p className="text-xs text-indigo-600 mt-1 animate-pulse font-bold">Uploading...</p>}
                  {mediaUploadError && <p className="text-xs text-red-600 mt-1 font-bold">{mediaUploadError}</p>}
                  {formMediaUrl && !isUploadingMedia && !mediaUploadError && <p className="text-xs text-green-600 mt-1 font-bold">File uploaded successfully!</p>}
                </div>
              </div>

              {formMediaType === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail Image (For Videos)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, true)}
                    className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {formMediaThumbnailUrl && <p className="text-xs text-green-600 mt-1 font-bold">Thumbnail uploaded successfully!</p>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tag (English) *</label>
                  <input 
                    type="text" required value={formMediaTagEn} onChange={e => setFormMediaTagEn(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    placeholder="e.g. event, meeting"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tag (Tamil) *</label>
                  <input 
                    type="text" required value={formMediaTag} onChange={e => setFormMediaTag(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    placeholder="e.g. நிகழ்வு, கூட்டம்"
                  />
                </div>
              </div>

              {/* Preview */}
              {formMediaUrl && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-500 mb-2">Media Preview</span>
                  {formMediaType === 'photo' ? (
                    <img src={formMediaUrl} alt="Preview" className="w-full max-w-sm rounded-lg shadow-sm" />
                  ) : (
                    <div className="w-full max-w-sm aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
                      <img src={formMediaThumbnailUrl || formMediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center z-10">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>

            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/80 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-3xl">
              <button 
                type="button"
                onClick={() => setIsMediaFormOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-center shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="media-form"
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors text-center flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {mediaFormType === 'add' ? 'Save Media' : 'Update Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offscreen flat renders for distortion-free high-quality capture */}
      <div className="absolute pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -9999, opacity: 0 }}>
        {selectedMember && (
          <>
            {/* Flat Front */}
            <div 
              ref={adminCardRef}
              className="w-[500px] h-[315px] rounded-3xl relative overflow-hidden text-left font-sans"
              style={{
                color: '#1E1250'
              }}
            >
              <img
                src="https://i.ibb.co/20qxy4NV/image.png"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover -z-10"
                alt="Background Front"
              />
              <div className="absolute left-[30px] top-[102px] w-[96px] h-[116px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-[#1E1250] bg-white">
                {memberImageB64 ? (
                  <img
                    src={memberImageB64} crossOrigin="anonymous" referrerPolicy="no-referrer"
                    alt="ID Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-4 h-4 border-2 border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="absolute left-[30px] top-[223px] w-[96px] flex justify-center">
                <span className="text-[7.5px] font-black tracking-widest px-2 py-0.5 rounded-md text-white bg-[#1E1250]">
                  உறுப்பினர்
                </span>
              </div>
              <div className="absolute left-[142px] top-[95px] right-[130px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பெயர்</p>
                <p className="font-extrabold text-[#1E1250] uppercase mt-0.5 truncate text-[14px] leading-tight font-sans">
                  {selectedMember.name}
                </p>
              </div>
              <div className="absolute right-[30px] top-[95px] text-right">
                <span className="text-[7.5px] font-bold text-[#1E1250]/75 tracking-wider font-sans">அட்டை எண்</span>
                <p className="font-mono font-black text-[12px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.cardId}</p>
              </div>

              {/* Row 2: Role & District */}
              <div className="absolute left-[142px] top-[130px] w-[150px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பதவி</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 flex items-center gap-1 font-sans">
                  <User className="w-3 h-3 stroke-[2.5]" style={{ stroke: '#1E1250' }} />
                  <span className="truncate">உறுப்பினர்</span>
                </p>
              </div>

              <div className="absolute left-[305px] top-[130px] right-[30px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">மாவட்டம்</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate font-sans">{selectedMember.district}</p>
              </div>

              {/* Row 3: Phone Number & Constituency */}
              <div className="absolute left-[142px] top-[165px] w-[150px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">கைப்பேசி</p>
                <p className="font-mono font-bold text-[10.5px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.phone}</p>
              </div>

              <div className="absolute left-[305px] top-[165px] right-[30px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">தொகுதி</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight font-sans">{selectedMember.constituency || 'N/A'}</p>
              </div>

              {/* Row 4: DOB & Union */}
              <div className="absolute left-[142px] top-[200px] w-[150px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பிறந்த தேதி</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.dob || 'N/A'}</p>
              </div>

              <div className="absolute left-[305px] top-[200px] right-[30px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">ஒன்றியம்</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight font-sans">{selectedMember.union || 'N/A'}</p>
              </div>

              {/* Row 5: Blood Group & Issued */}
              <div className="absolute left-[142px] top-[235px] w-[150px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">இரத்த வகை</p>
                <p className="font-black text-[10.5px] text-red-650 mt-0.5 text-red-600 font-sans">{selectedMember.bloodGroup || 'N/A'}</p>
              </div>

              <div className="absolute left-[305px] top-[235px] right-[30px]" style={{ paddingRight: '-4px', marginRight: '-13px' }}>
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">வழங்கிய தேதி</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 font-sans">{selectedMember.date}</p>
              </div>

              <div 
                className="absolute flex items-center justify-end text-white font-sans font-black text-[8px] select-none tracking-tight whitespace-nowrap"
                style={{
                  top: '71px',
                  right: '23px',
                  width: '75px',
                  height: '20px',
                  paddingRight: '5px',
                  textShadow: '0 1px 1.5px rgba(0,0,0,0.7)'
                }}
              >
                {selectedMember.validUntil}
              </div>
            </div>

            {/* Flat Back */}
            <div 
              ref={adminCardBackRef}
              className="w-[500px] h-[315px] rounded-3xl relative overflow-hidden"
            >
              <img
                src="https://i.ibb.co/0RmGfYgq/image.png"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Background Back"
              />
            </div>

            {/* Flat Letter */}
            <div 
              ref={adminLetterRef}
              className="w-[595px] h-[842px] shrink-0 relative overflow-hidden text-left font-sans bg-white"
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
                alt="Letter Background"
              />
              {/* Content Body */}
              <div className="absolute inset-0 z-10">
                {/* Image placed exactly in the template's portrait frame */}
                <div className="absolute top-[323px] left-[191px] w-[168px] h-[182px] rounded-2xl overflow-hidden shrink-0">
                  {memberImageB64 ? (
                    <img src={memberImageB64} className="w-full h-full object-cover mt-[3px] -mr-[4px]" alt="Member" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <div className="w-4 h-4 border-2 border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                    </div>
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
                  <h2 className="text-[24px] font-black text-[#1E1250] leading-tight" style={{ fontSize: '20px', marginBottom: '-11px', paddingBottom: '-8px', marginRight: '-9px', marginTop: '6px' }}>{selectedMember.name}</h2>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedOfficerForDownload && (
          <>
            {/* Flat Officer Card */}
            <div 
              ref={officerCardRef}
              className="w-[500px] h-[315px] rounded-3xl relative overflow-hidden text-left font-sans"
              style={{ color: '#1E1250' }}
            >
              <img src={bgs.front} crossOrigin="anonymous" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover -z-10" alt="Officer Background" />
              <div className="absolute left-[30px] top-[102px] w-[96px] h-[116px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-[#1E1250] bg-white">
                {officerImageB64 && <img src={officerImageB64} className="w-full h-full object-cover" alt="Avatar" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
              </div>
              <div className="absolute left-[30px] top-[223px] w-[96px] flex justify-center">
                <span className="text-[7.5px] font-black tracking-widest px-2 py-0.5 rounded-md text-white bg-[#1E1250]">
                  {selectedOfficerForDownload.level === 'state' ? 'மாநில பொறுப்பாளர்' : 'பொறுப்பாளர்'}
                </span>
              </div>
              <div className="absolute left-[142px] top-[95px] right-[130px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75">பெயர்</p>
                <p className="font-extrabold text-[#1E1250] uppercase mt-0.5 truncate text-[14px] leading-tight font-sans">
                  {selectedOfficerForDownload.name}
                </p>
              </div>
              <div className="absolute right-[30px] top-[95px] text-right">
                <span className="text-[7.5px] font-bold text-[#1E1250]/75 tracking-wider font-sans">அட்டை எண்</span>
                <p className="font-mono font-black text-[12px] text-[#1E1250] mt-0.5 font-sans">TUK-OFF-{selectedOfficerForDownload.id.substring(0, 4).toUpperCase()}</p>
              </div>

              {/* Row 2: Role & District */}
              <div className="absolute left-[142px] top-[130px] w-[150px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பதவி</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 flex items-center gap-1 font-sans">
                  <span className="truncate">{selectedOfficerForDownload.role}</span>
                </p>
              </div>

              <div className="absolute left-[305px] top-[130px] right-[30px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">மாவட்டம்</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate font-sans">{selectedOfficerForDownload.district}</p>
              </div>

              {/* Row 3: Phone */}
              <div className="absolute left-[142px] top-[165px] w-[150px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">கைப்பேசி</p>
                <p className="font-mono font-bold text-[10.5px] text-[#1E1250] mt-0.5 font-sans">{selectedOfficerForDownload.phone || 'N/A'}</p>
              </div>

              <div className="absolute left-[305px] top-[165px] right-[30px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பதவி (ENG)</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight font-sans">{selectedOfficerForDownload.role_en}</p>
              </div>

              {/* Row 4: Level */}
              <div className="absolute left-[142px] top-[200px] w-[150px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">நிலை</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 uppercase font-sans">{selectedOfficerForDownload.level}</p>
              </div>

              <div className="absolute left-[305px] top-[200px] right-[30px]">
                <p className="text-[7.5px] uppercase tracking-wider font-extrabold text-[#1E1250]/75 font-sans">பெயர் (ENG)</p>
                <p className="font-bold text-[10.5px] text-[#1E1250] mt-0.5 truncate leading-tight font-sans">{selectedOfficerForDownload.name_en}</p>
              </div>
            </div>

            {/* Flat Officer Letter */}
            <div 
              ref={officerLetterRef}
              className="w-[595px] h-[842px] shrink-0 relative overflow-hidden text-left font-sans bg-white"
              style={{
                color: '#1E1250',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <img
                src={bgs.letter}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover -z-10"
                alt="Officer Letter Background"
              />
              <div className="absolute inset-0 z-10">
                <div className="absolute top-[323px] left-[191px] w-[168px] h-[182px] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
                  {officerImageB64 ? (
                    <img src={officerImageB64} className="w-full h-full object-cover" alt="Officer Avatar" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <div className="w-4 h-4 border-2 border-[#1E1250] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <div className="absolute top-[564px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                  <p className="text-[20px] font-black text-[#1E1250] tracking-wide">
                    {selectedOfficerForDownload.role}
                  </p>
                </div>
                
                <div className="absolute top-[596px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                  <h2 className="text-[24px] font-black text-[#1E1250] leading-tight" style={{ fontSize: '20px', marginBottom: '-11px', paddingBottom: '-8px', marginRight: '-9px', marginTop: '6px' }}>{selectedOfficerForDownload.name}</h2>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
