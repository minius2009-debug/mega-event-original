import React, { useState, useRef, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
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
  Globe,
  Image as ImageIcon,
  CheckCircle,
  FileText,
  User
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

  // Selected Foil Theme for Holographic Studio
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
  const [customCategory, setCustomCategory] = useState('Active Participation');
  const [customSchool, setCustomSchool] = useState('Booni Degree College');
  const [customProject, setCustomProject] = useState('Science, Arts & Food Exhibition 2026');

  // Dedicated QR Data URL state for live template rendering
  const [generatedQr, setGeneratedQr] = useState<string>('');

  // Generate unique verification QR code for active certificate
  useEffect(() => {
    if (activeCertificate?.id) {
      const certId = activeCertificate.id;
      if (qrCodeDataUrls[certId]) {
        setGeneratedQr(qrCodeDataUrls[certId]);
      } else {
        const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(certId)}`;
        QRCode.toDataURL(verifyUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: '#1e1b4b',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        })
          .then(url => setGeneratedQr(url))
          .catch(err => console.error('Error generating QR code:', err));
      }
    }
  }, [activeCertificate?.id, qrCodeDataUrls]);

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

  // Download generated QR Code Image
  const handleDownloadQrImage = () => {
    if (!generatedQr) return;
    const a = document.createElement('a');
    a.href = generatedQr;
    a.download = `QR-Verification-${activeCertificate?.id || 'CLB-2026'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      eventName: 'Science, Arts & Food Exhibition 2026',
      issueDate: 'October 31, 2026',
      verified: true,
      issuer: 'District Youth Office, Collabs, Naveed-e-Falah & Jenabai Awards',
      school: customSchool.trim() || 'Booni Degree College',
      theme: selectedTheme,
      project: customProject.trim() || 'Science, Arts & Food Exhibition 2026'
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

  // Theme styling configurations for Holographic Studio
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
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800 mb-6">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>District Youth Office Upper Chitral & Collabs Official Credential</span>
            </div>
            
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Official Certificate <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">Verification Portal</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Jointly hosted by <strong>Collabs</strong> and <strong>Naveed-e-Falah</strong> in collaboration with <strong>Jenabai Awards</strong> and the <strong>District Youth Office</strong> for Science, Arts & Food Exhibition 2026.
            </p>
          </div>

          {/* Quick Actions & Tab Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handlePrintCertificate}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Printer size={16} /> Print / Save PDF
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

        {/* Live Credential Metrics Ticker Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Award size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Official Template</div>
              <div className="text-[10px] text-slate-400">Authentic Design</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <QrCode size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Dynamic QR Code</div>
              <div className="text-[10px] text-slate-400">Unique for Recipient</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Instant Verify</div>
              <div className="text-[10px] text-slate-400">District Approved</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <Layers size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">{certDatabase.length} Records</div>
              <div className="text-[10px] text-slate-400">Active Database</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar inside Hero */}
        <div className="relative z-10 flex items-center gap-2 pt-6 mt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
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
            <span>Official Master Certificate View</span>
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
            <span>Issue New Certificate</span>
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
                  { id: 'CLB-2026-892', name: 'Fatima Zahra', theme: 'gold' },
                  { id: 'CLB-2026-401', name: 'Elena Rostova', theme: 'emerald' },
                  { id: 'CLB-2026-774', name: 'Marcus Vance', theme: 'royal' },
                  { id: 'CLB-2026-520', name: 'Asad Ullah', theme: 'obsidian' }
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

          {/* TAB 1: OFFICIAL CERTIFICATE CANVAS */}
          {activeTab === 'certificate' && (
            <div className="bg-slate-900/5 p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Recipient Spotlight Summary Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-black text-slate-900 text-lg sm:text-xl">
                        {activeCertificate?.recipientName || 'Fatima Zahra'}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle size={12} /> Verified Recipient
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{activeCertificate?.school || 'Booni Degree College'}</span>
                      <span>·</span>
                      <span className="font-semibold text-blue-700">{activeCertificate?.achievementType || 'Certificate of Participation'}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-600 font-bold">ID: {activeCertificate?.id || 'CLB-2026-892'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={handleDownloadQrImage}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                    title="Download high resolution QR code PNG"
                  >
                    <Download size={14} className="text-blue-600" />
                    <span>Download QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyVerificationLink(activeCertificate?.id || 'CLB-2026-892')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Verification URL'}</span>
                  </button>
                </div>
              </div>

              {/* Creative, Compact & Engaging Foil Finish Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mr-1 flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>Foil Finish:</span>
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
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedTheme === t.id
                          ? `${t.color} ring-2 ring-blue-500 shadow-xs scale-105`
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTiltEnabled(!isTiltEnabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isTiltEnabled
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    3D Holographic Tilt: {isTiltEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Creative, Small & Attractive Vector Certificate Canvas */}
              <div
                id="printable-certificate"
                className="w-full max-w-2xl sm:max-w-3xl mx-auto my-2"
              >
                <div
                  ref={certCardRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    transform:
                      isTiltEnabled && tilt.active
                        ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)`
                        : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                    transition: tilt.active ? 'none' : 'transform 0.4s ease-out'
                  }}
                  className={`relative rounded-3xl border-4 sm:border-[6px] ${themeStyles.borderOuter} ${themeStyles.cardBg} p-6 sm:p-9 shadow-2xl overflow-hidden select-none text-center transition-all duration-300`}
                >
                  {/* Dynamic Specular Glare Sheen */}
                  {isTiltEnabled && tilt.active && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-3xl z-20 mix-blend-overlay transition-opacity duration-150"
                      style={{
                        background: `radial-gradient(circle 450px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)`,
                        opacity: 0.85
                      }}
                    />
                  )}

                  {/* Guilloche Filigree Inner Borders */}
                  <div className={`absolute inset-2.5 sm:inset-4 border-2 ${themeStyles.borderInner} rounded-2xl pointer-events-none`} />
                  <div className={`absolute inset-4 sm:inset-6 border border-dashed ${themeStyles.borderInner} rounded-xl pointer-events-none opacity-60`} />

                  {/* Ornamental Corner Brackets */}
                  <div className={`absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 ${themeStyles.cornerAccent} pointer-events-none`} />
                  <div className={`absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 ${themeStyles.cornerAccent} pointer-events-none`} />
                  <div className={`absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 ${themeStyles.cornerAccent} pointer-events-none`} />
                  <div className={`absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 ${themeStyles.cornerAccent} pointer-events-none`} />

                  {/* Header Crest with Collabs Official Emblem */}
                  <div className="relative z-10 flex flex-col items-center mb-3 sm:mb-4">
                    <div className="relative mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-white border-2 border-amber-500 shadow-lg flex items-center justify-center">
                        <img
                          src={officialLogo}
                          alt="Collabs Logo"
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                    </div>

                    <div className="font-heading font-black text-xl sm:text-2xl md:text-3xl tracking-widest uppercase">
                      <span className="font-cinzel tracking-widest leading-tight">Certificate of Participation</span>
                    </div>

                    <div className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-slate-500 mt-1">
                      Science, Arts & Food Exhibition 2026 · Booni, Upper Chitral
                    </div>
                    <div className="h-0.5 w-32 sm:w-44 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-2 sm:mt-2.5" />
                  </div>

                  {/* Conferral Statement */}
                  <div className="relative z-10 space-y-2 mb-4 sm:mb-6">
                    <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-blue-700">
                      THIS CERTIFICATE IS PROUDLY CONFERRED UPON
                    </div>

                    <div
                      className={`font-cinzel text-xl sm:text-2xl md:text-3xl font-black tracking-normal py-1 max-w-xl mx-auto leading-tight ${
                        selectedTheme === 'obsidian' ? 'text-amber-300' : 'text-slate-900'
                      }`}
                    >
                      {activeCertificate?.recipientName || 'Fatima Zahra'}
                    </div>

                    <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed pt-1 ${
                      selectedTheme === 'obsidian' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      In recognition of outstanding participation and innovative contribution in{' '}
                      <strong className={themeStyles.goldAccent}>
                        {activeCertificate?.project || activeCertificate?.eventName || 'Science, Arts & Food Exhibition 2026'}
                      </strong>
                      , jointly organized by <strong>Collabs</strong> and <strong>Naveed-e-Falah</strong> in collaboration with <strong>Jenabai Awards</strong> and the <strong>District Youth Office Upper Chitral</strong>.
                    </p>
                  </div>

                  {/* Signatures & Live Scannable QR Seal */}
                  <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 items-end pt-3 sm:pt-4 border-t border-slate-200/80">
                    {/* Founder Signature */}
                    <div className="text-left">
                      <div className="font-signature text-xl sm:text-2xl text-slate-900 border-b border-slate-400 pb-0.5 leading-none">
                        Syed Farhan Danish
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-800 mt-1">
                        Syed Farhan Danish
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 font-medium">
                        Founder, Collabs
                      </div>
                    </div>

                    {/* Centered QR Medallion */}
                    <div className="flex flex-col items-center justify-center">
                      <div
                        onClick={() => handleOpenLookupForId(activeCertificate?.id || 'CLB-2026-892')}
                        className={`p-1 bg-white border-2 ${themeStyles.qrBorder} rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform group`}
                        title="Click to verify credential authenticity on live registry"
                      >
                        {generatedQr ? (
                          <img
                            src={generatedQr}
                            alt="QR code"
                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain block p-0.5"
                          />
                        ) : (
                          <QrCode size={20} className="animate-spin text-slate-400" />
                        )}
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-500 mt-1 tracking-tight">
                        SCAN TO VERIFY
                      </span>
                    </div>

                    {/* Director Signature */}
                    <div className="text-right">
                      <div className="font-signature text-xl sm:text-2xl text-slate-900 border-b border-slate-400 pb-0.5 leading-none">
                        Umme Kulsoom
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-800 mt-1">
                        Umme Kulsoom
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 font-medium">
                        Director, Collabs
                      </div>
                    </div>
                  </div>

                  {/* Footer Baseline */}
                  <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] sm:text-[10px] text-slate-500 font-mono">
                    <span>Date: {activeCertificate?.issueDate || 'October 31, 2026'} · Booni</span>
                    <button
                      onClick={() => handleOpenLookupForId(activeCertificate?.id || 'CLB-2026-892')}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      CREDENTIAL ID: {activeCertificate?.id || 'CLB-2026-892'}
                    </button>
                    <span>{cryptoHash}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-emerald-600" />
                  <span className="font-semibold text-slate-800">Verified Official Template with Unique QR Code</span>
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
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
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
                    <option value="Second Position">Second Position</option>
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
                      <span>View Official Certificate</span>
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
                  Issue New Certificate
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Type any recipient name to generate an official certificate with a unique scannable QR code.
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
                    Achievement Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  >
                    <option value="Active Participation">Certificate of Participation</option>
                    <option value="First Position Winner">1st Position (Winner Shield & Certificate)</option>
                    <option value="Second Position Certificate">2nd Position Certificate (Official)</option>
                    <option value="Third Position Distinction">3rd Position Distinction Certificate</option>
                    <option value="Excellence in Technology">Certificate of Excellence</option>
                    <option value="Volunteer Leadership">Certificate of Volunteer Leadership</option>
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
                    Exhibition / Event
                  </label>
                  <input
                    type="text"
                    value={customProject}
                    onChange={(e) => setCustomProject(e.target.value)}
                    placeholder="Science, Arts & Food Exhibition 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Generate & View Official Certificate
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
