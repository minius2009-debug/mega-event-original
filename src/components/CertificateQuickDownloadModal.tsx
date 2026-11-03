import React, { useState, useMemo } from 'react';
import {
  X,
  Award,
  Download,
  FileCheck2,
  CheckCircle2,
  Search,
  Printer,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { CertificateRecord } from './CertificatePortal';
import { downloadCertificateAsPdf, downloadCertificateAsImage, getCertificateTemplatePath } from '../services/certificateDownloadService';

interface CertificateQuickDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  certDatabase: CertificateRecord[];
  initialCertId?: string;
  onNavigateToPortal?: () => void;
}

export const CertificateQuickDownloadModal: React.FC<CertificateQuickDownloadModalProps> = ({
  isOpen,
  onClose,
  certDatabase,
  initialCertId,
  onNavigateToPortal
}) => {
  const [searchQuery, setSearchQuery] = useState(initialCertId || '');
  const [selectedCertId, setSelectedCertId] = useState<string>(initialCertId || certDatabase[0]?.id || 'CLB-2026-892');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync selected cert if initialCertId changes
  React.useEffect(() => {
    if (initialCertId) {
      setSelectedCertId(initialCertId);
      setSearchQuery(initialCertId);
    }
  }, [initialCertId]);

  const activeCert = useMemo(() => {
    return (
      certDatabase.find(c => c.id.toLowerCase() === selectedCertId.toLowerCase()) ||
      certDatabase.find(c => c.recipientName.toLowerCase().includes(selectedCertId.toLowerCase())) ||
      certDatabase[0]
    );
  }, [certDatabase, selectedCertId]);

  // Filtered search matches
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return certDatabase.slice(0, 6);
    return certDatabase.filter(
      c => c.recipientName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.project && c.project.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [certDatabase, searchQuery]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!activeCert) return;
    try {
      setDownloadingPdf(true);
      await downloadCertificateAsPdf(activeCert);
      setToastMessage(`Downloaded PDF certificate for ${activeCert.recipientName}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('PDF Download failed:', err);
      setToastMessage('Error generating PDF. Please try image download or printing.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!activeCert) return;
    try {
      setDownloadingImage(true);
      await downloadCertificateAsImage(activeCert);
      setToastMessage(`Downloaded PNG certificate for ${activeCert.recipientName}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Image Download failed:', err);
      setToastMessage('Error generating image. Please try PDF download.');
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeCert) return;
    const url = `${window.location.origin}/certificate?verify=${encodeURIComponent(activeCert.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-4 text-left relative flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Award size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase tracking-wider mb-0.5">
                <ShieldCheck size={12} className="text-purple-600" />
                <span>Official SAF 2026 Credential</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-tight">
                Download Official Certificate
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Quick Lookup Bar */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              Select or Search Participant Name / Certificate ID
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student full name (e.g. Fatima Zahra) or ID (CLB-2026-892)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            {/* Issued Certificates List Form */}
            {certDatabase.length > 0 ? (
              <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 pb-1 border-b border-slate-200 flex justify-between">
                  <span>Issued Certificates ({certDatabase.length})</span>
                  <span>Click name to open</span>
                </div>
                {searchResults.map(c => {
                  const isSelected = activeCert?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCertId(c.id);
                        setSearchQuery(c.recipientName);
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white hover:bg-purple-50 text-slate-800 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-purple-500'}`} />
                        <span className="font-bold truncate">{c.recipientName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-mono text-[10px] ${isSelected ? 'text-purple-200' : 'text-purple-700'}`}>
                          {c.id}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          Open
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No certificates have been added in the Admin Page yet.
              </div>
            )}
          </div>

          {/* Active Certificate Spotlight Preview Card */}
          {activeCert ? (
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider">
                    Certificate Recipient:
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white font-heading mt-0.5">
                    {activeCert.recipientName}
                  </h4>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {activeCert.achievementType || 'Certificate of Participation'} · <span className="font-mono text-purple-300 font-bold">{activeCert.id}</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 size={13} />
                  <span>Ready to Download</span>
                </div>
              </div>

              {/* Certificate Canvas Mock Thumbnail */}
              <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-white aspect-[2000/1414] max-h-48 sm:max-h-56 mx-auto w-full">
                <img
                  src={getCertificateTemplatePath(activeCert.achievementType)}
                  alt="Certificate Template"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                <div
                  className="absolute text-center w-full px-4 pointer-events-none font-heading font-black text-slate-900"
                  style={{
                    top: '41.2%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 'clamp(14px, 2.8vw, 24px)'
                  }}
                >
                  {activeCert.recipientName}
                </div>
              </div>

              {/* Action Buttons for Download */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {downloadingPdf ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download Official PDF (Print-Ready)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={downloadingImage}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {downloadingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating Image...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 size={16} className="text-emerald-400" />
                      <span>Download High-Res PNG (2000px)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Copy Link & Full Portal Link */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Verification URL Copied!' : 'Copy Verification Link'}</span>
                </button>

                {onNavigateToPortal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToPortal();
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Open Full Certificate Portal</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <p>No matching certificate found. Please check spelling or Certificate ID.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>District Youth Office Upper Chitral & Collabs Verified Credential</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
