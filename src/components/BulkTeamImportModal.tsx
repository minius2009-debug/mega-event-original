import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Users,
  Building2,
  Sparkles,
  RefreshCw,
  Trash2,
  HelpCircle,
  Info,
  Check,
  ChevronRight,
  Filter,
  Eye,
  Award
} from 'lucide-react';
import { TeamParticipation, ParticipantMember } from '../App';

interface BulkTeamImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newTeams: TeamParticipation[], mode: 'append' | 'replace') => void;
  existingTeamsCount: number;
}

interface ParsedTeamRow {
  index: number;
  isValid: boolean;
  warnings: string[];
  teamCode: string;
  projectName: string;
  category: string;
  school: string;
  campus: string;
  location: string;
  teamLeader: string;
  leaderEmail: string;
  coLeader: string;
  supervisor: string;
  capacity: number;
  members: ParticipantMember[];
  projectDescription: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  award: 'First Place' | 'Second Place' | 'Third Place' | 'Participation';
  selected: boolean;
}

const NORMALIZE_KEY = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export const BulkTeamImportModal: React.FC<BulkTeamImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingTeamsCount
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedTeamRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [previewSearch, setPreviewSearch] = useState('');
  const [selectedPreviewRow, setSelectedPreviewRow] = useState<ParsedTeamRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter preview rows
  const filteredPreview = useMemo(() => {
    if (!previewSearch.trim()) return parsedRows;
    const q = previewSearch.toLowerCase();
    return parsedRows.filter(
      r =>
        r.projectName.toLowerCase().includes(q) ||
        r.teamCode.toLowerCase().includes(q) ||
        r.teamLeader.toLowerCase().includes(q) ||
        r.school.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [parsedRows, previewSearch]);

  // ---------------------------------------------------------------------------
  // 1. Download Sample Excel Template
  // ---------------------------------------------------------------------------
  const handleDownloadExcelTemplate = () => {
    // Sample rows tailored to Upper Chitral & Booni Mega Event
    const sampleData = [
      {
        'Team Code': 'CLB-STEM-01',
        'Project Name': 'Smart High-Altitude Orchard Monitor',
        'Category': 'Climate & Smart Ag',
        'School / Institution': 'Pamir Public School & College',
        'Campus': 'Main Campus Booni',
        'Location / Station': 'Exhibition Stall 01',
        'Team Leader': 'Ahmad Khan',
        'Leader Email': 'ahmad.khan@pamir.edu.pk',
        'Co-Leader': 'Marcus Vance',
        'Supervisor / Advisor': 'Prof. Jamshed Ali',
        'Capacity': 5,
        'Team Members': 'Ahmad Khan (Team Leader); Marcus Vance (Hardware Specialist); Chloe Bennett (Field Operations); Sara Bibi (Data Analyst)',
        'Project Description': 'IoT-based soil moisture and cold-snap early warning system designed specifically for high-elevation apple and walnut orchards.',
        'Status': 'Approved',
        'Award': 'Second Place'
      },
      {
        'Team Code': 'CLB-TECH-02',
        'Project Name': 'Glacier Lake Flood Warning IoT',
        'Category': 'AI & Robotics',
        'School / Institution': 'Booni Degree College',
        'Campus': 'Upper Chitral Campus',
        'Location / Station': 'Tech Pod A',
        'Team Leader': 'Zeeshan Ahmad',
        'Leader Email': 'zeeshan.ahmad@collabs.org',
        'Co-Leader': 'Bilal Shah',
        'Supervisor / Advisor': 'Dr. Tariq Hussain',
        'Capacity': 5,
        'Team Members': 'Zeeshan Ahmad (Team Lead); Bilal Shah (Robotics Eng); Nida Fatima (Sensors & Firmware); Karim Baig (Cloud Telemetry)',
        'Project Description': 'Autonomous ultrasonic water-level detection nodes that relay flash-flood alerts across mountainous valleys.',
        'Status': 'Approved',
        'Award': 'Participation'
      },
      {
        'Team Code': 'CLB-WATER-03',
        'Project Name': 'Clean Stream Chitral Microplastic Filter',
        'Category': 'Water & Environment',
        'School / Institution': 'Aga Khan Higher Secondary School Kuragh',
        'Campus': 'Kuragh Campus',
        'Location / Station': 'Eco Station Beta',
        'Team Leader': 'Amina Nour',
        'Leader Email': 'amina.nour@collabs.org',
        'Co-Leader': 'Devon Takahashi',
        'Supervisor / Advisor': 'Ms. Samina Bibi',
        'Capacity': 4,
        'Team Members': 'Amina Nour (Project Lead); Devon Takahashi (Water Quality Sampling); Yasmin Ali (Public Health)',
        'Project Description': 'Community water filtration and microplastic sampling initiative along the Mastuj River tributaries.',
        'Status': 'Approved',
        'Award': 'Participation'
      },
      {
        'Team Code': 'CLB-ART-04',
        'Project Name': 'Khowar Cultural Digital Archive & Textile Art',
        'Category': 'Art',
        'School / Institution': 'Chitral Model College',
        'Campus': 'Heritage Wing',
        'Location / Station': 'Creative Pavilion 03',
        'Team Leader': 'Afroza Gul',
        'Leader Email': 'afroza.gul@collabs.org',
        'Co-Leader': 'Salma Karim',
        'Supervisor / Advisor': 'Mr. Inayat Ullah',
        'Capacity': 4,
        'Team Members': 'Afroza Gul (Creative Director); Salma Karim (Traditional Weaving); Faraz Baig (Digital Media & 3D Scanner)',
        'Project Description': 'Preserving traditional indigenous Chitrali embroidery patterns through digital documentation and modern craft exhibits.',
        'Status': 'Approved',
        'Award': 'Participation'
      },
      {
        'Team Code': 'CLB-FOOD-05',
        'Project Name': 'Solar Dehydrated Mountain Superfoods',
        'Category': 'Food & Nutrition',
        'School / Institution': 'Government High School Booni',
        'Campus': 'Agri Lab',
        'Location / Station': 'Nutrition Pavilion 02',
        'Team Leader': 'Sheraz Ali',
        'Leader Email': 'sheraz.ali@collabs.org',
        'Co-Leader': 'Kamran Khan',
        'Supervisor / Advisor': 'Engr. Rashid Latif',
        'Capacity': 5,
        'Team Members': 'Sheraz Ali (Product Lead); Kamran Khan (Thermal Tech); Mahnoor Begum (Food Safety); Danish Ali (Packaging)',
        'Project Description': 'Zero-emission solar dehydrator optimizing shelf-life and nutrient retention of Chitral mulberries and apricots for winter distribution.',
        'Status': 'Approved',
        'Award': 'Participation'
      }
    ];

    // Instructions sheet data
    const instructions = [
      { 'Field Name': 'Project Name', 'Required': 'YES', 'Example': 'Smart Orchard Monitor', 'Description': 'The official title of the student project or innovation unit.' },
      { 'Field Name': 'Team Leader', 'Required': 'YES', 'Example': 'Ahmad Khan', 'Description': 'Primary student representative and coordinator.' },
      { 'Field Name': 'Leader Email', 'Required': 'NO', 'Example': 'ahmad@example.com', 'Description': 'Contact email for communications & QR code delivery.' },
      { 'Field Name': 'School / Institution', 'Required': 'RECOMMENDED', 'Example': 'Booni Degree College', 'Description': 'Affiliated school or college name.' },
      { 'Field Name': 'Category', 'Required': 'RECOMMENDED', 'Example': 'STEM / AI & Robotics / Art / Food / Climate', 'Description': 'Domain track for the exhibition competition.' },
      { 'Field Name': 'Team Members', 'Required': 'RECOMMENDED', 'Example': 'Name 1 (Role); Name 2 (Role); Name 3', 'Description': 'Semicolon (;) or comma (,) separated list of members. Roles in parentheses are automatically extracted!' },
      { 'Field Name': 'Team Code', 'Required': 'OPTIONAL', 'Example': 'CLB-STEM-01', 'Description': 'Unique code. If left blank, a code like CLB-TEAM-XX is auto-assigned.' },
      { 'Field Name': 'Campus', 'Required': 'OPTIONAL', 'Example': 'Main Campus', 'Description': 'Specific branch or campus.' },
      { 'Field Name': 'Location / Station', 'Required': 'OPTIONAL', 'Example': 'Exhibition Stall 04', 'Description': 'Booth or room number at Booni event grounds.' },
      { 'Field Name': 'Supervisor / Advisor', 'Required': 'OPTIONAL', 'Example': 'Prof. Jamshed Ali', 'Description': 'Faculty mentor or teacher.' },
      { 'Field Name': 'Project Description', 'Required': 'OPTIONAL', 'Example': 'Detailed overview...', 'Description': 'Summary of community challenge and solution.' },
      { 'Field Name': 'Status', 'Required': 'OPTIONAL', 'Example': 'Approved / Pending', 'Description': 'Default is Approved.' },
      { 'Field Name': 'Award', 'Required': 'OPTIONAL', 'Example': 'First Place / Second Place / Third Place / Participation', 'Description': 'Default is Participation.' }
    ];

    const wb = XLSX.utils.book_new();

    // Sheet 1: Data Template
    const wsData = XLSX.utils.json_to_sheet(sampleData);
    // Set column widths
    wsData['!cols'] = [
      { wch: 15 }, // Team Code
      { wch: 35 }, // Project Name
      { wch: 22 }, // Category
      { wch: 32 }, // School
      { wch: 20 }, // Campus
      { wch: 22 }, // Location
      { wch: 20 }, // Team Leader
      { wch: 25 }, // Leader Email
      { wch: 20 }, // Co-Leader
      { wch: 22 }, // Supervisor
      { wch: 10 }, // Capacity
      { wch: 45 }, // Members
      { wch: 50 }, // Description
      { wch: 12 }, // Status
      { wch: 15 }  // Award
    ];
    XLSX.utils.book_append_sheet(wb, wsData, 'Team Participation Data');

    // Sheet 2: Guidelines
    const wsGuide = XLSX.utils.json_to_sheet(instructions);
    wsGuide['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 30 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Field Guidelines');

    XLSX.writeFile(wb, 'collabs_team_participation_template.xlsx');
  };

  // ---------------------------------------------------------------------------
  // 2. Parse Member String into ParticipantMember[]
  // ---------------------------------------------------------------------------
  const parseMembersString = (
    str: string,
    leaderName: string,
    leaderEmail: string,
    schoolName: string
  ): ParticipantMember[] => {
    const list: ParticipantMember[] = [];
    const addedNames = new Set<string>();

    // If leader provided, add leader first
    if (leaderName && leaderName.trim()) {
      const trimmedLeader = leaderName.trim();
      list.push({
        name: trimmedLeader,
        role: 'Team Leader',
        email: leaderEmail?.trim() || `${trimmedLeader.toLowerCase().replace(/\s+/g, '.')}@collabs.org`,
        school: schoolName
      });
      addedNames.add(trimmedLeader.toLowerCase());
    }

    if (!str || !str.trim()) return list;

    // Split on semicolons or commas (if not enclosed in parentheses)
    const tokens = str.split(/;|\n/);

    tokens.forEach(tok => {
      const trimmed = tok.trim();
      if (!trimmed) return;

      // Extract optional role inside parentheses: "Ahmad Khan (Hardware Lead)"
      const match = trimmed.match(/^([^(]+)(?:\(([^)]+)\))?/);
      let name = trimmed;
      let role = 'Member';

      if (match) {
        name = match[1].trim();
        if (match[2]) {
          role = match[2].trim();
        }
      }

      // Also support name - role syntax: "Sara Ali - Researcher"
      if (role === 'Member' && name.includes(' - ')) {
        const parts = name.split(' - ');
        name = parts[0].trim();
        role = parts.slice(1).join(' - ').trim();
      }

      if (!name) return;

      // Avoid duplicate of leader
      if (addedNames.has(name.toLowerCase())) {
        return;
      }

      addedNames.add(name.toLowerCase());
      list.push({
        name,
        role: role || 'Member',
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@collabs.org`,
        school: schoolName
      });
    });

    return list;
  };

  // ---------------------------------------------------------------------------
  // 3. Process File (Excel or CSV)
  // ---------------------------------------------------------------------------
  const processWorkbook = (wb: XLSX.WorkBook) => {
    try {
      const firstSheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      if (!rawData || rawData.length === 0) {
        setErrorMessage('The uploaded spreadsheet appears to be empty.');
        return;
      }

      const rows: ParsedTeamRow[] = [];

      rawData.forEach((row, idx) => {
        // Map keys loosely by removing punctuation & spaces
        const mapped: Record<string, any> = {};
        Object.entries(row).forEach(([k, v]) => {
          mapped[NORMALIZE_KEY(k)] = v;
        });

        const projectName =
          mapped['projectname'] ||
          mapped['projecttitle'] ||
          mapped['teamname'] ||
          mapped['title'] ||
          mapped['project'] ||
          '';

        const teamLeader =
          mapped['teamleader'] ||
          mapped['leadername'] ||
          mapped['leader'] ||
          mapped['lead'] ||
          '';

        const leaderEmail =
          mapped['leaderemail'] ||
          mapped['email'] ||
          mapped['contactemail'] ||
          '';

        const school =
          mapped['schoolinstitution'] ||
          mapped['school'] ||
          mapped['institution'] ||
          mapped['college'] ||
          mapped['university'] ||
          'Booni Degree College';

        const category =
          mapped['category'] ||
          mapped['domain'] ||
          mapped['track'] ||
          'STEM';

        const teamCode =
          mapped['teamcode'] ||
          mapped['code'] ||
          mapped['teamid'] ||
          `CLB-TEAM-${String(existingTeamsCount + idx + 1).padStart(2, '0')}`;

        const campus = mapped['campus'] || mapped['branch'] || 'Main Campus';
        const location = mapped['locationstation'] || mapped['location'] || mapped['station'] || mapped['stall'] || 'Booni Grounds';
        const coLeader = mapped['coleader'] || mapped['viceleader'] || '';
        const supervisor = mapped['supervisoradvisor'] || mapped['supervisor'] || mapped['advisor'] || mapped['mentor'] || '';
        const capacity = Number(mapped['capacity'] || mapped['teamsize']) || 5;

        const membersRaw =
          mapped['teammembers'] ||
          mapped['members'] ||
          mapped['roster'] ||
          mapped['participants'] ||
          '';

        const projectDescription =
          mapped['projectdescription'] ||
          mapped['description'] ||
          mapped['summary'] ||
          mapped['abstract'] ||
          `Innovative student project by ${projectName || 'team'} for First Mega Event of Collabs 2026 in Booni.`;

        // In team participation, all registered teams are equal participants
        const award: ParsedTeamRow['award'] = 'Participation';

        // Status
        const rawStatus = (mapped['status'] || '').toString().toLowerCase();
        let status: ParsedTeamRow['status'] = 'Approved';
        if (rawStatus.includes('pend')) status = 'Pending';
        if (rawStatus.includes('reject')) status = 'Rejected';

        // Check validity
        const warnings: string[] = [];
        if (!projectName.trim()) {
          warnings.push('Missing Project Name');
        }
        if (!teamLeader.trim()) {
          warnings.push('Missing Team Leader');
        }

        const members = parseMembersString(
          membersRaw.toString(),
          teamLeader.toString(),
          leaderEmail.toString(),
          school.toString()
        );

        rows.push({
          index: idx + 1,
          isValid: warnings.length === 0,
          warnings,
          teamCode: teamCode.toString().trim().toUpperCase(),
          projectName: projectName.toString().trim() || `Untitled Team ${idx + 1}`,
          category: category.toString().trim(),
          school: school.toString().trim(),
          campus: campus.toString().trim(),
          location: location.toString().trim(),
          teamLeader: teamLeader.toString().trim() || 'Unassigned',
          leaderEmail: leaderEmail.toString().trim(),
          coLeader: coLeader.toString().trim(),
          supervisor: supervisor.toString().trim(),
          capacity,
          members,
          projectDescription: projectDescription.toString().trim(),
          status,
          award,
          selected: warnings.length === 0
        });
      });

      setParsedRows(rows);
      if (rows.length > 0) {
        setSelectedPreviewRow(rows[0]);
      }
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Error processing spreadsheet:', err);
      setErrorMessage(`Failed to parse file: ${err.message || 'Unknown format'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    setIsLoading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('File data was empty');
        const wb = XLSX.read(data, { type: 'binary' });
        processWorkbook(wb);
      } catch (err: any) {
        setErrorMessage(`Could not read workbook: ${err.message}`);
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('FileReader encountered an error reading this file.');
      setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFile(e.dataTransfer.files[0]);
    }
  };

  // Toggle selection
  const handleToggleRow = (index: number) => {
    setParsedRows(prev =>
      prev.map(r => (r.index === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setParsedRows(prev => prev.map(r => ({ ...r, selected: select })));
  };

  const selectedCount = parsedRows.filter(r => r.selected).length;

  // ---------------------------------------------------------------------------
  // 4. Final Import Action
  // ---------------------------------------------------------------------------
  const handleConfirmImport = () => {
    const selectedRows = parsedRows.filter(r => r.selected);
    if (selectedRows.length === 0) return;

    const newTeams: TeamParticipation[] = selectedRows.map((r, i) => {
      const generatedId = `tp-bulk-${Date.now().toString().slice(-4)}-${i + 1}`;
      return {
        id: generatedId,
        teamCode: r.teamCode || `CLB-TEAM-${String(existingTeamsCount + i + 1).padStart(2, '0')}`,
        projectName: r.projectName,
        category: r.category,
        school: r.school,
        campus: r.campus,
        location: r.location,
        teamLeader: r.teamLeader,
        coLeader: r.coLeader || undefined,
        supervisor: r.supervisor || undefined,
        capacity: r.capacity || 5,
        members: r.members,
        projectDescription: r.projectDescription,
        status: r.status,
        award: r.award,
        createdAt: 'Oct 2026'
      };
    });

    onImport(newTeams, importMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-6 animate-fadeIn text-left flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Spreadsheet Ingestion
                </span>
                <span className="text-xs text-slate-500">.xlsx / .xls / .csv</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Bulk Team Participation Import
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Top Info Banner & Template Download Button */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Sparkles size={16} className="text-emerald-600" />
                <span>Standardized Excel Roster Format</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Upload your school or event participant spreadsheet. The parser automatically extracts team names, institutional affiliations, leadership, student rosters with roles, domain categories, and locations.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 shrink-0 cursor-pointer transition-transform active:scale-95"
            >
              <Download size={15} /> Download Sample Excel Template (.xlsx)
            </button>
          </div>

          {/* Upload Area / Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : fileName
                ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-emerald-600">
              {isLoading ? (
                <RefreshCw size={26} className="animate-spin text-blue-600" />
              ) : fileName ? (
                <CheckCircle2 size={28} className="text-emerald-600" />
              ) : (
                <Upload size={26} />
              )}
            </div>

            {fileName ? (
              <div>
                <span className="font-heading font-black text-slate-900 text-base">{fileName}</span>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  Spreadsheet loaded · {parsedRows.length} team record(s) parsed
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Click to browse or drop another file</p>
              </div>
            ) : (
              <div>
                <p className="font-heading font-black text-slate-800 text-base">
                  Drag and drop your Excel (.xlsx, .xls) or CSV file here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  or click to select file from your computer
                </p>
                <span className="inline-block mt-3 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Supports custom column names, roles in parentheses & multiple team members
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Import Warning: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Preview Section if rows are parsed */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              {/* Preview Bar & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h4 className="font-heading font-black text-slate-900 text-base flex items-center gap-2">
                    <span>Parsed Teams Preview</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg">
                      {selectedCount} of {parsedRows.length} Selected
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review extracted data before finalizing team enrollment.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className="text-xs font-bold text-blue-600 hover:underline px-2 py-1"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="text-xs font-bold text-slate-500 hover:underline px-2 py-1"
                  >
                    Deselect All
                  </button>
                  <input
                    type="text"
                    placeholder="Filter preview..."
                    value={previewSearch}
                    onChange={e => setPreviewSearch(e.target.value)}
                    className="p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs w-36 sm:w-44 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedRows.length && parsedRows.length > 0}
                          onChange={e => handleSelectAll(e.target.checked)}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="p-3">Team & Code</th>
                      <th className="p-3">School / Campus</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Team Leader</th>
                      <th className="p-3 text-center">Roster</th>
                      <th className="p-3 text-center">Award</th>
                      <th className="p-3 text-center">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPreview.map(r => (
                      <tr
                        key={r.index}
                        onClick={() => setSelectedPreviewRow(r)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          !r.isValid ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={r.selected}
                            onChange={() => handleToggleRow(r.index)}
                            className="rounded text-blue-600 cursor-pointer"
                          />
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{r.projectName}</span>
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {r.teamCode}
                            </span>
                          </div>
                          {r.warnings.length > 0 && (
                            <span className="text-[10px] text-amber-600 font-medium">
                              ⚠ {r.warnings.join(', ')}
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-slate-700">
                          <div className="font-medium truncate max-w-[150px]">{r.school}</div>
                          <div className="text-[10px] text-slate-400">{r.campus}</div>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-slate-800">{r.category}</span>
                        </td>

                        <td className="p-3 text-slate-800">
                          <div className="font-bold">{r.teamLeader}</div>
                          {r.supervisor && (
                            <div className="text-[10px] text-slate-400">Adv: {r.supervisor}</div>
                          )}
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-blue-600">
                          {r.members.length}
                        </td>

                        <td className="p-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {r.award}
                          </span>
                        </td>

                        <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewRow(r)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Inspect parsed details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected Row Detail Box */}
              {selectedPreviewRow && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {selectedPreviewRow.teamCode}
                      </span>
                      <h5 className="font-heading font-black text-slate-900 text-sm">
                        {selectedPreviewRow.projectName}
                      </h5>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      {selectedPreviewRow.school} · {selectedPreviewRow.location}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs italic bg-white p-2.5 rounded-xl border border-slate-200">
                    "{selectedPreviewRow.projectDescription}"
                  </p>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Parsed Roster ({selectedPreviewRow.members.length} members):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedPreviewRow.members.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] font-medium shadow-2xs"
                        >
                          <span className="font-bold text-slate-900">{m.name}</span>
                          <span className="text-slate-400 ml-1">({m.role})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Mode Radio Toggle */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800">Import Mode:</span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-blue-600"
                      />
                      <span>Append to existing teams (Keep current {existingTeamsCount})</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-red-600"
                      />
                      <span>Replace all existing teams</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleConfirmImport}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              selectedCount > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Check size={16} /> Import {selectedCount} Teams Now
          </button>
        </div>
      </div>
    </div>
  );
};
