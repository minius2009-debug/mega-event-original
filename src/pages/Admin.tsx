import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  Settings,
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  MapPin,
  Building2,
  ListTodo,
  QrCode as QrIcon,
  Activity,
  FileText,
  ExternalLink,
  Camera,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Eye,
  X,
  ChevronRight,
  Shield,
  Layers,
  Megaphone,
  Check,
  Copy,
  Printer,
  Sliders,
  Share2,
  Radio
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TeamManagement } from '../components/TeamManagement';
import { VolunteerManagement } from '../components/VolunteerManagement';
import { TeamParticipation, VolunteerLog, EventItem } from '../App';
import officialLogo from '../assets/images/logo2.png';

interface CertificateRecord {
  id: string;
  recipientName: string;
  achievementType: 'Excellence' | 'Volunteer Leadership' | 'Active Participation';
  eventName: string;
  issueDate: string;
  verified: boolean;
  issuer: string;
  school?: string;
}

interface OperationalTask {
  id: string;
  title: string;
  department: 'Technical' | 'Logistics' | 'Operations' | 'Media' | 'Outreach';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignee: string;
  deadline: string;
}

interface AuditItem {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  type: 'team' | 'volunteer' | 'certificate' | 'task' | 'system' | 'checkin';
}

interface AdminPageProps {
  teamParticipations: TeamParticipation[];
  setTeamParticipations: React.Dispatch<React.SetStateAction<TeamParticipation[]>>;
  volunteers: VolunteerLog[];
  setVolunteers: React.Dispatch<React.SetStateAction<VolunteerLog[]>>;
  certDatabase: CertificateRecord[];
  setCertDatabase: React.Dispatch<React.SetStateAction<CertificateRecord[]>>;
  events?: EventItem[];
  setEvents?: React.Dispatch<React.SetStateAction<EventItem[]>>;
  handleVolunteerSubmit?: any;
  handleGenerateCertificate?: any;
}

const COMMON_SCHOOLS = [
  'Booni Degree College',
  'Pamir Public School & College',
  'Aga Khan Higher Secondary School Kuragh',
  'Government High School Booni',
  'Chitral Model College',
  'University of Chitral'
];

const INITIAL_TASKS: OperationalTask[] = [
  {
    id: 'tsk-1',
    title: 'Finalize Stage Audio & Presentation Screen Setup at Booni Venue',
    department: 'Technical',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Aarish Salik (IT Lead)',
    deadline: '30 Oct 2026'
  },
  {
    id: 'tsk-2',
    title: 'Print participant QR badges and lanyard credentials',
    department: 'Logistics',
    priority: 'High',
    status: 'Pending',
    assignee: 'Zeeshan (Event Manager)',
    deadline: '29 Oct 2026'
  },
  {
    id: 'tsk-3',
    title: 'Distribute volunteer track duty rosters and briefing pack',
    department: 'Operations',
    priority: 'Medium',
    status: 'Completed',
    assignee: 'Elena Rostova (Lead Volunteer)',
    deadline: '25 Oct 2026'
  },
  {
    id: 'tsk-4',
    title: 'Arrange guest transportation and reception logistics',
    department: 'Logistics',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Shahan (Relations)',
    deadline: '30 Oct 2026'
  },
  {
    id: 'tsk-5',
    title: 'Setup Media & Photography Interview backdrop for teams',
    department: 'Media',
    priority: 'Medium',
    status: 'Pending',
    assignee: 'Ayan Afzal (Media Lead)',
    deadline: '30 Oct 2026'
  }
];

const INITIAL_AUDIT_LOGS: AuditItem[] = [
  {
    id: 'aud-1',
    actor: 'Admin (Syed Farhan)',
    action: 'Approved Team Registration',
    entity: 'Smart Irrigation Booni (CLB-TEAM-01)',
    timestamp: 'Today at 09:20 AM',
    type: 'team'
  },
  {
    id: 'aud-2',
    actor: 'Admin (Umme Kulsoom)',
    action: 'Issued Official Certificate',
    entity: 'Elena Rostova (CLB-2026-892)',
    timestamp: 'Today at 08:45 AM',
    type: 'certificate'
  },
  {
    id: 'aud-3',
    actor: 'System Coordinator',
    action: 'Registered Volunteer Personnel',
    entity: 'Marcus Vance · Logistics',
    timestamp: 'Yesterday at 04:15 PM',
    type: 'volunteer'
  },
  {
    id: 'aud-4',
    actor: 'Operations Desk',
    action: 'Updated Task Execution Status',
    entity: 'Distribute volunteer track duty rosters -> Completed',
    timestamp: 'Yesterday at 02:00 PM',
    type: 'task'
  }
];

export const AdminPage: React.FC<AdminPageProps> = ({
  teamParticipations,
  setTeamParticipations,
  volunteers,
  setVolunteers,
  certDatabase,
  setCertDatabase,
  events = [],
  setEvents
}) => {
  const navigate = useNavigate();

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Global Search State across admin
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Operational Tasks State
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
  const [taskFilter, setTaskFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    department: 'Operations' as OperationalTask['department'],
    priority: 'High' as OperationalTask['priority'],
    assignee: '',
    deadline: '30 Oct 2026'
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>(INITIAL_AUDIT_LOGS);

  // System Settings State
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emergencyBanner, setEmergencyBanner] = useState(false);
  const [emergencyBannerText, setEmergencyBannerText] = useState(
    'Notice: Booni Mega Event venue layout updated. All teams please view assigned stations in Team Directory.'
  );

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add an audit log helper
  const addAuditLog = (action: string, entity: string, type: AuditItem['type']) => {
    const newLog: AuditItem = {
      id: `aud-${Date.now()}`,
      actor: 'System Administrator',
      action,
      entity,
      timestamp: 'Just now',
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Export CSV Helper
  const exportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      showToast('No records available to export.');
      return;
    }
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(h => {
            const val = row[h] === undefined || row[h] === null ? '' : String(row[h]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename} successfully.`);
    addAuditLog(`Exported dataset`, filename, 'system');
  };

  // ---------------------------------------------------------------------------
  // CERTIFICATES MANAGEMENT STATE
  // ---------------------------------------------------------------------------
  const [certSearch, setCertSearch] = useState('');
  const [certFilterType, setCertFilterType] = useState('All');
  const [isIssueCertModalOpen, setIsIssueCertModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [previewCertQr, setPreviewCertQr] = useState<string>('');

  const [newCertForm, setNewCertForm] = useState({
    recipientName: '',
    achievementType: 'Excellence' as CertificateRecord['achievementType'],
    eventName: 'First Mega Event of Collabs',
    school: COMMON_SCHOOLS[0],
    issueDate: '31 October 2026',
    issuer: 'Collabs Executive Board'
  });

  // Certificate generation handler
  const handleIssueCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertForm.recipientName.trim()) return;

    const newId = `CLB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: CertificateRecord = {
      id: newId,
      recipientName: newCertForm.recipientName.trim(),
      achievementType: newCertForm.achievementType,
      eventName: newCertForm.eventName.trim(),
      issueDate: newCertForm.issueDate,
      school: newCertForm.school,
      verified: true,
      issuer: newCertForm.issuer
    };

    setCertDatabase(prev => [newRecord, ...prev]);
    setIsIssueCertModalOpen(false);
    showToast(`Certificate ${newId} issued for ${newRecord.recipientName}!`);
    addAuditLog(`Issued certificate (${newId})`, newRecord.recipientName, 'certificate');

    // Auto open preview
    setPreviewCert(newRecord);
  };

  // Generate QR for active preview certificate
  useEffect(() => {
    if (previewCert) {
      const verifyUrl = `${window.location.origin}/?verify=${previewCert.id}`;
      QRCode.toDataURL(verifyUrl, { width: 240, margin: 1 }).then(setPreviewCertQr);
    }
  }, [previewCert]);

  // ---------------------------------------------------------------------------
  // EVENT SCHEDULE MANAGEMENT STATE
  // ---------------------------------------------------------------------------
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    category: 'Workshops' as EventItem['category'],
    date: '31 October 2026',
    time: '02:00 PM – 03:30 PM PKT',
    venue: 'Main Innovation Arena, Booni',
    description: 'Hands-on project mentorship and youth collaborative sprint.',
    totalSeats: 150
  });

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title.trim()) return;

    const newEvent: EventItem = {
      id: `ev-${Date.now().toString().slice(-4)}`,
      title: newEventForm.title.trim(),
      category: newEventForm.category,
      date: newEventForm.date,
      time: newEventForm.time,
      venue: newEventForm.venue,
      description: newEventForm.description,
      seatsLeft: newEventForm.totalSeats,
      totalSeats: newEventForm.totalSeats,
      agendaItems: [
        'Session Kick-off & Topic Introduction',
        'Interactive Team Working & Prototyping',
        'Judge Review & Feedback'
      ]
    };

    if (setEvents) {
      setEvents(prev => [...prev, newEvent]);
    }
    setIsAddEventModalOpen(false);
    showToast(`Event session "${newEvent.title}" added to schedule!`);
    addAuditLog(`Created Event Session`, newEvent.title, 'system');
  };

  // ---------------------------------------------------------------------------
  // QR SCANNER / CHECK-IN STATION STATE
  // ---------------------------------------------------------------------------
  const [scannerCode, setScannerCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    title: string;
    type: 'team' | 'volunteer' | 'certificate' | 'unknown';
    details: any;
  } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleVerifyCode = (codeToTest: string) => {
    const clean = codeToTest.trim().toUpperCase();
    if (!clean) return;

    // 1. Check Team
    const matchedTeam = teamParticipations.find(
      t =>
        t.teamCode?.toUpperCase() === clean ||
        t.id.toUpperCase() === clean ||
        t.projectName.toUpperCase().includes(clean)
    );
    if (matchedTeam) {
      setScanResult({
        success: true,
        title: `Team Check-In: ${matchedTeam.projectName}`,
        type: 'team',
        details: matchedTeam
      });
      addAuditLog(`On-site Team Check-in`, `${matchedTeam.projectName} (${matchedTeam.teamCode})`, 'checkin');
      showToast(`Team Verified: ${matchedTeam.projectName}`);
      return;
    }

    // 2. Check Volunteer
    const matchedVol = volunteers.find(
      v =>
        v.id.toUpperCase() === clean ||
        v.username.toUpperCase() === clean ||
        v.name.toUpperCase().includes(clean)
    );
    if (matchedVol) {
      setScanResult({
        success: true,
        title: `Volunteer Badge: ${matchedVol.name}`,
        type: 'volunteer',
        details: matchedVol
      });
      addAuditLog(`Volunteer Check-in Verified`, `${matchedVol.name} (${matchedVol.id})`, 'checkin');
      showToast(`Volunteer Verified: ${matchedVol.name}`);
      return;
    }

    // 3. Check Certificate
    const matchedCert = certDatabase.find(c => c && c.id && c.id.toUpperCase() === clean);
    if (matchedCert) {
      setScanResult({
        success: true,
        title: `Authentic Certificate: ${matchedCert.id}`,
        type: 'certificate',
        details: matchedCert
      });
      addAuditLog(`Certificate Validated`, `${matchedCert.recipientName} (${matchedCert.id})`, 'checkin');
      showToast(`Certificate Authenticated: ${matchedCert.id}`);
      return;
    }

    // Not found
    setScanResult({
      success: false,
      title: `No Record Found for Code: ${clean}`,
      type: 'unknown',
      details: null
    });
  };

  // ---------------------------------------------------------------------------
  // SCHOOLS AGGREGATED METRICS
  // ---------------------------------------------------------------------------
  const schoolAnalytics = useMemo(() => {
    const map = new Map<string, { school: string; teams: number; volunteers: number }>();
    COMMON_SCHOOLS.forEach(s => map.set(s, { school: s, teams: 0, volunteers: 0 }));

    teamParticipations.forEach(t => {
      const s = t.school || 'Unassigned';
      if (!map.has(s)) map.set(s, { school: s, teams: 0, volunteers: 0 });
      map.get(s)!.teams += 1;
    });

    volunteers.forEach(v => {
      const s = v.school || 'Unassigned';
      if (!map.has(s)) map.set(s, { school: s, teams: 0, volunteers: 0 });
      map.get(s)!.volunteers += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.teams + b.volunteers - (a.teams + a.volunteers));
  }, [teamParticipations, volunteers]);

  // Overall Quick Stats
  const stats = useMemo(() => {
    const totalVolunteers = volunteers.length;
    const activeVolunteers = volunteers.filter(v => v.status === 'Verified Active' || v.status === 'Lead Volunteer').length;
    const totalTeams = teamParticipations.length;
    const totalMembers = teamParticipations.reduce((acc, t) => acc + (t.members?.length || 0), 0);
    const totalHours = volunteers.reduce((acc, v) => acc + (v.hours || 0), 0);
    const totalCerts = certDatabase.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    const schoolsCount = schoolAnalytics.filter(s => s.teams > 0 || s.volunteers > 0).length;

    return {
      totalVolunteers,
      activeVolunteers,
      totalTeams,
      totalMembers,
      totalHours,
      totalCerts,
      completedTasks,
      pendingTasks,
      schoolsCount
    };
  }, [volunteers, teamParticipations, certDatabase, tasks, schoolAnalytics]);

  // Chart Data: School Distribution
  const schoolChartData = useMemo(() => {
    return schoolAnalytics.slice(0, 6).map(item => ({
      name: item.school.split(' ')[0] + (item.school.includes('Degree') ? ' DC' : item.school.includes('Kuragh') ? ' Kuragh' : ''),
      Teams: item.teams,
      Volunteers: item.volunteers
    }));
  }, [schoolAnalytics]);

  // Chart Data: Task Progress Breakdown
  const taskChartData = useMemo(() => {
    return [
      { name: 'Completed', value: stats.completedTasks, color: '#10b981' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#3b82f6' },
      { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length, color: '#f59e0b' }
    ];
  }, [tasks, stats]);

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null, group: 'CORE' },
    { id: 'teams', label: 'Teams & Innovations', icon: Users, badge: teamParticipations.length, group: 'CORE' },
    { id: 'volunteers', label: 'Volunteer Roster', icon: UserCheck, badge: volunteers.length, group: 'CORE' },
    { id: 'events', label: 'Event Schedule', icon: Calendar, badge: events.length, group: 'OPERATIONS' },
    { id: 'schools', label: 'School Network', icon: Building2, badge: stats.schoolsCount, group: 'OPERATIONS' },
    { id: 'tasks', label: 'Tasks & Responsibilities', icon: ListTodo, badge: stats.pendingTasks, group: 'OPERATIONS' },
    { id: 'certificates', label: 'Certificates & Honors', icon: Award, badge: certDatabase.length, group: 'OPERATIONS' },
    { id: 'scanner', label: 'QR Check-in Station', icon: QrIcon, badge: 'Live', group: 'SECURITY & AUDIT' },
    { id: 'audit', label: 'Audit Trail & Logs', icon: Activity, badge: auditLogs.length, group: 'SECURITY & AUDIT' },
    { id: 'settings', label: 'Settings & Control', icon: Settings, badge: null, group: 'SECURITY & AUDIT' }
  ];

  // Global Search Filtered Results
  const globalSearchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const q = globalSearch.toLowerCase().trim();

    const matchedTeams = teamParticipations
      .filter(t => t.projectName.toLowerCase().includes(q) || (t.teamCode && t.teamCode.toLowerCase().includes(q)) || t.teamLeader.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedVols = volunteers
      .filter(v => v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q) || (v.school && v.school.toLowerCase().includes(q)))
      .slice(0, 3);

    const matchedCerts = certDatabase
      .filter(c => c && ((c.recipientName && c.recipientName.toLowerCase().includes(q)) || (c.id && c.id.toLowerCase().includes(q))))
      .slice(0, 3);

    const matchedTasks = tasks
      .filter(t => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q))
      .slice(0, 3);

    return { teams: matchedTeams, volunteers: matchedVols, certs: matchedCerts, tasks: matchedTasks };
  }, [globalSearch, teamParticipations, volunteers, certDatabase, tasks]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2.5 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-fadeIn text-xs font-semibold">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-6 shrink-0 shadow-xs">
        {/* Brand & Live Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <img src={officialLogo} alt="Collabs Logo" className="w-8 h-8 rounded-lg object-contain border border-slate-200 shadow-xs" />
            <div className="leading-none">
              <span className="font-heading font-black text-slate-950 text-lg tracking-tight">COLLABS<span className="text-blue-600">.</span></span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Admin Console</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">First Mega Event · 31 Oct 2026</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Booni, Upper Chitral</span>
          </div>
        </div>

        {/* Global Search Center Bar */}
        <div className="relative flex-1 max-w-md mx-6 hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search teams, volunteers, certificates, tasks... (Press /)"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
          {globalSearch && (
            <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}

          {/* Live Search Quick Results Dropdown */}
          {globalSearch && globalSearchResults && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-xs z-50 animate-fadeIn space-y-3">
              <div className="flex items-center justify-between border-b pb-2 text-[11px] font-bold text-slate-500 uppercase">
                <span>Matching Results</span>
                <button onClick={() => setGlobalSearch('')} className="text-slate-400 hover:text-slate-700">Close</button>
              </div>

              {globalSearchResults.teams.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Teams</div>
                  {globalSearchResults.teams.map(t => (
                    <div
                      key={t.id}
                      onClick={() => { setActiveTab('teams'); setGlobalSearch(''); }}
                      className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-900">{t.projectName} ({t.teamCode})</span>
                      <span className="text-slate-500 text-[10px]">{t.school}</span>
                    </div>
                  ))}
                </div>
              )}

              {globalSearchResults.volunteers.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Volunteers</div>
                  {globalSearchResults.volunteers.map(v => (
                    <div
                      key={v.id}
                      onClick={() => { setActiveTab('volunteers'); setGlobalSearch(''); }}
                      className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-900">{v.name} ({v.id})</span>
                      <span className="text-slate-500 text-[10px]">{v.role}</span>
                    </div>
                  ))}
                </div>
              )}

              {globalSearchResults.certs.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-purple-600 uppercase mb-1">Certificates</div>
                  {globalSearchResults.certs.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { setActiveTab('certificates'); setGlobalSearch(''); }}
                      className="p-2 hover:bg-purple-50 rounded-lg cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-900">{c.recipientName}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{c.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Topbar Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Action Button */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-blue-600/30 cursor-pointer">
              <Plus size={14} /> Quick Action
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 hidden group-hover:block z-50 text-xs">
              <button
                onClick={() => setActiveTab('teams')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Users size={14} className="text-blue-600" /> New Team Wizard
              </button>
              <button
                onClick={() => setActiveTab('volunteers')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <UserCheck size={14} className="text-emerald-600" /> Add Volunteer
              </button>
              <button
                onClick={() => setIsIssueCertModalOpen(true)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Award size={14} className="text-purple-600" /> Issue Certificate
              </button>
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <ListTodo size={14} className="text-amber-600" /> Create Task
              </button>
            </div>
          </div>

          {/* Quick Link back to Public Website */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
            title="Switch back to public website view"
          >
            <ExternalLink size={13} /> Return to Site
          </button>
        </div>
      </header>

      {/* MAIN BODY: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-900 select-none overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* System Status Pill */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <span>System Health</span>
                <span className="text-emerald-400 font-mono">100% ONLINE</span>
              </div>
              <div className="text-slate-300 font-medium">Booni Mega Operations Hub</div>
            </div>

            {/* Nav Groups */}
            {['CORE', 'OPERATIONS', 'SECURITY & AUDIT'].map(grp => (
              <div key={grp} className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                  {grp}
                </div>
                <div className="space-y-1">
                  {navItems
                    .filter(item => item.group === grp)
                    .map(item => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== null && (
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Admin User Footer Card */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/70 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-inner">
                AD
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white">Administrator</div>
                <div className="text-[10px] text-slate-400 font-mono">admin@collabs.org</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-100">
          {/* ========================================================================= */}
          {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Event Announcement & Countdown Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 md:p-8 shadow-md border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                      <Sparkles size={13} /> Booni Mega Exhibition Control Center
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                      First Mega Event of Collabs · 31 Oct 2026
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      Real-time administrative command center supervising {stats.totalTeams} innovation teams,{' '}
                      {stats.totalVolunteers} registered volunteers, and institutional delegations across Upper Chitral.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setActiveTab('teams')}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-2"
                    >
                      <Plus size={15} /> Create Team (Wizard)
                    </button>
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer flex items-center gap-2"
                    >
                      <QrIcon size={15} /> Open QR Station
                    </button>
                  </div>
                </div>
              </div>

              {/* 8 Primary Live KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('teams')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Registered Teams</span>
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 font-mono tabular-nums">{stats.totalTeams}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-blue-600">
                    <span>{stats.totalMembers} enrolled members</span>
                    <ChevronRight size={12} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('volunteers')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Active Volunteers</span>
                    <UserCheck size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600 font-mono tabular-nums">{stats.activeVolunteers}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-emerald-600">
                    <span>{stats.totalVolunteers} total in roster</span>
                    <ChevronRight size={12} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('schools')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Partner Schools</span>
                    <Building2 size={16} className="text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-amber-600 font-mono tabular-nums">{stats.schoolsCount}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-amber-600">
                    <span>Institutions engaged</span>
                    <ChevronRight size={12} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('certificates')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Certificates Issued</span>
                    <Award size={16} className="text-purple-600" />
                  </div>
                  <div className="text-3xl font-black text-purple-600 font-mono tabular-nums">{stats.totalCerts}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-purple-600">
                    <span>Digitally verified badges</span>
                    <ChevronRight size={12} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('volunteers')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Logged Hours</span>
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 font-mono tabular-nums">{stats.totalHours} hrs</div>
                  <div className="text-[11px] text-slate-500 mt-1">Community contribution</div>
                </div>

                <div
                  onClick={() => setActiveTab('tasks')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Tasks Completed</span>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600 font-mono tabular-nums">
                    {stats.completedTasks} / {tasks.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{stats.pendingTasks} pending execution</div>
                </div>

                <div
                  onClick={() => setActiveTab('events')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>Event Sessions</span>
                    <Calendar size={16} className="text-indigo-600" />
                  </div>
                  <div className="text-3xl font-black text-indigo-600 font-mono tabular-nums">{events.length || 1}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Exhibition stages & slots</div>
                </div>

                <div
                  onClick={() => setActiveTab('scanner')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                    <span>QR Check-ins</span>
                    <QrIcon size={16} className="text-teal-600" />
                  </div>
                  <div className="text-3xl font-black text-teal-600 font-mono tabular-nums">LIVE</div>
                  <div className="text-[11px] text-slate-500 mt-1">Ready for on-site scanning</div>
                </div>
              </div>

              {/* Data Visualizations: 2 Comprehensive Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* School Representation Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-base">School & College Participation</h3>
                      <p className="text-xs text-slate-500">Distribution of enrolled teams and volunteers by institution</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('schools')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View Network →
                    </button>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={schoolChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="Teams" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Volunteers" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Operations & Tasks Execution Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-base">Operational Task Readiness</h3>
                      <p className="text-xs text-slate-500">Execution status of event logistics, IT, and safety preparations</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Manage Tasks →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {taskChartData.map(st => (
                      <div key={st.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <div className="text-[11px] font-bold text-slate-500">{st.name}</div>
                        <div className="text-xl font-black font-mono mt-1" style={{ color: st.color }}>
                          {st.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick recent tasks preview */}
                  <div className="space-y-2">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              task.status === 'Completed'
                                ? 'bg-emerald-500'
                                : task.status === 'In Progress'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                          ></span>
                          <span className="font-semibold text-slate-800 truncate">{task.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{task.assignee.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Activity Ledger Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Action Station */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                  <h3 className="font-heading font-black text-slate-900 text-base mb-1">Administrative Shortcuts</h3>
                  <p className="text-xs text-slate-500 mb-4">One-click actions to manage your event roster</p>

                  <button
                    onClick={() => setActiveTab('teams')}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-between border border-slate-200/80 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users size={15} className="text-blue-600" /> Launch Multi-Step Team Wizard
                    </span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => setActiveTab('volunteers')}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-between border border-slate-200/80 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck size={15} className="text-emerald-600" /> Register Volunteer with Duplicate Protection
                    </span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => setIsIssueCertModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-between border border-slate-200/80 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Award size={15} className="text-purple-600" /> Issue Digital Certificate
                    </span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => {
                      exportCSV(teamParticipations, 'teams_master.csv');
                      exportCSV(volunteers, 'volunteers_master.csv');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download size={15} /> Export Complete Organization Snapshot
                    </span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Real-time Activity Feed */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-base">Live Activity & Audit Feed</h3>
                      <p className="text-xs text-slate-500">Chronological ledger of registrations and operations</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Full Audit Trail →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map(item => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              item.type === 'team'
                                ? 'bg-blue-100 text-blue-700'
                                : item.type === 'volunteer'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.type === 'certificate'
                                ? 'bg-purple-100 text-purple-700'
                                : item.type === 'checkin'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.type[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.action}</div>
                            <div className="text-[11px] text-slate-500">{item.entity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block">{item.timestamp}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{item.actor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TEAMS MANAGEMENT MODULE */}
          {/* ========================================================================= */}
          {activeTab === 'teams' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <TeamManagement
                teamParticipations={teamParticipations}
                setTeamParticipations={setTeamParticipations}
                volunteers={volunteers}
                exportCSV={exportCSV}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: VOLUNTEER ROSTER MODULE */}
          {/* ========================================================================= */}
          {activeTab === 'volunteers' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <VolunteerManagement
                volunteers={volunteers}
                setVolunteers={setVolunteers}
                exportCSV={exportCSV}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: EVENT SCHEDULE & EXHIBITION AGENDA */}
          {/* ========================================================================= */}
          {activeTab === 'events' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              {/* Header card */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Exhibition Timeline</div>
                  <h2 className="text-2xl font-black text-slate-900 font-heading">Event Schedule & Sessions</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage session agendas, stage allocations, and seat capacity for the 31 October 2026 Booni event.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCSV(events, 'event_sessions.csv')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border cursor-pointer flex items-center gap-2"
                  >
                    <Download size={15} /> Export CSV
                  </button>
                  <button
                    onClick={() => setIsAddEventModalOpen(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Session
                  </button>
                </div>
              </div>

              {/* Event Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((ev, idx) => (
                  <div key={ev.id || idx} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold">
                        {ev.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {ev.seatsLeft} / {ev.totalSeats} Seats Left
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-lg">{ev.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-blue-600">
                          <Calendar size={13} /> {ev.date}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock size={13} /> {ev.time}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={13} /> {ev.venue}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                    {ev.agendaItems && ev.agendaItems.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Session Itinerary</div>
                        {ev.agendaItems.map((item: string, i: number) => (
                          <div key={i} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SCHOOL & COLLEGE NETWORK */}
          {/* ========================================================================= */}
          {activeTab === 'schools' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Institutional Partnerships</div>
                  <h2 className="text-2xl font-black text-slate-900 font-heading">Partner School & College Network</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Supervise institutional delegations across Upper Chitral, student teams, and academic faculty liaisons.
                  </p>
                </div>
                <button
                  onClick={() => exportCSV(schoolAnalytics, 'school_network_report.csv')}
                  className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Download size={15} /> Export Institutional Summary
                </button>
              </div>

              {/* Schools Table / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schoolAnalytics.map((sc, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
                        <Building2 size={20} />
                      </div>
                      <h3 className="font-heading font-black text-slate-900 text-base">{sc.school}</h3>
                      <p className="text-xs text-slate-500 mt-1">Upper Chitral District · Official Academic Partner</p>

                      <div className="grid grid-cols-2 gap-3 my-4 pt-3 border-t border-slate-100">
                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] font-bold uppercase text-slate-500">Teams</div>
                          <div className="text-xl font-black text-blue-600 font-mono mt-0.5">{sc.teams}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] font-bold uppercase text-slate-500">Volunteers</div>
                          <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">{sc.volunteers}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('teams');
                        showToast(`Filtering for ${sc.school}`);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                    >
                      View Assigned Teams →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: TASKS & OPERATIONAL RESPONSIBILITIES */}
          {/* ========================================================================= */}
          {activeTab === 'tasks' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Operations Hub</div>
                  <h2 className="text-2xl font-black text-slate-900 font-heading">Event Operations & Tasks</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Assign responsibilities to volunteer squads, track IT readiness, logistics, and on-ground safety.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCSV(tasks, 'operations_tasks.csv')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border cursor-pointer flex items-center gap-2"
                  >
                    <Download size={15} /> Export Tasks
                  </button>
                  <button
                    onClick={() => setIsNewTaskModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={16} /> New Operational Task
                  </button>
                </div>
              </div>

              {/* Task Filter Pills */}
              <div className="flex items-center gap-2">
                {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setTaskFilter(flt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      taskFilter === flt
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {flt} ({flt === 'All' ? tasks.length : tasks.filter(t => t.status === flt).length})
                  </button>
                ))}
              </div>

              {/* Tasks List */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {tasks
                    .filter(t => taskFilter === 'All' || t.status === taskFilter)
                    .map(task => {
                      const isDone = task.status === 'Completed';
                      return (
                        <div
                          key={task.id}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => {
                                setTasks(prev =>
                                  prev.map(t =>
                                    t.id === task.id
                                      ? { ...t, status: t.status === 'Completed' ? 'In Progress' : 'Completed' }
                                      : t
                                  )
                                );
                                showToast(`Updated task: ${task.title}`);
                                addAuditLog('Toggled Task Status', task.title, 'task');
                              }}
                              className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 hover:border-blue-600 text-transparent'
                              }`}
                            >
                              <Check size={14} />
                            </button>
                            <div>
                              <div className={`font-bold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {task.title}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">{task.assignee}</span>
                                <span>·</span>
                                <span>{task.department} Dept</span>
                                <span>·</span>
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  <Clock size={11} /> Due: {task.deadline}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                task.priority === 'High'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority} Priority
                            </span>

                            <button
                              onClick={() => {
                                setTasks(prev => prev.filter(t => t.id !== task.id));
                                showToast('Task removed.');
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: CERTIFICATES & DIGITAL HONORS */}
          {/* ========================================================================= */}
          {activeTab === 'certificates' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Official Credentials</div>
                  <h2 className="text-2xl font-black text-slate-900 font-heading">Digital Certificates & Honors</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Issue cryptographically referenced certificates with dynamic QR code verification for attendees and winners.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCSV(certDatabase, 'certificates_database.csv')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border cursor-pointer flex items-center gap-2"
                  >
                    <Download size={15} /> Export Registry ({certDatabase.length})
                  </button>
                  <button
                    onClick={() => setIsIssueCertModalOpen(true)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-purple-600/20 cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={16} /> Issue Certificate
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search certificates by recipient name or credential ID..."
                    value={certSearch}
                    onChange={e => setCertSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <select
                  value={certFilterType}
                  onChange={e => setCertFilterType(e.target.value)}
                  className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
                >
                  <option value="All">All Honors & Categories</option>
                  <option value="Excellence">Excellence</option>
                  <option value="Volunteer Leadership">Volunteer Leadership</option>
                  <option value="Active Participation">Active Participation</option>
                </select>
              </div>

              {/* Certificates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certDatabase
                  .filter(c => {
                    if (!c || !c.id) return false;
                    const matchesQ =
                      !certSearch ||
                      (c.recipientName && c.recipientName.toLowerCase().includes(certSearch.toLowerCase())) ||
                      c.id.toLowerCase().includes(certSearch.toLowerCase());
                    const matchesType = certFilterType === 'All' || c.achievementType === certFilterType;
                    return Boolean(matchesQ && matchesType);
                  })
                  .map(cert => (
                    <div
                      key={cert.id}
                      onClick={() => setPreviewCert(cert)}
                      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-lg">
                            {cert.id}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Verified Valid
                          </span>
                        </div>

                        <h3 className="font-heading font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
                          {cert.recipientName}
                        </h3>
                        <div className="text-xs font-semibold text-purple-700 mt-1">{cert.achievementType}</div>
                        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400" />
                          <span>{cert.school || 'Partner School'}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono text-[11px]">{cert.issueDate}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setPreviewCert(cert);
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg cursor-pointer"
                            title="Preview Certificate"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setCertDatabase(prev => prev.filter(c => c.id !== cert.id));
                              showToast(`Revoked certificate ${cert.id}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                            title="Revoke Certificate"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: ON-SITE QR CHECK-IN & SCANNER STATION */}
          {/* ========================================================================= */}
          {activeTab === 'scanner' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">On-Site Security Station</div>
                <h2 className="text-2xl font-black text-slate-900 font-heading">Event QR Check-In & Scanner</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Validate participant team badges, volunteer credentials, and official certificates live on-ground at Booni.
                </p>

                {/* Input Bar */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <QrIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Scan badge or enter code (e.g. CLB-TEAM-01, vol-101, CLB-2026-892)..."
                      value={scannerCode}
                      onChange={e => setScannerCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyCode(scannerCode)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                  <button
                    onClick={() => handleVerifyCode(scannerCode)}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Verify Check-In
                  </button>
                </div>

                {/* Quick Test Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold">Quick test test-codes:</span>
                  {teamParticipations.slice(0, 2).map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setScannerCode(t.teamCode || t.id);
                        handleVerifyCode(t.teamCode || t.id);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg font-mono text-[10px] cursor-pointer"
                    >
                      {t.teamCode || t.id}
                    </button>
                  ))}
                  {volunteers.slice(0, 2).map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setScannerCode(v.id);
                        handleVerifyCode(v.id);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-700 rounded-lg font-mono text-[10px] cursor-pointer"
                    >
                      {v.id}
                    </button>
                  ))}
                  {certDatabase.slice(0, 1).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setScannerCode(c.id);
                        handleVerifyCode(c.id);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 text-purple-700 rounded-lg font-mono text-[10px] cursor-pointer"
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan Results Display */}
              {scanResult && (
                <div
                  className={`p-6 md:p-8 rounded-3xl border shadow-lg animate-fadeIn ${
                    scanResult.success
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-red-50/70 border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        scanResult.success ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {scanResult.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            scanResult.success ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {scanResult.success ? 'VALIDATED RECORD' : 'VERIFICATION FAILED'}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">Booni Entry Gate</span>
                      </div>
                      <h3 className="text-xl font-black font-heading">{scanResult.title}</h3>

                      {scanResult.details && (
                        <div className="mt-4 p-4 bg-white/80 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-800">
                          {scanResult.type === 'team' && (
                            <>
                              <div><strong>Team Leader:</strong> {scanResult.details.teamLeader}</div>
                              <div><strong>School:</strong> {scanResult.details.school}</div>
                              <div><strong>Assigned Location:</strong> {scanResult.details.location || 'Exhibition Hall'}</div>
                              <div><strong>Registered Members:</strong> {scanResult.details.members?.length || 0} participants</div>
                            </>
                          )}
                          {scanResult.type === 'volunteer' && (
                            <>
                              <div><strong>Volunteer Name:</strong> {scanResult.details.name}</div>
                              <div><strong>Track:</strong> {scanResult.details.department} ({scanResult.details.role})</div>
                              <div><strong>Institution:</strong> {scanResult.details.school}</div>
                              <div><strong>Status:</strong> {scanResult.details.status}</div>
                            </>
                          )}
                          {scanResult.type === 'certificate' && (
                            <>
                              <div><strong>Recipient:</strong> {scanResult.details.recipientName}</div>
                              <div><strong>Achievement:</strong> {scanResult.details.achievementType}</div>
                              <div><strong>Event:</strong> {scanResult.details.eventName}</div>
                              <div><strong>Issue Date:</strong> {scanResult.details.issueDate}</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: AUDIT TRAIL & HISTORY LEDGER */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Compliance & Audit</div>
                  <h2 className="text-2xl font-black text-slate-900 font-heading">System Audit Trail & History</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Immutable administrative action log recording approvals, task changes, certificates, and logins.
                  </p>
                </div>
                <button
                  onClick={() => exportCSV(auditLogs, 'audit_trail_export.csv')}
                  className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Download size={15} /> Export Audit Trail
                </button>
              </div>

              {/* Audit Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Actor / Operator</th>
                      <th className="py-4 px-6">Action Executed</th>
                      <th className="py-4 px-6">Entity / Details</th>
                      <th className="py-4 px-6 text-center">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                        <td className="py-4 px-6 font-semibold text-slate-900">{log.actor}</td>
                        <td className="py-4 px-6 font-bold">{log.action}</td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-600">{log.entity}</td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              log.type === 'team'
                                ? 'bg-blue-100 text-blue-700'
                                : log.type === 'volunteer'
                                ? 'bg-emerald-100 text-emerald-700'
                                : log.type === 'certificate'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: SETTINGS & MAINTENANCE CONTROLS */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">System Configuration</div>
                <h2 className="text-2xl font-black text-slate-900 font-heading">Platform Settings & Controls</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage public enrollment availability, system status, emergency broadcast alerts, and data backups.
                </p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
                {/* Setting 1: Registration Status */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-sm text-slate-900">Public Team & Volunteer Registration</div>
                    <div className="text-slate-500 mt-0.5">Allow students and teams to submit new registrations via the public site.</div>
                  </div>
                  <button
                    onClick={() => {
                      setRegistrationOpen(!registrationOpen);
                      showToast(`Registration set to ${!registrationOpen ? 'OPEN' : 'CLOSED'}`);
                      addAuditLog('Toggled Registration', !registrationOpen ? 'OPEN' : 'CLOSED', 'system');
                    }}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      registrationOpen ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {registrationOpen ? 'OPEN (Active)' : 'CLOSED (Paused)'}
                  </button>
                </div>

                {/* Setting 2: Emergency Announcement Banner */}
                <div className="space-y-3 pb-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900">Emergency Announcement Broadcast</div>
                      <div className="text-slate-500 mt-0.5">Display a top banner on the public website for urgent alerts.</div>
                    </div>
                    <button
                      onClick={() => {
                        setEmergencyBanner(!emergencyBanner);
                        showToast(`Emergency alert banner ${!emergencyBanner ? 'ACTIVATED' : 'DEACTIVATED'}`);
                        addAuditLog('Emergency Banner', !emergencyBanner ? 'ACTIVE' : 'OFF', 'system');
                      }}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        emergencyBanner ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {emergencyBanner ? 'BROADCASTING' : 'DISABLED'}
                    </button>
                  </div>
                  {emergencyBanner && (
                    <input
                      type="text"
                      value={emergencyBannerText}
                      onChange={e => setEmergencyBannerText(e.target.value)}
                      className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900"
                    />
                  )}
                </div>

                {/* Setting 3: Event Date & Location Confirmation */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-sm text-slate-900">Event Date & Location</div>
                    <div className="text-slate-500 mt-0.5">Target schedule synchronized across all public and admin pages.</div>
                  </div>
                  <div className="font-bold font-mono text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                    31 October 2026 · Booni, Upper Chitral
                  </div>
                </div>

                {/* Setting 4: Data Snapshot Backup */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900">System JSON Snapshot</div>
                    <div className="text-slate-500 mt-0.5">Download entire database state (teams, volunteers, certs, tasks) as JSON.</div>
                  </div>
                  <button
                    onClick={() => {
                      const snapshot = {
                        exportedAt: new Date().toISOString(),
                        eventDate: '31 October 2026',
                        teams: teamParticipations,
                        volunteers,
                        certificates: certDatabase,
                        tasks,
                        auditLogs
                      };
                      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `collabs_backup_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      showToast('JSON backup snapshot downloaded!');
                      addAuditLog('Downloaded System Backup', 'JSON Snapshot', 'system');
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={14} /> Download Backup
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ISSUE NEW DIGITAL CERTIFICATE */}
      {/* ========================================================================= */}
      {isIssueCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fadeIn text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">Issue Official Certificate</h3>
                  <p className="text-[11px] text-slate-500">Generate verified credential for Booni event</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueCertModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleIssueCertificateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Bibi"
                  value={newCertForm.recipientName}
                  onChange={e => setNewCertForm({ ...newCertForm, recipientName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Achievement / Honor Level</label>
                <select
                  value={newCertForm.achievementType}
                  onChange={e => setNewCertForm({ ...newCertForm, achievementType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value="Excellence">Excellence</option>
                  <option value="Volunteer Leadership">Volunteer Leadership</option>
                  <option value="Active Participation">Active Participation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School / Institution</label>
                <select
                  value={newCertForm.school}
                  onChange={e => setNewCertForm({ ...newCertForm, school: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  {COMMON_SCHOOLS.map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
                <input
                  type="text"
                  value={newCertForm.issueDate}
                  onChange={e => setNewCertForm({ ...newCertForm, issueDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueCertModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md"
                >
                  Generate & Verify Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PREVIEW DIGITAL CERTIFICATE CARD */}
      {/* ========================================================================= */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fadeIn text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="font-bold text-xs uppercase tracking-wider text-purple-600">Official Certificate Preview</div>
              <button
                onClick={() => setPreviewCert(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={14} />
              </button>
            </div>

            {/* Certificate Template Card */}
            <div className="p-6 rounded-2xl border-2 border-purple-200 bg-linear-to-b from-purple-50/40 to-white text-center space-y-4 relative">
              <div className="text-[11px] font-bold text-purple-700 tracking-widest uppercase">
                First Mega Event of Collabs · Upper Chitral
              </div>
              <h3 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
                Certificate of {previewCert.achievementType}
              </h3>
              <p className="text-xs text-slate-500">This official credential proudly honors</p>
              <div className="text-xl font-black text-purple-900 border-b border-purple-200 pb-2 max-w-xs mx-auto">
                {previewCert.recipientName}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                For exemplary contribution and innovation at the First Mega Event of Collabs held in Booni on 31 October 2026.
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-purple-100 text-left text-xs">
                <div>
                  <div className="font-mono text-[10px] text-slate-400">CREDENTIAL ID</div>
                  <div className="font-mono font-bold text-slate-900">{previewCert.id}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{previewCert.issueDate}</div>
                </div>

                {previewCertQr && (
                  <div className="text-center">
                    <img src={previewCertQr} alt="QR" className="w-16 h-16 rounded border bg-white p-0.5 inline-block" />
                    <div className="text-[9px] text-slate-400 font-mono">Scan to Verify</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={() => setPreviewCert(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD OPERATIONAL TASK */}
      {/* ========================================================================= */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fadeIn text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <ListTodo size={18} className="text-blue-600" />
                <h3 className="font-heading font-black text-slate-900 text-base">New Operational Task</h3>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={14} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newTaskForm.title.trim()) return;
                const task: OperationalTask = {
                  id: `tsk-${Date.now()}`,
                  title: newTaskForm.title.trim(),
                  department: newTaskForm.department,
                  priority: newTaskForm.priority,
                  status: 'Pending',
                  assignee: newTaskForm.assignee.trim() || 'Volunteer Team',
                  deadline: newTaskForm.deadline
                };
                setTasks(prev => [task, ...prev]);
                setIsNewTaskModalOpen(false);
                showToast(`Task assigned: ${task.title}`);
                addAuditLog('Created Operational Task', task.title, 'task');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Test video projector in Hall 2"
                  value={newTaskForm.title}
                  onChange={e => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newTaskForm.department}
                    onChange={e => setNewTaskForm({ ...newTaskForm, department: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Operations">Operations</option>
                    <option value="Media">Media</option>
                    <option value="Outreach">Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={e => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Person or Squad</label>
                <input
                  type="text"
                  placeholder="e.g. Aarish Salik / Logistics Squad"
                  value={newTaskForm.assignee}
                  onChange={e => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EVENT SESSION */}
      {/* ========================================================================= */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fadeIn text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                <h3 className="font-heading font-black text-slate-900 text-base">Add Schedule Session</h3>
              </div>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Robotics Exhibition Stall Demos"
                  value={newEventForm.title}
                  onChange={e => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newEventForm.category}
                    onChange={e => setNewEventForm({ ...newEventForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Workshops">Workshops</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newEventForm.time}
                    onChange={e => setNewEventForm({ ...newEventForm, time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue / Stage Location</label>
                <input
                  type="text"
                  value={newEventForm.venue}
                  onChange={e => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newEventForm.description}
                  onChange={e => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
