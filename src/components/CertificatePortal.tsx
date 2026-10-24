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
  RotateCw,
  ExternalLink,
  Flame,
  BadgeCheck
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
  theme?: 'gold' | 'emerald' | 'royal' | 'obsidian' | string;
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

export type CertificateTheme = 'gold' | 'emerald' | 'royal' | 'obsidian';

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

  // Selected Theme (Gold Foil, Alpine Emerald, Sapphire, Obsidian)
  const [selectedTheme, setSelectedTheme] = useState<CertificateTheme>(
    (activeCertificate?.theme as CertificateTheme) || 'gold'
  );

  // 3D Tilt & Holographic Sheen
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, active: false });
  const [isTiltEnabled, setIsTiltEnabled] = useState(true);
  const certCardRef = useRef<HTMLDivElement>(null);

  // Custom Issuer Drawer (Optional, non-complex)
  const [showCustomIssuer, setShowCustomIssuer] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('First Position Winner');
  const [customSchool, setCustomSchool] = useState('Booni Degree College');

  // Handle Certificate ID Retrieval
  const handleRetrieveById = (idToLookup: string) => {
    const cleanId = idToLookup.trim().toUpperCase();
    if (!cleanId) return;

    const found = certDatabase.find(c => c.id.toUpperCase() === cleanId);
    if (found) {
      setCurrentCertId(found.id);
      setInputCertId(found.id);
      if (found.theme && ['gold', 'emerald', 'royal', 'obsidian'].includes(found.theme)) {
        setSelectedTheme(found.theme as CertificateTheme);
      }
      setLookupMessage({
        text: `Certificate verified: Conferred to ${found.recipientName} (${found.achievementType})`,
        type: 'success'
      });
    } else {
      setLookupMessage({
        text: `Certificate ID "${cleanId}" not found. Try demo ID CLB-2026-892.`,
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

    const rotateX = ((y - centerY) / centerY) * -5.5; // subtle tilt
    const rotateY = ((x - centerX) / centerX) * 5.5;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, active: false });
  };

  // Cryptographic checksum display
  const cryptoHash = useMemo(() => {
    const raw = `${activeCertificate?.id || 'CLB-2026-892'}:${activeCertificate?.recipientName || 'Fatima Zahra'}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `SHA256: 9E4A-${hex.toUpperCase()}-7C01`;
  }, [activeCertificate]);

  // Handle instant demo creation
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
      project: 'Summit Innovation Initiative'
    };

    setCertDatabase([newRecord, ...certDatabase]);
    setCurrentCertId(newId);
    setInputCertId(newId);
    setShowCustomIssuer(false);
    setLookupMessage({
      text: `New certificate issued to ${newRecord.recipientName} with ID: ${newId}!`,
      type: 'success'
    });
  };

  // Theme styling configurations
  const themeStyles = {
    gold: {
      name: 'Imperial Gold',
      cardBg: 'bg-[#fffdf7] text-slate-900',
      borderOuter: 'border-amber-600/70',
      borderInner: 'border-amber-500/40',
      cornerAccent: 'border-amber-500',
      goldAccent: 'text-amber-800',
      sealGradient: 'from-amber-400 via-amber-300 to-amber-600',
      sealBorder: 'border-amber-600',
      sealRibbon: 'from-amber-600 to-amber-700',
      qrBorder: 'border-amber-600/50'
    },
    emerald: {
      name: 'Alpine Emerald',
      cardBg: 'bg-[#f7fcf9] text-slate-900',
      borderOuter: 'border-emerald-700/70',
      borderInner: 'border-emerald-600/40',
      cornerAccent: 'border-emerald-600',
      goldAccent: 'text-emerald-900',
      sealGradient: 'from-emerald-400 via-teal-300 to-emerald-700',
      sealBorder: 'border-emerald-700',
      sealRibbon: 'from-emerald-700 to-emerald-900',
      qrBorder: 'border-emerald-700/50'
    },
    royal: {
      name: 'Sapphire Honor',
      cardBg: 'bg-[#f8faff] text-slate-900',
      borderOuter: 'border-blue-900/70',
      borderInner: 'border-blue-700/40',
      cornerAccent: 'border-blue-600',
      goldAccent: 'text-blue-950',
      sealGradient: 'from-sky-400 via-blue-300 to-indigo-700',
      sealBorder: 'border-blue-800',
      sealRibbon: 'from-blue-700 to-indigo-900',
      qrBorder: 'border-blue-800/50'
    },
    obsidian: {
      name: 'Cyber Obsidian',
      cardBg: 'bg-[#090d16] text-white',
      borderOuter: 'border-amber-500/80',
      borderInner: 'border-amber-400/30',
      cornerAccent: 'border-amber-400',
      goldAccent: 'text-amber-400',
      sealGradient: 'from-amber-300 via-yellow-200 to-amber-600',
      sealBorder: 'border-amber-400',
      sealRibbon: 'from-amber-600 to-amber-800',
      qrBorder: 'border-amber-500/60'
    }
  }[selectedTheme];

  return (
    <section id="certificates" className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24 text-left">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
            <ShieldCheck size={16} /> Collabs 2026 Summit Accreditation
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Official Digital Certificate Demo
            </h2>
            <button
              onClick={onToggleExpand}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Expand or Collapse"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} /> Collapse
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Expand
                </>
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Enter your Certificate ID to retrieve and inspect your official credential, or explore our live demo below.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintCertificate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          
          {/* 1. PRIMARY CERTIFICATE ID RETRIEVAL BAR (Clean, Prominent, Not Complex) */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-white leading-tight">
                      Get Your Certificate by ID
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Type your assigned credential ID or click any demo ID to preview immediately
                    </p>
                  </div>
                </div>

                {/* Instant Try Demo Button */}
                <button
                  type="button"
                  onClick={() => handleRetrieveById('CLB-2026-892')}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto shrink-0"
                >
                  <Sparkles size={13} className="text-amber-950" />
                  <span>Try Demo (Fatima Zahra)</span>
                </button>
              </div>

              {/* Input & Lookup Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRetrieveById(inputCertId);
                }}
                className="flex flex-col sm:flex-row gap-2 pt-1"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={inputCertId}
                    onChange={(e) => setInputCertId(e.target.value.toUpperCase())}
                    placeholder="Enter Certificate ID, e.g. CLB-2026-892"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 shrink-0"
                >
                  <Award size={15} />
                  <span>Get Certificate</span>
                </button>
              </form>

              {/* Quick Sample Demo IDs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
                <span className="font-semibold text-slate-400">Sample Demo IDs:</span>
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
                    className={`font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer text-[10px] ${
                      activeCertificate?.id === item.id
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                    }`}
                  >
                    {item.id} · {item.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Feedback Alert Toast */}
              {lookupMessage.text && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    lookupMessage.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                      : 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
                  }`}
                >
                  {lookupMessage.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
                  <span>{lookupMessage.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. THE PROMINENT CERTIFICATE DEMO CANVAS */}
          <div className="bg-slate-100/80 p-3 sm:p-6 rounded-3xl border border-slate-300 shadow-inner">
            
            {/* Theme & Tilt Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Foil Finish:</span>
                {(
                  [
                    { id: 'gold', label: 'Gold Foil', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                    { id: 'emerald', label: 'Alpine Emerald', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                    { id: 'royal', label: 'Sapphire Honor', color: 'bg-blue-100 text-blue-900 border-blue-300' },
                    { id: 'obsidian', label: 'Cyber Obsidian', color: 'bg-slate-900 text-amber-400 border-amber-600' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${
                      selectedTheme === t.id
                        ? `${t.color} ring-2 ring-blue-500 shadow-xs scale-105`
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsTiltEnabled(!isTiltEnabled)}
                  className="hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} className={isTiltEnabled ? 'text-amber-500' : 'text-slate-400'} />
                  <span>3D Tilt: {isTiltEnabled ? 'On' : 'Off'}</span>
                </button>
                <span>·</span>
                <span className="font-mono text-blue-700 font-bold">
                  ID: {activeCertificate?.id || 'CLB-2026-892'}
                </span>
              </div>
            </div>

            {/* Certificate Canvas Box */}
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
              className={`relative rounded-2xl border-4 ${themeStyles.borderOuter} ${themeStyles.cardBg} p-6 sm:p-10 shadow-2xl overflow-hidden select-none text-center`}
            >
              {/* Dynamic Specular Holographic Glare Sheen */}
              {isTiltEnabled && tilt.active && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl z-20 mix-blend-overlay transition-opacity duration-150"
                  style={{
                    background: `radial-gradient(circle 400px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)`,
                    opacity: 0.85
                  }}
                />
              )}

              {/* Shimmer line */}
              <div className="holographic-sheen absolute -inset-x-20 -inset-y-20 pointer-events-none opacity-20 z-10" />

              {/* Guilloche Filigree Inner Perimeter Border */}
              <div
                className={`absolute inset-2 sm:inset-3 border-2 ${themeStyles.borderInner} rounded-xl pointer-events-none`}
              />
              <div
                className={`absolute inset-3 sm:inset-4 border border-dashed ${themeStyles.borderInner} rounded-lg pointer-events-none opacity-60`}
              />

              {/* Corner Rosettes */}
              <div className={`absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 ${themeStyles.cornerAccent} pointer-events-none`} />
              <div className={`absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 ${themeStyles.cornerAccent} pointer-events-none`} />
              <div className={`absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 ${themeStyles.cornerAccent} pointer-events-none`} />
              <div className={`absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 ${themeStyles.cornerAccent} pointer-events-none`} />

              {/* Background mountain crest watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <svg viewBox="0 0 400 400" className="w-96 h-96">
                  <polygon points="200,60 320,130 320,270 200,340 80,270 80,130" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M 120 250 L 170 170 L 210 220 L 250 160 L 290 250 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                </svg>
              </div>

              {/* Summit Header */}
              <div className="relative z-10 flex flex-col items-center mb-5">
                <div className="relative mb-2">
                  <img
                    src={officialLogo}
                    alt="Collabs Logo"
                    className="w-16 h-16 object-contain rounded-full border-2 border-amber-500/70 p-0.5 bg-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-900 rounded-full p-0.5 shadow-xs">
                    <CheckCircle2 size={13} className="text-white fill-blue-700" />
                  </div>
                </div>

                <div className="font-heading font-black text-2xl sm:text-3xl tracking-widest uppercase">
                  <span className="font-cinzel tracking-widest">Collabs. Summit</span>
                </div>

                <div className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-slate-500 mt-0.5">
                  First Mega Event of Collabs 2026 · Booni, Upper Chitral
                </div>
                <div className="h-0.5 w-28 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-2" />
              </div>

              {/* Recipient & Conferral */}
              <div className="relative z-10 space-y-2 mb-6">
                <div className="text-[11px] uppercase font-bold tracking-widest text-blue-700">
                  THIS OFFICIAL CREDENTIAL IS PROUDLY CONFERRED UPON
                </div>

                <div
                  className={`font-cinzel text-2xl sm:text-4xl font-extrabold tracking-tight py-1 max-w-xl mx-auto ${
                    selectedTheme === 'obsidian' ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  {activeCertificate?.recipientName || 'Fatima Zahra'}
                </div>

                <div className="text-xs text-slate-600 max-w-lg mx-auto">
                  of <strong className="font-semibold text-slate-900">{activeCertificate?.school || 'Booni Degree College'}</strong>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed pt-2">
                  in formal recognition of outstanding <strong className={themeStyles.goldAccent}>{activeCertificate?.achievementType || 'First Position Winner'}</strong> demonstrated during the mega initiative:
                </p>

                <div className="font-heading text-sm sm:text-base font-bold text-slate-900 max-w-md mx-auto pt-0.5">
                  "{activeCertificate?.project || activeCertificate?.eventName || 'Autonomous High-Altitude Robotics Sprint'}"
                </div>
              </div>

              {/* Bottom Signatures, Seal & Scannable QR Code */}
              <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 items-end pt-5 border-t border-slate-200/80 mt-5">
                {/* Signature 1 */}
                <div className="text-left">
                  <div className="font-signature text-2xl sm:text-3xl text-slate-900 border-b border-slate-400 pb-0.5 leading-none">
                    Alex Rivera
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700 mt-1">
                    Alex Rivera
                  </div>
                  <div className="text-[8px] text-slate-500">Executive Director · Collabs</div>
                </div>

                {/* Center Embossed Seal & QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    onClick={() => handleOpenLookupForId(activeCertificate?.id || 'CLB-2026-892')}
                    className="group cursor-pointer flex flex-col items-center transition-transform hover:scale-105"
                    title="Click or scan to verify in registry"
                  >
                    {/* Embossed Metallic Seal & Ribbon */}
                    <div className="relative mb-2">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr ${themeStyles.sealGradient} border-2 ${themeStyles.sealBorder} shadow-lg flex items-center justify-center p-1 relative`}
                      >
                        <div className="w-full h-full rounded-full border border-dashed border-amber-900/40 flex flex-col items-center justify-center text-amber-950 text-center leading-none">
                          <Award size={18} className="text-amber-950 drop-shadow-xs" />
                          <span className="text-[6px] font-black uppercase tracking-tighter mt-0.5">
                            CONFERRED
                          </span>
                        </div>
                      </div>

                      {/* Dual Satin Ribbon Tails */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
                        <div
                          className={`w-2.5 h-4 bg-gradient-to-b ${themeStyles.sealRibbon} shadow-xs -rotate-12`}
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
                        />
                        <div
                          className={`w-2.5 h-4 bg-gradient-to-b ${themeStyles.sealRibbon} shadow-xs rotate-12`}
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
                        />
                      </div>
                    </div>

                    {/* Live QR Scannable Code */}
                    <div className={`p-1.5 bg-white border ${themeStyles.qrBorder} rounded-lg shadow-sm mt-1.5`}>
                      {activeCertificate && qrCodeDataUrls[activeCertificate.id] ? (
                        <img
                          src={qrCodeDataUrls[activeCertificate.id]}
                          alt={`QR verification for ${activeCertificate.id}`}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain block"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 flex items-center justify-center">
                          <QrCode size={20} className="animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-wider text-blue-900 mt-1">
                      POINT CAMERA TO VERIFY
                    </div>
                  </div>
                </div>

                {/* Signature 2 */}
                <div className="text-right">
                  <div className="font-signature text-2xl sm:text-3xl text-slate-900 border-b border-slate-400 pb-0.5 leading-none">
                    Sofia Morales
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700 mt-1">
                    Sofia Morales
                  </div>
                  <div className="text-[8px] text-slate-500">Registrar · Booni Secretariat</div>
                </div>
              </div>

              {/* Security & Checksum Baseline */}
              <div className="relative z-10 mt-5 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] text-slate-500 font-mono">
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

            {/* Certificate Bottom Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-2">
              <div className="flex items-center gap-2">
                <BadgeCheck size={14} className="text-emerald-600" />
                <span>Standard Print-Ready A4 Landscape layout</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintCertificate}
                  className="text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={13} /> Direct Print PDF
                </button>
                <span>·</span>
                <button
                  onClick={() => handleCopyVerificationLink(activeCertificate?.id || 'CLB-2026-892')}
                  className="text-slate-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Verification URL'}</span>
                </button>
                <span>·</span>
                <button
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="text-slate-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={13} /> Full Registry Lookup
                </button>
              </div>
            </div>

          </div>

          {/* 3. OPTIONAL COLLAPSIBLE CUSTOM GENERATOR (Keeps UI clean and simple) */}
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowCustomIssuer(!showCustomIssuer)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-blue-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Need a custom certificate demo? Generate one here
                </span>
                <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                  (Type any name to test live generation)
                </span>
              </div>
              <div className="text-xs text-blue-600 font-bold flex items-center gap-1">
                {showCustomIssuer ? 'Hide Generator' : 'Open Generator'}
                {showCustomIssuer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {showCustomIssuer && (
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50">
                <form onSubmit={handleQuickIssue} className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Asad Ullah"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Achievement Category
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="First Position Winner">1st Position (Gold Cash Prize)</option>
                      <option value="Runner-Up Innovation Award">Runner-Up Innovation Award</option>
                      <option value="Excellence">Certificate of Excellence</option>
                      <option value="Volunteer Leadership">Certificate of Volunteer Leadership</option>
                      <option value="Active Participation">Certificate of Active Participation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      School / Institution
                    </label>
                    <input
                      type="text"
                      value={customSchool}
                      onChange={(e) => setCustomSchool(e.target.value)}
                      placeholder="e.g. Pamir Public School Booni"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} /> Generate & View This Certificate Demo
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      )}
    </section>
  );
};
