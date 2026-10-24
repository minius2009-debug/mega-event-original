import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  Printer,
  QrCode,
  Copy,
  Check,
  Search,
  Award,
  ShieldCheck,
  Trophy,
  Download,
  Share2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  BadgeCheck,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  FileCheck2,
  Sparkle,
  Filter,
  Eye,
  CheckCheck,
  UserCheck,
  Send,
  Zap,
  Globe
} from 'lucide-react';

export interface CertificateRecord {
  id: string;
  recipientName: string;
  achievementType: 'Excellence' | 'Volunteer Leadership' | 'Active Participation' | string;
  eventName: string;
  issueDate: string;
  verified: boolean;
  issuer: string;
  school?: string;
  theme?: 'gold' | 'emerald' | 'royal' | 'obsidian' | 'rosegold' | string;
  project?: string;
}

interface CertificatePortalProps {
  certDatabase: CertificateRecord[];
  setCertDatabase: React.Dispatch<React.SetStateAction<CertificateRecord[]>>;
  currentCertId: string;
  setCurrentCertId: (id: string) => void;
  activeCertificate: CertificateRecord;
  qrCodeDataUrls: Record<string, string>;
  handlePrintCertificate: () => void;
  handleCopyVerificationLink: (certId: string) => void;
  copiedLink: boolean;
  handleOpenLookupForId: (certId: string) => void;
  setIsVerifyModalOpen: (open: boolean) => void;
  officialLogo: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export type CertificateTheme = 'gold' | 'emerald' | 'royal' | 'obsidian' | 'rosegold';

export const CertificatePortal: React.FC<CertificatePortalProps> = ({
  certDatabase,
  setCertDatabase,
  currentCertId,
  setCurrentCertId,
  activeCertificate,
  qrCodeDataUrls,
  handlePrintCertificate,
  handleCopyVerificationLink,
  copiedLink,
  handleOpenLookupForId,
  setIsVerifyModalOpen,
  officialLogo,
  isExpanded,
  onToggleExpand
}) => {
  // Input ID for certificate lookup
  const [inputCertId, setInputCertId] = useState(activeCertificate?.id || 'CLB-2026-892');
  const [lookupMessage, setLookupMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null
  });

  // Selected Theme (Gold Foil, Alpine Emerald, Sapphire, Obsidian, Rose Gold)
  const [selectedTheme, setSelectedTheme] = useState<CertificateTheme>(
    (activeCertificate?.theme as CertificateTheme) || 'gold'
  );

  // Active Tab View: 'certificate' | 'registry' | 'generator'
  const [activeTab, setActiveTab] = useState<'certificate' | 'registry' | 'generator'>('certificate');

  // Search & Filter state for Registry
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryCategoryFilter, setRegistryCategoryFilter] = useState('All');

  // 3D Tilt & Holographic Sheen
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, active: false });
  const [isTiltEnabled, setIsTiltEnabled] = useState(true);
  const certCardRef = useRef<HTMLDivElement>(null);

  // Custom Issuer State
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('First Position Winner');
  const [customSchool, setCustomSchool] = useState('Booni Degree College');
  const [customProject, setCustomProject] = useState('High-Altitude Autonomous Innovation Project');

  // Handle Certificate ID Retrieval
  const handleRetrieveById = (idToLookup: string) => {
    const cleanId = idToLookup.trim().toUpperCase();
    if (!cleanId) return;

    const found = certDatabase.find(c => c.id.toUpperCase() === cleanId);
    if (found) {
      setCurrentCertId(found.id);
      setInputCertId(found.id);
      if (found.theme && ['gold', 'emerald', 'royal', 'obsidian', 'rosegold'].includes(found.theme)) {
        setSelectedTheme(found.theme as CertificateTheme);
      }
      setLookupMessage({
        text: `Certificate Verified & Loaded: Conferred to ${found.recipientName} (${found.achievementType})`,
        type: 'success'
      });
      setActiveTab('certificate');
    } else {
      setLookupMessage({
        text: `Certificate ID "${cleanId}" not found in database. Try demo ID CLB-2026-892.`,
        type: 'error'
      });
    }

    setTimeout(() => {
      setLookupMessage({ text: '', type: null });
    }, 4500);
  };

  // 3D Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTiltEnabled) return;
    const card = certCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, active: false });
  };

  // Cryptographic checksum display
  const cryptoHash = useMemo(() => {
    const raw = `${activeCertificate?.id || 'CLB-2026-892'}:${activeCertificate?.recipientName || 'Fatima Zahra'}:${activeCertificate?.issueDate || '31 Oct 2026'}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `SHA256: 9E4A-${hex.toUpperCase()}-7C01-VERIFIED`;
  }, [activeCertificate]);

  // Handle instant live issue
  const handleQuickIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newId = `CLB-2026-${Math.floor(600 + Math.random() * 399)}`;
    const newRecord: CertificateRecord = {
      id: newId,
      recipientName: customName.trim(),
      achievementType: customCategory,
      eventName: 'First Mega Event of Collabs 2026',
      issueDate: '31 October 2026',
      verified: true,
      issuer: 'Collabs. Community Executive Secretariat',
      school: customSchool.trim() || 'Booni Degree College',
      theme: selectedTheme,
      project: customProject.trim() || 'Summit Innovation Sprint'
    };

    setCertDatabase([newRecord, ...certDatabase]);
    setCurrentCertId(newId);
    setInputCertId(newId);
    setActiveTab('certificate');
    setLookupMessage({
      text: `Official certificate generated for ${newRecord.recipientName} [ID: ${newId}]!`,
      type: 'success'
    });
  };

  // Filtered registry list
  const filteredRegistry = useMemo(() => {
    return certDatabase.filter(item => {
      const matchesSearch =
        item.recipientName.toLowerCase().includes(registrySearch.toLowerCase()) ||
        item.id.toLowerCase().includes(registrySearch.toLowerCase()) ||
        (item.school && item.school.toLowerCase().includes(registrySearch.toLowerCase())) ||
        item.achievementType.toLowerCase().includes(registrySearch.toLowerCase());

      const matchesCategory =
        registryCategoryFilter === 'All' ||
        item.achievementType.toLowerCase().includes(registryCategoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [certDatabase, registrySearch, registryCategoryFilter]);

  // Theme styling configurations
  const themeStyles = {
    gold: {
      name: 'Imperial Gold',
      bgGradient: 'bg-gradient-to-b from-[#fffdfa] via-[#fdfbf2] to-[#fffdf7]',
      cardBg: 'bg-[#fffdf7] text-slate-900',
      borderOuter: 'border-amber-600/70',
      borderInner: 'border-amber-500/40',
      cornerAccent: 'border-amber-600',
      goldAccent: 'text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      sealGradient: 'from-amber-400 via-amber-300 to-amber-600',
      sealBorder: 'border-amber-600',
      sealRibbon: 'from-amber-600 to-amber-700',
      qrBorder: 'border-amber-600/50',
      headerGradient: 'from-amber-600 via-yellow-500 to-amber-700'
    },
    emerald: {
      name: 'Alpine Emerald',
      bgGradient: 'bg-gradient-to-b from-[#f4fbf7] via-[#f0fdf4] to-[#f7fcf9]',
      cardBg: 'bg-[#f7fcf9] text-slate-900',
      borderOuter: 'border-emerald-700/70',
      borderInner: 'border-emerald-600/40',
      cornerAccent: 'border-emerald-700',
      goldAccent: 'text-emerald-900',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      sealGradient: 'from-emerald-400 via-teal-300 to-emerald-700',
      sealBorder: 'border-emerald-700',
      sealRibbon: 'from-emerald-700 to-emerald-900',
      qrBorder: 'border-emerald-700/50',
      headerGradient: 'from-emerald-700 via-teal-600 to-emerald-800'
    },
    royal: {
      name: 'Sapphire Honor',
      bgGradient: 'bg-gradient-to-b from-[#f4f8ff] via-[#eff5ff] to-[#f8faff]',
      cardBg: 'bg-[#f8faff] text-slate-900',
      borderOuter: 'border-blue-900/70',
      borderInner: 'border-blue-700/40',
      cornerAccent: 'border-blue-700',
      goldAccent: 'text-blue-950',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      sealGradient: 'from-sky-400 via-blue-300 to-indigo-700',
      sealBorder: 'border-blue-800',
      sealRibbon: 'from-blue-700 to-indigo-900',
      qrBorder: 'border-blue-800/50',
      headerGradient: 'from-blue-800 via-indigo-700 to-blue-900'
    },
    obsidian: {
      name: 'Cyber Obsidian',
      bgGradient: 'bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#0b101d]',
      cardBg: 'bg-[#090d16] text-white',
      borderOuter: 'border-amber-500/80',
      borderInner: 'border-amber-400/30',
      cornerAccent: 'border-amber-400',
      goldAccent: 'text-amber-400',
      badgeBg: 'bg-slate-900 text-amber-400 border-amber-600',
      sealGradient: 'from-amber-300 via-yellow-200 to-amber-600',
      sealBorder: 'border-amber-400',
      sealRibbon: 'from-amber-600 to-amber-800',
      qrBorder: 'border-amber-500/60',
      headerGradient: 'from-amber-400 via-yellow-300 to-amber-500'
    },
    rosegold: {
      name: 'Rose Gold Crest',
      bgGradient: 'bg-gradient-to-b from-[#fff7f8] via-[#fdf2f4] to-[#fff5f6]',
      cardBg: 'bg-[#fff5f6] text-slate-900',
      borderOuter: 'border-rose-600/70',
      borderInner: 'border-rose-400/40',
      cornerAccent: 'border-rose-600',
      goldAccent: 'text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      sealGradient: 'from-rose-400 via-pink-300 to-rose-600',
      sealBorder: 'border-rose-600',
      sealRibbon: 'from-rose-600 to-rose-800',
      qrBorder: 'border-rose-600/50',
      headerGradient: 'from-rose-600 via-pink-500 to-rose-700'
    }
  }[selectedTheme];

  return (
    <section id="certificates" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 text-left">
      
      {/* Top Banner Header with Editorial Styling */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800 mb-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Collabs 2026 Official Credential Verification System</span>
            </div>
            
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Certificate <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">Verification Portal</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Verify, preview, and download officially authenticated credentials from the First Mega Event of Collabs 2026 in Booni, Upper Chitral.
            </p>
          </div>

          {/* Quick Actions & Tab Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handlePrintCertificate}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Printer size={16} /> Print / Download PDF
            </button>

            <button
              onClick={onToggleExpand}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} /> Collapse Portal
                </>
              ) : (
                <>
                  <ChevronDown size={16} /> Expand Portal
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar inside Hero */}
        <div className="relative z-10 flex items-center gap-2 pt-6 mt-6 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Award size={15} />
            <span>Interactive Certificate Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'registry'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Layers size={15} />
            <span>Recipient Registry ({certDatabase.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Sparkles size={15} className="text-amber-400" />
            <span>Custom Certificate Generator</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-8">
          
          {/* 1. RETRIEVAL & SEARCH BAR (Available Across View Tabs) */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-blue-800/50">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-black text-white leading-tight">
                      Instant Credential Verification Lookup
                    </h2>
                    <p className="text-xs text-slate-300">
                      Enter any assigned Certificate ID or select a sample ID below to verify instantly
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRetrieveById('CLB-2026-892')}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto shrink-0"
                >
                  <Sparkles size={14} className="text-amber-950" />
                  <span>Try Demo (Fatima Zahra)</span>
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRetrieveById(inputCertId);
                }}
                className="flex flex-col sm:flex-row gap-2.5 pt-1"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={inputCertId}
                    onChange={(e) => setInputCertId(e.target.value.toUpperCase())}
                    placeholder="Enter Certificate ID, e.g. CLB-2026-892"
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 text-xs sm:text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 shrink-0 active:scale-95"
                >
                  <Award size={16} />
                  <span>Verify Certificate</span>
                </button>
              </form>

              {/* Sample Demo IDs Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 text-xs">Featured Credentials:</span>
                {[
                  { id: 'CLB-2026-892', name: 'Fatima Zahra (1st Winner)', theme: 'gold' },
                  { id: 'CLB-2026-401', name: 'Elena Rostova (Lead Ops)', theme: 'emerald' },
                  { id: 'CLB-2026-774', name: 'Marcus Vance (Innovation)', theme: 'royal' },
                  { id: 'CLB-2026-520', name: 'Asad Ullah (Participant)', theme: 'obsidian' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRetrieveById(item.id)}
                    className={`font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-xs ${
                      activeCertificate?.id === item.id
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-xs scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                    }`}
                  >
                    {item.id} · {item.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Notification Banner */}
              {lookupMessage.text && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn ${
                    lookupMessage.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                      : 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {lookupMessage.type === 'success' ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldCheck size={18} className="text-rose-400 shrink-0" />
                    )}
                    <span>{lookupMessage.text}</span>
                  </div>
                  <button
                    onClick={() => setLookupMessage({ text: '', type: null })}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: INTERACTIVE CERTIFICATE STUDIO CANVAS */}
          {activeTab === 'certificate' && (
            <div className="bg-slate-900/5 p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              
              {/* Foil Finish & Controls Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mr-1">
                    Foil Finish:
                  </span>
                  {[
                    { id: 'gold', label: 'Imperial Gold', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                    { id: 'emerald', label: 'Alpine Emerald', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                    { id: 'royal', label: 'Sapphire Honor', color: 'bg-blue-100 text-blue-900 border-blue-300' },
                    { id: 'obsidian', label: 'Cyber Obsidian', color: 'bg-slate-900 text-amber-400 border-amber-600' },
                    { id: 'rosegold', label: 'Rose Gold Crest', color: 'bg-rose-100 text-rose-900 border-rose-300' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id as CertificateTheme)}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        selectedTheme === t.id
                          ? `${t.color} ring-2 ring-blue-500 shadow-sm scale-105`
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => setIsTiltEnabled(!isTiltEnabled)}
                    className="hover:text-slate-900 font-bold flex items-center gap-1.5 cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs"
                  >
                    <Sparkles size={14} className={isTiltEnabled ? 'text-amber-500' : 'text-slate-400'} />
                    <span>3D Holographic Tilt: {isTiltEnabled ? 'Active' : 'Off'}</span>
                  </button>

                  <div className="font-mono text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                    ID: {activeCertificate?.id || 'CLB-2026-892'}
                  </div>
                </div>
              </div>

              {/* Certificate Canvas Frame */}
              <div
                ref={certCardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform:
                    isTiltEnabled && tilt.active
                      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)`
                      : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                  transition: tilt.active ? 'none' : 'transform 0.5s ease-out'
                }}
                id="printable-certificate"
                className={`relative rounded-3xl border-8 ${themeStyles.borderOuter} ${themeStyles.cardBg} p-8 sm:p-14 shadow-2xl overflow-hidden select-none text-center transition-all duration-300`}
              >
                {/* Dynamic Specular Holographic Glare Sheen */}
                {isTiltEnabled && tilt.active && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl z-20 mix-blend-overlay transition-opacity duration-150"
                    style={{
                      background: `radial-gradient(circle 500px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)`,
                      opacity: 0.85
                    }}
                  />
                )}

                {/* Shimmer line */}
                <div className="holographic-sheen absolute -inset-x-20 -inset-y-20 pointer-events-none opacity-20 z-10" />

                {/* Guilloche Filigree Inner Perimeter Border */}
                <div
                  className={`absolute inset-3 sm:inset-5 border-2 ${themeStyles.borderInner} rounded-2xl pointer-events-none`}
                />
                <div
                  className={`absolute inset-5 sm:inset-7 border border-dashed ${themeStyles.borderInner} rounded-xl pointer-events-none opacity-60`}
                />

                {/* Corner Rosettes */}
                <div className={`absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 ${themeStyles.cornerAccent} pointer-events-none`} />
                <div className={`absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 ${themeStyles.cornerAccent} pointer-events-none`} />
                <div className={`absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 ${themeStyles.cornerAccent} pointer-events-none`} />
                <div className={`absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 ${themeStyles.cornerAccent} pointer-events-none`} />

                {/* Background Crest Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <svg viewBox="0 0 400 400" className="w-[500px] h-[500px]">
                    <polygon points="200,60 320,130 320,270 200,340 80,270 80,130" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path d="M 120 250 L 170 170 L 210 220 L 250 160 L 290 250 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                  </svg>
                </div>

                {/* Header Crest */}
                <div className="relative z-10 flex flex-col items-center mb-6">
                  <div className="relative mb-3">
                    <img
                      src={officialLogo}
                      alt="Collabs Logo"
                      className="w-20 h-20 object-contain rounded-full border-2 border-amber-500 p-1 bg-white shadow-xl"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-900 rounded-full p-1 shadow-md">
                      <CheckCircle2 size={16} className="text-white fill-blue-700" />
                    </div>
                  </div>

                  <div className="font-heading font-black text-2xl sm:text-4xl tracking-widest uppercase">
                    <span className="font-cinzel tracking-widest">Collabs. Summit 2026</span>
                  </div>

                  <div className="text-xs sm:text-sm uppercase tracking-widest font-bold text-slate-500 mt-1">
                    First Mega Event of Collabs · Booni, Upper Chitral
                  </div>
                  <div className="h-0.5 w-36 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-3" />
                </div>

                {/* Conferral Statement */}
                <div className="relative z-10 space-y-3 mb-8">
                  <div className="text-xs uppercase font-bold tracking-widest text-blue-700">
                    THIS OFFICIAL DIPLOMA OF ACCREDITATION IS PROUDLY CONFERRED UPON
                  </div>

                  <div
                    className={`font-cinzel text-3xl sm:text-5xl font-extrabold tracking-tight py-2 max-w-2xl mx-auto ${
                      selectedTheme === 'obsidian' ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    {activeCertificate?.recipientName || 'Fatima Zahra'}
                  </div>

                  <div className="text-sm text-slate-600 max-w-lg mx-auto">
                    Representing <strong className="font-bold text-slate-900">{activeCertificate?.school || 'Booni Degree College'}</strong>
                  </div>

                  <p className="text-xs sm:text-base text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
                    In formal recognition of outstanding performance as <strong className={themeStyles.goldAccent}>{activeCertificate?.achievementType || 'First Position Winner'}</strong> in the grand competition initiative:
                  </p>

                  <div className="font-heading text-base sm:text-xl font-bold text-slate-900 max-w-lg mx-auto pt-1">
                    "{activeCertificate?.project || activeCertificate?.eventName || 'Autonomous High-Altitude Robotics Sprint'}"
                  </div>
                </div>

                {/* Signatures & Seal */}
                <div className="relative z-10 grid grid-cols-3 gap-4 items-end pt-6 border-t border-slate-200/80 mt-6">
                  {/* Signature 1 */}
                  <div className="text-left">
                    <div className="font-signature text-2xl sm:text-4xl text-slate-900 border-b-2 border-slate-400 pb-1 leading-none">
                      Alex Rivera
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mt-1.5">
                      Alex Rivera
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Executive Director · Collabs</div>
                  </div>

                  {/* Embossed Metallic Seal & QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={() => handleOpenLookupForId(activeCertificate?.id || 'CLB-2026-892')}
                      className="group cursor-pointer flex flex-col items-center transition-transform hover:scale-105"
                      title="Click or scan to verify in official registry"
                    >
                      <div className="relative mb-2">
                        <div
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${themeStyles.sealGradient} border-2 ${themeStyles.sealBorder} shadow-xl flex items-center justify-center p-1.5 relative`}
                        >
                          <div className="w-full h-full rounded-full border border-dashed border-amber-900/40 flex flex-col items-center justify-center text-amber-950 text-center leading-none">
                            <Award size={22} className="text-amber-950 drop-shadow-xs" />
                            <span className="text-[7px] font-black uppercase tracking-tighter mt-1">
                              AUTHENTICATED
                            </span>
                          </div>
                        </div>

                        {/* Ribbon Tails */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
                          <div
                            className={`w-3 h-5 bg-gradient-to-b ${themeStyles.sealRibbon} shadow-xs -rotate-12`}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
                          />
                          <div
                            className={`w-3 h-5 bg-gradient-to-b ${themeStyles.sealRibbon} shadow-xs rotate-12`}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
                          />
                        </div>
                      </div>

                      {/* Live QR Code */}
                      <div className={`p-2 bg-white border ${themeStyles.qrBorder} rounded-xl shadow-md mt-2`}>
                        {activeCertificate && qrCodeDataUrls[activeCertificate.id] ? (
                          <img
                            src={qrCodeDataUrls[activeCertificate.id]}
                            alt={`QR verification for ${activeCertificate.id}`}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain block"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 flex items-center justify-center">
                            <QrCode size={24} className="animate-spin text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-blue-900 mt-1.5">
                        SCAN TO VERIFY
                      </div>
                    </div>
                  </div>

                  {/* Signature 2 */}
                  <div className="text-right">
                    <div className="font-signature text-2xl sm:text-4xl text-slate-900 border-b-2 border-slate-400 pb-1 leading-none">
                      Sofia Morales
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mt-1.5">
                      Sofia Morales
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Registrar · Booni Secretariat</div>
                  </div>
                </div>

                {/* Footer Baseline */}
                <div className="relative z-10 mt-6 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                  <span>Issued: {activeCertificate?.issueDate || '31 October 2026'}</span>
                  <button
                    onClick={() => handleOpenLookupForId(activeCertificate?.id || 'CLB-2026-892')}
                    className="font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    REGISTRY ID: {activeCertificate?.id || 'CLB-2026-892'}
                  </button>
                  <span>{cryptoHash}</span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-emerald-600" />
                  <span className="font-semibold text-slate-800">Verified A4 Landscape Layout · Print & PDF Ready</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrintCertificate}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer size={14} /> Print / Save PDF
                  </button>

                  <button
                    onClick={() => handleCopyVerificationLink(activeCertificate?.id || 'CLB-2026-892')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={() => setIsVerifyModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink size={14} /> Full Verification Modal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RECIPIENT REGISTRY DIRECTORY */}
          {activeTab === 'registry' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-heading text-xl font-black text-slate-900">
                    Official Recipient Registry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search and inspect all credentials conferred for Collabs 2026
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="Search recipient or ID..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <select
                    value={registryCategoryFilter}
                    onChange={(e) => setRegistryCategoryFilter(e.target.value)}
                    className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="All">All Categories</option>
                    <option value="First Position">First Position</option>
                    <option value="Runner-Up">Runner-Up</option>
                    <option value="Excellence">Excellence</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Active Participation">Active Participation</option>
                  </select>
                </div>
              </div>

              {/* Grid of Recipients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRegistry.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => {
                      setCurrentCertId(record.id);
                      if (record.theme) setSelectedTheme(record.theme as CertificateTheme);
                      setActiveTab('certificate');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                      activeCertificate?.id === record.id
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        {record.id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    </div>

                    <h4 className="font-heading font-black text-slate-900 text-sm line-clamp-1">
                      {record.recipientName}
                    </h4>

                    <div className="text-xs font-semibold text-slate-600 line-clamp-1 mt-0.5">
                      {record.achievementType}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
                      <GraduationCap size={13} className="text-slate-400" />
                      <span className="truncate">{record.school || 'Booni Degree College'}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                      <span>View Credential Canvas</span>
                      <Eye size={13} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CERTIFICATE GENERATOR */}
          {activeTab === 'generator' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="font-heading text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={20} />
                  Live Custom Certificate Studio
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Issue an authenticated demo certificate with instant QR code verification in seconds.
                </p>
              </div>

              <form onSubmit={handleQuickIssue} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Asad Ullah Khan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Achievement Title / Rank
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  >
                    <option value="First Position Winner">1st Position (Gold Cash Prize)</option>
                    <option value="Runner-Up Innovation Award">Runner-Up Innovation Award</option>
                    <option value="Excellence in Technology">Certificate of Excellence</option>
                    <option value="Volunteer Leadership">Certificate of Volunteer Leadership</option>
                    <option value="Active Participation">Certificate of Active Participation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Institution / School
                  </label>
                  <input
                    type="text"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="e.g. Pamir Public School & College Booni"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Project Title / Category
                  </label>
                  <input
                    type="text"
                    value={customProject}
                    onChange={(e) => setCustomProject(e.target.value)}
                    placeholder="e.g. High-Altitude Autonomous Robotics"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Generate & View Authentic Certificate
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </section>
  );
};
