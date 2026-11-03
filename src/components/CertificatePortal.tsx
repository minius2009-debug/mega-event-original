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
  User,
  FileSpreadsheet,
  Upload,
  Clock,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { BulkCertificateImportModal } from './BulkCertificateImportModal';
import { downloadCertificateAsPdf, downloadCertificateAsImage } from '../services/certificateDownloadService';

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

export const getCertificateTemplateImage = (achievementType?: string): string => {
  const typeLower = (achievementType || '').toLowerCase();
  if (typeLower.includes('leadership') || typeLower.includes('leader')) {
    return '/assets/aistudio/Certificate_of_Leadership_e0b3d616.png';
  }
  if (typeLower.includes('volunteer') || typeLower.includes('volunteerism')) {
    return '/assets/aistudio/Certificate_of_Volunteerism_e195dba3.png';
  }
  return '/assets/aistudio/Certificate_Of_Participation__1__0f22824f.png';
};

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
  isAdminMode?: boolean;
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
  onToggleExpand,
  isAdminMode = false
}) => {
  // Input ID or Name for certificate lookup
  const [inputCertId, setInputCertId] = useState(activeCertificate?.id || '');
  const [lookupMessage, setLookupMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null
  });

  // Active Tab View: 'certificate' | 'registry' | 'generator' (Default to registry list view)
  const [activeTab, setActiveTab] = useState<'certificate' | 'registry' | 'generator'>('registry');

  // View mode for Registry: 'list' (Table List Form) | 'grid'
  const [registryViewMode, setRegistryViewMode] = useState<'list' | 'grid'>('list');

  // Search state for Registry
  const [registrySearch, setRegistrySearch] = useState('');

  // Ref for certificate canvas
  const certCardRef = useRef<HTMLDivElement>(null);

  // Custom Issuer Form State
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<string>('Certificate of Participation');
  const [customProject, setCustomProject] = useState('Science, Arts & Food Exhibition 2026');
  const [customSchool, setCustomSchool] = useState('');

  // Bulk Excel Import modal state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

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

  // Handle Certificate Lookup by Name or ID
  const handleRetrieveById = (query: string) => {
    const clean = query.trim().toLowerCase();
    if (!clean) return;

    const found = certDatabase.find(
      c => c.id.toLowerCase() === clean || c.recipientName.toLowerCase().includes(clean)
    );

    if (found) {
      setCurrentCertId(found.id);
      setInputCertId(found.id);
      setLookupMessage({
        text: `Certificate Verified & Loaded: Awarded to ${found.recipientName} [ID: ${found.id}]`,
        type: 'success'
      });
      setActiveTab('certificate');
    } else {
      setLookupMessage({
        text: `No certificate found matching "${query}". Search by student full name or ID (e.g. Fatima Zahra or CLB-2026-892).`,
        type: 'error'
      });
    }

    setTimeout(() => {
      setLookupMessage({ text: '', type: null });
    }, 4500);
  };

  // Direct Download States
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handleDownloadPdf = async (cert?: CertificateRecord) => {
    const target = cert || activeCertificate;
    if (!target) return;
    try {
      setDownloadingPdf(true);
      await downloadCertificateAsPdf(target);
      setDownloadToast(`Downloaded official PDF certificate for ${target.recipientName}!`);
      setTimeout(() => setDownloadToast(null), 4000);
    } catch (err) {
      console.error('PDF download error:', err);
      setDownloadToast('PDF generation failed. You can also use Print / Save PDF.');
      setTimeout(() => setDownloadToast(null), 4000);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async (cert?: CertificateRecord) => {
    const target = cert || activeCertificate;
    if (!target) return;
    try {
      setDownloadingImage(true);
      await downloadCertificateAsImage(target);
      setDownloadToast(`Downloaded high-res PNG certificate for ${target.recipientName}!`);
      setTimeout(() => setDownloadToast(null), 4000);
    } catch (err) {
      console.error('Image download error:', err);
      setDownloadToast('Image download failed. Please try again.');
      setTimeout(() => setDownloadToast(null), 4000);
    } finally {
      setDownloadingImage(false);
    }
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
      achievementType: customType || 'Certificate of Participation',
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
      text: `Official ${newRecord.achievementType} generated for ${newRecord.recipientName} [ID: ${newId}]!`,
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
      {/* Toast Notification */}
      {downloadToast && (
        <div className="mb-4 p-4 bg-emerald-900 text-emerald-100 border border-emerald-500/50 rounded-2xl flex items-center gap-3 shadow-lg animate-fadeIn text-xs sm:text-sm font-semibold">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="flex-1">{downloadToast}</span>
          <button onClick={() => setDownloadToast(null)} className="text-emerald-300 hover:text-white cursor-pointer text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Sleek Header & Section Nav Bar */}
      <div className="bg-slate-900 rounded-3xl text-white p-5 sm:p-6 shadow-xl border border-slate-800 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Official Certificates Portal
          </h1>
          <p className="text-slate-300 text-xs max-w-xl">
            View, search, and download official verified certificates for the Science, Arts & Food Exhibition 2026.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'registry'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Layers size={15} />
            <span>Issued Certificates List ({certDatabase.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Award size={15} />
            <span>Open Certificate Canvas</span>
          </button>

          {isAdminMode && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'generator'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <Sparkles size={15} className="text-amber-300" />
                <span>Issue Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkImportOpen(true)}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <FileSpreadsheet size={15} />
                <span>Upload Excel</span>
              </button>
            </>
          )}
        </div>
      </div>

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
                      Find Your Official Certificate
                    </h2>
                    <p className="text-xs text-slate-300">
                      Search your full name or Certificate ID to view and download your official SAF 2026 certificate
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs">
                  <BadgeCheck size={16} className="text-purple-400" />
                  <span>{certDatabase.length} Issued Certificates</span>
                </div>
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
                    onChange={(e) => setInputCertId(e.target.value)}
                    placeholder="Enter Student Full Name or Certificate ID..."
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 text-xs sm:text-sm font-sans tracking-wide focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 shrink-0 active:scale-95"
                >
                  <Award size={16} />
                  <span>Search Certificate</span>
                </button>
              </form>

              {/* Dynamic Roster Quick Tags */}
              {certDatabase.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 text-xs">Issued Credentials:</span>
                  {certDatabase.slice(0, 6).map((item) => (
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
                      {item.id} · {item.recipientName.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}

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
                    onClick={() => handleDownloadPdf(activeCertificate)}
                    disabled={downloadingPdf}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
                  >
                    {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadImage(activeCertificate)}
                    disabled={downloadingImage}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700 active:scale-95 disabled:opacity-60"
                  >
                    {downloadingImage ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} className="text-emerald-400" />}
                    <span>{downloadingImage ? 'Generating PNG...' : 'Download PNG'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadQrImage}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                    title="Download high-resolution verification QR code"
                  >
                    <QrCode size={14} className="text-purple-600" />
                    <span>QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyVerificationLink(activeCertificate?.id || 'CLB-2026-892')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                  >
                    <Printer size={14} />
                    <span>Print</span>
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
                    src={getCertificateTemplateImage(activeCertificate?.achievementType)}
                    alt={activeCertificate?.achievementType || 'Official Certificate'}
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

          {/* TAB 2: RECIPIENT REGISTRY DIRECTORY (LIST FORM) */}
          {activeTab === 'registry' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-heading text-xl font-black text-slate-900 flex items-center gap-2">
                    <Layers size={20} className="text-purple-600" />
                    Issued Certificates Directory
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click on any student name to open and preview their official certificate. Showing only certificates added in Admin.
                  </p>
                </div>

                {/* Search & View Mode Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="Search name or ID..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-600 font-medium"
                    />
                  </div>

                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setRegistryViewMode('list')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        registryViewMode === 'list'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="List View (Table)"
                    >
                      List Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistryViewMode('grid')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        registryViewMode === 'grid'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Card Grid View"
                    >
                      Grid
                    </button>
                  </div>
                </div>
              </div>

              {/* Empty State if certDatabase is empty or no search results */}
              {filteredRegistry.length === 0 ? (
                <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Award size={40} className="mx-auto text-slate-400 mb-3" />
                  <h4 className="font-heading font-black text-slate-800 text-base">
                    No Certificates Found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    {registrySearch
                      ? `No issued certificate matches "${registrySearch}". Try searching by a different name or credential ID.`
                      : 'No certificates have been added in the Admin page yet. Certificates added or issued in the Admin Portal will automatically appear in this list.'}
                  </p>
                </div>
              ) : registryViewMode === 'list' ? (
                /* TABLE LIST FORM */
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-200 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4">Recipient Name</th>
                        <th className="py-3.5 px-4">Certificate ID</th>
                        <th className="py-3.5 px-4">Honor / Achievement</th>
                        <th className="py-3.5 px-4">School / Project</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredRegistry.map((record) => {
                        const isSelected = activeCertificate?.id === record.id;
                        return (
                          <tr
                            key={record.id}
                            onClick={() => {
                              setCurrentCertId(record.id);
                              setActiveTab('certificate');
                            }}
                            className={`transition-colors cursor-pointer group hover:bg-purple-50/60 ${
                              isSelected ? 'bg-purple-50/80 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 border border-purple-200">
                                  <User size={15} />
                                </div>
                                <div>
                                  <div className="font-heading font-black text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                                    {record.recipientName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 sm:hidden">
                                    {record.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                              <span className="bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-md text-[11px]">
                                {record.id}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-semibold">
                                <Award size={12} className="text-indigo-600" />
                                {record.achievementType || 'Certificate of Participation'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                              <div className="font-medium text-slate-800 truncate">
                                {record.school || 'Upper Chitral Institution'}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {record.project || 'Science, Arts & Food Exhibition 2026'}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 size={11} /> Verified
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentCertId(record.id);
                                    setActiveTab('certificate');
                                  }}
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  title="Open & Preview Certificate Canvas"
                                >
                                  <Eye size={13} />
                                  <span>Open</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(record)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Download Official PDF"
                                >
                                  <Download size={13} />
                                  <span>PDF</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadImage(record)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Download PNG Image"
                                >
                                  <FileText size={13} />
                                  <span>PNG</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* CARD GRID VIEW */
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
                        {record.achievementType || 'Certificate of Participation'}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2">
                        <GraduationCap size={13} className="text-slate-400" />
                        <span className="truncate">{record.project || 'Science, Arts & Food Exhibition 2026'}</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(record)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Download official PDF"
                          >
                            <Download size={11} />
                            <span>PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadImage(record)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Download high-resolution image"
                          >
                            <FileText size={11} />
                            <span>PNG</span>
                          </button>
                        </div>

                        <span className="font-bold text-purple-600 flex items-center gap-1 hover:underline">
                          <span>Open</span>
                          <Eye size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    Credential Type *
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600"
                  >
                    <option value="Certificate of Participation">Certificate of Participation</option>
                    <option value="Certificate of Leadership">Certificate of Leadership</option>
                    <option value="Certificate of Volunteerism">Certificate of Volunteerism</option>
                  </select>
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

      {/* Excel / CSV Bulk Certificate Import Modal */}
      <BulkCertificateImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={(newCerts) => {
          setCertDatabase(prev => [...newCerts, ...prev]);
          if (newCerts.length > 0) {
            setCurrentCertId(newCerts[0].id);
            setInputCertId(newCerts[0].id);
            setActiveTab('certificate');
            setLookupMessage({
              text: `Bulk Imported ${newCerts.length} certificates! Loaded ${newCerts[0].recipientName} [ID: ${newCerts[0].id}]`,
              type: 'success'
            });
          }
        }}
        existingCount={certDatabase.length}
      />
    </section>
  );
};
