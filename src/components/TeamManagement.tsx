import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Users,
  Award,
  QrCode as QrIcon,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Shield,
  Layers,
  FileText,
  UserPlus,
  Share2,
  Copy,
  ExternalLink,
  FileSpreadsheet
} from 'lucide-react';
import { TeamParticipation, ParticipantMember, VolunteerLog } from '../App';
import { BulkTeamImportModal } from './BulkTeamImportModal';
import {
  saveTeamToFirestore,
  deleteTeamFromFirestore,
  bulkImportTeamsToFirestore,
  deleteAllTeamsFromFirestore
} from '../services/teamService';

interface TeamManagementProps {
  teamParticipations: TeamParticipation[];
  setTeamParticipations: React.Dispatch<React.SetStateAction<TeamParticipation[]>>;
  volunteers: VolunteerLog[];
  exportCSV: (data: any[], filename: string) => void;
}

const COMMON_SCHOOLS = [
  'Booni Degree College',
  'Pamir Public School & College',
  'Aga Khan Higher Secondary School Kuragh',
  'Government High School Booni',
  'Chitral Model College',
  'University of Chitral'
];

const CATEGORIES = [
  'AI & Robotics',
  'Climate & Smart Ag',
  'Water & Environment',
  'Software & Apps',
  'Community Logistics',
  'Creative Media',
  'Healthcare & First Aid'
];

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teamParticipations,
  setTeamParticipations,
  volunteers,
  exportCSV
}) => {
  // Navigation & View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // QR Code Cache
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamParticipation | null>(null);
  const [qrModalTeam, setQrModalTeam] = useState<TeamParticipation | null>(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<TeamParticipation | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamParticipation | null>(null);
  const [newMemberForm, setNewMemberForm] = useState<ParticipantMember>({
    name: '',
    role: 'Team Member',
    school: ''
  });
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Bulk Excel Import Callback
  const handleBulkImport = async (newTeams: TeamParticipation[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setTeamParticipations(newTeams);
    } else {
      setTeamParticipations(prev => [...newTeams, ...prev]);
    }

    try {
      await bulkImportTeamsToFirestore(newTeams, mode);
      showToast(
        mode === 'replace'
          ? `Saved to Firebase: Replaced team roster with ${newTeams.length} teams.`
          : `Saved to Firebase: Successfully added ${newTeams.length} new teams!`
      );
    } catch (err: any) {
      console.error('Firebase save error:', err);
      showToast(`Saved locally (Firebase sync pending: ${err.message || 'offline'})`);
    }
  };

  // Generate QR Codes for all teams
  useEffect(() => {
    teamParticipations.forEach(team => {
      if (!qrCodes[team.id]) {
        const payload = JSON.stringify({
          id: team.id,
          code: team.teamCode || team.id,
          name: team.projectName,
          leader: team.teamLeader,
          school: team.school || 'Collabs Event',
          event: 'First Mega Event of Collabs 2026'
        });
        QRCode.toDataURL(payload, { width: 320, margin: 2 }).then(url => {
          setQrCodes(prev => ({ ...prev, [team.id]: url }));
        }).catch(err => console.error("QR generation failed", err));
      }
    });
  }, [teamParticipations]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // WIZARD STATE (5 Steps)
  // Step 1: Basic Info (Name, Code, Category, Description)
  // Step 2: School & Location (School, Campus, Operating Room)
  // Step 3: Leadership (Team Leader, Co-Leader, Supervisor)
  // Step 4: Members (Search/select volunteers or custom member entry)
  // Step 5: Configuration & Live Review
  // ---------------------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState(1);
  const initialWizardData = {
    projectName: '',
    teamCode: '',
    category: CATEGORIES[0],
    projectDescription: '',
    school: COMMON_SCHOOLS[0],
    customSchool: '',
    campus: 'Main Campus',
    location: 'Lab Room 101',
    stallNumber: '',
    teamLeader: '',
    leaderEmail: '',
    coLeader: '',
    capacity: 5,
    status: 'Approved' as 'Approved' | 'Pending',
    members: [] as ParticipantMember[]
  };

  const [wizardData, setWizardData] = useState(initialWizardData);
  const [wizardErrors, setWizardErrors] = useState<Record<string, string>>({});

  // Temporary member inputs inside step 4
  const [manualMember, setManualMember] = useState({
    name: '',
    role: 'Team Specialist',
    email: '',
    school: ''
  });
  const [volunteerSearch, setVolunteerSearch] = useState('');

  // Open Wizard
  const handleOpenWizard = () => {
    const nextNum = teamParticipations.length + 1;
    setWizardData({
      ...initialWizardData,
      teamCode: `CLB-TEAM-${String(nextNum).padStart(2, '0')}`,
      members: []
    });
    setWizardStep(1);
    setWizardErrors({});
    setIsWizardOpen(true);
  };

  // Validate current step
  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!wizardData.projectName.trim()) {
        errors.projectName = 'Team / Project name is required.';
      } else if (wizardData.projectName.trim().length < 3) {
        errors.projectName = 'Team name must be at least 3 characters.';
      }

      if (!wizardData.teamCode.trim()) {
        errors.teamCode = 'Team code is required.';
      } else {
        const isDupCode = teamParticipations.some(
          t => t.teamCode?.toLowerCase() === wizardData.teamCode.trim().toLowerCase()
        );
        if (isDupCode) {
          errors.teamCode = 'This team code is already in use.';
        }
      }
    }

    if (step === 2) {
      if (wizardData.school === 'Other' && !wizardData.customSchool.trim()) {
        errors.customSchool = 'Please specify the school / institution name.';
      }
    }

    if (step === 3) {
      if (!wizardData.teamLeader.trim()) {
        errors.teamLeader = 'Team Leader name is required.';
      }
    }

    if (step === 4) {
      if (wizardData.members.length === 0) {
        errors.members = 'Please add at least 1 team member or leader into the roster.';
      }
    }

    setWizardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Next Step
  const handleNextStep = () => {
    if (validateStep(wizardStep)) {
      setWizardStep(prev => Math.min(5, prev + 1));
    }
  };

  // Previous Step
  const handlePrevStep = () => {
    setWizardStep(prev => Math.max(1, prev - 1));
  };

  // Add a volunteer to team members in step 4
  const handleAddVolunteerToTeam = (vol: VolunteerLog) => {
    if (wizardData.members.some(m => m.name.toLowerCase() === vol.name.toLowerCase())) {
      return; // Already added
    }
    const newMember: ParticipantMember = {
      name: vol.name,
      role: vol.role || `${vol.department} Specialist`,
      email: vol.email || `${vol.username}@collabs.org`,
      school: vol.school || wizardData.school,
      volunteerId: vol.id
    };
    setWizardData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  // Add manual member in step 4
  const handleAddManualMember = () => {
    if (!manualMember.name.trim()) return;
    const newMember: ParticipantMember = {
      name: manualMember.name.trim(),
      role: manualMember.role.trim() || 'Contributor',
      email: manualMember.email.trim() || 'team.member@collabs.org',
      school: manualMember.school.trim() || wizardData.school
    };
    setWizardData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    setManualMember({ name: '', role: 'Team Specialist', email: '', school: '' });
  };

  // Remove member from wizard roster
  const handleRemoveMember = (idx: number) => {
    setWizardData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx)
    }));
  };

  // Final Submit Wizard
  const handleFinishWizard = () => {
    if (!validateStep(1) || !validateStep(3) || !validateStep(4)) {
      setWizardStep(1);
      return;
    }

    const targetSchool = wizardData.school === 'Other' ? wizardData.customSchool.trim() : wizardData.school;
    const newTeamId = `tp-${Date.now().toString().slice(-4)}`;

    const newTeam: TeamParticipation = {
      id: newTeamId,
      teamCode: wizardData.teamCode.trim().toUpperCase(),
      projectName: wizardData.projectName.trim(),
      category: wizardData.category,
      projectDescription: wizardData.projectDescription.trim() || `Innovative project by ${wizardData.projectName} for Booni Mega Event.`,
      school: targetSchool,
      campus: wizardData.campus.trim(),
      location: wizardData.location.trim(),
      stallNumber: wizardData.stallNumber.trim() || undefined,
      teamLeader: wizardData.teamLeader.trim(),
      coLeader: wizardData.coLeader.trim() || undefined,
      capacity: Number(wizardData.capacity) || 5,
      status: wizardData.status,
      members: wizardData.members,
      award: 'Participation',
      createdAt: 'Oct 2026'
    };

    setTeamParticipations(prev => [newTeam, ...prev]);
    setIsWizardOpen(false);
    showToast(`Team "${newTeam.projectName}" (${newTeam.teamCode}) created!`);

    saveTeamToFirestore(newTeam).catch(err => {
      console.error('Error saving team to Firestore:', err);
    });
  };

  // Filter & Search Logic
  const filteredTeams = useMemo(() => {
    return teamParticipations.filter(team => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        team.projectName.toLowerCase().includes(q) ||
        (team.teamCode && team.teamCode.toLowerCase().includes(q)) ||
        team.teamLeader.toLowerCase().includes(q) ||
        (team.school && team.school.toLowerCase().includes(q)) ||
        (team.category && team.category.toLowerCase().includes(q)) ||
        (team.projectDescription && team.projectDescription.toLowerCase().includes(q));

      const matchesSchool = schoolFilter === 'All' || team.school === schoolFilter;
      const matchesCategory = categoryFilter === 'All' || team.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || team.status === statusFilter;

      return matchesSearch && matchesSchool && matchesCategory && matchesStatus;
    });
  }, [teamParticipations, searchQuery, schoolFilter, categoryFilter, statusFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = teamParticipations.length;
    const approved = teamParticipations.filter(t => t.status === 'Approved').length;
    const totalMembers = teamParticipations.reduce((acc, t) => acc + (t.members?.length || 0), 0);
    const uniqueSchools = new Set(teamParticipations.map(t => t.school).filter(Boolean)).size;
    return { total, approved, totalMembers, uniqueSchools };
  }, [teamParticipations]);

  // Dynamic available schools
  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    COMMON_SCHOOLS.forEach(s => set.add(s));
    teamParticipations.forEach(t => {
      if (t.school) set.add(t.school);
    });
    return Array.from(set);
  }, [teamParticipations]);

  // Export Teams CSV
  const handleExportTeams = () => {
    const data = filteredTeams.map(t => ({
      ID: t.id,
      TeamCode: t.teamCode || t.id,
      ProjectName: t.projectName,
      Category: t.category || 'General',
      School: t.school || 'Unassigned',
      Campus: t.campus || 'Main',
      StallNumber: t.stallNumber || 'Assigned',
      Location: t.location || 'TBA',
      Leader: t.teamLeader,
      CoLeader: t.coLeader || 'None',
      MemberCount: t.members?.length || 0,
      Status: t.status,
      Award: t.award || 'None',
      Description: t.projectDescription
    }));
    exportCSV(data, `teams_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Delete Team
  const handleDeleteTeam = () => {
    if (!deleteConfirmTeam) return;
    const target = deleteConfirmTeam;
    setTeamParticipations(prev => prev.filter(t => t.id !== target.id));
    if (selectedTeam?.id === target.id) setSelectedTeam(null);
    showToast(`Removed team "${target.projectName}".`);
    setDeleteConfirmTeam(null);

    deleteTeamFromFirestore(target.id).catch(err => {
      console.error('Error deleting team from Firestore:', err);
    });
  };

  // Delete All Teams in a single action
  const handleDeleteAllTeams = async () => {
    setIsDeletingAll(true);
    try {
      setTeamParticipations([]);
      setSelectedTeam(null);
      setDeleteConfirmTeam(null);
      setQrCodes({});

      await deleteAllTeamsFromFirestore();

      showToast('All participating teams have been completely deleted.');
      setIsDeleteAllModalOpen(false);
    } catch (err: any) {
      console.error('Error deleting all teams:', err);
      showToast(`Removed teams locally (Sync notice: ${err?.message || 'offline'})`);
      setIsDeleteAllModalOpen(false);
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Download QR Code
  const downloadQRCode = (team: TeamParticipation) => {
    const dataUrl = qrCodes[team.id];
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QR_${team.teamCode || team.id}_${team.projectName.replace(/\s+/g, '_')}.png`;
    link.click();
    showToast(`Downloaded QR badge for ${team.projectName}`);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 animate-fadeIn text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-600 mb-1">Total Teams</div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{stats.total}</div>
          <div className="text-[11px] text-slate-600 mt-1">Registered innovation units</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-600 mb-1">Approved & Verified</div>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">{stats.approved}</div>
          <div className="text-[11px] text-slate-600 mt-1">Confirmed for Booni Exhibition</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-600 mb-1">Active Members</div>
          <div className="text-2xl font-black text-blue-600 font-mono tabular-nums">{stats.totalMembers}</div>
          <div className="text-[11px] text-slate-600 mt-1">Students and innovators</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-600 mb-1">Participating Schools</div>
          <div className="text-2xl font-black text-purple-600 font-mono tabular-nums">{stats.uniqueSchools}</div>
          <div className="text-[11px] text-slate-600 mt-1">Institutional partners</div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Module Header & Action Toolbar */}
        <div className="p-6 md:p-8 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Collaborative Units & Schools
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-heading">Team Directory & Management</h2>
              <p className="text-xs text-slate-500 mt-1">
                Organize school-specific innovation teams, track leadership responsibilities, and generate event QR badges.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(true)}
                disabled={teamParticipations.length === 0}
                className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 ${
                  teamParticipations.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 hover:border-red-400'
                }`}
                title={teamParticipations.length === 0 ? 'No teams to delete' : `Delete all ${teamParticipations.length} teams in a single click`}
              >
                <Trash2 size={15} className={teamParticipations.length === 0 ? 'text-slate-400' : 'text-red-600'} /> Delete All Teams ({teamParticipations.length})
              </button>

              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                title="Upload .xlsx, .xls, or .csv spreadsheet to add teams in bulk"
              >
                <FileSpreadsheet size={15} className="text-emerald-600" /> Bulk Excel Import
              </button>

              <button
                onClick={handleExportTeams}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-slate-200/80"
              >
                <Download size={15} /> Export CSV ({filteredTeams.length})
              </button>

              <button
                onClick={handleOpenWizard}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus size={16} /> Create Team (Wizard)
              </button>
            </div>
          </div>

          {/* Filtering, Search & View Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search teams by project name, code, leader, school..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* School Filter */}
            <div className="lg:col-span-3">
              <div className="relative">
                <select
                  value={schoolFilter}
                  onChange={e => setSchoolFilter(e.target.value)}
                  className="w-full py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="All">All Schools & Colleges</option>
                  {availableSchools.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Building2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-2">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Layers size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* View Toggle */}
            <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: VISUAL CARD GRID */}
        {/* ========================================================================= */}
        {viewMode === 'grid' ? (
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.length > 0 ? (
                filteredTeams.map(team => {
                  const qr = qrCodes[team.id];
                  return (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className="bg-slate-50/60 rounded-3xl p-6 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        {/* Top Metadata Row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                              {team.teamCode || team.id}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              {team.category || 'Innovation Sprint'}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              team.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {team.status}
                          </span>
                        </div>

                        {/* Team Title & School */}
                        <h3 className="font-heading font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                          {team.projectName}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{team.school || 'Collabs Central Organization'}</span>
                        </div>

                        <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed">
                          {team.projectDescription}
                        </p>

                        {/* Roster & Leader Details */}
                        <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Team Leader:</span>
                            <span className="font-bold text-slate-900">{team.teamLeader}</span>
                          </div>

                          {team.location && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 flex items-center gap-1">
                                <MapPin size={11} className="text-slate-400" /> Station:
                              </span>
                              <span className="text-slate-700 font-medium">{team.location}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-500">Enrolled Members:</span>
                            <span className="font-mono font-bold text-blue-600">
                              {team.members?.length || 0} / {team.capacity || 5}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom QR & Actions */}
                      <div
                        className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-3">
                          {qr ? (
                            <img
                              src={qr}
                              alt="QR"
                              className="w-12 h-12 rounded-xl border border-slate-200 bg-white p-1 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setQrModalTeam(team)}
                              title="Click to view full QR Badge"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                              <QrIcon size={18} />
                            </div>
                          )}
                          <div className="text-[11px]">
                            <button
                              onClick={() => setQrModalTeam(team)}
                              className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <QrIcon size={12} /> Check-in QR
                            </button>
                            <span className="text-slate-400 text-[10px] block">For Booni Check-in</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTeam(team)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                            title="View Full Team Profile"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setEditingTeam(team)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                            title="Edit Team Details & Members"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTeam(team)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                            title="Delete Team"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 py-12 text-center text-slate-500">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <Users size={22} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No teams found</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try clearing your search query or launch the creation wizard.
                  </p>
                  <button
                    onClick={handleOpenWizard}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    + Launch Team Creation Wizard
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: DATA TABLE VIEW */
          /* ========================================================================= */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Team Identity & Code</th>
                  <th className="py-4 px-6">School / Institution</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Leadership</th>
                  <th className="py-4 px-6 text-center">Members</th>
                  <th className="py-4 px-6 text-center">QR Code</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTeams.map(team => (
                  <tr
                    key={team.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedTeam(team)}
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{team.projectName}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {team.teamCode || team.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{team.projectDescription}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{team.school || 'Collabs Central Organization'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4">{team.campus || 'Upper Chitral'}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-800">{team.category || 'Innovation Sprint'}</span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{team.teamLeader}</div>
                      {team.supervisor && (
                        <div className="text-[11px] text-slate-500">Adv: {team.supervisor}</div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center font-mono font-bold">
                      {team.members?.length || 0} / {team.capacity || 5}
                    </td>

                    <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                      {qrCodes[team.id] ? (
                        <button
                          onClick={() => setQrModalTeam(team)}
                          className="p-1 hover:bg-slate-100 rounded-lg inline-block transition-colors"
                          title="View QR Badge"
                        >
                          <img src={qrCodes[team.id]} alt="QR" className="w-8 h-8 rounded border" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">...</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          team.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {team.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingTeam(team)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                          title="Edit Details & Members"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmTeam(team)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Delete Team"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MULTI-STEP TEAM CREATION WIZARD MODAL */}
      {/* ========================================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-fadeIn text-left flex flex-col max-h-[90vh]">
            {/* Wizard Header & Step Indicator */}
            <div className="pb-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Step {wizardStep} of 5
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-heading">
                    {wizardStep === 1 && 'Step 1: Team Identity & Concept'}
                    {wizardStep === 2 && 'Step 2: School & Institutional Location'}
                    {wizardStep === 3 && 'Step 3: Leadership & Supervision'}
                    {wizardStep === 4 && 'Step 4: Member Selection & Roles'}
                    {wizardStep === 5 && 'Step 5: Review & Confirm Team'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Step Progress Tracker */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, label: 'Identity' },
                  { step: 2, label: 'School' },
                  { step: 3, label: 'Leaders' },
                  { step: 4, label: 'Members' },
                  { step: 5, label: 'Review' }
                ].map(item => (
                  <div key={item.step} className="space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        wizardStep >= item.step ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    ></div>
                    <span
                      className={`text-[10px] font-bold block truncate ${
                        wizardStep >= item.step ? 'text-blue-700' : 'text-slate-400'
                      }`}
                    >
                      {item.step}. {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Body Scrollable Area */}
            <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-4">
              {/* STEP 1: Basic Info */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Team / Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Glacier Flood Monitoring Squad"
                      value={wizardData.projectName}
                      onChange={e => setWizardData({ ...wizardData, projectName: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                    {wizardErrors.projectName && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{wizardErrors.projectName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Unique Team Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="CLB-TEAM-04"
                        value={wizardData.teamCode}
                        onChange={e => setWizardData({ ...wizardData, teamCode: e.target.value.toUpperCase() })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                      {wizardErrors.teamCode && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{wizardErrors.teamCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category / Domain</label>
                      <select
                        value={wizardData.category}
                        onChange={e => setWizardData({ ...wizardData, category: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project Objective & Mission
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what real community problem this student team is tackling for the Booni exhibition..."
                      value={wizardData.projectDescription}
                      onChange={e => setWizardData({ ...wizardData, projectDescription: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: School Selection */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Partner School / Institution <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={wizardData.school}
                      onChange={e => setWizardData({ ...wizardData, school: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                    >
                      {COMMON_SCHOOLS.map(sc => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                      <option value="Other">Other / Custom School...</option>
                    </select>

                    {wizardData.school === 'Other' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Enter School or College Name"
                          value={wizardData.customSchool}
                          onChange={e => setWizardData({ ...wizardData, customSchool: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                        {wizardErrors.customSchool && (
                          <p className="text-[11px] text-red-600 font-medium mt-1">{wizardErrors.customSchool}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Campus or Branch</label>
                      <input
                        type="text"
                        placeholder="e.g. Science Block / Main Campus"
                        value={wizardData.campus}
                        onChange={e => setWizardData({ ...wizardData, campus: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Operating Room / Station
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lab 2 / Exhibition Stall 14"
                        value={wizardData.location}
                        onChange={e => setWizardData({ ...wizardData, location: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
                    <Building2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      All members assigned to this team will inherit this institutional affiliation for official certificates and exhibition badge generation.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Leadership Assignment */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  {/* Team Leader Input with Quick Volunteer Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Team Leader Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rostova or select below"
                      value={wizardData.teamLeader}
                      onChange={e => setWizardData({ ...wizardData, teamLeader: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                    {wizardErrors.teamLeader && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{wizardErrors.teamLeader}</p>
                    )}

                    {/* Quick Pick From Registered Volunteers */}
                    <div className="mt-2 text-xs">
                      <span className="text-slate-500 text-[11px]">Or pick from available volunteers:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-24 overflow-y-auto">
                        {volunteers.map(vol => (
                          <button
                            key={vol.id}
                            type="button"
                            onClick={() => {
                              setWizardData({
                                ...wizardData,
                                teamLeader: vol.name,
                                leaderEmail: vol.email || ''
                              });
                              // Also auto-add to members if not already
                              handleAddVolunteerToTeam(vol);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer border border-slate-200"
                          >
                            + {vol.name} ({vol.id})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Co-Leader (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Jordan Hayes"
                        value={wizardData.coLeader}
                        onChange={e => setWizardData({ ...wizardData, coLeader: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Assigned Stall Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Stall #14"
                        value={wizardData.stallNumber}
                        onChange={e => setWizardData({ ...wizardData, stallNumber: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Member Selection */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  {wizardErrors.members && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                      {wizardErrors.members}
                    </div>
                  )}

                  {/* Pick from Volunteers Directory */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        Select From Volunteer Pool ({volunteers.length})
                      </span>
                      <input
                        type="text"
                        placeholder="Filter volunteers..."
                        value={volunteerSearch}
                        onChange={e => setVolunteerSearch(e.target.value)}
                        className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs w-44"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {volunteers
                        .filter(v => !volunteerSearch || v.name.toLowerCase().includes(volunteerSearch.toLowerCase()))
                        .map(vol => {
                          const isAlreadyAdded = wizardData.members.some(
                            m => m.name.toLowerCase() === vol.name.toLowerCase()
                          );
                          return (
                            <div
                              key={vol.id}
                              className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                isAlreadyAdded
                                  ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <div className="font-bold">{vol.name}</div>
                                <div className="text-[10px] text-slate-500">
                                  {vol.school || 'Collabs'} · {vol.department}
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={isAlreadyAdded}
                                onClick={() => handleAddVolunteerToTeam(vol)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
                                  isAlreadyAdded
                                    ? 'bg-blue-600 text-white cursor-default'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                              >
                                {isAlreadyAdded ? 'Added' : '+ Add'}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Or Manual Custom Member Input */}
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-slate-700">Add External / Custom Student Member</div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Member Full Name"
                        value={manualMember.name}
                        onChange={e => setManualMember({ ...manualMember, name: e.target.value })}
                        className="p-2 bg-slate-50 border rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Specific Role (e.g. Lead Dev)"
                        value={manualMember.role}
                        onChange={e => setManualMember({ ...manualMember, role: e.target.value })}
                        className="p-2 bg-slate-50 border rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualMember}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg px-3 py-2 cursor-pointer"
                      >
                        + Add Member
                      </button>
                    </div>
                  </div>

                  {/* Selected Roster Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Selected Team Roster ({wizardData.members.length} members)</span>
                      <span className="font-mono text-blue-600">Max Capacity: {wizardData.capacity}</span>
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {wizardData.members.map((mem, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900">{mem.name}</span>
                              <span className="text-[11px] text-slate-500 ml-2">({mem.role})</span>
                              {mem.school && (
                                <span className="text-[10px] text-slate-400 block">{mem.school}</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove member"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Configuration & Live Summary Review */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Max Team Capacity</label>
                      <input
                        type="number"
                        min="2"
                        max="12"
                        value={wizardData.capacity}
                        onChange={e => setWizardData({ ...wizardData, capacity: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Initial Approval Status</label>
                      <select
                        value={wizardData.status}
                        onChange={e => setWizardData({ ...wizardData, status: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs cursor-pointer"
                      >
                        <option value="Approved">Approved (Ready for Exhibition)</option>
                        <option value="Pending">Pending Review</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Team Card Preview */}
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Live Exhibition Badge Preview:
                    </span>
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                            {wizardData.teamCode || 'CLB-TEAM-XX'}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">{wizardData.category}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {wizardData.status}
                        </span>
                      </div>

                      <h4 className="font-heading font-black text-xl text-slate-900">
                        {wizardData.projectName || 'Project Title Preview'}
                      </h4>

                      <div className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                        <Building2 size={13} className="text-blue-600" />
                        <span>
                          {wizardData.school === 'Other' ? wizardData.customSchool : wizardData.school} ·{' '}
                          {wizardData.campus}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Designated Leader:</span>
                          <span className="font-bold text-slate-900">{wizardData.teamLeader || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Operating Station:</span>
                          <span className="text-slate-700">{wizardData.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Confirmed Members:</span>
                          <span className="font-bold text-blue-600 font-mono">
                            {wizardData.members.length} of {wizardData.capacity} spots
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {wizardStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  Continue to Step {wizardStep + 1} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check size={16} /> Create Team & Generate QR
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TEAM PROFILE / MEMBER DETAILS DRAWER */}
      {/* ========================================================================= */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-fadeIn text-left space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {selectedTeam.teamCode || selectedTeam.id}
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-heading mt-1">
                  {selectedTeam.projectName}
                </h3>
                <p className="text-xs text-slate-500">{selectedTeam.category || 'Innovation Sprint'}</p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Affiliated School</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedTeam.school || 'Collabs Central'}</div>
                <div className="text-[10px] text-slate-400">{selectedTeam.campus || 'Main Campus'}</div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200/80">
                <div className="text-[11px] text-indigo-700 font-extrabold uppercase flex items-center justify-between">
                  <span>Stall Number</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold">CONFIRMED</span>
                </div>
                <div className="font-heading font-black text-slate-900 mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-indigo-600 shrink-0" />
                  <span>{selectedTeam.stallNumber || (selectedTeam.teamCode?.match(/-(\d+)$/) ? `Stall #${selectedTeam.teamCode.match(/-(\d+)$/)?.[1]}` : (selectedTeam.location?.match(/stall\s*#?\s*([a-zA-Z0-9-]+)/i) ? `Stall #${selectedTeam.location.match(/stall\s*#?\s*([a-zA-Z0-9-]+)/i)?.[1]}` : 'Stall Assigned'))}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{selectedTeam.location || 'Booni Exhibition Ground'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Team Leader</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedTeam.teamLeader}</div>
                {selectedTeam.coLeader && (
                  <div className="text-[10px] text-slate-500">Co-Lead: {selectedTeam.coLeader}</div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Award & Status</div>
                <div className="font-bold text-slate-900 mt-0.5">{selectedTeam.status}</div>
                <div className="text-[10px] text-amber-600 font-semibold">{selectedTeam.award || 'Participation'}</div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Mission Description</div>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                {selectedTeam.projectDescription}
              </p>
            </div>

            {/* Members Roster */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Enrolled Team Members ({selectedTeam.members?.length || 0})
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedTeam.members?.map((mem, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{mem.name}</span>
                      <span className="text-[11px] text-slate-500 ml-2">· {mem.role}</span>
                      {mem.school && <span className="text-[10px] text-slate-400 block">{mem.school}</span>}
                    </div>
                    {mem.email && <span className="text-[10px] text-slate-400 font-mono">{mem.email}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* QR Download & Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedTeam(null);
                  setQrModalTeam(selectedTeam);
                }}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <QrIcon size={14} /> Open Check-in Badge
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingTeam(selectedTeam);
                    setSelectedTeam(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Edit3 size={14} /> Edit Details & Members
                </button>

                <button
                  onClick={() => setSelectedTeam(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE BADGE DISPLAY & DOWNLOAD */}
      {/* ========================================================================= */}
      {qrModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {qrModalTeam.teamCode || qrModalTeam.id}
              </span>
              <button
                onClick={() => setQrModalTeam(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">{qrModalTeam.projectName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{qrModalTeam.school}</p>
            </div>

            {qrCodes[qrModalTeam.id] && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-inner inline-block mx-auto">
                <img
                  src={qrCodes[qrModalTeam.id]}
                  alt="Team QR Code"
                  className="w-56 h-56 object-contain rounded-lg"
                />
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div>
                Leader: <strong>{qrModalTeam.teamLeader}</strong>
              </div>
              <div>
                Location: <strong>{qrModalTeam.location || 'Booni Venue'}</strong>
              </div>
              <div className="text-[10px] text-slate-400">
                Authorized for on-ground exhibition entry & attendance verification
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => downloadQRCode(qrModalTeam)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Download size={15} /> Download PNG Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT TEAM DETAILS & MEMBER ROSTER */}
      {/* ========================================================================= */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-fadeIn text-left space-y-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  Admin Edit Mode
                </span>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  Edit Team Details & Members
                </h3>
                <p className="text-xs text-slate-500">Update project name, category, leader, school, stall number, and member roster.</p>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <div className="space-y-5 overflow-y-auto pr-1 flex-1">
              {/* Project Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project / Team Name *</label>
                  <input
                    type="text"
                    value={editingTeam.projectName}
                    onChange={e => setEditingTeam({ ...editingTeam, projectName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Team Code</label>
                  <input
                    type="text"
                    value={editingTeam.teamCode || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, teamCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category & School */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingTeam.category || 'Computer Science'}
                    onChange={e => setEditingTeam({ ...editingTeam, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Art">Art</option>
                    <option value="Food">Food</option>
                    <option value="AI & Robotics">AI & Robotics</option>
                    <option value="Climate & Smart Ag">Climate & Smart Ag</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution</label>
                  <input
                    type="text"
                    value={editingTeam.school || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, school: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Leader & Co-Leader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Team Leader *</label>
                  <input
                    type="text"
                    value={editingTeam.teamLeader}
                    onChange={e => setEditingTeam({ ...editingTeam, teamLeader: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Co-Leader / Supervisor</label>
                  <input
                    type="text"
                    value={editingTeam.coLeader || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, coLeader: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    placeholder="Optional co-leader"
                  />
                </div>
              </div>

              {/* Stall & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stall Number</label>
                  <input
                    type="text"
                    value={editingTeam.stallNumber || ''}
                    onChange={e => setEditingTeam({ ...editingTeam, stallNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                    placeholder="e.g. 01, 15, Stall #25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingTeam.status}
                    onChange={e => setEditingTeam({ ...editingTeam, status: e.target.value as 'Approved' | 'Pending' | 'Rejected' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Description / Summary</label>
                <textarea
                  rows={3}
                  value={editingTeam.projectDescription}
                  onChange={e => setEditingTeam({ ...editingTeam, projectDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed"
                ></textarea>
              </div>

              {/* Member Roster Editing Section */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-blue-600" />
                    <span>Team Members Roster ({editingTeam.members?.length || 0})</span>
                  </span>
                </div>

                {/* Member List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editingTeam.members && editingTeam.members.length > 0 ? (
                    editingTeam.members.map((mem, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 truncate">{mem.name}</div>
                          <div className="text-[11px] text-slate-500">{mem.role} {mem.school ? `· ${mem.school}` : ''}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedMembers = editingTeam.members.filter((_, i) => i !== idx);
                            setEditingTeam({ ...editingTeam, members: updatedMembers });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                      No extra team members added yet. Use the form below to add members.
                    </p>
                  )}
                </div>

                {/* Add New Member Input Subform */}
                <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-2.5">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                    + Add Member To Roster
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Member Name *"
                      value={newMemberForm.name}
                      onChange={e => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Developer, Artist)"
                      value={newMemberForm.role}
                      onChange={e => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="School / Institution"
                      value={newMemberForm.school || editingTeam.school || ''}
                      onChange={e => setNewMemberForm({ ...newMemberForm, school: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMemberForm.name.trim()) return;
                      const newMem: ParticipantMember = {
                        name: newMemberForm.name.trim(),
                        role: newMemberForm.role.trim() || 'Team Member',
                        school: newMemberForm.school?.trim() || editingTeam.school || ''
                      };
                      setEditingTeam({
                        ...editingTeam,
                        members: [...(editingTeam.members || []), newMem]
                      });
                      setNewMemberForm({ name: '', role: 'Team Member', school: '' });
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus size={14} /> Add Member to Team
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingTeam.projectName.trim() || !editingTeam.teamLeader.trim()) {
                    showToast('Project Name and Team Leader are required.');
                    return;
                  }
                  const updated = {
                    ...editingTeam,
                    projectName: editingTeam.projectName.trim(),
                    teamLeader: editingTeam.teamLeader.trim()
                  };
                  setTeamParticipations(prev => prev.map(t => (t.id === updated.id ? updated : t)));
                  saveTeamToFirestore(updated).catch(err => {
                    console.error('Error saving updated team to Firestore:', err);
                  });
                  showToast(`Updated details & members for "${updated.projectName}"!`);
                  setEditingTeam(null);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirmTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Team Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-900">{deleteConfirmTeam.projectName}</strong>? This will remove all associated member roster records from the exhibition.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTeam(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Yes, Remove Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE ALL TEAMS CONFIRMATION */}
      {/* ========================================================================= */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-fadeIn text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-heading">Delete All {teamParticipations.length} Teams?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This will permanently delete <strong>all {teamParticipations.length} registered innovation teams</strong> from the event roster and cloud storage.
              </p>
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 font-medium text-left flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span>You can restore or upload new teams at any time using the <strong>Bulk Excel Import</strong> button.</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                disabled={isDeletingAll}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllTeams}
                disabled={isDeletingAll}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {isDeletingAll ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Delete All Teams
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK EXCEL SPREADSHEET IMPORT */}
      {/* ========================================================================= */}
      <BulkTeamImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
        existingTeamsCount={teamParticipations.length}
      />
    </div>
  );
};
