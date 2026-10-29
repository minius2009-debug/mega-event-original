import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X, Sparkles, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CertificateRecord } from './CertificatePortal';

interface BulkCertificateImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newCerts: CertificateRecord[]) => void;
  existingCount: number;
}

export const BulkCertificateImportModal: React.FC<BulkCertificateImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingCount
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CertificateRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Process uploaded Excel or CSV file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rows || rows.length < 2) {
          setErrorMsg('The spreadsheet appears to be empty or missing header rows.');
          return;
        }

        // Identify Header Row
        const headers: string[] = (rows[0] || []).map((h: any) => String(h || '').trim().toLowerCase());
        
        // Column Index Mapping Helpers
        const findCol = (keywords: string[]) => {
          return headers.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const nameIdx = findCol(['name', 'recipient', 'student', 'participant', 'volunteer', 'member', 'full name']);
        const typeIdx = findCol(['type', 'certificate type', 'achievement', 'category', 'award', 'role', 'honor']);
        const schoolIdx = findCol(['school', 'college', 'institution', 'university', 'organization']);
        const projectIdx = findCol(['project', 'subject', 'track', 'topic', 'stall']);

        if (nameIdx === -1) {
          setErrorMsg('Could not find a "Name" or "Recipient" column in the uploaded file. Please use the template format.');
          return;
        }

        const parsedCerts: CertificateRecord[] = [];
        let rowCounter = 100 + existingCount;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const recipientName = String(row[nameIdx] || '').trim();
          if (!recipientName) continue;

          const rawType = typeIdx !== -1 ? String(row[typeIdx] || '').trim() : 'Participation';
          const school = schoolIdx !== -1 ? String(row[schoolIdx] || '').trim() : undefined;
          const project = projectIdx !== -1 ? String(row[projectIdx] || '').trim() : undefined;

          // Determine Certificate Type cleanly
          let achievementType = 'Certificate of Participation';
          const typeLower = rawType.toLowerCase();
          if (typeLower.includes('leadership') || typeLower.includes('leader')) {
            achievementType = 'Certificate of Leadership';
          } else if (typeLower.includes('volunteer') || typeLower.includes('volunteerism')) {
            achievementType = 'Certificate of Volunteerism';
          } else if (typeLower.includes('participation') || typeLower.includes('active')) {
            achievementType = 'Certificate of Participation';
          } else if (rawType) {
            achievementType = rawType.startsWith('Certificate of') ? rawType : `Certificate of ${rawType}`;
          }

          rowCounter++;
          const certId = `CLB-2026-${rowCounter}`;

          parsedCerts.push({
            id: certId,
            recipientName,
            achievementType,
            eventName: 'Science, Arts & Food Exhibition 2026',
            issueDate: 'October 31, 2026',
            verified: true,
            issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
            school: school || undefined,
            project: project || undefined
          });
        }

        if (parsedCerts.length === 0) {
          setErrorMsg('No valid recipient rows found in the file.');
          return;
        }

        setPreviewData(parsedCerts);
      } catch (err: any) {
        console.error('Spreadsheet parse error:', err);
        setErrorMsg('Failed to read spreadsheet file. Please check file format.');
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (previewData.length === 0) return;
    onImport(previewData);
    setSuccessCount(previewData.length);
    setTimeout(() => {
      onClose();
      setFile(null);
      setPreviewData([]);
      setSuccessCount(null);
    }, 1200);
  };

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        'Full Name': 'Syed Farhan Danish',
        'Certificate Type': 'Leadership',
        'School / College': 'Booni Degree College',
        'Project / Subject': 'Organizing Committee'
      },
      {
        'Full Name': 'Elena Rostova',
        'Certificate Type': 'Volunteerism',
        'School / College': 'University of Chitral',
        'Project / Subject': 'Event Operations Track'
      },
      {
        'Full Name': 'Marcus Vance',
        'Certificate Type': 'Participation',
        'School / College': 'Chitral Model College',
        'Project / Subject': 'Clean Mountain Micro-Hydro'
      },
      {
        'Full Name': 'Fatima Zahra',
        'Certificate Type': 'Participation',
        'School / College': 'Pamir Public School Booni',
        'Project / Subject': 'High-Altitude Solar Dryer'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates_Roster');
    XLSX.writeFile(workbook, 'SAF_Certificate_Bulk_Import_Template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white shadow-2xl relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-white">Bulk Import Certificates</h3>
              <p className="text-xs text-slate-400">Upload Excel (.xlsx, .xls) or CSV spreadsheet to generate certificates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-5 space-y-5">
          {/* File Upload Zone */}
          <div className="relative border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-2xl p-6 text-center bg-slate-950/50 transition-colors group cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div className="font-bold text-sm text-slate-200">
                {file ? file.name : 'Click to Upload Excel / CSV File'}
              </div>
              <p className="text-xs text-slate-400">
                Supports <span className="text-purple-300 font-mono font-semibold">.xlsx, .xls, .csv</span> files
              </p>
            </div>
          </div>

          {/* Template Download Link */}
          <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Need a sample Excel template?</span>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold rounded-lg border border-purple-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Download Excel Template</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successCount !== null && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Successfully imported {successCount} official certificates!</span>
            </div>
          )}

          {/* Preview Parsed Data */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Preview Ready to Import ({previewData.length} records)</span>
                <span className="text-purple-400">Auto-assigning IDs CLB-2026-XXX</span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2 space-y-1.5">
                {previewData.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded-lg text-xs flex items-center justify-between border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">{item.recipientName}</div>
                      <div className="text-[10px] text-slate-400">{item.school || 'Unassigned School'} · {item.project || 'SAF 2026'}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.achievementType}
                    </span>
                  </div>
                ))}
                {previewData.length > 10 && (
                  <div className="text-center py-1 text-[11px] text-slate-500 italic">
                    + {previewData.length - 10} more records ready
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={previewData.length === 0}
            onClick={handleConfirmImport}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={15} />
            <span>Confirm Import ({previewData.length} Certificates)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
