import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Building2,
  Users,
  Download,
  QrCode as QrIcon,
  BookOpen,
  User,
  CheckCircle2
} from 'lucide-react';
import { TeamParticipation } from '../App';

interface TeamDetailsModalProps {
  team: TeamParticipation | null;
  onClose: () => void;
  certDatabase?: any[];
  onViewCertificate?: (certId: string) => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!team) return;

    const memberNames = (team.members || []).map(m => m.name).filter(Boolean);
    const membersListStr = memberNames.length > 0 ? memberNames.join(', ') : 'N/A';

    const fullDetailsText = [
      `PROJECT: ${team.projectName}`,
      `SUBJECT: ${team.category || 'General'}`,
      `SCHOOL: ${team.school || 'Collabs Event'}`,
      `TEAM LEADER: ${team.teamLeader}`,
      `TEAM MEMBERS: ${membersListStr}`,
      `SUMMARY: ${team.projectDescription || ''}`,
      `EVENT: First Mega Event of Collabs 2026 (31 Oct 2026 · TMA Office Booni, Upper Chitral)`
    ].join('\n\n');

    QRCode.toDataURL(fullDetailsText, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M'
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error('Failed to generate project QR:', err));
  }, [team]);

  if (!team) return null;

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    const safeName = team.projectName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    link.download = `QR_${safeName}.png`;
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-6 animate-fadeIn text-left flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="pr-4">
            {/* Subject / Category Tag */}
            {team.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
                <BookOpen size={13} className="text-blue-600" />
                <span>Subject: {team.category}</span>
              </span>
            )}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-tight">
              {team.projectName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1 text-xs">
          {/* School Name */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                School / Institution
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {team.school || 'Collabs Event Partner School'}
              </div>
            </div>
          </div>

          {/* Team Leader & Members */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <User size={15} className="text-blue-600" />
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Team Leadership
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{team.teamLeader}</span>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-md">
                Team Leader
              </span>
            </div>

            {/* Team Members List */}
            {team.members && team.members.length > 0 && (
              <div className="pt-3 border-t border-slate-200/70">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={15} className="text-slate-600" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Team Members ({team.members.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {team.members.map((mem, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <span className="font-bold text-slate-800 text-xs truncate">
                        {mem.name}
                      </span>
                      {mem.role && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {mem.role}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Everything About the Project / Summary */}
          {team.projectDescription && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Project Summary & Details:
              </span>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-xs sm:text-sm">
                {team.projectDescription}
              </div>
            </div>
          )}

          {/* Small Downloadable QR Code Section */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center gap-4 border border-slate-800 shadow-md">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Project Details QR Code"
                className="w-24 h-24 bg-white p-1.5 rounded-xl shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <QrIcon size={28} className="text-slate-400" />
              </div>
            )}

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <h4 className="font-heading font-black text-sm text-white">
                Project QR Pass
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Scan or download this QR code to view all details about <strong>{team.projectName}</strong>.
              </p>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="mt-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-300" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>Download QR Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
