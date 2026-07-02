import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, User, Phone, MapPin, Search, Filter, Shield, X, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredOfficers, DISTRICTS, WINGS } from '../data';
import { TRANSLATIONS } from '../translations';
import { Officer } from '../types';
import { dbService } from '../lib/dbService';

export default function DirectoryPage() {
  // Read and persist chosen language across browser sessions
  const [lang, setLang] = useState<'ta' | 'en'>(() => {
    const saved = localStorage.getItem('app_lang_v2');
    return (saved === 'ta' || saved === 'en') ? saved : 'ta';
  });

  const [officersList, setOfficersList] = useState<Officer[]>(() => getStoredOfficers());
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  useEffect(() => {
    localStorage.setItem('app_lang_v2', lang);
  }, [lang]);

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

  const t = TRANSLATIONS[lang];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [levelFilter, setLevelFilter] = useState<'all' | 'state' | 'district' | 'constituency' | 'union' | 'branch' | 'ward'>('all');

  const filteredOfficers = useMemo(() => {
    return officersList.filter(o => {
      // 1. Filter by level
      if (levelFilter !== 'all' && o.level !== levelFilter) {
        return false;
      }
      // 2. Filter by district
      if (selectedDistrict !== 'All') {
        const cleanedSelectedDistrict = selectedDistrict.split(' (')[1]?.replace(')', '') || selectedDistrict;
        if (o.district_en !== cleanedSelectedDistrict && o.district !== cleanedSelectedDistrict) {
          return false;
        }
      }
      // 3. Filter by search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        return (
          o?.name?.toLowerCase().includes(query) ||
          o?.name_en?.toLowerCase().includes(query) ||
          o?.role?.toLowerCase().includes(query) ||
          o?.role_en?.toLowerCase().includes(query) ||
          o?.district_en?.toLowerCase().includes(query) ||
          o?.district?.toLowerCase().includes(query) ||
          o?.constituency?.toLowerCase().includes(query) ||
          o?.constituency_en?.toLowerCase().includes(query) ||
          o?.union?.toLowerCase().includes(query) ||
          o?.union_en?.toLowerCase().includes(query) ||
          o?.branch?.toLowerCase().includes(query) ||
          o?.branch_en?.toLowerCase().includes(query) ||
          o?.ward?.toLowerCase().includes(query) ||
          o?.ward_en?.toLowerCase().includes(query)
        );
      }
      return true;
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
    
  }, [officersList, levelFilter, searchTerm, selectedDistrict]);

  // Separate officers by level
  const stateOfficers = useMemo(() => {
    return filteredOfficers.filter(o => o.level === 'state');
  }, [filteredOfficers]);

  const districtOfficers = useMemo(() => {
    return filteredOfficers.filter(o => o.level === 'district');
  }, [filteredOfficers]);

  const constituencyOfficers = useMemo(() => {
    return filteredOfficers.filter(o => o.level === 'constituency');
  }, [filteredOfficers]);

  const unionOfficers = useMemo(() => {
    return filteredOfficers.filter(o => o.level === 'union');
  }, [filteredOfficers]);

  const branchOfficers = useMemo(() => {
    return filteredOfficers.filter(o => o.level === 'branch');
  }, [filteredOfficers]);

  const wardOfficers = useMemo(() => {
    return filteredOfficers.filter(o => o.level === 'ward');
  }, [filteredOfficers]);

  // Group district officers by district
  const groupedDistrictOfficers = useMemo(() => {
    const groups: Record<string, Officer[]> = {};
    districtOfficers.forEach(o => {
      const distName = lang === 'ta' ? o.district : o.district_en;
      if (!groups[distName]) groups[distName] = [];
      groups[distName].push(o);
    });
    return groups;
  }, [districtOfficers, lang]);

  // Group constituency officers by constituency
  const groupedConstituencyOfficers = useMemo(() => {
    const groups: Record<string, Officer[]> = {};
    constituencyOfficers.forEach(o => {
      const name = (lang === 'ta' ? o.constituency : o.constituency_en) || (lang === 'ta' ? 'பொதுத் தொகுதி' : 'General Constituency');
      if (!groups[name]) groups[name] = [];
      groups[name].push(o);
    });
    return groups;
  }, [constituencyOfficers, lang]);

  // Group union officers by union
  const groupedUnionOfficers = useMemo(() => {
    const groups: Record<string, Officer[]> = {};
    unionOfficers.forEach(o => {
      const name = (lang === 'ta' ? o.union : o.union_en) || (lang === 'ta' ? 'பொது ஒன்றியம்' : 'General Union');
      if (!groups[name]) groups[name] = [];
      groups[name].push(o);
    });
    return groups;
  }, [unionOfficers, lang]);

  // Group branch officers by branch
  const groupedBranchOfficers = useMemo(() => {
    const groups: Record<string, Officer[]> = {};
    branchOfficers.forEach(o => {
      const name = (lang === 'ta' ? o.branch : o.branch_en) || (lang === 'ta' ? 'பொதுக் கிளை' : 'General Branch');
      if (!groups[name]) groups[name] = [];
      groups[name].push(o);
    });
    return groups;
  }, [branchOfficers, lang]);

  // Group ward officers by ward
  const groupedWardOfficers = useMemo(() => {
    const groups: Record<string, Officer[]> = {};
    wardOfficers.forEach(o => {
      const name = (lang === 'ta' ? o.ward : o.ward_en) || (lang === 'ta' ? 'பொது வார்டு' : 'General Ward');
      if (!groups[name]) groups[name] = [];
      groups[name].push(o);
    });
    return groups;
  }, [wardOfficers, lang]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Sleek, Professional Header/Navbar - Compact & Highly Responsive */}
      <header className="bg-slate-950 text-white sticky top-0 z-25 shadow-md border-b border-brand-gold/45 backdrop-blur-md">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue-light/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 relative z-10">
          {/* Row 1: Back Navigation, Title & Lang Switcher */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link 
                to="/home" 
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-md border border-white/5 group flex items-center justify-center shrink-0"
                aria-label="Back to home"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform text-white" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-display font-black tracking-tight leading-none gold-shine-text truncate">
                  {lang === 'ta' ? 'நிர்வாகக் குழு' : 'Executive Management'}
                </h1>
                <p className="text-brand-gold/80 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest mt-1 hidden xs:block truncate">
                  {lang === 'ta' ? 'அமைப்பு மற்றும் பொறுப்பாளர்கள் விவரம்' : 'Official Registry & Directorate'}
                </p>
              </div>
            </div>

            {/* Language Selection rounded pill (compact) */}
            <div className="flex items-center bg-white/5 p-0.5 sm:p-1 rounded-xl border border-white/10 text-[10px] sm:text-xs font-bold gap-0.5 sm:gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setLang('ta')}
                className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'ta' ? 'bg-brand-gold text-brand-blue shadow-md font-black' : 'text-slate-350 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-brand-gold text-brand-blue shadow-md font-black' : 'text-slate-350 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Row 2: Search, Filter, Level Switch (Perfect Flex Alignment) */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between w-full min-w-0">
            {/* Search Input & District Selection */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 lg:w-[450px]">
              {/* Search */}
              <div className="relative group flex-grow">
                <Search className="absolute inset-y-0 left-3 flex h-full items-center text-brand-gold/60 group-focus-within:text-white transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder={lang === 'ta' ? 'பெயர், பதவி அல்லது மாவட்டத்தைத் தேடுக...' : 'Search by name, role or district...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl py-2 pl-9 pr-3 focus:outline-none focus:ring-1.5 focus:ring-brand-gold/50 focus:bg-white/15 transition-all text-xs sm:text-sm placeholder:text-slate-400 text-white min-w-0"
                />
              </div>

              {/* District Dropdown */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 sm:max-w-[200px] shrink-0">
                <Filter className="w-3.5 h-3.5 text-brand-gold/70 shrink-0" />
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-white text-[11px] sm:text-xs font-bold cursor-pointer w-full pr-6 outline-none"
                >
                  <option value="All" className="text-slate-900">
                    {lang === 'ta' ? 'அனைத்து மாவட்டங்கள் (All)' : 'All Districts'}
                  </option>
                  {DISTRICTS.map(d => {
                    const cleanedName = lang === 'ta' ? d : d.split(' (')[1]?.replace(')', '') || d;
                    return (
                      <option key={d} value={d} className="text-slate-900">{cleanedName}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Level switch filter buttons */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 justify-start flex-1 min-w-0">
              <button
                onClick={() => setLevelFilter('all')}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shrink-0 uppercase border ${
                  levelFilter === 'all'
                    ? 'bg-brand-gold text-brand-blue border-brand-gold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {lang === 'ta' ? 'அனைத்தும்' : 'All Tiers'}
              </button>
              <button
                onClick={() => setLevelFilter('state')}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shrink-0 uppercase border ${
                  levelFilter === 'state'
                    ? 'bg-brand-gold text-brand-blue border-brand-gold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {lang === 'ta' ? 'மாநில நிர்வாகிகள்' : 'State'}
              </button>
              <button
                onClick={() => setLevelFilter('district')}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shrink-0 uppercase border ${
                  levelFilter === 'district'
                    ? 'bg-brand-gold text-brand-blue border-brand-gold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {lang === 'ta' ? 'மாவட்ட நிர்வாகிகள்' : 'District'}
              </button>
              <button
                onClick={() => setLevelFilter('constituency')}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shrink-0 uppercase border ${
                  levelFilter === 'constituency'
                    ? 'bg-brand-gold text-brand-blue border-brand-gold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {lang === 'ta' ? 'தொகுதி நிர்வாகிகள்' : 'Constituency'}
              </button>
              <button
                onClick={() => setLevelFilter('union')}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shrink-0 uppercase border ${
                  levelFilter === 'union'
                    ? 'bg-brand-gold text-brand-blue border-brand-gold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {lang === 'ta' ? 'ஒன்றிய நிர்வாகிகள்' : 'Union'}
              </button>
              <button
                onClick={() => setLevelFilter('branch')}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shrink-0 uppercase border ${
                  levelFilter === 'branch'
                    ? 'bg-brand-gold text-brand-blue border-brand-gold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {lang === 'ta' ? 'கிளை நிர்வாகிகள்' : 'Branch'}
              </button>
              <button
                onClick={() => setLevelFilter('ward')}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shrink-0 uppercase border ${
                  levelFilter === 'ward'
                    ? 'bg-brand-gold text-brand-blue border-brand-gold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {lang === 'ta' ? 'வார்டு நிர்வாகிகள்' : 'Ward'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <AnimatePresence mode="popLayout">
          {/* 1. State Board Section */}
          {stateOfficers.length > 0 && (
            <div className="mb-12 sm:mb-16">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-gold shrink-0" />
                <h2 className="text-lg sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-snug">
                  {lang === 'ta' ? 'மாநிலத் தலைமைச் செயற்குழு' : 'State Executive Committee'}
                </h2>
                <div className="h-[1.5px] flex-grow bg-gradient-to-r from-brand-gold/30 to-transparent"></div>
                <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-brand-gold/20 shadow-xs shrink-0">
                  {stateOfficers.length} {lang === 'ta' ? 'நிர்வாகிகள்' : (stateOfficers.length === 1 ? 'Leader' : 'Leaders')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {stateOfficers.map((officer) => (
                  <motion.div
                    key={officer.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedOfficer(officer)}
                    className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 group relative overflow-hidden flex flex-col justify-between min-h-[190px] cursor-pointer"
                  >
                    {/* Top half alignment header */}
                    <div className="relative">
                      {/* State Badge on Top Right corner */}
                      <div className="absolute -top-5 -right-5 py-1 px-3 bg-brand-gold/15 rounded-bl-xl border-l border-b border-brand-gold/20 font-black text-[8px] sm:text-[9px] text-brand-gold tracking-widest uppercase">
                        {lang === 'ta' ? 'மாநிலம்' : 'STATE'}
                      </div>
                      
                      <div className="flex items-start gap-4 pr-10">
                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 flex items-center justify-center p-0.5 border border-slate-100 overflow-hidden shrink-0">
                          {officer.imageUrl ? (
                            <img 
                              src={officer.imageUrl} 
                              alt={lang === 'ta' ? officer.name : officer.name_en} 
                              className="w-full h-full object-cover rounded-[10px]" 
                            />
                          ) : (
                            <User className="w-7 h-7 text-slate-300 stroke-1 group-hover:scale-105 transition-transform duration-500" />
                          )}
                        </div>

                        {/* Text and Titles */}
                        <div className="min-w-0 pt-0.5">
                          <span className="text-[9px] sm:text-[10px] font-black text-brand-gold uppercase tracking-widest block mb-0.5 break-words">
                            {lang === 'ta' ? officer.role : officer.role_en}
                          </span>
                          <h3 className="text-sm sm:text-base font-display font-bold text-slate-900 leading-snug group-hover:text-brand-blue transition-colors break-words">
                            {lang === 'ta' ? officer.name : officer.name_en}
                          </h3>
                          {lang === 'ta' && officer.name_en !== officer.name && (
                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{officer.name_en}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom half metadata strip (Perfect Alignment) */}
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-brand-blue/60 shrink-0" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
                          {lang === 'ta' ? officer.district : officer.district_en}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 2. District Boards */}
          {Object.entries(groupedDistrictOfficers).length > 0 && (
            Object.entries(groupedDistrictOfficers).map(([district, officers]: [string, any[]], groupIdx) => (
              <motion.div
                key={`district-${district}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.03 }}
                className="mb-10 sm:mb-16 last:mb-0"
              >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-snug">{district}</h2>
                  <div className="h-[1.5px] flex-grow bg-gradient-to-r from-brand-gold/30 to-transparent"></div>
                  <span className="px-3 py-1 bg-brand-blue/5 text-brand-blue rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-brand-blue/10 shadow-xs shrink-0">
                    {officers.length} {lang === 'ta' ? 'நிர்வாகிகள்' : (officers.length === 1 ? 'Officer' : 'Officers')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {officers.map((officer) => (
                    <motion.div
                      key={officer.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedOfficer(officer)}
                      className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 group flex flex-col justify-between min-h-[190px] cursor-pointer"
                    >
                      {/* Top half alignment header */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 flex items-center justify-center p-0.5 border border-slate-100 overflow-hidden shrink-0">
                          {officer.imageUrl ? (
                            <img 
                              src={officer.imageUrl} 
                              alt={lang === 'ta' ? officer.name : officer.name_en} 
                              className="w-full h-full object-cover rounded-[10px]" 
                            />
                          ) : (
                            <User className="w-7 h-7 text-slate-300 stroke-1 group-hover:scale-105 transition-transform duration-500" />
                          )}
                        </div>

                        {/* Text and Titles */}
                        <div className="min-w-0 pt-0.5">
                          <span className="text-[9px] sm:text-[10px] font-black text-brand-gold uppercase tracking-widest block mb-0.5 break-words">
                            {lang === 'ta' ? officer.role : officer.role_en}
                          </span>
                          <h3 className="text-sm sm:text-base font-display font-medium text-slate-900 leading-snug group-hover:text-brand-blue transition-colors break-words">
                            {lang === 'ta' ? officer.name : officer.name_en}
                          </h3>
                          {lang === 'ta' && officer.name_en !== officer.name && (
                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{officer.name_en}</p>
                          )}
                        </div>
                      </div>

                      {/* Bottom half metadata strip (Perfect Alignment) */}
                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue/60 shrink-0" />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
                            {lang === 'ta' ? officer.district : officer.district_en}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          {/* 3. Constituency Boards */}
          {Object.entries(groupedConstituencyOfficers).length > 0 && (
            Object.entries(groupedConstituencyOfficers).map(([constituency, officers]: [string, any[]], groupIdx) => (
              <motion.div
                key={`constituency-${constituency}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.03 }}
                className="mb-10 sm:mb-16 last:mb-0"
              >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-snug">
                    {constituency} {lang === 'ta' ? 'தொகுதி' : 'Constituency'}
                  </h2>
                  <div className="h-[1.5px] flex-grow bg-gradient-to-r from-brand-gold/30 to-transparent"></div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-xs shrink-0">
                    {officers.length} {lang === 'ta' ? 'நிர்வாகிகள்' : (officers.length === 1 ? 'Officer' : 'Officers')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {officers.map((officer) => (
                    <motion.div
                      key={officer.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedOfficer(officer)}
                      className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 group flex flex-col justify-between min-h-[190px] cursor-pointer"
                    >
                      {/* Top half alignment header */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 flex items-center justify-center p-0.5 border border-slate-100 overflow-hidden shrink-0">
                          {officer.imageUrl ? (
                            <img 
                              src={officer.imageUrl} 
                              alt={lang === 'ta' ? officer.name : officer.name_en} 
                              className="w-full h-full object-cover rounded-[10px]" 
                            />
                          ) : (
                            <User className="w-7 h-7 text-slate-300 stroke-1 group-hover:scale-105 transition-transform duration-500" />
                          )}
                        </div>

                        {/* Text and Titles */}
                        <div className="min-w-0 pt-0.5">
                          <span className="text-[9px] sm:text-[10px] font-black text-brand-gold uppercase tracking-widest block mb-0.5 break-words">
                            {lang === 'ta' ? officer.role : officer.role_en}
                          </span>
                          <h3 className="text-sm sm:text-base font-display font-medium text-slate-900 leading-snug group-hover:text-brand-blue transition-colors break-words">
                            {lang === 'ta' ? officer.name : officer.name_en}
                          </h3>
                          {lang === 'ta' && officer.name_en !== officer.name && (
                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{officer.name_en}</p>
                          )}
                        </div>
                      </div>

                      {/* Bottom half metadata strip */}
                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue/60 shrink-0" />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
                            {lang === 'ta' ? officer.district : officer.district_en} - {lang === 'ta' ? officer.constituency : officer.constituency_en}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          {/* 4. Union Boards */}
          {Object.entries(groupedUnionOfficers).length > 0 && (
            Object.entries(groupedUnionOfficers).map(([union, officers]: [string, any[]], groupIdx) => (
              <motion.div
                key={`union-${union}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.03 }}
                className="mb-10 sm:mb-16 last:mb-0"
              >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-snug">
                    {union} {lang === 'ta' ? '' : 'Union'}
                  </h2>
                  <div className="h-[1.5px] flex-grow bg-gradient-to-r from-brand-gold/30 to-transparent"></div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-xs shrink-0">
                    {officers.length} {lang === 'ta' ? 'நிர்வாகிகள்' : (officers.length === 1 ? 'Officer' : 'Officers')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {officers.map((officer) => (
                    <motion.div
                      key={officer.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedOfficer(officer)}
                      className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 group flex flex-col justify-between min-h-[190px] cursor-pointer"
                    >
                      {/* Top half alignment header */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 flex items-center justify-center p-0.5 border border-slate-100 overflow-hidden shrink-0">
                          {officer.imageUrl ? (
                            <img 
                              src={officer.imageUrl} 
                              alt={lang === 'ta' ? officer.name : officer.name_en} 
                              className="w-full h-full object-cover rounded-[10px]" 
                            />
                          ) : (
                            <User className="w-7 h-7 text-slate-300 stroke-1 group-hover:scale-105 transition-transform duration-500" />
                          )}
                        </div>

                        {/* Text and Titles */}
                        <div className="min-w-0 pt-0.5">
                          <span className="text-[9px] sm:text-[10px] font-black text-brand-gold uppercase tracking-widest block mb-0.5 break-words">
                            {lang === 'ta' ? officer.role : officer.role_en}
                          </span>
                          <h3 className="text-sm sm:text-base font-display font-medium text-slate-900 leading-snug group-hover:text-brand-blue transition-colors break-words">
                            {lang === 'ta' ? officer.name : officer.name_en}
                          </h3>
                          {lang === 'ta' && officer.name_en !== officer.name && (
                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{officer.name_en}</p>
                          )}
                        </div>
                      </div>

                      {/* Bottom half metadata strip */}
                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue/60 shrink-0" />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
                            {lang === 'ta' ? officer.district : officer.district_en} - {lang === 'ta' ? officer.union : officer.union_en}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          {/* 5. Branch Boards */}
          {Object.entries(groupedBranchOfficers).length > 0 && (
            Object.entries(groupedBranchOfficers).map(([branch, officers]: [string, any[]], groupIdx) => (
              <motion.div
                key={`branch-${branch}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.03 }}
                className="mb-10 sm:mb-16 last:mb-0"
              >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-snug">
                    {branch} {lang === 'ta' ? '' : 'Branch'}
                  </h2>
                  <div className="h-[1.5px] flex-grow bg-gradient-to-r from-brand-gold/30 to-transparent"></div>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-purple-100 shadow-xs shrink-0">
                    {officers.length} {lang === 'ta' ? 'நிர்வாகிகள்' : (officers.length === 1 ? 'Officer' : 'Officers')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {officers.map((officer) => (
                    <motion.div
                      key={officer.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedOfficer(officer)}
                      className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 group flex flex-col justify-between min-h-[190px] cursor-pointer"
                    >
                      {/* Top half alignment header */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 flex items-center justify-center p-0.5 border border-slate-100 overflow-hidden shrink-0">
                          {officer.imageUrl ? (
                            <img 
                              src={officer.imageUrl} 
                              alt={lang === 'ta' ? officer.name : officer.name_en} 
                              className="w-full h-full object-cover rounded-[10px]" 
                            />
                          ) : (
                            <User className="w-7 h-7 text-slate-300 stroke-1 group-hover:scale-105 transition-transform duration-500" />
                          )}
                        </div>

                        {/* Text and Titles */}
                        <div className="min-w-0 pt-0.5">
                          <span className="text-[9px] sm:text-[10px] font-black text-brand-gold uppercase tracking-widest block mb-0.5 break-words">
                            {lang === 'ta' ? officer.role : officer.role_en}
                          </span>
                          <h3 className="text-sm sm:text-base font-display font-medium text-slate-900 leading-snug group-hover:text-brand-blue transition-colors break-words">
                            {lang === 'ta' ? officer.name : officer.name_en}
                          </h3>
                          {lang === 'ta' && officer.name_en !== officer.name && (
                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{officer.name_en}</p>
                          )}
                        </div>
                      </div>

                      {/* Bottom half metadata strip */}
                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue/60 shrink-0" />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
                            {lang === 'ta' ? officer.district : officer.district_en} - {lang === 'ta' ? officer.branch : officer.branch_en}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          {/* 6. Ward Boards */}
          {Object.entries(groupedWardOfficers).length > 0 && (
            Object.entries(groupedWardOfficers).map(([ward, officers]: [string, any[]], groupIdx) => (
              <motion.div
                key={`ward-${ward}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.03 }}
                className="mb-10 sm:mb-16 last:mb-0"
              >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-snug">
                    {ward} {lang === 'ta' ? '' : 'Ward'}
                  </h2>
                  <div className="h-[1.5px] flex-grow bg-gradient-to-r from-brand-gold/30 to-transparent"></div>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-xs shrink-0">
                    {officers.length} {lang === 'ta' ? 'நிர்வாகிகள்' : (officers.length === 1 ? 'Officer' : 'Officers')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {officers.map((officer) => (
                    <motion.div
                      key={officer.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedOfficer(officer)}
                      className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-100 group flex flex-col justify-between min-h-[190px] cursor-pointer"
                    >
                      {/* Top half alignment header */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 flex items-center justify-center p-0.5 border border-slate-100 overflow-hidden shrink-0">
                          {officer.imageUrl ? (
                            <img 
                              src={officer.imageUrl} 
                              alt={lang === 'ta' ? officer.name : officer.name_en} 
                              className="w-full h-full object-cover rounded-[10px]" 
                            />
                          ) : (
                            <User className="w-7 h-7 text-slate-300 stroke-1 group-hover:scale-105 transition-transform duration-500" />
                          )}
                        </div>

                        {/* Text and Titles */}
                        <div className="min-w-0 pt-0.5">
                          <span className="text-[9px] sm:text-[10px] font-black text-brand-gold uppercase tracking-widest block mb-0.5 break-words">
                            {lang === 'ta' ? officer.role : officer.role_en}
                          </span>
                          <h3 className="text-sm sm:text-base font-display font-medium text-slate-900 leading-snug group-hover:text-brand-blue transition-colors break-words">
                            {lang === 'ta' ? officer.name : officer.name_en}
                          </h3>
                          {lang === 'ta' && officer.name_en !== officer.name && (
                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{officer.name_en}</p>
                          )}
                        </div>
                      </div>

                      {/* Bottom half metadata strip */}
                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue/60 shrink-0" />
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
                            {lang === 'ta' ? officer.district : officer.district_en} - {lang === 'ta' ? officer.ward : officer.ward_en}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          {/* Fallback Empty Search screen */}
          {stateOfficers.length === 0 &&
           Object.entries(groupedDistrictOfficers).length === 0 &&
           Object.entries(groupedConstituencyOfficers).length === 0 &&
           Object.entries(groupedUnionOfficers).length === 0 &&
           Object.entries(groupedBranchOfficers).length === 0 &&
           Object.entries(groupedWardOfficers).length === 0 && (
            <div className="text-center py-20 sm:py-32 w-full col-span-full">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xs">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {lang === 'ta' ? 'முடிவுகள் எதுவும் இல்லை' : 'No results matched your search'}
              </h3>
              <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">
                {lang === 'ta' ? 'அகற்று வடிகட்டிகள் மூலம் மீண்டும் தேடுக' : 'Try clearing your filters or searching for something else'}
              </p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedDistrict('All'); setLevelFilter('all');}}
                className="mt-6 px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:scale-102 transition-all shadow-md shadow-brand-blue/20 text-xs sm:text-sm cursor-pointer"
              >
                {lang === 'ta' ? 'வடிகட்டிகளை நீக்கவும்' : 'Clear all filters'}
              </button>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 pt-12 sm:pt-16 mt-16 sm:mt-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-brand-gold to-brand-blue z-10"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10 px-4 sm:px-6 pb-12">
          <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mb-3">
            {lang === 'ta' ? 'அதிகாரப்பூர்வ நிர்வாகப் பதிவேடு' : 'Official Registry'}
          </p>
          <div className="text-white text-xl sm:text-2xl font-black tracking-tight mb-6">
            {lang === 'ta' ? 'தேசிய உரிமைகள் களம்' : 'National Rights Forum'}
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            <span>2026 Admin Console</span>
            <span className="hidden sm:inline">•</span>
            <span>Tamizhagam</span>
          </div>
        </div>
        <img src="https://i.ibb.co/bMp8mVWF/image.png" referrerPolicy="no-referrer" alt="Footer Details" className="w-full h-auto block relative z-10" />
      </footer>

      {/* Officer Detail Modal Popup */}
      <AnimatePresence>
        {selectedOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOfficer(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-2xl w-full relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
            >
              {/* Close Button on absolute top right for both desktop & mobile */}
              <button
                onClick={() => setSelectedOfficer(null)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-slate-100/80 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Full Portrait Image */}
              <div className="md:w-1/2 bg-slate-950 flex items-center justify-center relative h-[320px] sm:h-[380px] md:h-auto md:min-h-[420px] shrink-0 overflow-hidden">
                {selectedOfficer.imageUrl ? (
                  <img
                    src={selectedOfficer.imageUrl}
                    alt={lang === 'ta' ? selectedOfficer.name : selectedOfficer.name_en}
                    className="absolute inset-0 w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500 py-12">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                      <User className="w-10 h-10 stroke-1" />
                    </div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                      {lang === 'ta' ? 'படம் இல்லை' : 'No Photo Available'}
                    </span>
                  </div>
                )}
                {/* Decorative overlay badge */}
                <div className="absolute bottom-4 left-4 py-1 px-3 bg-brand-gold text-brand-blue font-black text-[9px] sm:text-[10px] tracking-widest uppercase rounded-lg shadow-md border border-brand-gold/20">
                  {selectedOfficer.level === 'state' 
                    ? (lang === 'ta' ? 'மாநிலப் பிரிவு' : 'State Division') 
                    : selectedOfficer.level === 'district'
                    ? (lang === 'ta' ? 'மாவட்டப் பிரிவு' : 'District Division')
                    : selectedOfficer.level === 'constituency'
                    ? (lang === 'ta' ? 'தொகுதிப் பிரிவு' : 'Constituency Division')
                    : selectedOfficer.level === 'union'
                    ? (lang === 'ta' ? 'ஒன்றியப் பிரிவு' : 'Union Division')
                    : selectedOfficer.level === 'branch'
                    ? (lang === 'ta' ? 'கிளைப் பிரிவு' : 'Branch Division')
                    : selectedOfficer.level === 'ward'
                    ? (lang === 'ta' ? 'வார்டுப் பிரிவு' : 'Ward Division')
                    : (lang === 'ta' ? 'சார்பு அணி' : 'Wing Division')}
                </div>
              </div>

              {/* Right Column: Key Details */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow">
                <div>
                  {/* Badge & Level marker */}
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-brand-gold shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-brand-gold uppercase tracking-widest">
                      {lang === 'ta' ? selectedOfficer.role : selectedOfficer.role_en}
                    </span>
                  </div>

                  {/* Name Header */}
                  <div className="space-y-1 mb-6">
                    <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight leading-tight">
                      {lang === 'ta' ? selectedOfficer.name : selectedOfficer.name_en}
                    </h2>
                    {lang === 'ta' && selectedOfficer.name_en !== selectedOfficer.name && (
                      <p className="text-slate-400 text-sm font-semibold tracking-wide">{selectedOfficer.name_en}</p>
                    )}
                    {lang === 'en' && selectedOfficer.name !== selectedOfficer.name_en && (
                      <p className="text-slate-400 font-display text-sm font-medium">{selectedOfficer.name}</p>
                    )}
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-4">
                    {/* District */}
                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                          {lang === 'ta' ? 'மாவட்டம்' : 'District'}
                        </p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {lang === 'ta' ? selectedOfficer.district : selectedOfficer.district_en}
                        </p>
                      </div>
                    </div>

                    {/* Constituency */}
                    {selectedOfficer.constituency && (
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                            {lang === 'ta' ? 'சட்டமன்றத் தொகுதி' : 'Assembly Constituency'}
                          </p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {lang === 'ta' ? selectedOfficer.constituency : selectedOfficer.constituency_en}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Union */}
                    {selectedOfficer.union && (
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                            {lang === 'ta' ? 'ஒன்றியம்' : 'Union / Block'}
                          </p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {lang === 'ta' ? selectedOfficer.union : selectedOfficer.union_en}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Branch */}
                    {selectedOfficer.branch && (
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                            {lang === 'ta' ? 'கிளை' : 'Branch'}
                          </p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {lang === 'ta' ? selectedOfficer.branch : selectedOfficer.branch_en}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ward */}
                    {selectedOfficer.ward && (
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                            {lang === 'ta' ? 'வார்டு' : 'Ward'}
                          </p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {lang === 'ta' ? selectedOfficer.ward : selectedOfficer.ward_en}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {selectedOfficer.phone && (
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                            {lang === 'ta' ? 'தொலைபேசி' : 'Phone'}
                          </p>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                            {selectedOfficer.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Role Division */}
                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                          {lang === 'ta' ? 'அதிகாரப்பூர்வ பொறுப்பு' : 'Official Designation'}
                        </p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {lang === 'ta' ? selectedOfficer.role : selectedOfficer.role_en}
                        </p>
                      </div>
                    </div>

                    {/* Optional Wing Identification */}
                    {selectedOfficer.wingId && (
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue shrink-0 font-bold text-xs flex justify-center items-center w-8 h-8">
                          ⭐
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                            {lang === 'ta' ? 'சார்பு அணி' : 'Affiliation Wing'}
                          </p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {lang === 'ta' 
                              ? (WINGS.find(w => w.id === selectedOfficer.wingId)?.name || selectedOfficer.wingId)
                              : (WINGS.find(w => w.id === selectedOfficer.wingId)?.name_en || selectedOfficer.wingId)
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
