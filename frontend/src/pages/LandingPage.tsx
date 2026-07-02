import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useAnimationFrame } from 'motion/react';
import {
  UserPlus,
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Menu,
  X,
  Play,
  Image as ImageIcon,
  Heart,
  Info,
  Globe,
  Scale,
  Shield,
  Lightbulb,
  Sparkles,
  Smartphone,
  User,
  Camera,
  CreditCard,
  HeartHandshake,
  Leaf,
  Activity,
  Compass,
  Briefcase,
  Award,
  UserCheck,
  ShieldAlert,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { LEADERS, WINGS, HERO_BADGE_URL, MEDIA_ITEMS } from '../data';
import { MediaItem, Wing } from '../types';
import { TRANSLATIONS } from '../translations';
import WingIcon from '../components/WingIcon';
import { dbService } from '../lib/dbService';

// Modals
import RegistrationModal from '../components/RegistrationModal';
import OfficerDirectoryModal from '../components/OfficerDirectoryModal';
import MediaViewerModal from '../components/MediaViewerModal';
import ContactFormModal from '../components/ContactFormModal';
import WingDetailsModal from '../components/WingDetailsModal';
import RenewCardModal from '../components/RenewCardModal';
import LeaderDetailsModal from '../components/LeaderDetailsModal';

interface Ideology {
  id: number;
  title_ta: string;
  title_en: string;
  images: string[];
  iconName: string;
}

const IDEOLOGIES: Ideology[] = [
  {
    id: 1,
    title_ta: "ஏழைகள், நலிவடைந்தவர்கள் மற்றும் தங்களது உரிமைகளைப் பறி கொடுத்தவர்களின் நலனில் பங்கேற்பது",
    title_en: "To participate in the welfare of the poor, the downtrodden, and those who have been deprived of their rights",
    images: [
      "https://i.ibb.co/mwnSW4v/image.png",
      "https://i.ibb.co/LXxyMqP9/image.png",
      "https://i.ibb.co/gZr2MYfM/image.png"
    ],
    iconName: "HeartHandshake"
  },
  {
    id: 2,
    title_ta: "தமிழ்நாடு மக்களின் உரிமைகளைப் பாதுகாப்பது",
    title_en: "To protect the rights of the people of Tamil Nadu",
    images: [
      "https://i.ibb.co/gZr2MYfM/image.png",
      "https://i.ibb.co/SXVTP0VB/image.png",
      "https://i.ibb.co/Q7bRvK75/image.png"
    ],
    iconName: "Scale"
  },
  {
    id: 3,
    title_ta: "விவசாயிகளின் வாழ்வாதாரத்தை மேம்படுத்துவது",
    title_en: "To improve the livelihood of farmers",
    images: [
      "https://i.ibb.co/wN2h3NmF/image.png",
      "https://i.ibb.co/nMK8j5tM/image.png",
      "https://i.ibb.co/nMGBn1Zd/image.png",
      "https://i.ibb.co/d08ZWh9k/image.png"
    ],
    iconName: "Leaf"
  },
  {
    id: 4,
    title_ta: "இயற்கை மற்றும் கனிம வளங்களைப் பாதுகாப்பது",
    title_en: "To protect natural and mineral resources",
    images: [
      "https://i.ibb.co/0pNGn9T1/image.png",
      "https://i.ibb.co/spDcSL9y/image.png",
      "https://i.ibb.co/WWZZ0jv9/image.png"
    ],
    iconName: "Shield"
  },
  {
    id: 5,
    title_ta: "அனைவருக்கும் சமமான கல்வி மற்றும் சுகாதாரத்தை உறுதி செய்வது",
    title_en: "To ensure equal education and healthcare for all",
    images: [
      "https://i.ibb.co/S7H19gb2/image.png",
      "https://i.ibb.co/998gqmJr/image.png",
      "https://i.ibb.co/N2XnkKY0/image.png",
      "https://i.ibb.co/4n9Pg5T7/image.png"
    ],
    iconName: "Activity"
  },
  {
    id: 6,
    title_ta: "ஒருவரது கடின உழைப்பின் மூலம் ஈட்டிய ஊதியத்தை முறைப்படி பெறுவது",
    title_en: "To rightfully receive the wages earned through one's hard work",
    images: [
      "https://i.ibb.co/R4T31tgN/image.png",
      "https://i.ibb.co/R4HPr31b/image.png",
      "https://i.ibb.co/Swsk6Bph/image.png"
    ],
    iconName: "CreditCard"
  },
  {
    id: 7,
    title_ta: "மாணவர்களை அவர்களின் எதிர்கால வாழ்க்கையை நோக்கி வழிநடத்துவது",
    title_en: "To guide students toward their future lives",
    images: [
      "https://i.ibb.co/wFmXbr30/image.png",
      "https://i.ibb.co/3YCSjmLg/image.png",
      "https://i.ibb.co/bjx1nbL4/image.png"
    ],
    iconName: "Compass"
  },
  {
    id: 8,
    title_ta: "இளைய தலைமுறையினருக்கு வேலை வாய்ப்புகளை உருவாக்குவது",
    title_en: "To create employment opportunities for youth",
    images: [
      "https://i.ibb.co/Q7CQYkfD/image.png",
      "https://i.ibb.co/HDHTBCCX/image.png",
      "https://i.ibb.co/nNyGnzxz/image.png"
    ],
    iconName: "Briefcase"
  },
  {
    id: 9,
    title_ta: "இளைஞர்களிடையே தேசிய பற்று மற்றும் சமூகப் பொறுப்பை ஊட்டுவது",
    title_en: "To instill national pride and social responsibility among the youth",
    images: [
      "https://i.ibb.co/JgYnzDz/image.png",
      "https://i.ibb.co/Fk8mNY0s/image.png",
      "https://i.ibb.co/q3Q2XyNt/image.png"
    ],
    iconName: "Award"
  },
  {
    id: 10,
    title_ta: "இந்தியாவின் மாணவர்கள் மற்றும் இளைஞர்களிடையே அவர்களின் உரிமைகளை நிலைநாட்டுவது",
    title_en: "To establish their rights among students and youth of India",
    images: [
      "https://i.ibb.co/yFcy0QvD/image.png",
      "https://i.ibb.co/chYM5gwq/image.png",
      "https://i.ibb.co/jv77yvQw/image.png"
    ],
    iconName: "UserCheck"
  },
  {
    id: 11,
    title_ta: "மாணவர்கள் மற்றும் இளைஞர்களிடையே பெண்களின் பாதுகாப்பு மற்றும் உரிமைகள் பற்றிய விழிப்புணர்வை ஏற்படுத்துவது",
    title_en: "To create awareness about women's safety and rights among students and youth",
    images: [
      "https://i.ibb.co/jvkbqKN5/image.png",
      "https://i.ibb.co/q3kL2PzJ/image.png",
      "https://i.ibb.co/HDtjRrFc/image.png"
    ],
    iconName: "ShieldAlert"
  },
  {
    id: 12,
    title_ta: "வஞ்சகமான மற்றும் கவர்ச்சிகரமான வார்த்தைகளால் எதிர்கால தேவைகளை முடக்கி வைக்கும் நவீன சமூகத்தின் தீய சக்திகளிடமிருந்து எதிர்கால இளைஞர்களைக் காப்பது",
    title_en: "To save the youth of the future from the evil forces of modern society that trap and lock away their future needs with deceitful and alluring words",
    images: [
      "https://i.ibb.co/1YXXFTz7/image.png"
    ],
    iconName: "Lock"
  }
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartHandshake,
  Scale,
  Leaf,
  Shield,
  Activity,
  CreditCard,
  Compass,
  Briefcase,
  Award,
  UserCheck,
  ShieldAlert,
  Lock
};

function IdeologyIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = iconMap[name] || Sparkles;
  return <IconComponent className={className} />;
}

const MediaCarouselCard = ({ items, lang, onClick }: { items: MediaItem[], lang: 'ta' | 'en', onClick: (item: MediaItem) => void, key?: string | number }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length]);

  const currentItem = items[currentIndex];

  return (
    <div onClick={() => onClick(items[currentIndex])} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg bg-slate-900 aspect-video cursor-pointer">
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item) => (
          <img 
            key={item.id}
            src={item.thumbnailUrl} 
            alt={item.title} 
            className="w-full h-full object-cover shrink-0 group-hover:scale-105 transition-transform duration-700" 
            referrerPolicy="no-referrer" 
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 flex flex-col justify-between p-4 z-10 pointer-events-none">
        <span className="self-start text-[8px] uppercase tracking-widest bg-brand-gold text-brand-blue px-2 py-0.5 rounded-full font-extrabold pointer-events-auto">{lang === 'ta' ? items[currentIndex].tag : items[currentIndex].tag_en}</span>
        {items[currentIndex].type === 'video' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-gold text-brand-blue flex items-center justify-center shadow-md"><Play className="w-4.5 h-4.5 fill-current" /></div>}
        <div className="flex justify-between items-end mt-auto gap-3 w-full pointer-events-auto">
          <h4 className="text-white text-xs font-display font-bold leading-tight line-clamp-2">{lang === 'ta' ? items[currentIndex].title : items[currentIndex].title_en}</h4>
          <div className="shrink-0 p-1.5 rounded-lg bg-white/10 group-hover:bg-brand-gold group-hover:text-brand-blue text-white transition-colors">{items[currentIndex].type === 'photo' ? <ImageIcon className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</div>
        </div>
      </div>
      {items.length > 1 && (
        <div className="absolute top-3 right-3 flex gap-1 z-20 bg-black/30 p-1.5 rounded-full backdrop-blur-sm shadow-inner pointer-events-auto">
          {items.map((_, idx) => (
             <div key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }} className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${idx === currentIndex ? 'bg-brand-gold scale-125' : 'bg-white/40 hover:bg-white'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function LandingPage() {
  // Navigation / Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Bilingual Language State (TAMIL by default, togglable to ENGLISH)
  const [lang, setLang] = useState<'ta' | 'en'>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved === 'ta' || saved === 'en') ? saved : 'ta';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);
  const navigate = useNavigate();
  const t = TRANSLATIONS[lang];
  
  const [mediaItemsDb, setMediaItemsDb] = useState<MediaItem[]>(() => {
    const cached = localStorage.getItem('tuk_media');
    return cached ? JSON.parse(cached) : MEDIA_ITEMS;
  });

  useEffect(() => {
    const unsub = dbService.subscribeToCollection('media', (data) => {
      if (data.length > 0) {
        setMediaItemsDb(data);
        localStorage.setItem('tuk_media', JSON.stringify(data));
      }
    });
    return () => unsub();
  }, []);

  // Interactive Guiding Ideologues infinite carousel config
  const leadersX = useMotionValue(-1000);
  const [isInteracting, setIsInteracting] = useState(false);
  const leadersContainerRef = useRef<HTMLDivElement>(null);
  const [singleSetWidth, setSingleSetWidth] = useState(1200);

  useEffect(() => {
    if (leadersContainerRef.current) {
      const totalWidth = leadersContainerRef.current.scrollWidth;
      const widthOfOneSet = totalWidth / 3;
      setSingleSetWidth(widthOfOneSet);
      leadersX.set(-widthOfOneSet);
    }
  }, [lang]);

  useAnimationFrame((time, delta) => {
    if (isInteracting) return;
    const speed = 40; // px per second
    const step = (speed * delta) / 1000;
    let nextX = leadersX.get() + step;
    if (nextX > -singleSetWidth) {
      nextX -= singleSetWidth;
    }
    leadersX.set(nextX);
  });

  // Modals management
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedWingId, setSelectedWingId] = useState<string | undefined>(undefined);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [activeMediaId, setActiveMediaId] = useState<string>('');
  const [contactOpen, setContactOpen] = useState(false);
  const [wingDetailsOpen, setWingDetailsOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [leaderDetailsOpen, setLeaderDetailsOpen] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | undefined>(undefined);

  // Filter for Gallery
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'video'>('all');

  // Ideologies automatic carousel state
  const [activeIdeology, setActiveIdeology] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [ideologyPaused, setIdeologyPaused] = useState(false);
  const [ideologyTimer, setIdeologyTimer] = useState(0);

  useEffect(() => {
    if (ideologyPaused) return;
    const interval = setInterval(() => {
      setIdeologyTimer(prev => {
        if (prev >= 5000) {
          setActiveIdeology(curr => (curr + 1) % IDEOLOGIES.length);
          setActiveImageIdx(0);
          return 0;
        }
        return prev + 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [ideologyPaused]);

  // Automatically cycle through images of active ideology if there are multiple
  useEffect(() => {
    if (ideologyPaused) return;
    const imagesCount = IDEOLOGIES[activeIdeology].images.length;
    if (imagesCount <= 1) {
      setActiveImageIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveImageIdx(curr => (curr + 1) % imagesCount);
    }, 2500);
    return () => clearInterval(interval);
  }, [activeIdeology, ideologyPaused]);

  const nextIdeology = () => {
    setActiveIdeology(curr => (curr + 1) % IDEOLOGIES.length);
    setActiveImageIdx(0);
    setIdeologyTimer(0);
  };

  const prevIdeology = () => {
    setActiveIdeology(curr => (curr - 1 + IDEOLOGIES.length) % IDEOLOGIES.length);
    setActiveImageIdx(0);
    setIdeologyTimer(0);
  };

  // Contact quick message inside website footer
  const [footerMsg, setFooterMsg] = useState({ name: '', phone: '', message: '' });
  const [footerSuccess, setFooterSuccess] = useState(false);

  // Handle scroll detection for styled sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered media records
  const filteredMedia = mediaItemsDb.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const groupedMedia = Object.values(filteredMedia.reduce((acc, item) => {
    const key = item.title_en || item.title;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>)) as MediaItem[][];

  const handleWingClick = (wing: Wing) => {
    setSelectedWingId(wing.id);
    setWingDetailsOpen(true);
  };

  const handleRegisterGeneral = () => {
    setSelectedWingId(undefined);
    setRegisterOpen(true);
  };

  const handleMediaClick = (item: MediaItem) => {
    setActiveMediaId(item.id);
    setMediaOpen(true);
  };

  const handleLeaderClick = (id: string) => {
    setSelectedLeaderId(id);
    setLeaderDetailsOpen(true);
  };

  const handleFooterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!footerMsg.name || !footerMsg.phone) {
      alert(lang === 'ta' ? 'பெயர் மற்றும் கைப்பேசி எண் தேவை' : 'Name and Phone are required');
      return;
    }

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('tuk_footer_contacts') || '[]');
    existing.push({ ...footerMsg, date: new Date().toISOString() });
    localStorage.setItem('tuk_footer_contacts', JSON.stringify(existing));

    setFooterSuccess(true);
    setFooterMsg({ name: '', phone: '', message: '' });
    setTimeout(() => {
      setFooterSuccess(false);
    }, 4000);
  };

  // Load and remove checkerboard/white background from watermark image using advanced canvas keying
  const [watermarkTransparentUrl, setWatermarkTransparentUrl] = useState<string>('');
  const [leadersTransparentUrl, setLeadersTransparentUrl] = useState<string>('');
  const [advocateTransparentUrl, setAdvocateTransparentUrl] = useState<string>('');
  const [newAdvocateTransparentUrl, setNewAdvocateTransparentUrl] = useState<string>('');

  useEffect(() => {
    const rawUrl = "https://i.postimg.cc/4dfw9pvd/image-removebg-preview.png";
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setWatermarkTransparentUrl(rawUrl);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const diff = maxVal - minVal;
          
          if (diff < 35 || (r > 175 && g > 175 && b > 175 && diff < 45) || (r < 60 && g < 60 && b < 60 && diff < 20)) {
            data[i+3] = 0; // Make pixels clear/transparent
          } else {
            // High quality soft blending on borders of key
            if (diff < 50) {
              const borderFactor = (diff - 35) / 15; // 0..1 transition
              data[i+3] = Math.round(data[i+3] * borderFactor);
            }
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        setWatermarkTransparentUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        setWatermarkTransparentUrl(rawUrl);
      }
    };
    img.onerror = () => {
      setWatermarkTransparentUrl(rawUrl);
    };
    img.src = rawUrl;
  }, []);

  useEffect(() => {
    const removeWhiteBg = (rawUrl: string, threshold: number, isAdvocate: boolean): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawUrl);
            return;
          }
          ctx.drawImage(img, 0, 0);
          try {
            const imgData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i+1];
              const b = data[i+2];
              
              const maxVal = Math.max(r, g, b);
              const minVal = Math.min(r, g, b);
              const diff = maxVal - minVal;
              
              // Key out white / light gray backgrounds
              if (r >= threshold && g >= threshold && b >= threshold && diff < 12) {
                // Safeguard advocate's center collar, tie, neckband, and inner shirt so they don't get keyed out
                if (isAdvocate) {
                  const pixelIndex = i / 4;
                  const x = pixelIndex % img.width;
                  const y = Math.floor(pixelIndex / img.width);
                  
                  // Protect the core shirt, tilak & neckband area from transparentization
                  if (x > img.width * 0.32 && x < img.width * 0.68 && y > img.height * 0.25 && y < img.height * 0.85) {
                    continue;
                  }
                }
                data[i+3] = 0;
              } else {
                // Apply soft anti-aliased blending on boundaries
                const avg = (r + g + b) / 3;
                if (avg > threshold - 15 && diff < 15) {
                  const factor = (threshold - avg) / 15;
                  data[i+3] = Math.round(data[i+3] * factor);
                }
              }
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            resolve(rawUrl);
          }
        };
        img.onerror = () => {
          resolve(rawUrl);
        };
        img.src = rawUrl;
      });
    };

    removeWhiteBg("/src/assets/images/leader_group_portrait_1781895577389.jpg", 242, false).then(setLeadersTransparentUrl);
    removeWhiteBg("/src/assets/images/advocate_portrait_1781895592122.jpg", 248, true).then(setAdvocateTransparentUrl);
    removeWhiteBg("https://i.ibb.co/23PzbC3r/leader.png", 200, true).then(setNewAdvocateTransparentUrl);
  }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-gold selection:text-brand-blue font-sans antialiased text-slate-800 bg-slate-50 home-all-bold">
      
      {/* 1. Header (Navbar) - Responsive and sticky on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-45 transition-all duration-300 bg-slate-950/95 backdrop-blur-md border-b border-brand-gold/45 shadow-lg shadow-brand-gold/5 ${
          scrolled || mobileMenuOpen
            ? 'py-2'
            : 'py-3'
        }`}
      >
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 pb-1 border-b border-white/5 text-[10px] tracking-widest font-extrabold uppercase font-sans select-none animate-fade-in opacity-80 mt-[2px] mb-[5px] pt-[5px]">
          <span className="text-white">{lang === 'ta' ? 'வீரம்!!' : 'Valor!!'}</span>
          <span className="gold-shine-text font-black">{lang === 'ta' ? 'விவேகம்!!' : 'Wisdom!!'}</span>
          <span className="text-white">{lang === 'ta' ? 'நீதி!!' : 'Justice!!'}</span>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-1">
          <div className="flex justify-between items-center">
            
            {/* Branding Logo Left */}
            <a href="#home" className="flex items-center gap-3 group transition-transform hover:scale-[1.01] ml-[-11px]">
              <div className="w-14 h-14 select-none shrink-0 animate-pulse-subtle flex items-center justify-center">
                <img
                  id="navbar-logo"
                  src="https://i.ibb.co/bYGc84w/image.png"
                  alt="Logo"
                  className="w-[46px] h-[46px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center font-sans flex flex-col justify-center items-center">
                <h1 className="font-sans font-extrabold text-brand-gold text-sm sm:text-base leading-tight tracking-wide gold-shine-text">
                  {t.brandName}
                </h1>
                <p className="text-[10px] sm:text-xs text-white tracking-wider font-semibold">
                  {t.organizationSubtitle}
                </p>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 font-sans">
              <a href="#home" className="text-white hover:text-brand-gold font-bold text-xs sm:text-sm tracking-wide transition-colors">
                {t.home}
              </a>
              <a href="#policies" className="text-white hover:text-brand-gold font-bold text-xs sm:text-sm tracking-wide transition-colors">
                {t.policy}
              </a>
              <a href="#management" className="text-white hover:text-brand-gold font-bold text-xs sm:text-sm tracking-wide transition-colors">
                {t.execManagement}
              </a>
              <a href="#gallery" className="text-white hover:text-brand-gold font-bold text-xs sm:text-sm tracking-wide transition-colors">
                {t.gallery}
              </a>
              <a href="#contact" className="text-white hover:text-brand-gold font-bold text-xs sm:text-sm tracking-wide transition-colors">
                {t.contact}
              </a>
            </nav>

            {/* Actions button right */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Switcher rounded pill */}
              <div className="flex items-center bg-brand-blue/90 p-1 rounded-xl border border-brand-gold/30 text-xs font-bold gap-1 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setLang('ta')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    lang === 'ta' ? 'gold-glowing-btn' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    lang === 'en' ? 'gold-glowing-btn' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={handleRegisterGeneral}
                id="header-register-btn"
                className="py-2 px-4 rounded-xl gold-glowing-btn active:scale-98 font-bold text-xs tracking-wider border border-brand-gold/20 flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-brand-blue-dark stroke-[2.5]" /> {t.joinUs}
              </button>
            </div>

            {/* Mobile menu trigger buttons */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Simple toggler for mobile screen sizes */}
              <button
                onClick={() => setLang(l => (l === 'ta' ? 'en' : 'ta'))}
                className="p-1 px-2.5 rounded-lg bg-brand-blue border border-brand-blue-light text-brand-gold font-bold text-xs gold-shine-text"
              >
                {lang === 'ta' ? 'EN' : 'தமிழ்'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                id="mobile-nav-toggle"
                className="p-1.5 rounded-lg bg-brand-blue text-brand-gold hover:text-[#fff] transition-colors cursor-pointer border border-brand-gold/25"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mx-4 my-2 p-5 bg-slate-950/98 rounded-2xl border border-brand-gold/20 shadow-2xl space-y-4">
            <nav className="flex flex-col gap-2.5 text-left font-sans">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-brand-gold text-xs font-bold tracking-wide transition-colors py-2 border-b border-white/5"
              >
                {t.home}
              </a>
              <a
                href="#policies"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-brand-gold text-xs font-bold tracking-wide transition-colors py-2 border-b border-white/5"
              >
                {t.policy}
              </a>
              <a
                href="#management"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-brand-gold text-xs font-bold tracking-wide transition-colors py-2 border-b border-white/5"
              >
                {t.execManagement}
              </a>
              <a
                href="#gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-brand-gold text-xs font-bold tracking-wide transition-colors py-2 border-b border-white/5"
              >
                {t.gallery}
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-brand-gold text-xs font-bold tracking-wide transition-colors py-2"
              >
                {t.contact}
              </a>
            </nav>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleRegisterGeneral();
              }}
              id="mobile-nav-register-btn"
              className="w-full py-2.5 px-4 rounded-xl gold-glowing-btn text-brand-blue font-sans font-bold text-xs tracking-wider border border-brand-gold/20 flex justify-center items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-brand-blue stroke-[2.5]" /> {t.joinUsLong}
            </button>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section
        id="home"
        className="h-[510px] xs:h-[550px] sm:h-[650.1px] md:h-[840.1px] pt-12 xs:pt-16 md:pt-20 pb-4 xs:pb-8 md:pb-10 bg-brand-blue text-white relative overflow-hidden font-sans select-none min-h-[480px] xs:min-h-[510px] sm:min-h-[550px] md:min-h-[540px] flex flex-col justify-center"
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.22] pointer-events-none z-0 overflow-hidden">
          <img
            src={watermarkTransparentUrl || "https://i.postimg.cc/4dfw9pvd/image-removebg-preview.png"}
            alt="National Rights Forum Watermark"
            className="w-[65%] max-w-[580px] h-auto object-contain select-none pointer-events-none transition-transform duration-500 scale-[1.02]"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col w-full mb-[3px] max-sm:mb-[-20px] mt-[1px] pb-[2px]">

          <div className="flex flex-row gap-4 md:gap-11 items-center py-4 relative z-10 w-full mt-[12px]">
             <div className="w-1/2 md:w-7/12 space-y-2 text-left order-1 pt-[8px] md:pt-[37px] pb-[8px] md:pb-[0px] mb-[18px] xs:mb-[32px] sm:mb-[65px] md:mb-[120px]">
              <div className="flex flex-col gap-1 select-none">
                <h2 className={`font-tamil-display font-medium leading-[1] tracking-normal text-left flex flex-col gap-0 justify-start items-start ${
                  lang === 'ta'
                    ? 'text-[24px] xs:text-[28px] sm:text-[34px] md:text-5xl lg:text-[72px]'
                    : 'text-[32px] xs:text-[38px] sm:text-[44px] lg:text-[72px]'
                }`}>
                  {lang === 'ta' ? (
                    <>
                      <span className="gold-shine-text whitespace-nowrap md:whitespace-normal">தேசிய உரிமைகள்</span>
                      <span className="gold-shine-text whitespace-nowrap md:whitespace-normal">களம்</span>
                    </>
                  ) : (
                    <>
                      <span className="gold-shine-text whitespace-nowrap md:whitespace-normal">National Rights</span>
                      <span className="gold-shine-text whitespace-nowrap md:whitespace-normal">Forum</span>
                    </>
                  )}
                </h2>
                <h3 className={`font-display font-black text-white leading-tight tracking-normal mt-2 ${
                  lang === 'ta'
                    ? 'text-[12px] xs:text-[14px] sm:text-[16px] md:text-[24px] lg:text-[32px]'
                    : 'text-[15px] xs:text-[18px] sm:text-[22px] lg:text-[32px]'
                }`}>
                  {lang === 'ta' ? 'நுகர்வோர் அமைப்பு' : t.organizationSubtitle}
                </h3>
              </div>
              <div className="space-y-4 pt-5 mt-[17px] pb-4">
                <div className="flex items-stretch gap-3.5 pl-1.5">
                  <div className="w-[3px] bg-brand-gold rounded-full shrink-0"></div>
                  <p className="font-sans font-bold text-[10px] leading-relaxed select-none">
                    <span className="gold-shine-text font-extrabold">
                       {lang === 'ta' ? 'இன்றைய அங்கீகாரம்...!!' : 'Recognition Today...!!'}
                     </span>{' '}
                    <span className="text-white ml-2 opacity-90">
                       {lang === 'ta' ? 'நாளைய அதிகாரம்...!!' : 'Authority Tomorrow...!!'}
                     </span>
                  </p>
                </div>
                <div className="flex items-stretch gap-3.5 pl-1.5">
                  <div className="w-[3px] bg-brand-gold rounded-full shrink-0"></div>
                  <p className="font-sans font-bold text-[10px] leading-relaxed select-none mt-[-2px] mb-0 mr-[-11px]">
                    <span className="text-white opacity-90">
                       {lang === 'ta' ? 'மக்கள் சக்தியாய் கூடுவோம்..!!' : 'Unite as Public Power..!!'}
                     </span>{' '}
                    <span className="gold-shine-text font-extrabold ml-2">
                       {lang === 'ta' ? 'மனித உரிமை காப்போம்...!!' : 'Protect Human Rights...!!'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="pt-2 animate-fade-in">
                <button
                  onClick={handleRegisterGeneral}
                  className="py-1.5 px-3 xs:py-2 xs:px-4 rounded-xl gold-glowing-btn active:scale-98 font-bold text-[10px] xs:text-xs tracking-wider border border-brand-gold/20 flex items-center gap-1.5 cursor-pointer text-brand-blue"
                >
                  <UserPlus className="w-3.5 h-3.5 text-brand-blue stroke-[2.5]" /> {t.joinUs}
                </button>
              </div>
            </div>
            <div className="w-1/2 md:w-5/12 flex flex-col items-center justify-center order-2 z-10 pt-[53px] sm:pt-4 ml-[-18px] sm:ml-[-15px] md:ml-[-31px] mt-[7px] sm:mt-0">
                <img
                  src="https://i.ibb.co/939kQt3R/bg.png"
                  className="w-[99px] h-[140px] xs:w-[99px] sm:w-[110px] md:w-[132px] xs:h-[140px] sm:h-[112px] md:h-[134px] -mt-[32px] xs:-mt-[32px] sm:-mt-[55px] md:-mt-[65px] ml-[101px] xs:ml-[101px] sm:ml-[30px] md:ml-[40px] -mb-[15px] xs:-mb-[15px] sm:mb-0 pb-[59px] sm:pb-0 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] animate-fade-in transition-transform duration-300 hover:scale-[1.01]"
                  referrerPolicy="no-referrer"
                />
                <img
                  src={lang === 'ta' ? "https://i.ibb.co/Nnfs4hb8/advocate.png" : "https://i.ibb.co/4wcBQzbm/image.png"}
                  className="w-[550.6px] h-[288.25px] xs:w-[550.6px] xs:h-[288.25px] sm:w-[350px] md:w-[450px] sm:h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] animate-fade-in transition-transform duration-300 hover:scale-[1.01] mr-[-10px] xs:mr-[-15px] sm:mr-2 md:mr-[41px] mb-[-106px] xs:mb-[-106px] sm:mb-[-82px] md:mb-[-105px] pl-0 xs:pl-0 sm:pl-0 mt-[-25px] xs:mt-[-25px] sm:mt-[55px] pt-[45px] sm:pt-0"
                  referrerPolicy="no-referrer"
                />

            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Section: About the Party Video */}
      <section id="party-video" className="py-12 md:py-20 bg-slate-50 border-b border-slate-200 flex justify-center text-center relative text-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-blue tracking-tight mb-3">
              {lang === 'ta' ? 'கட்சியின் பார்வை' : 'Vision of Our Forum'}
            </h3>
            <div className="h-[3px] w-12 bg-gradient-to-r from-brand-blue to-brand-gold rounded-full mx-auto"></div>
          </div>
          
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black">
            <iframe 
              className="absolute inset-0 w-full h-full"
              src="about:blank" 
              title="Party Video" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* 2.6 Section: En Thokuthi Banner */}
      <section id="en-thokuthi" className="py-12 md:py-20 bg-white border-b border-slate-100 flex justify-center text-center relative text-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-blue tracking-tight mb-3">
              {lang === 'ta' ? 'என் தொகுதி' : 'My Constituency'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
              {lang === 'ta' 
                ? 'உங்கள் தொகுதிக்குட்பட்ட அனைத்து விவரங்கள் மற்றும் கட்சிப் பொறுப்பாளர்களைத் தெரிந்துகொள்ள உதவும் பிரத்யேக தளம்.' 
                : 'A dedicated platform to check details and list of executives in your specific constituency.'}
            </p>
            <div className="h-[3px] w-12 bg-gradient-to-r from-brand-blue to-brand-gold rounded-full mx-auto mt-4"></div>
          </div>
          
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50 p-2 sm:p-4 hover:shadow-2xl transition-all duration-300">
            <img 
              src="https://i.ibb.co/cSmQsbSF/jpg-enthokuthi.png" 
              alt="En Thokuthi Banner" 
              className="w-full h-auto object-cover rounded-xl transition-transform duration-300 hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 3. Section: Guiding Ideologues Policies */}
      <section id="policies" className="py-12 md:py-16 bg-white text-slate-800 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-brand-blue tracking-tight flex items-center justify-center gap-1.5">
              {t.policyTitle}
            </h3>
            <div className="h-[3px] w-12 bg-gradient-to-r from-brand-gold to-brand-blue-light rounded-full mx-auto"></div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-2xl mx-auto font-sans">
              {t.policyDesc}
            </p>
          </div>

          <div className="relative w-full overflow-hidden py-4">
            {/* Ambient vignette masks for slick modern look */}
            <div className="absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-white/30 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-white/30 to-transparent z-10 pointer-events-none"></div>

            <motion.div 
              ref={leadersContainerRef}
              drag="x"
              dragConstraints={{ left: -3000, right: 3000 }}
              dragElastic={0.05}
              onDragStart={() => setIsInteracting(true)}
              onDragEnd={() => {
                setIsInteracting(false);
                const currentX = leadersX.get();
                if (currentX > -singleSetWidth) {
                  leadersX.set(currentX - singleSetWidth);
                } else if (currentX < -2 * singleSetWidth) {
                  leadersX.set(currentX + singleSetWidth);
                }
              }}
              onDrag={() => {
                const currentX = leadersX.get();
                if (currentX > -singleSetWidth) {
                  leadersX.set(currentX - singleSetWidth);
                } else if (currentX < -2 * singleSetWidth) {
                  leadersX.set(currentX + singleSetWidth);
                }
              }}
              onHoverStart={() => setIsInteracting(true)}
              onHoverEnd={() => setIsInteracting(false)}
              style={{ x: leadersX }}
              className="flex gap-6 md:gap-8 py-2 cursor-grab active:cursor-grabbing"
            >
               {[...LEADERS, ...LEADERS, ...LEADERS].map((leader, i) => (
                 <div
                   key={`${leader.id}-${i}`}
                   onClick={() => handleLeaderClick(leader.id)}
                   className="group relative bg-[#fafbff] rounded-3xl border border-slate-100 hover:border-brand-blue/20 hover:shadow-xl transition-all duration-300 flex flex-col items-stretch overflow-hidden overflow-ellipsis transform hover:-translate-y-1.5 w-[280px] sm:w-[340px] md:w-[380px] shrink-0 cursor-pointer"
                   title={lang === 'ta' ? 'விவரங்களைப் பார்க்க கிளிக் செய்க' : 'Click to view details'}
                 >
                   <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light py-8 px-6 text-center text-white relative flex flex-col items-center">
                     <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
                     <div 
                       className="w-24 h-24 rounded-full border-4 border-brand-gold p-0.5 overflow-hidden bg-white shadow-md transform group-hover:scale-110 hover:border-white transition-all mb-4 relative z-10 cursor-pointer active:scale-95"
                     >
                       <img
                         src={leader.imageUrl}
                         alt={lang === 'ta' ? leader.name : leader.name_en}
                         className="w-full h-full object-cover rounded-full"
                         referrerPolicy="no-referrer"
                       />
                     </div>
                     <div className="relative z-10 space-y-1">
                       <h4 className="font-display font-bold text-sm sm:text-base tracking-wide text-white leading-tight">
                         {lang === 'ta' ? leader.name : leader.name_en}
                       </h4>
                       <div className="h-[2px] w-8 bg-brand-gold rounded-full mx-auto my-1.5"></div>
                       <p className="text-[10px] uppercase tracking-widest text-brand-gold font-extrabold">
                         {lang === 'ta' ? leader.title : leader.title_en}
                       </p>
                     </div>
                   </div>
                   <div className="p-6 md:p-8 flex-1 flex flex-col justify-between text-left relative bg-white">
                     <div className="absolute top-2 left-3 text-7xl font-serif text-slate-100 opacity-60 pointer-events-none group-hover:text-brand-gold/5 transition-colors">“</div>
                     <p className="text-slate-600 text-[13px] sm:text-sm leading-relaxed relative z-10 pt-3 pb-5 select-none font-sans font-medium min-h-[80px]">
                       {lang === 'ta' ? leader.quote : leader.quote_en}
                     </p>
                     <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 mt-auto">
                       <div className="flex items-center justify-between">
                         <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">{t.guidingMoral}</span>
                       </div>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           handleLeaderClick(leader.id);
                         }}
                         className="w-full flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl border border-brand-blue/10 bg-slate-50 text-brand-blue hover:bg-brand-blue hover:text-white hover:border-transparent transition-all text-xs font-black cursor-pointer shadow-sm"
                       >
                         <span>{lang === 'ta' ? 'விவரங்களை அறிய' : 'View Life Bio'}</span>
                         <span className="text-[10px]">➜</span>
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Section: Organizational Management Board */}
      <section id="management" className="py-16 md:py-20 bg-gradient-to-br from-brand-blue via-brand-blue/95 to-brand-blue/90 text-white relative overflow-hidden">
        {/* Subtle decorative background pattern / radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.06),transparent_50%)] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
            {lang === 'ta' ? 'நிர்வாகப் பொறுப்பாளர்கள்' : 'Executive Management'}
          </h3>
          <div className="h-[3px] w-14 bg-brand-gold rounded-full mx-auto mt-4 mb-5 shadow-sm"></div>
          
          <p className="text-sm sm:text-base text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed mb-8">
            {lang === 'ta' 
              ? 'மாநில அளவிலான தலைமை நிர்வாகிகள் மற்றும் மாவட்ட பொறுப்பாளர்களைக் கொண்ட எங்களின் அர்ப்பணிப்புமிக்க செயல்பாட்டாளர்கள்.'
              : 'Our dedicated team of state-level administrators and regional district officers leading legal support and public service.'}
          </p>
          
          <div className="flex justify-center">
            <Link 
              to="/directory" 
              className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm sm:text-base tracking-wide shadow-xl active:scale-95 transition-all flex items-center gap-3.5 border border-white hover:bg-brand-gold hover:text-brand-blue hover:border-brand-gold group"
            >
              <span>{lang === 'ta' ? 'பொறுப்பாளர்கள் விவரங்கள்' : 'View Officers Directory'}</span>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Section: Sub-Organizations wings */}
      <section id="wings" className="py-12 md:py-16 bg-slate-50 text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3 font-sans">
            <div className="inline-block px-4 py-1.5 rounded-xl bg-brand-blue border border-brand-gold/20 shadow-md">
              <h3 className="font-display font-extrabold text-base tracking-widest gold-shine-text uppercase">{t.wingsTitle}</h3>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-xl mx-auto mt-3">{t.wingsDesc}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {WINGS.map(wing => (
              <button key={wing.id} onClick={() => handleWingClick(wing)} className="group outline-none text-left w-full p-3 sm:p-4.5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-brand-blue hover:to-brand-blue-light border border-slate-200/60 shadow-sm hover:shadow-md hover:border-brand-blue/10 transition-all duration-300 flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-brand-gold">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 group-hover:bg-white/10 group-hover:scale-110 flex items-center justify-center shadow-inner transition-transform shrink-0 text-brand-blue group-hover:text-brand-gold"><WingIcon name={wing.icon} className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <div className="min-w-0">
                    <h4 className="font-sans font-bold text-slate-800 group-hover:text-brand-gold-light text-[11px] sm:text-sm leading-tight line-clamp-2">{lang === 'ta' ? wing.name : wing.name_en}</h4>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 group-hover:text-brand-gold/80 mt-0.5 truncate">{lang === 'ta' ? 'இணைந்து பணியாற்ற ➜' : 'Apply online to join ➜'}</p>
                  </div>
                </div>
                <ChevronRight className="hidden sm:block w-4 h-4 text-slate-400 group-hover:text-brand-gold group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-12 md:py-16 bg-white text-slate-800 border-t border-slate-100 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-brand-blue tracking-tight flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-brand-gold" /> {t.galleryTitle}
            </h3>
            <div className="h-[3px] w-12 bg-brand-gold rounded-full mx-auto"></div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-xl mx-auto">{t.galleryDesc}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-8">
            <button onClick={() => setActiveTab('all')} className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${activeTab === 'all' ? 'bg-brand-blue text-brand-gold shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t.tabAll}</button>
            <button onClick={() => setActiveTab('photo')} className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${activeTab === 'photo' ? 'bg-brand-blue text-brand-gold shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t.tabPhotos}</button>
            <button onClick={() => setActiveTab('video')} className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${activeTab === 'video' ? 'bg-brand-blue text-brand-gold shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t.tabVideos}</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedMedia.map((group, idx) => (
              <MediaCarouselCard key={idx} items={group} lang={lang} onClick={handleMediaClick} />
            ))}
          </div>
        </div>
      </section>

      {/* Ideologies Section */}
      <section id="ideologies" className="py-16 md:py-20 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-brand-blue tracking-tight flex items-center justify-center gap-2">
              {t.ideologiesTitle}
            </h3>
            <div className="h-[3px] w-12 bg-brand-gold rounded-full mx-auto"></div>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-xl mx-auto">{t.ideologiesDesc}</p>
          </div>

          {/* Automatic Moving Carousel Container */}
          <div 
            className="relative max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden"
            onMouseEnter={() => setIdeologyPaused(true)}
            onMouseLeave={() => setIdeologyPaused(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px] md:min-h-[460px]">
              {/* Left Content Column */}
              <div className="col-span-1 md:col-span-7 p-6 sm:p-10 flex flex-col justify-between relative bg-gradient-to-br from-white to-slate-50/50">
                {/* Big Index Decoration */}
                <div className="absolute top-0 left-2 text-[100px] sm:text-[120px] font-sans font-black text-slate-100/70 select-none pointer-events-none leading-none">
                  {String(IDEOLOGIES[activeIdeology].id).padStart(2, '0')}
                </div>
                
                <div className="relative z-10 mt-6 sm:mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 border border-brand-blue/5">
                      <IdeologyIcon name={IDEOLOGIES[activeIdeology].iconName} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-blue px-2.5 py-1 rounded-lg">
                      {lang === 'ta' ? 'நோக்கம்' : 'Objective'} {activeIdeology + 1}/12
                    </span>
                  </div>
                  
                  <h4 className="font-display font-extrabold text-base sm:text-lg md:text-xl text-slate-900 leading-snug tracking-tight mb-4 min-h-[60px]">
                    {lang === 'ta' ? IDEOLOGIES[activeIdeology].title_ta : IDEOLOGIES[activeIdeology].title_en}
                  </h4>
                  
                  <p className="text-xs sm:text-[13px] text-slate-450 leading-relaxed italic border-l-2 border-brand-gold/40 pl-4">
                    {lang === 'ta' ? IDEOLOGIES[activeIdeology].title_en : IDEOLOGIES[activeIdeology].title_ta}
                  </p>
                </div>

                {/* Nav Controls at bottom left */}
                <div className="flex items-center gap-3 mt-8 sm:mt-12 relative z-10">
                  <button 
                    onClick={prevIdeology}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                    title={lang === 'ta' ? 'முந்தைய நோக்கம்' : 'Previous Objective'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={nextIdeology}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                    title={lang === 'ta' ? 'அடுத்த நோக்கம்' : 'Next Objective'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 font-mono ml-2 uppercase tracking-wide">
                    {ideologyPaused ? (lang === 'ta' ? 'நிறுத்தப்பட்டுள்ளது' : 'Paused') : (lang === 'ta' ? 'தானியங்கி இயக்கம்...' : 'Auto-playing...')}
                  </span>
                </div>
              </div>

              {/* Right Images Column */}
              <div className="col-span-1 md:col-span-5 relative bg-slate-950 overflow-hidden flex flex-col justify-center min-h-[320px] md:min-h-full">
                {/* Main active image inside right column */}
                <div className="absolute inset-0">
                  <img 
                    src={IDEOLOGIES[activeIdeology].images[activeImageIdx]} 
                    referrerPolicy="no-referrer"
                    alt="Ideology Media" 
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-100 hover:scale-105"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                </div>

                {/* Thumbnail preview indicators inside image */}
                {IDEOLOGIES[activeIdeology].images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
                    {IDEOLOGIES[activeIdeology].images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${idx === activeImageIdx ? 'border-brand-gold scale-105 shadow-md' : 'border-white/20 opacity-70 hover:opacity-100 hover:border-white'}`}
                      >
                        <img src={img} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar representing autoplay timer */}
            <div className="w-full h-1 bg-slate-100 relative">
              <div 
                className="h-full bg-brand-gold transition-all duration-100"
                style={{ width: `${(ideologyTimer / 5000) * 100}%` }}
              />
            </div>
          </div>



        </div>
      </section>

      {/* Renew Member Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6 text-brand-blue" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-slate-900 mb-2">{lang === 'ta' ? 'உறுப்பினர் அட்டையை புதுப்பிக்கவும்' : 'Renew Member Card'}</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-lg mx-auto">{lang === 'ta' ? 'உங்கள் உறுப்பினர் அட்டையின் செல்லுபடியாகும் காலம் முடிவடைந்தால், அதை எளிதாக புதுப்பித்துக் கொள்ளலாம்.' : 'If your member card has expired, you can easily renew it to continue your membership benefits.'}</p>
          <button
            onClick={() => setRenewOpen(true)}
            className="bg-brand-blue hover:bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md cursor-pointer"
          >
            {lang === 'ta' ? 'இப்பொழுதே புதுப்பிக்கவும்' : 'Renew Now'}
          </button>
        </div>
      </section>

      {/* 7. Footer */}
      <footer id="contact" className="bg-brand-blue text-white pt-16 pb-0 border-t border-brand-gold/20 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#daa5200a,transparent_60%)] pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 border-b border-brand-gold/10 pb-12 mb-8">
            {/* About Platform */}
            <div className="sm:col-span-2 lg:col-span-7 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold shadow-inner shrink-0">
                  <Scale className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="font-display font-black text-white text-base sm:text-lg leading-tight tracking-tight">{t.footerTitle}</h4>
                  <p className="text-[10px] text-brand-gold font-extrabold uppercase tracking-widest mt-0.5">{t.organizationSubtitle}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-sm">{t.footerDesc}</p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-gold hover:text-brand-blue transition-all duration-300 border border-white/10 flex items-center justify-center text-slate-300 shadow-sm"><Globe className="w-4.5 h-4.5" /></a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-gold hover:text-brand-blue transition-all duration-300 border border-white/10 flex items-center justify-center text-slate-300 shadow-sm"><Smartphone className="w-4.5 h-4.5" /></a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="sm:col-span-2 lg:col-span-5 space-y-4 text-left">
              <h5 className="font-sans font-black text-brand-gold text-[11px] tracking-wider uppercase border-l-2 border-brand-gold pl-2.5">{t.footerContactInfo}</h5>
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4.5 h-4.5 text-brand-gold mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed text-slate-300 font-medium">{t.footerOffice}<br /><span className="text-slate-400 text-[11px] font-normal">{t.footerOfficeAddress}</span></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4.5 h-4.5 text-brand-gold shrink-0" /> 
                  <a href="tel:+919952381216" className="hover:text-brand-gold font-semibold transition-colors">+91 99523 81216</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4.5 h-4.5 text-brand-gold shrink-0" /> 
                  <button onClick={() => setContactOpen(true)} className="hover:text-brand-gold underline font-semibold transition-colors text-left truncate">admin@nationalrightsforum.org</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <img src="https://i.ibb.co/bMp8mVWF/image.png" referrerPolicy="no-referrer" alt="Footer Details" className="w-full h-auto block relative z-10" />
        <div className="text-center space-y-2.5 py-8 bg-slate-950/40 relative z-10 border-t border-white/5">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.footerCopyright}</p>
          <p className="text-[9px] text-slate-500 font-medium tracking-tight">Authorized Digital Portal • Secured Database Systems</p>
        </div>
      </footer>

      {/* Modals */}
      <RegistrationModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} lang={lang} preselectedWingId={selectedWingId} />
      <WingDetailsModal 
        isOpen={wingDetailsOpen} 
        onClose={() => setWingDetailsOpen(false)} 
        wingId={selectedWingId} 
        lang={lang} 
        onJoinClick={(wingId) => {
          setSelectedWingId(wingId);
          setRegisterOpen(true);
        }}
      />
      <MediaViewerModal isOpen={mediaOpen} onClose={() => setMediaOpen(false)} initialMediaId={activeMediaId} items={mediaItemsDb} />
      <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} lang={lang} />
      <RenewCardModal isOpen={renewOpen} onClose={() => setRenewOpen(false)} lang={lang} />
      <LeaderDetailsModal isOpen={leaderDetailsOpen} onClose={() => setLeaderDetailsOpen(false)} leaderId={selectedLeaderId} lang={lang} />
    </div>
  );
}
