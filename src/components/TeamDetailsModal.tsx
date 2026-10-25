import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Building2,
  MapPin,
  Users,
  Award,
  QrCode as QrIcon,
  Download,
  Mail,
  UserCheck,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { TeamParticipation } from '../App';

interface TeamDetailsModalProps {
  team: TeamParticipation | null;
  onClose: () => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!team) return;
    const payload = JSON.stringify({
      id: team.id,
      code: team.teamCode || team.id,
      name: team.projectName,
      leader: team.teamLeader,
      school: team.school || 'Collabs Event',
      event: 'First Mega Event of Collabs 2026'
    });

    QRCode.toDataURL(payload, { width: 360, margin: 2 })
      .then(url => setQrUrl(url))
      .catch(err => console.error('Failed to generate QR:', err));
  }, [team]);

  if (!team) return null;

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${team.teamCode || team.id}_${team.projectName.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.teamCode || team.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stallNumber = (() => {
    if (team.stallNumber && team.stallNumber.trim()) {
      const s = team.stallNumber.trim();
      return s.toLowerCase().startsWith('stall') ? s : `Stall #${s.replace(/^#/, '')}`;
    }
    const loc = (team.location || '').trim();
    const stallMatch = loc.match(/stall\s*#?\s*([a-zA-Z0-9-]+)/i);
    if (stallMatch) {
      return `Stall #${stallMatch[1]}`;
    }
    const code = (team.teamCode || team.id || '').trim();
    const numMatch = code.match(/(?:[a-zA-Z]+-)+(?:2026-)?(\d+)/i) || code.match(/-(\d+)$/);
    if (numMatch) {
      const num = numMatch[1].replace(/^0+/, '') || numMatch[1];
      return `Stall #${num}`;
    }
    if (loc && !loc.toLowerCase().includes('grounds') && !loc.toLowerCase().includes('venue')) {
      return loc;
    }
    return 'Stall Assigned';
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-6 animate-fadeIn text-left flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                {team.teamCode || team.id}
                <button
                  onClick={handleCopyCode}
                  title="Copy Team Code"
                  className="hover:text-blue-900 cursor-pointer"
                >
                  <Copy size={11} />
                </button>
              </span>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
              <span className="font-mono text-xs font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                <MapPin size={11} className="text-indigo-600" />
                <span>{stallNumber}</span>
              </span>
              <span className="text-xs font-medium text-slate-400">·</span>
              <span className="text-xs font-bold text-slate-600">{team.category || 'Innovation Sprint'}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-heading">
              {team.projectName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 text-xs">
          {/* Top Quick Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Institution</div>
              <div className="font-bold text-slate-900 mt-1 line-clamp-1">{team.school || 'Collabs Event'}</div>
              <div className="text-[10px] text-slate-600 truncate">{team.campus || 'Main Campus'}</div>
            </div>

            {/* Professional Stall Number Card */}
            <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white rounded-2xl border border-indigo-200/90 shadow-2xs">
              <div className="text-[10px] text-indigo-700 uppercase font-extrabold tracking-wider flex items-center justify-between">
                <span>Stall Number</span>
                <span className="text-[9px] font-mono text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.2 rounded-full">
                  Confirmed
                </span>
              </div>
              <div className="font-heading font-black text-slate-900 text-sm sm:text-base mt-1 flex items-center gap-1.5 text-indigo-900">
                <MapPin size={13} className="text-indigo-600 shrink-0" />
                <span className="truncate">{stallNumber}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                {team.location && !team.location.toLowerCase().includes('booni grounds') ? team.location : 'Exhibition Zone · Booni Grounds'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Team Leader</div>
              <div className="font-bold text-slate-900 mt-1 truncate">{team.teamLeader}</div>
              <div className="text-[10px] text-slate-600 truncate">{team.coLeader ? `Co: ${team.coLeader}` : 'Primary Representative'}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Recognition</div>
              <div className="font-bold text-emerald-700 mt-1">{team.status}</div>
              <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                <Award size={10} className="text-blue-600 shrink-0" />
                <span>Official Participation</span>
              </div>
            </div>
          </div>

          {/* Project Abstract / Description */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Project Description & Community Mission:
            </span>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-xs">
              {team.projectDescription}
            </div>
          </div>

          {/* Team Members Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Enrolled Team Members ({team.members?.length || 0} / {team.capacity || 5})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Booni Exhibition Cohort</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {team.members?.map((mem, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-blue-300 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="truncate">{mem.name}</span>
                      {mem.name.toLowerCase() === team.teamLeader.toLowerCase() && (
                        <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded shrink-0">
                          LEAD
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-blue-600 font-semibold">{mem.role || 'Member'}</div>
                    {mem.school && <div className="text-[10px] text-slate-400 truncate">{mem.school}</div>}
                  </div>

                  {mem.email && (
                    <a
                      href={`mailto:${mem.email}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
                      title={mem.email}
                    >
                      <Mail size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* QR Badge & Check-in Details */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl flex flex-col sm:flex-row items-center gap-5">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Event Check-in QR"
                className="w-28 h-28 bg-white p-1.5 rounded-2xl shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                <QrIcon size={32} className="text-slate-500" />
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                Exhibition Check-in QR Badge
              </span>
              <h4 className="font-heading font-black text-lg text-white">
                Collabs Booni 2026 Digital Pass
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan this credential at the exhibition reception desk in Booni for immediate team credential verification, certificate eligibility, and booth check-in.
              </p>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="mt-1 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download size={14} /> Download High-Res QR Badge
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
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
