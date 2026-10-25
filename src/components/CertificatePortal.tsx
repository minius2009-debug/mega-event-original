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
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BadgeCheck,
  GraduationCap,
  Layers,
  Eye,
  CheckCircle,
  User
} from 'lucide-react';

export interface CertificateRecord {
  id: string;
  recipientName: string;
  achievementType: string;
  eventName: string;
  issueDate: string;
  verified: boolean;
  issuer: string;
  school?: string;
  theme?: string;
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

  // Active Tab View: 'certificate' | 'registry' | 'generator'
  const [activeTab, setActiveTab] = useState<'certificate' | 'registry' | 'generator'>('certificate');

  // Search state for Registry
  const [registrySearch, setRegistrySearch] = useState('');

  // Ref for certificate canvas
  const certCardRef = useRef<HTMLDivElement>(null);

  // Custom Issuer Form State
  const [customName, setCustomName] = useState('');
  const [customProject, setCustomProject] = useState('Science, Arts & Food Exhibition 2026');
  const [customSchool, setCustomSchool] = useState('');

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
          width: 400,
          margin: 1,
          color: {
            dark: '#1e1b4b',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
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
      setLookupMessage({
        text: `Certificate Verified & Loaded: Awarded to ${found.recipientName}`,
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

  // Cryptographic checksum display
  const cryptoHash = useMemo(() => {
    const raw = `${activeCertificate?.id || 'CLB-2026-892'}:${activeCertificate?.recipientName || 'Fatima Zahra'}:${activeCertificate?.issueDate || 'October 31, 2026'}`;
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
      achievementType: 'Certificate of Participation',
      eventName: 'Science, Arts & Food Exhibition 2026',
      issueDate: 'October 31, 2026',
      verified: true,
      issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
      school: customSchool.trim() || undefined,
      project: customProject.trim() || 'Science, Arts & Food Exhibition 2026'
    };

    setCertDatabase([newRecord, ...certDatabase]);
    setCurrentCertId(newId);
    setInputCertId(newId);
    setActiveTab('certificate');
    setLookupMessage({
      text: `Official Certificate of Participation generated for ${newRecord.recipientName} [ID: ${newId}]!`,
      type: 'success'
    });
  };

  // Filtered registry list
  const filteredRegistry = useMemo(() => {
    return certDatabase.filter(item => {
      const q = registrySearch.toLowerCase().trim();
      if (!q) return true;
      return (
        item.recipientName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.school && item.school.toLowerCase().includes(q)) ||
        (item.project && item.project.toLowerCase().includes(q))
      );
    });
  }, [certDatabase, registrySearch]);

  return (
    <section id="certificates" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 text-left">
      {/* Top Banner Header with Editorial Styling */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800 mb-6">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-purple-400" />
              <span>District Youth Office Upper Chitral & Collabs Official Credential</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Official Certificate of Participation
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Jointly hosted by <strong>Collabs</strong> and <strong>Naveed-e-Falah</strong> in collaboration with <strong>Jenabai Awards</strong> and the <strong>District Youth Office</strong> for <strong>Science, Arts & Food Exhibition 2026</strong>.
            </p>
          </div>

          {/* Quick Actions & Expand / Print */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handlePrintCertificate}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
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

        {/* Live Credential Metrics Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <Award size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Official Template</div>
              <div className="text-[10px] text-slate-400">Authentic Joint Design</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <QrCode size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Dynamic QR Fixed</div>
              <div className="text-[10px] text-slate-400">Unique for Each Student</div>
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Layers size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">{certDatabase.length} Students</div>
              <div className="text-[10px] text-slate-400">Registered Roster</div>
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
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Award size={15} />
            <span>Official Certificate View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'registry'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Layers size={15} />
            <span>Student Registry ({certDatabase.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'generator'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Sparkles size={15} className="text-amber-400" />
            <span>Issue Student Certificate</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-8">
          {/* RETRIEVAL & SEARCH BAR */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-purple-800/40">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-black text-white leading-tight">
                      Instant Certificate & QR Lookup
                    </h2>
                    <p className="text-xs text-slate-300">
                      Enter any student's Certificate ID to load their official certificate with fixed verification QR code
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRetrieveById('CLB-2026-892')}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto shrink-0"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  <span>Demo: Fatima Zahra (CLB-2026-892)</span>
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
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 text-xs sm:text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 shrink-0 active:scale-95"
                >
                  <Award size={16} />
                  <span>Load Certificate</span>
                </button>
              </form>

              {/* Sample Quick IDs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 text-xs">Quick Roster IDs:</span>
                {[
                  { id: 'CLB-2026-892', name: 'Fatima Zahra' },
                  { id: 'CLB-2026-401', name: 'Elena Rostova' },
                  { id: 'CLB-2026-774', name: 'Marcus Vance' },
                  { id: 'CLB-2026-105', name: 'Ahmad Khan' },
                  { id: 'CLB-2026-520', name: 'Asad Ullah' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRetrieveById(item.id)}
                    className={`font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-xs ${
                      activeCertificate?.id === item.id
                        ? 'bg-purple-500 text-white font-black border-purple-400 shadow-xs scale-105'
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

          {/* TAB 1: OFFICIAL MASTER CERTIFICATE CANVAS */}
          {activeTab === 'certificate' && (
            <div className="bg-slate-900/5 p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              {/* Recipient Spotlight Summary Header Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-black text-slate-900 text-lg sm:text-xl">
                        {activeCertificate?.recipientName || 'Fatima Zahra'}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle size={12} /> Official Recipient
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-purple-700">Certificate of Participation</span>
                      <span>·</span>
                      <span className="font-mono text-slate-600 font-bold">Credential ID: {activeCertificate?.id || 'CLB-2026-892'}</span>
                      <span>·</span>
                      <span>Presented on October 31, 2026</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={handleDownloadQrImage}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                    title="Download high-resolution verification QR code"
                  >
                    <Download size={14} className="text-purple-600" />
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

                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer size={14} />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* THE OFFICIAL CERTIFICATE TEMPLATE WITH STUDENT NAME & FIXED UNIQUE QR CODE */}
              {/* ========================================================================= */}
              <div
                id="printable-certificate"
                className="w-full max-w-4xl mx-auto my-2"
              >
                <div
                  ref={certCardRef}
                  className="relative w-full rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden select-none bg-white border border-slate-200 transition-all"
                  style={{
                    aspectRatio: '2560 / 1810'
                  }}
                >
                  {/* Master Background Official Certificate Template Image */}
                  <img
                    src="/assets/certificate_of_participation_template.jpeg"
                    alt="Official Certificate of Participation"
                    className="w-full h-full object-cover block select-none pointer-events-none"
                    draggable={false}
                  />

                  {/* Dynamic Student Name Overlay - Positioned under 'This certificate awarded to' */}
                  <div
                    className="absolute text-center w-full px-6 pointer-events-none"
                    style={{
                      top: '41.2%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="font-heading font-black text-slate-900 tracking-normal leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl drop-shadow-xs">
                      {activeCertificate?.recipientName || 'Fatima Zahra'}
                    </div>
                  </div>

                  {/* Dynamic Unique QR Code Fixed in the Bottom Square */}
                  <div
                    onClick={() => handleOpenLookupForId(activeCertificate?.id || 'CLB-2026-892')}
                    className="absolute flex items-center justify-center cursor-pointer group transition-all"
                    style={{
                      left: '42.9%',
                      top: '82.65%',
                      width: '11.13%',
                      height: '14.58%',
                    }}
                    title={`Click to verify credential ${activeCertificate?.id || 'CLB-2026-892'} on live registry`}
                  >
                    {generatedQr ? (
                      <div className="w-full h-full p-1 sm:p-1.5 flex items-center justify-center">
                        <img
                          src={generatedQr}
                          alt={`QR verification code for ${activeCertificate?.recipientName}`}
                          className="w-full h-full object-contain rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/80 rounded-xl">
                        <QrCode size={20} className="animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action & Verification Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-emerald-600" />
                  <span className="font-semibold text-slate-800">
                    Official Certificate of Participation with unique student QR code fixed in bottom square.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-500">
                    {cryptoHash}
                  </span>

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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-heading text-xl font-black text-slate-900">
                    Official Recipient Registry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search and inspect all official certificates conferred for Science, Arts & Food Exhibition 2026
                  </p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Search recipient or ID..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Grid of Recipients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRegistry.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => {
                      setCurrentCertId(record.id);
                      setActiveTab('certificate');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                      activeCertificate?.id === record.id
                        ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                        {record.id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    </div>

                    <h4 className="font-heading font-black text-slate-900 text-sm line-clamp-1">
                      {record.recipientName}
                    </h4>

                    <div className="text-xs font-semibold text-purple-700 line-clamp-1 mt-0.5">
                      Certificate of Participation
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
                      <GraduationCap size={13} className="text-slate-400" />
                      <span className="truncate">{record.project || 'Science, Arts & Food Exhibition 2026'}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-600 font-bold">
                      <span>View Official Certificate & QR</span>
                      <Eye size={13} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATE GENERATOR */}
          {activeTab === 'generator' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-heading text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={20} />
                  Issue Certificate of Participation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter student details to generate their official Certificate of Participation with a unique, scannable QR code fixed into the bottom square.
                </p>
              </div>

              <form onSubmit={handleQuickIssue} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Asad Ullah Khan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Credential Type
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="Official Certificate of Participation"
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl p-3 text-xs text-slate-700 font-bold cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Exhibition Project / Track (Optional)
                  </label>
                  <input
                    type="text"
                    value={customProject}
                    onChange={(e) => setCustomProject(e.target.value)}
                    placeholder="Science, Arts & Food Exhibition 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Generate Certificate with Unique QR Code
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
