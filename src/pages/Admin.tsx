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
  Radio,
  TrendingUp,
  Flame,
  Volume2,
  VolumeX,
  CheckCheck,
  Maximize2,
  BadgeCheck,
  Zap,
  ArrowUpRight,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  achievementType: 'Excellence' | 'Volunteer Leadership' | 'Active Participation' | string;
  eventName: string;
  issueDate: string;
  verified: boolean;
  issuer: string;
  school?: string;
  theme?: 'gold' | 'emerald' | 'royal' | 'obsidian' | string;
  project?: string;
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
  onLogout?: () => void;
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

// Play a pleasant audio chime for QR verification
const playSuccessChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio context might be restricted before user gesture
  }
};

export const AdminPage: React.FC<AdminPageProps> = ({
  teamParticipations,
  setTeamParticipations,
  volunteers,
  setVolunteers,
  certDatabase,
  setCertDatabase,
  events = [],
  setEvents,
  onLogout
}) => {
  const navigate = useNavigate();

  // Dark and Light Mode state with persistence in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('collabs_admin_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark'; // Default to executive dark, seamlessly toggleable to light
  });

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('collabs_admin_theme', nextTheme);
    }
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Sidebar collapse toggle for spacious workspace
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global Search State across admin
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sound effect toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Countdown to Booni Event: 31 October 2026
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-10-31T09:30:00+05:00').getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

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
    if (previewCert && previewCert.id) {
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

  const handleVerifyCode = (codeToTest: string) => {
    const clean = codeToTest.trim().toUpperCase();
    if (!clean) return;

    if (soundEnabled) {
      playSuccessChime();
    }

    // 1. Check Team
    const matchedTeam = teamParticipations.find(
      t =>
        (t.teamCode && t.teamCode.toUpperCase() === clean) ||
        (t.id && t.id.toUpperCase() === clean) ||
        t.projectName.toUpperCase().includes(clean)
    );
    if (matchedTeam) {
      setScanResult({
        success: true,
        title: `Team Check-In: ${matchedTeam.projectName}`,
        type: 'team',
        details: matchedTeam
      });
      addAuditLog(`On-site Team Check-in`, `${matchedTeam.projectName} (${matchedTeam.teamCode || matchedTeam.id})`, 'checkin');
      showToast(`Team Verified: ${matchedTeam.projectName}`);
      return;
    }

    // 2. Check Volunteer
    const matchedVol = volunteers.find(
      v =>
        (v.id && v.id.toUpperCase() === clean) ||
        (v.username && v.username.toUpperCase() === clean) ||
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
    const readinessScore = Math.min(100, Math.round(((completedTasks + (totalTeams > 0 ? 3 : 0) + (totalVolunteers > 0 ? 3 : 0)) / (tasks.length + 6)) * 100));

    return {
      totalVolunteers,
      activeVolunteers,
      totalTeams,
      totalMembers,
      totalHours,
      totalCerts,
      completedTasks,
      pendingTasks,
      schoolsCount,
      readinessScore
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
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard, badge: 'Live', group: 'CORE' },
    { id: 'teams', label: 'Teams & Innovation', icon: Users, badge: teamParticipations.length, group: 'CORE' },
    { id: 'volunteers', label: 'Volunteer Roster', icon: UserCheck, badge: volunteers.length, group: 'CORE' },
    { id: 'events', label: 'Event Schedule', icon: Calendar, badge: events.length || 1, group: 'OPERATIONS' },
    { id: 'schools', label: 'School Network', icon: Building2, badge: stats.schoolsCount, group: 'OPERATIONS' },
    { id: 'tasks', label: 'Tasks & Readiness', icon: ListTodo, badge: stats.pendingTasks, group: 'OPERATIONS' },
    { id: 'certificates', label: 'Digital Honors', icon: Award, badge: certDatabase.length, group: 'OPERATIONS' },
    { id: 'scanner', label: 'QR Scanner Station', icon: QrIcon, badge: 'Scanner', group: 'SECURITY & AUDIT' },
    { id: 'audit', label: 'Audit Trail', icon: Activity, badge: auditLogs.length, group: 'SECURITY & AUDIT' },
    { id: 'settings', label: 'System Controls', icon: Settings, badge: null, group: 'SECURITY & AUDIT' }
  ];

  // Global Search Filtered Results
  const globalSearchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const q = globalSearch.toLowerCase().trim();

    const matchedTeams = teamParticipations
      .filter(t => t.projectName.toLowerCase().includes(q) || (t.teamCode && t.teamCode.toLowerCase().includes(q)) || t.teamLeader.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedVols = volunteers
      .filter(v => v.name.toLowerCase().includes(q) || (v.id && v.id.toLowerCase().includes(q)) || (v.school && v.school.toLowerCase().includes(q)))
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
    <div
      className={`${
        isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
      } min-h-screen flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border animate-fadeIn text-xs font-semibold ${
            isDark
              ? 'bg-slate-950/95 text-white border-blue-500/30'
              : 'bg-white text-slate-900 border-slate-200 shadow-xl'
          }`}
        >
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* TOP COMMAND & TELEMETRY BAR */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b h-16 flex items-center justify-between px-6 shrink-0 transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80 shadow-lg'
            : 'bg-white/95 border-slate-200/90 shadow-xs'
        }`}
      >
        {/* Brand & Breadcrumb */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('overview')}
          >
            <div className="relative">
              <img
                src={officialLogo}
                alt="Collabs Logo"
                className={`w-9 h-9 rounded-xl object-contain border p-0.5 shadow-md group-hover:scale-105 transition-transform ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></span>
            </div>
            <div className="leading-none">
              <div
                className={`font-heading font-black text-lg tracking-tight flex items-center gap-1.5 ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                <span>COLLABS</span>
                <span className="text-blue-500 text-xl leading-none">.</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-500 border border-blue-500/30">
                  Mission Control
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                Booni Exhibition Operations · Upper Chitral
              </div>
            </div>
          </div>

          {/* Live Telemetry Pill */}
          <div
            className={`hidden xl:flex items-center gap-2.5 px-3 py-1 rounded-full border text-xs ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-500 font-semibold text-[11px]">GATEWAY 200 OK</span>
            <span className="text-slate-400">|</span>
            <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Booni Summit · 31 Oct 2026
            </span>
          </div>
        </div>

        {/* Global Search Center Bar */}
        <div className="relative flex-1 max-w-md mx-6 hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search teams, volunteers, certificates, tasks... (Press / to search)"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className={`w-full pl-9 pr-14 py-2 border rounded-xl text-xs transition-all shadow-inner ${
              isDark
                ? 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white'
            }`}
          />
          <kbd
            className={`absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border rounded text-[10px] font-mono ${
              isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            /
          </kbd>

          {/* Live Search Quick Results Dropdown */}
          {globalSearch && globalSearchResults && (
            <div
              className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl border p-4 text-xs z-50 animate-fadeIn space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Matching Records</span>
                <button onClick={() => setGlobalSearch('')} className="text-slate-400 hover:text-slate-600">
                  Close
                </button>
              </div>

              {globalSearchResults.teams.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-blue-500 uppercase mb-1">Teams</div>
                  {globalSearchResults.teams.map(t => (
                    <div
                      key={t.id}
                      onClick={() => { setActiveTab('teams'); setGlobalSearch(''); }}
                      className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${
                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <span className="font-bold">{t.projectName} ({t.teamCode})</span>
                      <span className="text-slate-400 text-[10px]">{t.school}</span>
                    </div>
                  ))}
                </div>
              )}

              {globalSearchResults.volunteers.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Volunteers</div>
                  {globalSearchResults.volunteers.map(v => (
                    <div
                      key={v.id}
                      onClick={() => { setActiveTab('volunteers'); setGlobalSearch(''); }}
                      className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${
                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <span className="font-bold">{v.name} ({v.id})</span>
                      <span className="text-slate-400 text-[10px]">{v.role}</span>
                    </div>
                  ))}
                </div>
              )}

              {globalSearchResults.certs.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-purple-500 uppercase mb-1">Certificates</div>
                  {globalSearchResults.certs.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { setActiveTab('certificates'); setGlobalSearch(''); }}
                      className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${
                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <span className="font-bold">{c.recipientName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{c.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Topbar Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* THEME TOGGLE (DARK / LIGHT MODE) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl text-xs transition-all border cursor-pointer flex items-center gap-1.5 shadow-xs ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-amber-400 hover:text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
            }`}
            title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'}. Click to toggle.`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden sm:inline font-bold capitalize text-[11px]">
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs transition-colors border cursor-pointer ${
              soundEnabled
                ? isDark
                  ? 'bg-slate-900 border-slate-700 text-blue-400 hover:text-white'
                  : 'bg-slate-100 border-slate-300 text-blue-600 hover:text-blue-800'
                : 'bg-slate-900/40 border-slate-800 text-slate-400'
            }`}
            title={soundEnabled ? 'Scanner Audio Chime: Enabled' : 'Scanner Audio Chime: Muted'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Quick Action Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25 cursor-pointer">
              <Plus size={14} /> Quick Action
            </button>
            <div
              className={`absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl p-1.5 hidden group-hover:block z-50 text-xs animate-fadeIn border ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <button
                onClick={() => setActiveTab('teams')}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <Users size={14} className="text-blue-500" /> New Team Wizard
              </button>
              <button
                onClick={() => setActiveTab('volunteers')}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <UserCheck size={14} className="text-emerald-500" /> Add Volunteer
              </button>
              <button
                onClick={() => setIsIssueCertModalOpen(true)}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <Award size={14} className="text-purple-500" /> Issue Certificate
              </button>
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
              >
                <ListTodo size={14} className="text-amber-500" /> Create Task
              </button>
            </div>
          </div>

          {/* Return to Public Website */}
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer shadow-xs ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Switch back to public website view"
          >
            <ExternalLink size={13} /> Return to Site
          </button>

          {/* Log Out Admin Session */}
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                sessionStorage.removeItem('collabs_admin_auth');
                navigate('/');
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-xs ${
              isDark
                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
            title="Log out of Admin Mission Control"
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE: SIDEBAR + CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* EXECUTIVE SIDEBAR */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-64'
          } bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800/80 select-none overflow-y-auto transition-all duration-300`}
        >
          <div className="p-3.5 space-y-6">
            {/* Event Readiness Mini Widget */}
            {!sidebarCollapsed && (
              <div className="p-3.5 rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800/90 text-[11px] space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Zap size={12} /> Event Readiness
                  </span>
                  <span className="text-emerald-400 font-mono font-black">{stats.readinessScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.readinessScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>{stats.completedTasks} tasks complete</span>
                  <span>{stats.pendingTasks} pending</span>
                </div>
              </div>
            )}

            {/* Nav Groups */}
            {['CORE', 'OPERATIONS', 'SECURITY & AUDIT'].map(grp => (
              <div key={grp} className="space-y-1.5">
                {!sidebarCollapsed && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    {grp}
                  </div>
                )}
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
                          className={`w-full flex items-center ${
                            sidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                          } rounded-xl font-medium text-xs transition-all cursor-pointer group relative ${
                            isActive
                              ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                          }`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              size={17}
                              className={`transition-transform group-hover:scale-110 ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                              }`}
                            />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                          </div>
                          {!sidebarCollapsed && item.badge !== null && (
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800'
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

          {/* Admin User Footer Card with Collapse Button */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md border border-blue-400/30">
                  SF
                </div>
                {!sidebarCollapsed && (
                  <div className="leading-tight">
                    <div className="font-bold text-white text-xs">Syed Farhan</div>
                    <div className="text-[10px] text-slate-400 font-mono">Executive Lead</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* WORKSPACE CONTENT AREA */}
        <main
          className={`flex-1 overflow-y-auto p-6 md:p-8 transition-colors duration-200 ${
            isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
          }`}
        >
          {/* ========================================================================= */}
          {/* TAB 1: EXECUTIVE COMMAND CENTER OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
              {/* Dynamic Mission Control Hero Banner with Real Countdown Ticker */}
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 shadow-2xl border border-blue-500/30">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                      <Sparkles size={13} className="text-blue-400" />
                      <span>Executive Command Center</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span className="text-white">Collabs First Mega Summit</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-tight">
                      First Mega Event of Collabs <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-sky-300 to-indigo-300">
                        31 October 2026 · Booni, Upper Chitral
                      </span>
                    </h2>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Supervising {stats.totalTeams} innovation units, {stats.totalVolunteers} registered volunteers, and{' '}
                      {stats.schoolsCount} partner schools across Chitral with real-time on-site verification.
                    </p>
                  </div>

                  {/* Live Countdown Cards Box */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 shadow-inner flex flex-col items-center shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Clock size={12} className="text-blue-400" /> Countdown to Event Kick-off
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'DAYS', val: countdown.days },
                        { label: 'HOURS', val: countdown.hours },
                        { label: 'MINS', val: countdown.minutes },
                        { label: 'SECS', val: countdown.seconds }
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl min-w-[54px]">
                          <div className="text-xl font-black font-mono text-white tabular-nums">
                            {String(item.val).padStart(2, '0')}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 tracking-wider mt-0.5">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 Primary Live KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('teams')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-blue-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Registered Teams</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className={`text-3xl font-black font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {stats.totalTeams}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                    <span>{stats.totalMembers} enrolled members</span>
                    <ArrowUpRight size={13} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('volunteers')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-emerald-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Active Volunteers</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <UserCheck size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-500 font-mono tabular-nums">{stats.activeVolunteers}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                    <span>{stats.totalVolunteers} total in roster</span>
                    <ArrowUpRight size={13} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('schools')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-amber-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Partner Schools</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-500 font-mono tabular-nums">{stats.schoolsCount}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                    <span>Institutions connected</span>
                    <ArrowUpRight size={13} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('certificates')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-purple-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-purple-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Honors Issued</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                      <Award size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-purple-500 font-mono tabular-nums">{stats.totalCerts}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-purple-500 transition-colors">
                    <span>Digital credentials</span>
                    <ArrowUpRight size={13} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('volunteers')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-blue-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Logged Hours</span>
                    <Clock size={16} className="text-blue-500" />
                  </div>
                  <div className={`text-3xl font-black font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {stats.totalHours} hrs
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Youth volunteer service</div>
                </div>

                <div
                  onClick={() => setActiveTab('tasks')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-emerald-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Task Velocity</span>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-emerald-500 font-mono tabular-nums">
                    {stats.completedTasks} / {tasks.length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{stats.pendingTasks} tasks in progress</div>
                </div>

                <div
                  onClick={() => setActiveTab('events')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-indigo-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Event Tracks</span>
                    <Calendar size={16} className="text-indigo-500" />
                  </div>
                  <div className="text-3xl font-black text-indigo-500 font-mono tabular-nums">{events.length || 1}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Exhibition stages scheduled</div>
                </div>

                <div
                  onClick={() => setActiveTab('scanner')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-teal-500/60 shadow-lg text-white'
                      : 'bg-white border-slate-200/90 hover:border-teal-400 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 mb-1">
                    <span>Gate Check-in</span>
                    <QrIcon size={16} className="text-teal-500" />
                  </div>
                  <div className="text-3xl font-black text-teal-500 font-mono tabular-nums">LIVE</div>
                  <div className="text-[11px] text-slate-400 mt-1">On-site validator online</div>
                </div>
              </div>

              {/* Data Visualizations: 2 Comprehensive Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* School Network Representation Chart */}
                <div
                  className={`p-6 rounded-3xl border shadow-xl ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-heading font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        School & College Participation
                      </h3>
                      <p className="text-xs text-slate-400">Distribution of enrolled teams and volunteers by institution</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('schools')}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600"
                    >
                      View Network →
                    </button>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={schoolChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                        <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0f172a' : '#ffffff',
                            borderColor: isDark ? '#334155' : '#cbd5e1',
                            borderRadius: '12px',
                            color: isDark ? '#fff' : '#0f172a',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="Teams" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Volunteers" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Operations & Tasks Execution Breakdown */}
                <div
                  className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-heading font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Operational Task Readiness
                      </h3>
                      <p className="text-xs text-slate-400">Execution status of event logistics, IT, and safety preparations</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600"
                    >
                      Manage Tasks →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {taskChartData.map(st => (
                      <div
                        key={st.name}
                        className={`p-3 rounded-2xl text-center border ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-slate-400">{st.name}</div>
                        <div className="text-xl font-black font-mono mt-1" style={{ color: st.color }}>
                          {st.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick recent tasks preview */}
                  <div className="space-y-2">
                    {tasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-xl flex items-center justify-between text-xs border ${
                          isDark
                            ? 'bg-slate-900/90 border-slate-800/80 text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
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
                          <span className="font-semibold truncate">{task.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{task.assignee.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions Dock & Real-Time Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Administrative Shortcuts */}
                <div
                  className={`p-6 rounded-3xl border shadow-xl space-y-3 ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                  }`}
                >
                  <h3 className={`font-heading font-black text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Administrative Shortcuts
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Direct commands to operate the event platform</p>

                  <button
                    onClick={() => setActiveTab('teams')}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800/90 hover:border-blue-500/50 text-slate-200 border-slate-800'
                        : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users size={16} className="text-blue-500" /> Launch Multi-Step Team Wizard
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('volunteers')}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800/90 hover:border-emerald-500/50 text-slate-200 border-slate-800'
                        : 'bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <UserCheck size={16} className="text-emerald-500" /> Register Volunteer with Duplicate Protection
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>

                  <button
                    onClick={() => setIsIssueCertModalOpen(true)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800/90 hover:border-purple-500/50 text-slate-200 border-slate-800'
                        : 'bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Award size={16} className="text-purple-500" /> Issue Digital Certificate
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      exportCSV(teamParticipations, 'teams_master.csv');
                      exportCSV(volunteers, 'volunteers_master.csv');
                    }}
                    className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    <span className="flex items-center gap-2.5">
                      <Download size={16} /> Export Complete Organization Snapshot
                    </span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Real-time Activity Feed */}
                <div
                  className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-heading font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Live Activity & Audit Feed
                      </h3>
                      <p className="text-xs text-slate-400">Chronological ledger of registrations and operations</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600"
                    >
                      Full Audit Trail →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl flex items-center justify-between text-xs border transition-colors ${
                          isDark
                            ? 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              item.type === 'team'
                                ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                : item.type === 'volunteer'
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : item.type === 'certificate'
                                ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                                : item.type === 'checkin'
                                ? 'bg-teal-500/20 text-teal-500 border border-teal-500/30'
                                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {item.type[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold">{item.action}</div>
                            <div className="text-[11px] text-slate-400">{item.entity}</div>
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
              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Exhibition Timeline</div>
                  <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Event Schedule & Sessions
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage session agendas, stage allocations, and seat capacity for the 31 October 2026 Booni event.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCSV(events, 'event_sessions.csv')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer flex items-center gap-2 ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Download size={15} /> Export CSV
                  </button>
                  <button
                    onClick={() => setIsAddEventModalOpen(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Session
                  </button>
                </div>
              </div>

              {/* Event Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
                      isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold">
                        {ev.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {ev.seatsLeft} / {ev.totalSeats} Seats Left
                      </span>
                    </div>

                    <div>
                      <h3 className={`font-heading font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{ev.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-blue-500">
                          <Calendar size={13} /> {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {ev.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} /> {ev.venue}
                        </span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{ev.description}</p>

                    {ev.agendaItems && ev.agendaItems.length > 0 && (
                      <div className={`pt-3 border-t space-y-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Itinerary</div>
                        {ev.agendaItems.map((item: string, i: number) => (
                          <div key={i} className={`text-xs flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
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
              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Institutional Network</div>
                  <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Partner School & College Network
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Supervise institutional delegations across Upper Chitral, student teams, and academic faculty liaisons.
                  </p>
                </div>
                <button
                  onClick={() => exportCSV(schoolAnalytics, 'school_network_report.csv')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer flex items-center gap-2 ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                  }`}
                >
                  <Download size={15} /> Export Institutional Summary
                </button>
              </div>

              {/* Schools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schoolAnalytics.map((sc, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition-colors ${
                      isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4">
                        <Building2 size={20} />
                      </div>
                      <h3 className={`font-heading font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{sc.school}</h3>
                      <p className="text-xs text-slate-400 mt-1">Upper Chitral District · Academic Partner</p>

                      <div className={`grid grid-cols-2 gap-3 my-4 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className={`p-3 rounded-xl text-center border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Teams</div>
                          <div className="text-xl font-black text-blue-500 font-mono mt-0.5">{sc.teams}</div>
                        </div>
                        <div className={`p-3 rounded-xl text-center border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Volunteers</div>
                          <div className="text-xl font-black text-emerald-500 font-mono mt-0.5">{sc.volunteers}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('teams');
                        showToast(`Filtering for ${sc.school}`);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer text-center ${
                        isDark
                          ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      View Assigned Teams →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: TASKS & READINESS */}
          {/* ========================================================================= */}
          {activeTab === 'tasks' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Operations Hub</div>
                  <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Event Operations & Tasks
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Assign responsibilities to volunteer squads, track IT readiness, logistics, and on-ground safety.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCSV(tasks, 'operations_tasks.csv')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer flex items-center gap-2 ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Download size={15} /> Export Tasks
                  </button>
                  <button
                    onClick={() => setIsNewTaskModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-2"
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
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : isDark
                        ? 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-white'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {flt} ({flt === 'All' ? tasks.length : tasks.filter(t => t.status === flt).length})
                  </button>
                ))}
              </div>

              {/* Tasks List */}
              <div
                className={`rounded-3xl border shadow-xl overflow-hidden ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {tasks
                    .filter(t => taskFilter === 'All' || t.status === taskFilter)
                    .map(task => {
                      const isDone = task.status === 'Completed';
                      return (
                        <div
                          key={task.id}
                          className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'
                          }`}
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
                                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                                  : isDark
                                  ? 'border-slate-700 hover:border-blue-500 text-transparent bg-slate-900'
                                  : 'border-slate-300 hover:border-blue-600 text-transparent bg-white'
                              }`}
                            >
                              <Check size={14} />
                            </button>
                            <div>
                              <div
                                className={`font-bold text-sm ${
                                  isDone
                                    ? isDark ? 'line-through text-slate-500' : 'line-through text-slate-400'
                                    : isDark ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {task.assignee}
                                </span>
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
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                task.priority === 'High'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : isDark
                                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {task.priority} Priority
                            </span>

                            <button
                              onClick={() => {
                                setTasks(prev => prev.filter(t => t.id !== task.id));
                                showToast('Task removed.');
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
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
          {/* TAB 7: DIGITAL HONORS & CREDENTIALS */}
          {/* ========================================================================= */}
          {activeTab === 'certificates' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Official Credentials</div>
                  <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Digital Certificates & Honors
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Issue cryptographically referenced certificates with dynamic QR code verification for attendees and winners.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCSV(certDatabase, 'certificates_database.csv')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer flex items-center gap-2 ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Download size={15} /> Export Registry ({certDatabase.length})
                  </button>
                  <button
                    onClick={() => setIsIssueCertModalOpen(true)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-purple-600/30 cursor-pointer flex items-center gap-2"
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
                    className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs border ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-800 text-white focus:outline-none focus:border-purple-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600'
                    }`}
                  />
                </div>

                <select
                  value={certFilterType}
                  onChange={e => setCertFilterType(e.target.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium cursor-pointer border ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 text-slate-300 focus:outline-none focus:border-purple-500'
                      : 'bg-white border-slate-200 text-slate-800 focus:outline-none focus:border-purple-600'
                  }`}
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
                      className={`p-6 rounded-3xl border shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between cursor-pointer group ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-800 hover:border-purple-500/60 text-white'
                          : 'bg-white border-slate-200/90 hover:border-purple-300 text-slate-900 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-mono text-[10px] font-bold text-purple-400 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-lg">
                            {cert.id}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Verified Valid
                          </span>
                        </div>

                        <h3 className={`font-heading font-black text-lg group-hover:text-purple-500 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {cert.recipientName}
                        </h3>
                        <div className="text-xs font-semibold text-purple-500 mt-1">{cert.achievementType}</div>
                        <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400" />
                          <span>{cert.school || 'Partner School'}</span>
                        </div>
                      </div>

                      <div className={`mt-5 pt-3 border-t flex items-center justify-between text-xs text-slate-400 ${
                        isDark ? 'border-slate-800/80' : 'border-slate-100'
                      }`}>
                        <span className="font-mono text-[11px]">{cert.issueDate}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setPreviewCert(cert);
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-500 rounded-lg cursor-pointer"
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
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
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
          {/* TAB 8: ON-SITE QR SCANNER & GATE CHECK-IN STATION */}
          {/* ========================================================================= */}
          {activeTab === 'scanner' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
                  isDark ? 'bg-slate-950/80 border-teal-500/30' : 'bg-white border-slate-200/90 shadow-md'
                }`}
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                      On-Site Security Station
                    </div>
                    <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Event QR Check-In & Scanner
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Validate participant team badges, volunteer credentials, and official certificates live on-ground at Booni.
                    </p>
                  </div>
                </div>

                {/* Simulated Camera Targeting Reticle Viewport */}
                <div
                  className={`mt-6 p-6 rounded-2xl border-2 border-dashed text-center relative overflow-hidden ${
                    isDark ? 'bg-slate-900 border-teal-500/40' : 'bg-teal-50/50 border-teal-300'
                  }`}
                >
                  <div className="absolute inset-x-0 h-0.5 bg-teal-400 shadow-md shadow-teal-400 animate-pulse top-1/2 -translate-y-1/2"></div>
                  <div className="flex flex-col items-center justify-center py-6 space-y-2 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500">
                      <Camera size={28} className="animate-pulse" />
                    </div>
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Camera Viewport Active
                    </div>
                    <div className="text-xs text-slate-400 max-w-sm">
                      Position QR badge in front of camera or enter credential code below for instant verification.
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <QrIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                    <input
                      type="text"
                      placeholder="Scan badge or enter code (e.g. CLB-TEAM-01, vol-101, CLB-2026-892)..."
                      value={scannerCode}
                      onChange={e => setScannerCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyCode(scannerCode)}
                      className={`w-full pl-10 pr-3 py-3 rounded-2xl text-xs font-mono shadow-inner border ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:outline-none focus:border-teal-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-teal-600'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => handleVerifyCode(scannerCode)}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-teal-600/30 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Verify Check-In
                  </button>
                </div>

                {/* Quick Test Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Quick test sample codes:
                  </span>
                  {teamParticipations.slice(0, 2).map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setScannerCode(t.teamCode || t.id);
                        handleVerifyCode(t.teamCode || t.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] cursor-pointer transition-colors border ${
                        isDark
                          ? 'bg-slate-900 hover:bg-blue-900/40 text-blue-400 border-slate-800'
                          : 'bg-slate-100 hover:bg-blue-50 text-blue-700 border-slate-200'
                      }`}
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
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] cursor-pointer transition-colors border ${
                        isDark
                          ? 'bg-slate-900 hover:bg-emerald-900/40 text-emerald-400 border-slate-800'
                          : 'bg-slate-100 hover:bg-emerald-50 text-emerald-700 border-slate-200'
                      }`}
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
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] cursor-pointer transition-colors border ${
                        isDark
                          ? 'bg-slate-900 hover:bg-purple-900/40 text-purple-400 border-slate-800'
                          : 'bg-slate-100 hover:bg-purple-50 text-purple-700 border-slate-200'
                      }`}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan Results Card */}
              {scanResult && (
                <div
                  className={`p-6 md:p-8 rounded-3xl border shadow-2xl animate-fadeIn ${
                    scanResult.success
                      ? isDark
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-white'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : isDark
                      ? 'bg-red-950/60 border-red-500/50 text-white'
                      : 'bg-red-50 border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                        scanResult.success ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {scanResult.success ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            scanResult.success
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-500 border border-red-500/40'
                          }`}
                        >
                          {scanResult.success ? 'VALIDATED RECORD' : 'VERIFICATION FAILED'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Booni Summit Entry Gate</span>
                      </div>
                      <h3 className="text-xl font-black font-heading">{scanResult.title}</h3>

                      {scanResult.details && (
                        <div
                          className={`mt-4 p-4 rounded-2xl border text-xs space-y-2 ${
                            isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
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
          {/* TAB 9: AUDIT TRAIL */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance & Audit</div>
                  <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    System Audit Trail & History
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Immutable administrative action log recording approvals, task changes, certificates, and logins.
                  </p>
                </div>
                <button
                  onClick={() => exportCSV(auditLogs, 'audit_trail_export.csv')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer flex items-center gap-2 ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                  }`}
                >
                  <Download size={15} /> Export Audit Trail
                </button>
              </div>

              {/* Audit Table */}
              <div
                className={`rounded-3xl border shadow-xl overflow-hidden ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Actor / Operator</th>
                      <th className="py-4 px-6">Action Executed</th>
                      <th className="py-4 px-6">Entity / Details</th>
                      <th className="py-4 px-6 text-center">Category</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-850 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                    {auditLogs.map(log => (
                      <tr key={log.id} className={isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'}>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                        <td className={`py-4 px-6 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.actor}</td>
                        <td className="py-4 px-6 font-bold">{log.action}</td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-400">{log.entity}</td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              log.type === 'team'
                                ? 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                : log.type === 'volunteer'
                                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                                : log.type === 'certificate'
                                ? 'bg-purple-500/20 text-purple-500 border-purple-500/30'
                                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
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
          {/* TAB 10: SYSTEM CONTROLS & SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">System Configuration</div>
                <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Platform Settings & Controls
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage public enrollment availability, visual themes, system status, emergency broadcast alerts, and data backups.
                </p>
              </div>

              <div
                className={`p-6 md:p-8 rounded-3xl border shadow-xl space-y-6 text-xs ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                {/* Theme Selector Setting */}
                <div className={`flex items-center justify-between pb-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div>
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Theme Appearance (Dark & Light Mode)
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Switch between Executive Dark Mode and Clean Light SaaS Dashboard.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTheme('dark');
                        localStorage.setItem('collabs_admin_theme', 'dark');
                        showToast('Theme set to Dark Mode');
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border ${
                        isDark
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Moon size={14} /> Dark Mode
                    </button>
                    <button
                      onClick={() => {
                        setTheme('light');
                        localStorage.setItem('collabs_admin_theme', 'light');
                        showToast('Theme set to Light Mode');
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border ${
                        !isDark
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <Sun size={14} /> Light Mode
                    </button>
                  </div>
                </div>

                {/* Setting 1: Registration Status */}
                <div className={`flex items-center justify-between pb-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div>
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Public Team & Volunteer Registration
                    </div>
                    <div className="text-slate-400 mt-0.5">Allow students and teams to submit new registrations via the public site.</div>
                  </div>
                  <button
                    onClick={() => {
                      setRegistrationOpen(!registrationOpen);
                      showToast(`Registration set to ${!registrationOpen ? 'OPEN' : 'CLOSED'}`);
                      addAuditLog('Toggled Registration', !registrationOpen ? 'OPEN' : 'CLOSED', 'system');
                    }}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      registrationOpen
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {registrationOpen ? 'OPEN (Active)' : 'CLOSED (Paused)'}
                  </button>
                </div>

                {/* Setting 2: Emergency Announcement Banner */}
                <div className={`space-y-3 pb-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Emergency Announcement Broadcast
                      </div>
                      <div className="text-slate-400 mt-0.5">Display a top banner on the public website for urgent alerts.</div>
                    </div>
                    <button
                      onClick={() => {
                        setEmergencyBanner(!emergencyBanner);
                        showToast(`Emergency alert banner ${!emergencyBanner ? 'ACTIVATED' : 'DEACTIVATED'}`);
                        addAuditLog('Emergency Banner', !emergencyBanner ? 'ACTIVE' : 'OFF', 'system');
                      }}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        emergencyBanner
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
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
                      className={`w-full p-3 rounded-xl text-xs ${
                        isDark ? 'bg-red-950/40 border border-red-500/40 text-red-200' : 'bg-red-50 border border-red-200 text-red-900'
                      }`}
                    />
                  )}
                </div>

                {/* Setting 3: Event Date & Location Confirmation */}
                <div className={`flex items-center justify-between pb-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div>
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Event Date & Location</div>
                    <div className="text-slate-400 mt-0.5">Target schedule synchronized across all public and admin pages.</div>
                  </div>
                  <div className="font-bold font-mono text-blue-500 bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-xl">
                    31 October 2026 · Booni, Upper Chitral
                  </div>
                </div>

                {/* Setting 4: Data Snapshot Backup */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>System JSON Snapshot</div>
                    <div className="text-slate-400 mt-0.5">Download entire database state (teams, volunteers, certs, tasks) as JSON.</div>
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
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border animate-fadeIn text-left space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center border border-purple-500/30">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className={`font-heading font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Issue Official Certificate
                  </h3>
                  <p className="text-[11px] text-slate-400">Generate verified credential for Booni event</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueCertModalOpen(false)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 ${
                  isDark ? 'bg-slate-800 hover:text-white' : 'bg-slate-100'
                }`}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleIssueCertificateSubmit} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Bibi"
                  value={newCertForm.recipientName}
                  onChange={e => setNewCertForm({ ...newCertForm, recipientName: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Achievement / Honor Level
                </label>
                <select
                  value={newCertForm.achievementType}
                  onChange={e => setNewCertForm({ ...newCertForm, achievementType: e.target.value as any })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Excellence">Excellence</option>
                  <option value="Volunteer Leadership">Volunteer Leadership</option>
                  <option value="Active Participation">Active Participation</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  School / Institution
                </label>
                <select
                  value={newCertForm.school}
                  onChange={e => setNewCertForm({ ...newCertForm, school: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {COMMON_SCHOOLS.map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Issue Date
                </label>
                <input
                  type="text"
                  value={newCertForm.issueDate}
                  onChange={e => setNewCertForm({ ...newCertForm, issueDate: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueCertModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border animate-fadeIn text-left space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="font-bold text-xs uppercase tracking-wider text-purple-500">Official Certificate Preview</div>
              <button
                onClick={() => setPreviewCert(null)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 ${
                  isDark ? 'bg-slate-800 hover:text-white' : 'bg-slate-100'
                }`}
              >
                <X size={14} />
              </button>
            </div>

            {/* Certificate Template Card */}
            <div
              className={`p-6 rounded-2xl border-2 text-center space-y-4 relative shadow-inner ${
                isDark
                  ? 'border-purple-500/30 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white'
                  : 'border-purple-200 bg-linear-to-b from-purple-50/40 to-white text-slate-900'
              }`}
            >
              <div className="text-[11px] font-bold text-purple-500 tracking-widest uppercase">
                First Mega Event of Collabs · Upper Chitral
              </div>
              <h3 className={`font-heading font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Certificate of {previewCert.achievementType}
              </h3>
              <p className="text-xs text-slate-400">This official credential proudly honors</p>
              <div
                className={`text-xl font-black border-b pb-2 max-w-xs mx-auto ${
                  isDark ? 'text-purple-300 border-purple-500/30' : 'text-purple-900 border-purple-200'
                }`}
              >
                {previewCert.recipientName}
              </div>
              <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                For exemplary contribution and innovation at the First Mega Event of Collabs held in Booni on 31 October 2026.
              </p>

              <div className={`pt-4 flex items-center justify-between border-t text-left text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <div className="font-mono text-[10px] text-slate-400">CREDENTIAL ID</div>
                  <div className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{previewCert.id}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{previewCert.issueDate}</div>
                </div>

                {previewCertQr && (
                  <div className="text-center">
                    <img src={previewCertQr} alt="QR" className="w-16 h-16 rounded border bg-white p-0.5 inline-block" />
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">Scan to Verify</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={() => setPreviewCert(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border animate-fadeIn text-left space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <ListTodo size={18} className="text-blue-500" />
                <h3 className={`font-heading font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  New Operational Task
                </h3>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 ${
                  isDark ? 'bg-slate-800 hover:text-white' : 'bg-slate-100'
                }`}
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
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Test video projector in Hall 2"
                  value={newTaskForm.title}
                  onChange={e => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Department
                  </label>
                  <select
                    value={newTaskForm.department}
                    onChange={e => setNewTaskForm({ ...newTaskForm, department: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Operations">Operations</option>
                    <option value="Media">Media</option>
                    <option value="Outreach">Outreach</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Priority
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={e => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Assigned Person or Squad
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarish Salik / Logistics Squad"
                  value={newTaskForm.assignee}
                  onChange={e => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border animate-fadeIn text-left space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500" />
                <h3 className={`font-heading font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Schedule Session
                </h3>
              </div>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 ${
                  isDark ? 'bg-slate-800 hover:text-white' : 'bg-slate-100'
                }`}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Robotics Exhibition Stall Demos"
                  value={newEventForm.title}
                  onChange={e => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Category
                  </label>
                  <select
                    value={newEventForm.category}
                    onChange={e => setNewEventForm({ ...newEventForm, category: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Workshops">Workshops</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={newEventForm.time}
                    onChange={e => setNewEventForm({ ...newEventForm, time: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Venue / Stage Location
                </label>
                <input
                  type="text"
                  value={newEventForm.venue}
                  onChange={e => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newEventForm.description}
                  onChange={e => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
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
