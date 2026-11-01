import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Search,
  Award,
  User,
  Sparkles,
  FileSpreadsheet,
  Building2,
  X,
  ExternalLink,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { BulkCertificateImportModal } from './BulkCertificateImportModal';

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
  activeCertificate?: CertificateRecord;
  qrCodeDataUrls?: Record<string, string>;
  handlePrintCertificate?: () => void;
  handleCopyVerificationLink?: (certId: string) => void;
  copiedLink?: boolean;
  handleOpenLookupForId?: (certId: string) => void;
  setIsVerifyModalOpen?: (open: boolean) => void;
  officialLogo?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isAdminMode?: boolean;
}

export const CertificatePortal: React.FC<CertificatePortalProps> = ({
  certDatabase,
  setCertDatabase,
  setCurrentCertId,
  isAdminMode = false
}) => {
  // Search state to filter certificates by student name or school
  const [searchTerm, setSearchTerm] = useState('');

  // Currently selected certificate for Modal / Spotlight View
  const [selectedCertModal, setSelectedCertModal] = useState<CertificateRecord | null>(null);

  // View mode: 'cards' (participant cards as requested) or 'all' (all full certificates unrolled)
  const [viewMode, setViewMode] = useState<'cards' | 'all'>('cards');

  // Downloading state indicator for feedback
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  // Custom Issuer Form State (Admin)
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<string>('Certificate of Participation');
  const [customProject, setCustomProject] = useState('Science, Arts & Food Exhibition 2026');
  const [customSchool, setCustomSchool] = useState('');

  // Active tab for Admin mode: 'view' | 'generator'
  const [activeTab, setActiveTab] = useState<'view' | 'generator'>('view');

  // Bulk Excel Import modal state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Pre-generate QR Code URLs for all certificates in certDatabase
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    certDatabase.forEach(cert => {
      if (!qrCodeMap[cert.id]) {
        const payload = `Certificate ID: ${cert.id}\nRecipient: ${cert.recipientName}\nEvent: Science, Arts & Food Exhibition 2026`;
        QRCode.toDataURL(payload, {
          width: 300,
          margin: 1,
          color: { dark: '#1e1b4b', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        })
          .then(url => {
            setQrCodeMap(prev => ({ ...prev, [cert.id]: url }));
          })
          .catch(err => console.error('Error generating QR:', err));
      }
    });
  }, [certDatabase]);

  // Filtered certificate database based on search input
  const filteredCertificates = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return certDatabase;
    return certDatabase.filter(
      cert =>
        cert.recipientName.toLowerCase().includes(q) ||
        cert.id.toLowerCase().includes(q) ||
        (cert.school && cert.school.toLowerCase().includes(q)) ||
        (cert.project && cert.project.toLowerCase().includes(q))
    );
  }, [certDatabase, searchTerm]);

  // Handle high-resolution direct PNG certificate image download
  const handleDownloadPNG = async (cert: CertificateRecord) => {
    try {
      setDownloadingCertId(cert.id);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 2560;
      canvas.height = 1810;

      // Load background template image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = getCertificateTemplateImage(cert.achievementType);

      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.onerror = () => {
          const fallback = new Image();
          fallback.src = getCertificateTemplateImage(cert.achievementType);
          fallback.onload = resolve;
          fallback.onerror = resolve;
        };
      });

      // Draw background template
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Draw Recipient Name Overlay
      const name = cert.recipientName || 'Student Name';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 108px "Playfair Display", "Georgia", "Times New Roman", serif';
      ctx.fillText(name, canvas.width * 0.5, canvas.height * 0.412);

      // Draw Unique QR Code Overlay
      const qrDataUrl = qrCodeMap[cert.id];
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
        });

        const qrX = canvas.width * 0.429;
        const qrY = canvas.height * 0.8265;
        const qrW = canvas.width * 0.1113;
        const qrH = canvas.height * 0.1458;

        ctx.drawImage(qrImg, qrX, qrY, qrW, qrH);
      }

      // Convert canvas to Data URL and trigger direct download
      const dataUrl = canvas.toDataURL('image/png');
      const cleanName = name.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Certificate_${cleanName}_SAF2026.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download certificate image:', err);
      alert('Downloading certificate image... Please try printing if download is blocked by browser rules.');
    } finally {
      setDownloadingCertId(null);
    }
  };

  // Handle printing specific certificate
  const handlePrintCert = (cert: CertificateRecord) => {
    setCurrentCertId(cert.id);
    setSelectedCertModal(cert);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Handle Admin quick certificate issue
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
    setCustomName('');
    setActiveTab('view');
  };

  return (
    <section id="certificates" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-widest">
              <Award size={14} className="text-purple-400" />
              <span>Official Event Certificates Roster</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Official Certificates
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Click on any participant card below to view and download their official Certificate of Participation for <strong>Science, Arts & Food Exhibition 2026</strong>.
            </p>
          </div>

          {/* Header Metrics & Print All */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="px-4 py-3 bg-white/10 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl font-black text-white font-mono">{certDatabase.length}</div>
              <div className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Total Participants</div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Filter Bar & View Controls */}
        <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter participants by name or school..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-xs font-sans focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <LayoutGrid size={14} /> Participant Cards
            </button>

            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Layers size={14} /> Unrolled Certificates
            </button>

            {isAdminMode && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'generator' ? 'view' : 'generator')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} /> {activeTab === 'generator' ? 'Back to Certificates' : 'Issue Certificate'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} /> Bulk Upload
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN GENERATOR TAB */}
      {isAdminMode && activeTab === 'generator' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              Issue New Official Certificate
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add student details to immediately insert their official certificate into the roster below.
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
                <Sparkles size={16} /> Add Certificate to Roster
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DEFAULT VIEW: PARTICIPANT CARDS ROSTER */}
      {viewMode === 'cards' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-900">
                Participant Certificates Roster ({filteredCertificates.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click on any participant card to download or print their official main certificate
              </p>
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <User size={32} className="mx-auto" />
              <p className="text-sm font-bold text-slate-700">No participants match "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Show All Participants
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCertificates.map((cert, index) => (
                <div
                  key={`participant-card-${cert.id}-${index}`}
                  onClick={() => setSelectedCertModal(cert)}
                  className="bg-white border border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 p-5 rounded-2xl cursor-pointer shadow-2xs hover:shadow-lg transition-all space-y-2 group text-left relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-black text-purple-700 text-xl sm:text-2xl tracking-tight group-hover:text-purple-900 transition-colors">
                      {cert.recipientName}
                    </h3>
                  </div>

                  <p className="text-sm font-bold text-purple-600">
                    {cert.achievementType || 'Certificate of Participation'}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                    <Building2 size={15} className="text-slate-400 shrink-0" />
                    <span className="truncate">{cert.school || 'Partner School'}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-bold text-purple-700 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>View & Download Certificate</span>
                    <ExternalLink size={13} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UNROLLED FULL CERTIFICATES GALLERY VIEW */}
      {viewMode === 'all' && (
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Showing {filteredCertificates.length} Official Certificates
            </p>
          </div>

          {filteredCertificates.map((cert, index) => {
            const templateImg = getCertificateTemplateImage(cert.achievementType);
            const qrUrl = qrCodeMap[cert.id];

            return (
              <div
                key={`cert-unrolled-${cert.id}-${index}`}
                className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xl space-y-4 transition-all hover:border-purple-300"
              >
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-lg sm:text-xl">
                        {cert.recipientName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-purple-700">{cert.achievementType}</span>
                        {cert.school && (
                          <>
                            <span>·</span>
                            <span>{cert.school}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadPNG(cert)}
                      disabled={downloadingCertId === cert.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Download size={15} />
                      <span>{downloadingCertId === cert.id ? 'Generating PNG...' : 'Download PNG'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintCert(cert)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Printer size={15} /> Print / Save PDF
                    </button>
                  </div>
                </div>

                {/* Main Official Certificate Canvas */}
                <div className="w-full max-w-4xl mx-auto my-2">
                  <div
                    id={selectedCertModal?.id === cert.id ? 'printable-certificate' : undefined}
                    className="relative w-full rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden select-none bg-white border border-slate-200"
                    style={{ aspectRatio: '2560 / 1810' }}
                  >
                    <img
                      src={templateImg}
                      alt={`Official Certificate for ${cert.recipientName}`}
                      className="w-full h-full object-cover block select-none pointer-events-none"
                      draggable={false}
                    />

                    <div
                      className="absolute text-center w-full px-6 pointer-events-none"
                      style={{
                        top: '41.2%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="font-heading font-black text-slate-900 tracking-normal leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl drop-shadow-xs">
                        {cert.recipientName}
                      </div>
                    </div>

                    <div
                      className="absolute flex items-center justify-center"
                      style={{
                        left: '42.9%',
                        top: '82.65%',
                        width: '11.13%',
                        height: '14.58%',
                      }}
                    >
                      {qrUrl ? (
                        <div className="w-full h-full p-1 sm:p-1.5 flex items-center justify-center">
                          <img
                            src={qrUrl}
                            alt={`QR code for ${cert.recipientName}`}
                            className="w-full h-full object-contain rounded-lg sm:rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/80 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-mono">QR</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL OFFICIAL MAIN CERTIFICATE MODAL VIEW WHEN ANY PARTICIPANT CARD IS CLICKED */}
      {selectedCertModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedCertModal(null)}
        >
          <div
            className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-slate-800 shadow-2xl space-y-6 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
                    {selectedCertModal.recipientName}
                  </h3>
                  <p className="text-xs text-purple-300 font-semibold">
                    {selectedCertModal.achievementType} · {selectedCertModal.school || 'Science, Arts & Food Exhibition 2026'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDownloadPNG(selectedCertModal)}
                  disabled={downloadingCertId === selectedCertModal.id}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Download size={15} />
                  <span>{downloadingCertId === selectedCertModal.id ? 'Generating Image...' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintCert(selectedCertModal)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Printer size={15} /> Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCertModal(null)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MAIN CERTIFICATE CANVAS INSIDE MODAL */}
            <div className="w-full my-2 bg-white rounded-2xl p-2 sm:p-4 shadow-inner border border-slate-800">
              <div
                id="printable-certificate"
                className="relative w-full rounded-xl overflow-hidden select-none bg-white border border-slate-200"
                style={{ aspectRatio: '2560 / 1810' }}
              >
                <img
                  src={getCertificateTemplateImage(selectedCertModal.achievementType)}
                  alt={`Official Certificate for ${selectedCertModal.recipientName}`}
                  className="w-full h-full object-cover block select-none pointer-events-none"
                  draggable={false}
                />

                <div
                  className="absolute text-center w-full px-6 pointer-events-none"
                  style={{
                    top: '41.2%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="font-heading font-black text-slate-900 tracking-normal leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl drop-shadow-xs">
                    {selectedCertModal.recipientName}
                  </div>
                </div>

                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    left: '42.9%',
                    top: '82.65%',
                    width: '11.13%',
                    height: '14.58%',
                  }}
                >
                  {qrCodeMap[selectedCertModal.id] ? (
                    <div className="w-full h-full p-1 sm:p-1.5 flex items-center justify-center">
                      <img
                        src={qrCodeMap[selectedCertModal.id]}
                        alt={`QR code for ${selectedCertModal.recipientName}`}
                        className="w-full h-full object-contain rounded-lg sm:rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-mono">QR</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Presented on October 31, 2026 · Booni, Upper Chitral</span>
              <span className="font-mono text-[11px] text-purple-400 font-bold">Credential ID: {selectedCertModal.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Excel / CSV Bulk Certificate Import Modal (Admin) */}
      <BulkCertificateImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={(newCerts) => {
          setCertDatabase(prev => [...newCerts, ...prev]);
        }}
        existingCount={certDatabase.length}
      />
    </section>
  );
};
