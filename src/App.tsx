import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AdminPage from './pages/Admin.tsx';
import { AdminLoginGate } from './components/AdminLoginGate';
import QRCode from 'qrcode';
import officialLogo from './assets/images/logo2.png';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  FileCheck2,
  Search,
  PlusCircle,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Send,
  Trophy,
  Check,
  QrCode,
  Copy,
  Link2,
  Type,
  Maximize2,
  Minimize2,
  ArrowUp,
  Shield,
  Medal,
  Instagram,
  Youtube,
  Linkedin,
  Wifi,
  Phone,
  Download,
  IdCard,
  RotateCw,
  Building2,
  RefreshCw,
  Share2,
  BadgeCheck,
  Smartphone,
  AlertTriangle,
  Layers,
  User,
  Lightbulb,
  Target,
  Globe,
  Leaf,
  FileSpreadsheet,
  Eye,
  Trash2,
  ArrowUpDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowDownAZ,
  ArrowUpAZ,
  Cpu,
  Palette,
  Utensils,
  Droplets,
  GraduationCap,
  Filter,
  CheckSquare,
  Square,
  UserCheck,
  Briefcase,
  Radio,
  Zap,
  Key,
  Compass,
  ShieldCheck,
  CheckCheck,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import { BulkTeamImportModal } from './components/BulkTeamImportModal';
import { TeamDetailsModal } from './components/TeamDetailsModal';
import { CertificatePortal, CertificateRecord } from './components/CertificatePortal';
import { VolunteerDutyTracker } from './components/VolunteerDutyTracker';
import {
  subscribeTeams,
  deleteTeamFromFirestore,
  bulkImportTeamsToFirestore,
  seedInitialTeamsIfEmpty
} from './services/teamService';
import { testConnection } from './firebase/firebaseConfig';
import { SAF_FORM_RESPONSES_TEAMS } from './data/registeredTeamsData';

export interface EventItem {
  id: string;
  title: string;
  category: 'Upcoming' | 'Workshops' | 'Completed';
  date: string;
  time: string;
  venue: string;
  description: string;
  seatsLeft: number;
  totalSeats: number;
  agendaItems?: string[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus?: string;
  department?: string;
  responsibilities?: string[];
}

export interface VolunteerLog {
  id: string;
  name: string;
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  school?: string;
  role?: string;
  department: 'Technical' | 'Logistics' | 'Content' | 'Outreach' | string;
  hours: number;
  duties: string;
  dateJoined: string;
  status: 'Verified Active' | 'Lead Volunteer' | 'Active' | 'Pending' | 'Inactive' | string;
  assignedTasks?: string[];
  completedTasks?: string[];
  station?: string;
  shiftTime?: string;
  checkedIn?: boolean;
  checkInTime?: string;
}

export type { CertificateRecord };

export interface ParticipantMember {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  school?: string;
  volunteerId?: string;
}

export interface TeamParticipation {
  id: string;
  teamCode?: string;
  projectName: string;
  teamLeader: string;
  coLeader?: string;
  supervisor?: string;
  school?: string;
  campus?: string;
  location?: string;
  stallNumber?: string;
  category?: string;
  capacity?: number;
  members: ParticipantMember[];
  projectDescription: string;
  award?: 'First Place' | 'Second Place' | 'Third Place' | 'Participation';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
  qrCodeUrl?: string;
}

export const getTeamStallNumber = (team: {
  stallNumber?: string;
  location?: string;
  teamCode?: string;
  id?: string;
}): string => {
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
};

const INITIAL_TEAM_PARTICIPATIONS: TeamParticipation[] = SAF_FORM_RESPONSES_TEAMS;


const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    title: 'First Mega Event of Collabs',
    category: 'Upcoming',
    date: '31 October 2026',
    time: '09:30 AM – 05:30 PM PKT',
    venue: 'TMA Hall / Office, Booni, Upper Chitral',
    description: 'The landmark first mega gathering of Collabs in Chitral. Bringing together youth innovators, builders, students, and mentors for hands-on collaboration, workshops, and recognition.',
    seatsLeft: 85,
    totalSeats: 300,
    agendaItems: [
      '09:30 AM: Opening Assembly & Welcome at TMA Office Booni',
      '11:00 AM: Hands-on Youth Tech & Problem-Solving Ideation Sprint',
      '01:30 PM: Community Networking, Project Demos & Idea Exchange',
      '03:30 PM: Digital Certificates & Volunteer Recognition Ceremony'
    ]
  }
];

const MANAGEMENT_ROLES = [
  {
    id: 'role-1',
    title: 'Role 1: Overall Leadership & Strategic Direction',
    members: 'Aarish Salik (IT Lead) & Umme Kulsoom (Director)',
    responsibilities: [
      'Oversee the entire exhibition timeline, budget, and overall vision.',
      'Coordinate between different departments and make final executive decisions.',
      'Handle official communications, external guests, and key institutional stakeholders.'
    ]
  },
  {
    id: 'role-2',
    title: 'Role 2: Operations, Logistics & External Relations',
    members: 'Aarish Salik (IT Lead), Shahan (Relations Manager), & Zeeshan (Event Manager)',
    responsibilities: [
      'IT & Tech Support: Manage registration software, presentations, screens, and technical troubleshooting during the event (Aarish).',
      'Exhibition & Crowd Flow: Handle venue setup, seating, scheduling, and general attendee management (Zeeshan).',
      'External Coordination: Manage guest relations, sponsorships, partnerships, and announcements (Shahan).'
    ]
  },
  {
    id: 'role-3',
    title: 'Role 3: Media, Branding & Content Creation',
    members: 'Ayan Afzal, Mazhar, & Afroza (Media Team)',
    responsibilities: [
      'Capture high-quality photography and videography throughout the exhibition.',
      'Manage live updates, social media coverage, and promotional content.',
      'Handle media booth setup, visitor interviews, and post-event highlight reels.'
    ]
  }
];

const INITIAL_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Syed Farhan Danish', role: 'Founder', department: 'Executive' },
  { id: 'tm-2', name: 'Umme Kulsoom', role: 'Director', department: 'Executive' },
  { id: 'tm-3', name: 'Arish Wazir', role: 'IT Lead', department: 'Tech' },
  { id: 'tm-4', name: 'Madeeha Umar', role: 'Tech Manager', department: 'Tech' },
  { id: 'tm-5', name: 'Azhar Ali Shah', role: 'Operations Manager', department: 'Operations' },
  { id: 'tm-6', name: 'Andaleeb Nawaz', role: 'Ambassador', department: 'Outreach' },
  { id: 'tm-7', name: 'Syed Shahan Ali', role: 'Relations Manager', department: 'Relations' },
  { id: 'tm-8', name: 'Afroza Sardar', role: 'Collaboration Director', department: 'Relations' },
  { id: 'tm-9', name: 'Ehan Ali', role: 'Communications Lead & Event Host', department: 'Media' },
  { id: 'tm-10', name: 'Zakir Hussain', role: 'Finance Manager', department: 'Finance' },
  { id: 'tm-11', name: 'Alina Razaq', role: 'Subject Lead', department: 'Academics' },
  { id: 'tm-12', name: 'Ariyan Mir', role: 'Coordinator', department: 'Operations' },
  { id: 'tm-13', name: 'Ali Hassan', role: 'Coordinator', department: 'Operations' },
  { id: 'tm-14', name: 'Zuhaib Pirzada', role: 'Media Director', department: 'Media' },
  { id: 'tm-15', name: 'Imad Uddin', role: 'Developer', department: 'Tech' },
  { id: 'tm-16', name: 'Syed Mazhar', role: 'Media Manager', department: 'Media' },
  { id: 'tm-17', name: 'Uroosa', role: 'Field Manager', department: 'Operations' },
  { id: 'tm-18', name: 'Akhtar Musaveer', role: 'Logistics Team', department: 'Logistics' },
  { id: 'tm-19', name: 'Hisham Uddin', role: 'Campus Ambassador', department: 'Outreach' },
  { id: 'tm-20', name: 'Prince Ali', role: 'Campus Ambassador', department: 'Outreach' },
  { id: 'tm-21', name: 'Daniyal Saifullah', role: 'Campus Ambassador', department: 'Outreach' },
  { id: 'tm-22', name: 'Noman Khalid', role: 'Campus Ambassador', department: 'Outreach' },
  { id: 'tm-23', name: 'Syed Rehmat Hussain', role: 'Campus Ambassador', department: 'Outreach' },
  { id: 'tm-24', name: 'Shah Inam Ul Haq', role: 'Campus Ambassador', department: 'Outreach' },
  { id: 'tm-25', name: 'Saleem Yousuf', role: 'Discipline Committee', department: 'Management' }
];

const INITIAL_VOLUNTEERS: VolunteerLog[] = [
  { id: 'vol-1', name: 'Salman Ali', username: 'salman', email: 'salman@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-2', name: 'Faizan Ali Akbar', username: 'faizan', email: 'faizan@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-3', name: 'Syed Sameem', username: 'sameem', email: 'sameem@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-4', name: 'Manahil', username: 'manahil', email: 'manahil@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-5', name: 'Sania Ambareen', username: 'sania', email: 'sania@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-6', name: 'Sehba Rahim', username: 'sehba', email: 'sehba@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-7', name: 'Manahil Akram', username: 'manahil_a', email: 'manahil.akram@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-8', name: 'Rubama Hayat', username: 'rubama', email: 'rubama@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-9', name: 'Aliha', username: 'aliha', email: 'aliha@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-10', name: 'Sonam', username: 'sonam', email: 'sonam@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-11', name: 'Fakiha', username: 'fakiha', email: 'fakiha@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-12', name: 'Anita Mehak', username: 'anita', email: 'anita@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-13', name: 'Ifat Naseem', username: 'ifat', email: 'ifat@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-14', name: 'Sidra Ul Muntaha', username: 'sidra', email: 'sidra@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-15', name: 'Sabbah', username: 'sabbah', email: 'sabbah@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-16', name: 'Amina', username: 'amina', email: 'amina@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-17', name: 'Zoha', username: 'zoha', email: 'zoha@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-18', name: 'Muskan', username: 'muskan', email: 'muskan@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-19', name: 'Farina', username: 'farina', email: 'farina@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-20', name: 'Arshe', username: 'arshe', email: 'arshe@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-21', name: 'Ayan Ali', username: 'ayan', email: 'ayan@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-22', name: 'Shahid Nazir', username: 'shahid', email: 'shahid@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-23', name: 'S.Sani', username: 'ssani', email: 'sani@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-24', name: 'Asin Nawaz', username: 'asin', email: 'asin@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-25', name: 'Mazhar Ali', username: 'mazhar', email: 'mazhar@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-26', name: 'Ania Faraz', username: 'ania', email: 'ania@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-27', name: 'Wania', username: 'wania', email: 'wania@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-28', name: 'Shawana', username: 'shawana', email: 'shawana@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-29', name: 'Shayan Ali', username: 'shayan', email: 'shayan@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' },
  { id: 'vol-30', name: 'Samia Saba', username: 'samia', email: 'samia@collabs.org', role: 'Volunteer', department: 'Event Operations', hours: 12, duties: 'Event support', dateJoined: 'Oct 2026', status: 'Active' }
];

const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'CLB-2026-892',
    recipientName: 'Fatima Zahra',
    achievementType: 'Certificate of Participation',
    eventName: 'Science, Arts & Food Exhibition 2026',
    issueDate: 'October 31, 2026',
    verified: true,
    issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
    school: 'Booni Degree College',
    project: 'Autonomous High-Altitude Robotics Sprint'
  },
  {
    id: 'CLB-2026-401',
    recipientName: 'Elena Rostova',
    achievementType: 'Certificate of Participation',
    eventName: 'Science, Arts & Food Exhibition 2026',
    issueDate: 'October 31, 2026',
    verified: true,
    issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
    school: 'Booni Degree College',
    project: 'Lead Systems Engineer & Volunteer Coordinator'
  },
  {
    id: 'CLB-2026-774',
    recipientName: 'Marcus Vance',
    achievementType: 'Certificate of Participation',
    eventName: 'Science, Arts & Food Exhibition 2026',
    issueDate: 'October 31, 2026',
    verified: true,
    issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
    school: 'Chitral University · Tech Wing',
    project: 'Clean Mountain Hydro-Turbine Prototype'
  },
  {
    id: 'CLB-2026-105',
    recipientName: 'Ahmad Khan',
    achievementType: 'Certificate of Participation',
    eventName: 'Science, Arts & Food Exhibition 2026',
    issueDate: 'October 31, 2026',
    verified: true,
    issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
    school: 'Pamir Public School & College Booni',
    project: 'Smart High-Altitude Agriculture & Soil Sensor'
  },
  {
    id: 'CLB-2026-520',
    recipientName: 'Asad Ullah',
    achievementType: 'Certificate of Participation',
    eventName: 'Science, Arts & Food Exhibition 2026',
    issueDate: 'October 31, 2026',
    verified: true,
    issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
    school: 'Chitral Community Model School',
    project: 'Chitral Code Guild · Digital Literacy'
  }
];



export default function App() {
  // Font Selector State - Playfair Display, Inter, Roboto
  const [headingFont, setHeadingFont] = useState<'playfair' | 'inter' | 'roboto'>('playfair');

  useEffect(() => {
    document.documentElement.setAttribute('data-font', headingFont);
  }, [headingFont]);

  // Section Collapse/Expand State
  const [sectionsExpanded, setSectionsExpanded] = useState({
    heroCountdown: true,
    eventsHub: true,
    teamDirectory: true,
    volunteerNetwork: true,
    certificatePortal: true,
    awardsShowcase: true,
    badgeGenerator: true
  });

  // Individual Card-Level Expand/Collapse State
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({
    'role-1': true,
    'role-2': true,
    'role-3': true
  });

  const selectedTeamMemberIdState = useState<string>('tm-1');
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0);
  const teamSliderRef = useRef<HTMLDivElement>(null);
  const volunteerSliderRef = useRef<HTMLDivElement>(null);

  const scrollTeam = (direction: 'left' | 'right') => {
    if (teamSliderRef.current) {
      teamSliderRef.current.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
    }
  };

  const scrollVolunteers = (direction: 'left' | 'right') => {
    if (volunteerSliderRef.current) {
      volunteerSliderRef.current.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
    }
  };

  const selectedTeamMemberId = selectedTeamMemberIdState[0];
  const setSelectedTeamMemberId = selectedTeamMemberIdState[1];

  const toggleRole = (id: string) => {
    setExpandedRoles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSection = (sectionKey: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleExpandAll = () => {
    setSectionsExpanded({
      heroCountdown: true,
      eventsHub: true,
      teamDirectory: true,
      volunteerNetwork: true,
      certificatePortal: true,
      awardsShowcase: true,
      badgeGenerator: true
    });
  };

  const handleCollapseAll = () => {
    setSectionsExpanded({
      heroCountdown: false,
      eventsHub: false,
      teamDirectory: false,
      volunteerNetwork: false,
      certificatePortal: false,
      awardsShowcase: false,
      badgeGenerator: false
    });
  };

  // Smooth scroll handler that auto-expands the target section if collapsed
  const handleSmoothNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string, sectionKey?: keyof typeof sectionsExpanded) => {
    e.preventDefault();
    if (sectionKey && !sectionsExpanded[sectionKey]) {
      setSectionsExpanded(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Navigation & Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedTeamMemberModal, setSelectedTeamMemberModal] = useState<TeamMember | null>(null);
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<string>('events');

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'events', el: document.getElementById('events') },
        { id: 'team', el: document.getElementById('team') },
        { id: 'participants', el: document.getElementById('team-participation') },
        { id: 'judging', el: document.getElementById('judging-criteria') },
        { id: 'volunteers', el: document.getElementById('volunteers') },
        { id: 'certificates', el: document.getElementById('certificates') },
        { id: 'awards', el: document.getElementById('awards') },
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.el) {
          const top = section.el.offsetTop;
          if (scrollPosition >= top) {
            setActiveNavTab(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Events filter
  const [eventFilter, setEventFilter] = useState<'All' | 'Upcoming' | 'Workshops' | 'Completed'>('All');

  // Participation filter & sorting controls
  const [participationSearch, setParticipationSearch] = useState('');
  const [participationStatusFilter, setParticipationStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [participationCategoryFilter, setParticipationCategoryFilter] = useState<string>('All');
  const [participationSort, setParticipationSort] = useState<string>('name-asc');
  const [participationViewMode, setParticipationViewMode] = useState<'grid' | 'table'>('grid');
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(false);

  // Real-time Countdown strictly for 31 October 2026
  const [timeLeft, setTimeLeft] = useState({ days: 8, hours: 19, minutes: 48, seconds: 20 });

  useEffect(() => {
    const calculateCountdown = () => {
      // Event Date: 31 October 2026 at 09:30 AM PKT
      const targetTime = new Date('2026-10-31T09:30:00').getTime();
      const actualNow = Date.now();
      const diff = targetTime - actualNow;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 8, hours: 19, minutes: 45, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Volunteer Roster, Login & Signup state
  const [volunteers, setVolunteers] = useState<VolunteerLog[]>(INITIAL_VOLUNTEERS);
  const [volunteerFilter, setVolunteerFilter] = useState<string>('All');
  const [loggedInVolunteer, setLoggedInVolunteer] = useState<VolunteerLog | null>(null);
  const [volLoginUsername, setVolLoginUsername] = useState('');
  const [volLoginPassword, setVolLoginPassword] = useState('');
  const [volLoginError, setVolLoginError] = useState('');
  const [volForm, setVolForm] = useState({
    name: '',
    email: '',
    department: 'Technical' as 'Technical' | 'Logistics' | 'Content' | 'Outreach',
    availability: '4-8 Hours / Week',
    experience: ''
  });
  const [volSubmitted, setVolSubmitted] = useState(false);
  const [volunteerSuccessMsg, setVolunteerSuccessMsg] = useState('');
  const [scannedCheckInTeam, setScannedCheckInTeam] = useState<TeamParticipation | null>(null);
  const [checkInStationName, setCheckInStationName] = useState<string>('Main Gate & Registration Desk');
  const [checkInScanSuccess, setCheckInScanSuccess] = useState<string | null>(null);
  const [stationCheckInLogs, setStationCheckInLogs] = useState<Array<{ id: string; teamCode: string; projectName: string; station: string; time: string; volunteerName: string }>>([
    { id: 'log-1', teamCode: 'CLB-COMM-01', projectName: 'Chitral River Micro-Hydro', station: 'Main Gate Registration Desk', time: '09:15 AM PKT', volunteerName: 'Marcus Vance' },
    { id: 'log-2', teamCode: 'CLB-COMM-02', projectName: 'High-Altitude Greenhouse', station: 'Exhibition Pavilion Beta', time: '09:42 AM PKT', volunteerName: 'Elena Rostova' }
  ]);
  const [isCameraScannerActive, setIsCameraScannerActive] = useState<boolean>(false);
  const [manualScanInput, setManualScanInput] = useState<string>('');

  const handleScanCheckInCode = (codeText: string) => {
    let cleanCode = codeText.trim();
    try {
      if (cleanCode.startsWith('{')) {
        const parsed = JSON.parse(cleanCode);
        if (parsed.teamCode) cleanCode = parsed.teamCode;
        else if (parsed.id) cleanCode = parsed.id;
      }
    } catch (e) {}

    const match = teamParticipations.find(
      t => (t.teamCode && t.teamCode.toLowerCase() === cleanCode.toLowerCase()) ||
           t.id.toLowerCase() === cleanCode.toLowerCase() ||
           t.projectName.toLowerCase().includes(cleanCode.toLowerCase())
    );

    if (match) {
      setScannedCheckInTeam(match);
      setCheckInScanSuccess(null);
    } else {
      setCheckInScanSuccess(`No team found matching code "${cleanCode}". Try testing CLB-COMM-01, CLB-COMM-02, or CLB-COMM-03.`);
    }
  };

  const handleConfirmStationCheckIn = () => {
    if (!scannedCheckInTeam) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' PKT';
    const newLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      teamCode: scannedCheckInTeam.teamCode || scannedCheckInTeam.id,
      projectName: scannedCheckInTeam.projectName,
      station: checkInStationName,
      time: timeStr,
      volunteerName: loggedInVolunteer ? loggedInVolunteer.name : 'Duty Volunteer'
    };

    setStationCheckInLogs([newLog, ...stationCheckInLogs]);
    setCheckInScanSuccess(`Successfully checked in ${scannedCheckInTeam.projectName} (${scannedCheckInTeam.teamCode}) at ${checkInStationName}!`);
    setScannedCheckInTeam(null);
    setIsCameraScannerActive(false);
    setTimeout(() => setCheckInScanSuccess(null), 6000);
  };

  const handleVolunteerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setVolLoginError('');
    const found = volunteers.find(
      v => v.username.toLowerCase() === volLoginUsername.trim().toLowerCase()
    );
    if (found) {
      if (!found.password || found.password === volLoginPassword || volLoginPassword === 'collabs2026') {
        setLoggedInVolunteer(found);
        setVolLoginUsername('');
        setVolLoginPassword('');
        setVolunteerTab('mission');
      } else {
        setVolLoginError('Invalid password. Default test password is: collabs2026');
      }
    } else {
      setVolLoginError('Volunteer username not found. Try test usernames: elena, marcus, devon, amina, jordan, chloe');
    }
  };

  // Volunteer Portal Tab and Checklist State
  const [volunteerTab, setVolunteerTab] = useState<'mission' | 'tracks' | 'radar' | 'schedule' | 'apply'>('mission');
  const [selectedRadarStation, setSelectedRadarStation] = useState<string>('st-1');
  const [newVolunteerTaskInput, setNewVolunteerTaskInput] = useState('');
  const [volunteerBadgeQr, setVolunteerBadgeQr] = useState<string>('');

  useEffect(() => {
    if (loggedInVolunteer) {
      QRCode.toDataURL(
        `https://collabs.org/verify/volunteer/${loggedInVolunteer.id}?user=${loggedInVolunteer.username}`,
        { margin: 1, width: 140, color: { dark: '#0f172a', light: '#ffffff' } }
      ).then(url => setVolunteerBadgeQr(url)).catch(() => {});
    }
  }, [loggedInVolunteer]);

  const handleToggleVolunteerTask = (taskText: string) => {
    if (!loggedInVolunteer) return;
    const currentCompleted = loggedInVolunteer.completedTasks || [];
    const isDone = currentCompleted.includes(taskText);
    const updatedCompleted = isDone
      ? currentCompleted.filter(t => t !== taskText)
      : [...currentCompleted, taskText];

    const updated = {
      ...loggedInVolunteer,
      completedTasks: updatedCompleted
    };
    setLoggedInVolunteer(updated);
    setVolunteers(prev => prev.map(v => (v.id === updated.id ? updated : v)));
  };

  const handleToggleVolunteerCheckIn = () => {
    if (!loggedInVolunteer) return;
    const newChecked = !loggedInVolunteer.checkedIn;
    const timeNow = newChecked ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
    const updated = {
      ...loggedInVolunteer,
      checkedIn: newChecked,
      checkInTime: timeNow
    };
    setLoggedInVolunteer(updated);
    setVolunteers(prev => prev.map(v => (v.id === updated.id ? updated : v)));
  };

  const handleAddVolunteerTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInVolunteer || !newVolunteerTaskInput.trim()) return;
    const currentTasks = loggedInVolunteer.assignedTasks || [];
    const updated = {
      ...loggedInVolunteer,
      assignedTasks: [...currentTasks, newVolunteerTaskInput.trim()]
    };
    setLoggedInVolunteer(updated);
    setVolunteers(prev => prev.map(v => (v.id === updated.id ? updated : v)));
    setNewVolunteerTaskInput('');
  };

  const handleQuickVolunteerLogin = (vol: VolunteerLog) => {
    setLoggedInVolunteer(vol);
    setVolLoginError('');
    setVolunteerTab('mission');
  };

  const handleVolunteerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volForm.name || !volForm.email) return;

    const newVol: VolunteerLog = {
      id: `vol-${Date.now().toString().slice(-4)}`,
      name: volForm.name.trim(),
      username: volForm.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'crew',
      email: volForm.email.trim(),
      department: volForm.department,
      school: volForm.experience || 'Chitral Youth Innovation Group',
      role: `${volForm.department} Crew Member`,
      password: 'collabs2026',
      hours: 12,
      duties: `Assigned to ${volForm.department} operations for the 31 October 2026 Booni event.`,
      dateJoined: 'Oct 2026',
      status: 'Active',
      station: volForm.department === 'Technical' ? 'Lab Block A · Hardware Support' : 'Main Venue Concourse',
      shiftTime: '08:30 AM – 03:00 PM PKT',
      assignedTasks: [
        'Attend morning volunteer briefing at 08:00 AM',
        `Assist ${volForm.department} lead with station setup`,
        'Guide event attendees & team participants'
      ],
      completedTasks: [],
      checkedIn: false
    };

    setVolunteers(prev => [newVol, ...prev]);
    setLoggedInVolunteer(newVol);
    setVolSubmitted(true);
    setVolunteerTab('mission');
    setVolForm({
      name: '',
      email: '',
      department: 'Technical',
      availability: '4-8 Hours / Week',
      experience: ''
    });
  };

  // Certificate Generator State
  const [certDatabase, setCertDatabase] = useState<CertificateRecord[]>(INITIAL_CERTIFICATES);
  const [certTheme, setCertTheme] = useState<'gold' | 'emerald' | 'royal'>('gold');
  const [certRecipientSchool, setCertRecipientSchool] = useState('Booni Degree College');
  const [certForm, setCertForm] = useState({
    recipientName: 'Ali Ahmad',
    achievementType: 'Active Participation' as 'Excellence' | 'Volunteer Leadership' | 'Active Participation',
    eventName: 'First Mega Event of Collabs',
    issueDate: '31 October 2026'
  });
  const [teamParticipations, setTeamParticipations] = useState<TeamParticipation[]>(INITIAL_TEAM_PARTICIPATIONS);
  const [isBulkTeamImportOpen, setIsBulkTeamImportOpen] = useState(false);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<TeamParticipation | null>(null);
  const [teamImportToast, setTeamImportToast] = useState<string | null>(null);
  const [teamCardQrs, setTeamCardQrs] = useState<Record<string, string>>({});
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Initialize and synchronize with Firebase Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    testConnection().then(connected => {
      if (connected) {
        setIsFirebaseConnected(true);
        seedInitialTeamsIfEmpty(INITIAL_TEAM_PARTICIPATIONS).then(() => {
          unsubscribe = subscribeTeams(
            firestoreTeams => {
              if (firestoreTeams && firestoreTeams.length > 0) {
                setTeamParticipations(firestoreTeams);
              }
            },
            err => {
              console.warn('Live team sync notice:', err);
            }
          );
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Auto-generate Certificate records & unique verification codes for every enrolled participant
  useEffect(() => {
    setCertDatabase(prev => {
      const existingNames = new Set(prev.map(c => c.recipientName.trim().toLowerCase()));
      const newRecords: CertificateRecord[] = [];

      teamParticipations.forEach(tp => {
        // Leader
        if (tp.teamLeader && tp.teamLeader.trim()) {
          const leaderName = tp.teamLeader.trim();
          if (!existingNames.has(leaderName.toLowerCase())) {
            existingNames.add(leaderName.toLowerCase());
            let hash = 0;
            const str = `${leaderName.toLowerCase()}-${tp.id}`;
            for (let i = 0; i < str.length; i++) {
              hash = (hash << 5) - hash + str.charCodeAt(i);
              hash |= 0;
            }
            const codeNum = 100 + (Math.abs(hash) % 899);
            newRecords.push({
              id: `CLB-2026-${codeNum}`,
              recipientName: leaderName,
              achievementType: 'Certificate of Participation',
              eventName: 'Science, Arts & Food Exhibition 2026',
              issueDate: 'October 31, 2026',
              verified: true,
              issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
              school: tp.school,
              project: tp.projectName
            });
          }
        }

        // Members
        tp.members?.forEach(mem => {
          if (mem.name && mem.name.trim()) {
            const cleanName = mem.name.trim();
            if (!existingNames.has(cleanName.toLowerCase())) {
              existingNames.add(cleanName.toLowerCase());
              let hash = 0;
              const str = `${cleanName.toLowerCase()}-${tp.id}`;
              for (let i = 0; i < str.length; i++) {
                hash = (hash << 5) - hash + str.charCodeAt(i);
                hash |= 0;
              }
              const codeNum = 100 + (Math.abs(hash) % 899);
              newRecords.push({
                id: `CLB-2026-${codeNum}`,
                recipientName: cleanName,
                achievementType: 'Certificate of Participation',
                eventName: 'Science, Arts & Food Exhibition 2026',
                issueDate: 'October 31, 2026',
                verified: true,
                issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
                school: mem.school || tp.school,
                project: tp.projectName
              });
            }
          }
        });
      });

      if (newRecords.length === 0) return prev;
      return [...prev, ...newRecords];
    });
  }, [teamParticipations]);

  // Auto-generate QR codes for team participations
  useEffect(() => {
    teamParticipations.forEach(tp => {
      if (!teamCardQrs[tp.id]) {
        const payload = JSON.stringify({
          id: tp.id,
          code: tp.teamCode || tp.id,
          name: tp.projectName,
          leader: tp.teamLeader,
          school: tp.school || 'Collabs Event',
          event: 'First Mega Event of Collabs 2026'
        });
        QRCode.toDataURL(payload, { width: 240, margin: 1 })
          .then(url => {
            setTeamCardQrs(prev => ({ ...prev, [tp.id]: url }));
          })
          .catch(err => console.error('Failed to generate team QR:', err));
      }
    });
  }, [teamParticipations]);

  const handleBulkImportTeams = async (newTeams: TeamParticipation[], mode: 'append' | 'replace') => {
    // Optimistic UI update
    if (mode === 'replace') {
      setTeamParticipations(newTeams);
    } else {
      setTeamParticipations(prev => [...newTeams, ...prev]);
    }

    try {
      await bulkImportTeamsToFirestore(newTeams, mode);
      setTeamImportToast(
        mode === 'replace'
          ? `Saved to Firebase: Roster updated with ${newTeams.length} teams.`
          : `Saved to Firebase: Successfully added ${newTeams.length} new teams!`
      );
    } catch (err: any) {
      console.error('Firebase save error:', err);
      setTeamImportToast(`Saved locally (Firebase sync pending: ${err.message || 'offline'})`);
    }
    setTimeout(() => setTeamImportToast(null), 5000);
  };

  // Unique categories extracted dynamically from teams
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    teamParticipations.forEach(t => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    const customOrder = ['Physics', 'Biology', 'Chemistry', 'Computer Science', 'Art', 'Food'];
    return Array.from(set).sort((a, b) => {
      const indexA = customOrder.indexOf(a);
      const indexB = customOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [teamParticipations]);

  // Filtered and Sorted teams list based on user selections
  const sortedAndFilteredTeams = useMemo(() => {
    const list = teamParticipations.filter(p => {
      // Search query filter
      const q = participationSearch.toLowerCase().trim();
      if (q) {
        const matchName = p.projectName.toLowerCase().includes(q);
        const matchLeader = p.teamLeader.toLowerCase().includes(q);
        const matchSchool = (p.school || '').toLowerCase().includes(q);
        const matchCategory = (p.category || '').toLowerCase().includes(q);
        const matchCode = (p.teamCode || '').toLowerCase().includes(q);
        const matchDesc = (p.projectDescription || '').toLowerCase().includes(q);
        if (!matchName && !matchLeader && !matchSchool && !matchCategory && !matchCode && !matchDesc) {
          return false;
        }
      }

      // Status filter
      if (participationStatusFilter !== 'All' && p.status !== participationStatusFilter) {
        return false;
      }

      // Category filter
      if (participationCategoryFilter !== 'All' && p.category !== participationCategoryFilter) {
        return false;
      }

      return true;
    });

    // Sorting status maps
    const statusRank: Record<string, number> = {
      'Approved': 1,
      'Pending': 2,
      'Rejected': 3
    };

    return list.sort((a, b) => {
      switch (participationSort) {
        case 'name-asc':
          return a.projectName.localeCompare(b.projectName);
        case 'name-desc':
          return b.projectName.localeCompare(a.projectName);
        case 'code-asc':
          return (a.teamCode || a.id).localeCompare(b.teamCode || b.id);
        case 'school-asc':
          return (a.school || '').localeCompare(b.school || '');
        case 'school-desc':
          return (b.school || '').localeCompare(a.school || '');
        case 'category-asc':
          return (a.category || '').localeCompare(b.category || '');
        case 'status-approved': {
          const rankA = statusRank[a.status] || 99;
          const rankB = statusRank[b.status] || 99;
          if (rankA !== rankB) return rankA - rankB;
          return a.projectName.localeCompare(b.projectName);
        }
        case 'status-pending': {
          const rankA = a.status === 'Pending' ? 0 : 1;
          const rankB = b.status === 'Pending' ? 0 : 1;
          if (rankA !== rankB) return rankA - rankB;
          return a.projectName.localeCompare(b.projectName);
        }
        case 'members-desc': {
          const countA = a.members?.length || 0;
          const countB = b.members?.length || 0;
          return countB - countA;
        }
        default:
          return 0;
      }
    });
  }, [
    teamParticipations,
    participationSearch,
    participationStatusFilter,
    participationCategoryFilter,
    participationSort
  ]);

  // Show only 3 or 4 teams initially with an option to expand to all teams
  const INITIAL_TEAMS_LIMIT = 4;
  const displayedTeams = useMemo(() => {
    return isTeamsExpanded
      ? sortedAndFilteredTeams
      : sortedAndFilteredTeams.slice(0, INITIAL_TEAMS_LIMIT);
  }, [sortedAndFilteredTeams, isTeamsExpanded]);

  const hasMoreTeams = sortedAndFilteredTeams.length > INITIAL_TEAMS_LIMIT;

  // Export current filtered roster of teams to a CSV file
  const handleExportFilteredTeamsCSV = () => {
    if (sortedAndFilteredTeams.length === 0) return;
    const headers = [
      'Team Code',
      'Project Name',
      'Category',
      'School / Institution',
      'Stall Number',
      'Location / Station',
      'Team Leader',
      'Co-Leader',
      'Members Count',
      'Members Roster',
      'Project Description',
      'Recognition Award',
      'Registration Status',
      'Created At'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sortedAndFilteredTeams.map(t => {
      const memberNames = (t.members || [])
        .map((m: any) => (typeof m === 'string' ? m : `${m.name}${m.role ? ` (${m.role})` : ''}`))
        .filter(Boolean)
        .join('; ');

      return [
        escapeCSV(t.teamCode || t.id),
        escapeCSV(t.projectName),
        escapeCSV(t.category || 'Innovation Sprint'),
        escapeCSV(t.school || 'Collabs Event'),
        escapeCSV(getTeamStallNumber(t)),
        escapeCSV(t.location || ''),
        escapeCSV(t.teamLeader),
        escapeCSV(t.coLeader || ''),
        escapeCSV(t.members?.length || 0),
        escapeCSV(memberNames),
        escapeCSV(t.projectDescription || ''),
        escapeCSV('Participation'),
        escapeCSV(t.status || 'Pending'),
        escapeCSV(t.createdAt || 'Oct 2026')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filterSuffix = participationCategoryFilter !== 'All' ? `_${participationCategoryFilter.replace(/\s+/g, '_')}` : '';
    link.setAttribute('download', `collabs2026_participating_teams${filterSuffix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTeamCategoryBadge = (category?: string) => {
    const cat = (category || '').toLowerCase().trim();
    if (cat.includes('phys')) {
      return {
        label: category || 'Physics',
        icon: <Zap size={11} className="text-blue-600 shrink-0" />,
        style: 'bg-blue-50 text-blue-700 border-blue-200/80',
        borderAccent: 'border-l-blue-500'
      };
    }
    if (cat.includes('bio')) {
      return {
        label: category || 'Biology',
        icon: <Leaf size={11} className="text-emerald-600 shrink-0" />,
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        borderAccent: 'border-l-emerald-500'
      };
    }
    if (cat.includes('chem')) {
      return {
        label: category || 'Chemistry',
        icon: <Droplets size={11} className="text-cyan-600 shrink-0" />,
        style: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
        borderAccent: 'border-l-cyan-500'
      };
    }
    if (cat.includes('comp') || cat.includes('cs') || cat.includes('tech') || cat.includes('ai') || cat.includes('robo')) {
      return {
        label: category || 'Computer Science',
        icon: <Cpu size={11} className="text-indigo-600 shrink-0" />,
        style: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        borderAccent: 'border-l-indigo-500'
      };
    }
    if (cat.includes('art') || cat.includes('craft') || cat.includes('culture')) {
      return {
        label: category || 'Art',
        icon: <Palette size={11} className="text-pink-600 shrink-0" />,
        style: 'bg-pink-50 text-pink-700 border-pink-200/80',
        borderAccent: 'border-l-pink-500'
      };
    }
    if (cat.includes('food') || cat.includes('nutri') || cat.includes('dish')) {
      return {
        label: category || 'Food',
        icon: <Utensils size={11} className="text-amber-600 shrink-0" />,
        style: 'bg-amber-50 text-amber-700 border-amber-200/80',
        borderAccent: 'border-l-amber-500'
      };
    }
    return {
      label: category || 'General',
      icon: <Sparkles size={11} className="text-purple-600 shrink-0" />,
      style: 'bg-purple-50 text-purple-700 border-purple-200/80',
      borderAccent: 'border-l-purple-500'
    };
  };

  const getTeamStatusBadge = (status?: string) => {
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Approved
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
          <Clock size={10} className="text-amber-600" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
        <X size={10} className="text-rose-600" />
        Rejected
      </span>
    );
  };

  const getTeamAwardDetails = (_award?: string) => {
    return {
      icon: <Award size={12} className="text-blue-600 shrink-0" />,
      style: 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold',
      label: 'Participation',
      tag: 'Participant'
    };
  };
  const [eventsList, setEventsList] = useState<EventItem[]>(INITIAL_EVENTS);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('collabs_admin_auth') === 'true';
    }
    return false;
  });
  const isAdminMode = isAdminAuthenticated;
  const [currentHash, setCurrentHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [activePass, setActivePass] = useState<any>(null);
  const [badgeSuccessNotice, setBadgeSuccessNotice] = useState<string | null>(null);
  const [currentCertId, setCurrentCertId] = useState('CLB-2026-892');
  const [generatorSuccess, setGeneratorSuccess] = useState(false);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Certificate Verification Lookup State
  const [verifySearchQuery, setVerifySearchQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    searched: boolean;
    found: boolean;
    record?: CertificateRecord;
  }>({ searched: false, found: false });

  // Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    institution: '',
    notes: ''
  });
  const [regSuccessBadge, setRegSuccessBadge] = useState<string | null>(null);


  // Generate verification URL for a given Certificate ID
  const getVerificationUrl = (certId: string) => {
    if (typeof window === 'undefined') return `https://collab.org/verify?id=${certId}`;
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?verify=${encodeURIComponent(certId)}`;
  };

  const fallbackCert: CertificateRecord = INITIAL_CERTIFICATES[0] || {
    id: 'CLB-2026-892',
    recipientName: 'Jordan Hayes',
    achievementType: 'Excellence',
    eventName: 'First Mega Event of Collabs',
    issueDate: '31 October 2026',
    verified: true,
    issuer: 'Collabs. Community Board'
  };

  // Active Certificate for Live Preview
  const activeCertificate = (certDatabase && certDatabase.length > 0
    ? certDatabase.find(c => c && c.id === currentCertId) || certDatabase[0]
    : fallbackCert) || fallbackCert;

  // Dynamic QR Code generation for the active certificate
  useEffect(() => {
    const certId = activeCertificate?.id;
    if (certId && !qrCodeDataUrls[certId]) {
      const verifyUrl = getVerificationUrl(certId);
      QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      }).then(dataUrl => {
        setQrCodeDataUrls(prev => ({ ...prev, [certId]: dataUrl }));
      }).catch(err => {
        console.error('Error creating QR Code:', err);
      });
    }
  }, [activeCertificate?.id, qrCodeDataUrls]);

  // URL Query verification listener
  useEffect(() => {
    const checkUrlForVerify = () => {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('verify') || (window.location.hash.startsWith('#verify=') ? window.location.hash.replace('#verify=', '') : null);
      if (queryId) {
        const clean = decodeURIComponent(queryId).trim().toUpperCase();
        setVerifySearchQuery(clean);
        const match = certDatabase.find(c => c.id.toUpperCase() === clean);
        if (match) {
          setVerifyResult({ searched: true, found: true, record: match });
        } else {
          setVerifyResult({ searched: true, found: false });
        }
        setIsVerifyModalOpen(true);
      }
    };

    checkUrlForVerify();
    window.addEventListener('hashchange', checkUrlForVerify);
    return () => window.removeEventListener('hashchange', checkUrlForVerify);
  }, [certDatabase]);

  // Handlers
  const handleOpenRegistration = (event?: EventItem) => {
    setSelectedEventForReg(event || INITIAL_EVENTS[0]);
    setRegSuccessBadge(null);
    setIsRegisterModalOpen(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.email) return;
    const ticketId = `CLB-TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    setRegSuccessBadge(ticketId);
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volForm.name || !volForm.email) return;
    const newEntry: VolunteerLog = {
      id: `vol-${Date.now().toString().slice(-4)}`,
      name: volForm.name,
      username: volForm.name.toLowerCase().replace(/\s+/g, ''),
      password: 'collabs2026',
      department: volForm.department,
      hours: 12,
      duties: volForm.experience || `Enrolled volunteer in ${volForm.department} for Booni Mega Event.`,
      dateJoined: 'Oct 2026',
      status: 'Verified Active',
      assignedTasks: [
        `Report to ${volForm.department} lead at Booni venue`,
        `Assist with ${volForm.department.toLowerCase()} operations for 18 Oct`
      ]
    };
    setVolunteers([newEntry, ...volunteers]);
    setVolSubmitted(true);
    setTimeout(() => {
      setVolForm({
        name: '',
        email: '',
        department: 'Technical',
        availability: '4-8 Hours / Week',
        experience: ''
      });
      setVolSubmitted(false);
    }, 4000);
  };

// ... rest of code ...



  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.recipientName) return;
    const newId = `CLB-2026-${Math.floor(500 + Math.random() * 499)}`;
    const newCert: CertificateRecord = {
      id: newId,
      recipientName: certForm.recipientName.trim(),
      achievementType: 'Certificate of Participation',
      eventName: 'Science, Arts & Food Exhibition 2026',
      issueDate: 'October 31, 2026',
      verified: true,
      issuer: 'Collabs, Naveed-e-Falah, Jenabai Awards & District Youth Office',
      school: certRecipientSchool
    };
    setCertDatabase([newCert, ...certDatabase]);
    setCurrentCertId(newId);
    setGeneratorSuccess(true);
    setTimeout(() => setGeneratorSuccess(false), 3000);
  };

  const handleVerifyQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = verifySearchQuery.trim().toUpperCase();
    const match = certDatabase.find(c => c.id.toUpperCase() === cleanQuery);
    if (match) {
      setVerifyResult({ searched: true, found: true, record: match });
    } else {
      setVerifyResult({ searched: true, found: false });
    }
  };

  const handlePrintCertificate = () => {
    document.body.classList.add('print-cert');
    document.body.classList.remove('print-badge');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-cert');
    }, 1000);
  };



  const handleCopyVerificationLink = (certId: string) => {
    const url = getVerificationUrl(certId);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleOpenLookupForId = (certId: string) => {
    setVerifySearchQuery(certId);
    const match = certDatabase.find(c => c.id.toUpperCase() === certId.toUpperCase());
    if (match) {
      setVerifyResult({ searched: true, found: true, record: match });
    } else {
      setVerifyResult({ searched: true, found: false });
    }
    setIsVerifyModalOpen(true);
  };

  // Filtered Events
  const filteredEvents = eventsList.filter(ev => {
    if (eventFilter === 'All') return true;
    return ev.category === eventFilter;
  });

  // Filtered Volunteers
  const filteredVolunteers = volunteers.filter(vol => {
    if (volunteerFilter === 'All') return true;
    return vol.department === volunteerFilter;
  });

  const location = useLocation();
  const navigate = useNavigate();

  const normalizedPath = (location.pathname || '').toLowerCase();
  const normalizedHash = (currentHash || '').toLowerCase();

  const isAdminRoute =
    normalizedPath === '/admin' ||
    normalizedPath.startsWith('/admin') ||
    normalizedHash.includes('admin');

  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginGate
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onBackHome={() => {
            if (normalizedHash.includes('admin')) {
              window.location.hash = '';
            }
            navigate('/');
          }}
        />
      );
    }

    return (
      <AdminPage 
        teamParticipations={teamParticipations} 
        setTeamParticipations={setTeamParticipations} 
        volunteers={volunteers}
        setVolunteers={setVolunteers}
        certDatabase={certDatabase}
        setCertDatabase={setCertDatabase}
        events={eventsList}
        setEvents={setEventsList}
        handleVolunteerSubmit={handleVolunteerSubmit}
        handleGenerateCertificate={handleGenerateCertificate}
        onLogout={() => {
          setIsAdminAuthenticated(false);
          sessionStorage.removeItem('collabs_admin_auth');
          if (normalizedHash.includes('admin')) {
            window.location.hash = '';
          }
          navigate('/');
        }}
      />
    );
  }

  const isEventsHubRoute =
    normalizedPath === '/eventshub' ||
    normalizedPath === '/events' ||
    normalizedPath.startsWith('/eventshub') ||
    normalizedPath.startsWith('/events') ||
    normalizedHash.includes('eventshub');

  if (isEventsHubRoute) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer group text-left"
              >
                <img src={officialLogo} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-xs group-hover:scale-105 transition-transform" />
                <div>
                  <span className="font-heading text-2xl font-black tracking-tight text-slate-900 leading-none block">
                    Collabs.
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mt-0.5">
                    Events Hub
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/volunteer')}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Volunteer Portal
              </button>
              <button
                onClick={() => navigate('/certificate')}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Certificate Portal
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </header>

        <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
          {/* Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-extrabold uppercase tracking-widest">
                <Sparkles size={14} className="text-blue-400" />
                <span>Collabs. Official Gatherings & Schedule</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Events Hub
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Discover all upcoming youth hackathons, workshops, community innovation sprints, and exhibition milestones organized by Collabs in Booni, Upper Chitral.
              </p>

              {/* Countdown Banner inside Events Hub Hero */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Live Countdown to Event Day:</div>
                  <div className="flex items-center gap-2 font-mono font-black text-xl text-blue-400">
                    <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">{timeLeft.days}d</span>
                    <span>:</span>
                    <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">{timeLeft.hours}h</span>
                    <span>:</span>
                    <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">{timeLeft.minutes}m</span>
                    <span>:</span>
                    <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-blue-300">{timeLeft.seconds}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdUwKtlCvMl4JJBpsa6e7xMJ7KirLBU5_B6ram88WUwza-p-g/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    <span>Register Now</span>
                  </a>
                  <button
                    onClick={() => setIsRulesModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Event Rules
                  </button>
                </div>
              </div>
            </div>

            {/* Background Decorative Gradient Circles */}
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Filter Bar & Event Roster */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-heading text-2xl font-black text-slate-900">Featured Gatherings ({filteredEvents.length})</h2>
                <p className="text-xs text-slate-500 mt-0.5">Filter by upcoming, hands-on workshops, or past events</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(['All', 'Upcoming', 'Workshops', 'Completed'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setEventFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      eventFilter === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredEvents.map(event => {
                const isFull = event.seatsLeft === 0;
                const isCardExpanded = expandedCards[event.id] ?? true;

                return (
                  <div
                    key={event.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                          event.category === 'Upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : event.category === 'Workshops'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {event.category}
                        </span>

                        <button
                          onClick={() => toggleCard(event.id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                          title={isCardExpanded ? 'Collapse Details' : 'Expand Details'}
                        >
                          {isCardExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                        {event.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 font-medium mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-blue-600 shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-blue-600 shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-1">
                          <MapPin size={14} className="text-blue-600 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>

                      {/* Seat count indicator */}
                      <div className="mb-4 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Attendee Capacity:</span>
                          <span className={isFull ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                            {isFull ? 'Registration Full' : `${event.seatsLeft} of ${event.totalSeats} spots remaining`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFull ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0, ((event.totalSeats - event.seatsLeft) / event.totalSeats) * 100))}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Expandable Agenda Breakdown */}
                      {isCardExpanded && event.agendaItems && event.agendaItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2 animate-fadeIn">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock size={13} className="text-blue-600" />
                            <span>Program Agenda Timeline:</span>
                          </div>
                          <ul className="space-y-1.5">
                            {event.agendaItems.map((agenda, aIdx) => (
                              <li key={aIdx} className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                                <span>{agenda}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 mt-4">
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/eventshub`;
                          navigator.clipboard.writeText(shareUrl);
                          alert('Events Hub link copied to clipboard!');
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy size={13} /> Share Event Link
                      </button>

                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdUwKtlCvMl4JJBpsa6e7xMJ7KirLBU5_B6ram88WUwza-p-g/viewform"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Register for Event</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium text-slate-300">First Mega Event of Collabs · Events & Schedule Hub</p>
            <p className="text-slate-500 mt-1">31 October 2026 · Booni, Upper Chitral</p>
          </div>
        </footer>
      </div>
    );
  }

  const isVolunteerRoute =
    normalizedPath === '/volunteer' ||
    normalizedPath === '/volunter' ||
    normalizedPath.startsWith('/volunteer') ||
    normalizedPath.startsWith('/volunter') ||
    normalizedHash.includes('volunteer') ||
    normalizedHash.includes('volunter');

  if (isVolunteerRoute) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer group text-left"
              >
                <img src={officialLogo} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-xs group-hover:scale-105 transition-transform" />
                <div>
                  <span className="font-heading text-2xl font-black tracking-tight text-slate-900 leading-none block">
                    Collabs.
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mt-0.5">
                    Volunteer Portal
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/certificate')}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Certificate Portal
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </header>

        <main className="py-12">
          <section id="volunteers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Field Operations & Crew
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Volunteer Portal
                </h1>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Join our dedicated crew for the First Mega Event of Collabs in Booni on 31 October 2026. Select a role, apply in seconds, and contribute to youth innovation in Chitral.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                <span className="font-semibold text-slate-800">{volunteers.length} Active Crew</span>
                <span aria-hidden="true">·</span>
                <span>4 Key Teams</span>
                <span aria-hidden="true">·</span>
                <span className="text-blue-600 font-bold">31 Oct 2026 Booni</span>
              </div>
            </div>

            <div className="space-y-8 text-left">
              {/* Dedicated Volunteer Task & Duty Clearance Tracker (ID Lookup + Admin Decision Form) */}
              <VolunteerDutyTracker
                volunteers={volunteers}
                setVolunteers={setVolunteers}
                isAdminMode={isAdminMode}
                setIsAdminMode={setIsAdminAuthenticated}
              />

              {/* Team Pass QR Scanner & Station Quick Check-In Card */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
                      Station Check-In Tool
                    </span>
                    <h2 className="font-heading text-2xl font-black text-white flex items-center gap-2.5">
                      <QrCode size={24} className="text-blue-400" />
                      <span>Scan Team Pass QR Code</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Scan a team pass QR code or select a participating team to perform an instant station check-in directly from your duty post.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsCameraScannerActive(!isCameraScannerActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                        isCameraScannerActive
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <QrCode size={15} />
                      <span>{isCameraScannerActive ? 'Close Camera Scanner' : 'Open Camera Scanner'}</span>
                    </button>
                  </div>
                </div>

                {checkInScanSuccess && (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs font-semibold text-emerald-200 flex items-center gap-3 animate-fadeIn">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    <span>{checkInScanSuccess}</span>
                  </div>
                )}

                {/* Camera Scanner Container */}
                {isCameraScannerActive && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center max-w-md mx-auto space-y-3">
                    <p className="text-xs font-bold text-slate-300">Point camera at Team Pass QR Code:</p>
                    <QRScannerComponent
                      onScan={(decodedText) => {
                        handleScanCheckInCode(decodedText);
                      }}
                    />
                    <p className="text-[11px] text-slate-500">Hold team pass steady in camera view</p>
                  </div>
                )}

                {/* Quick Demo Scan Buttons / Select Team */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Quick Test Scan by Team Code:</span>
                      <span className="text-[10px] text-blue-400 font-mono font-semibold">1-Click Test</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {teamParticipations.slice(0, 3).map((team) => (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handleScanCheckInCode(team.teamCode || team.id)}
                          className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/60 rounded-xl text-left transition-all cursor-pointer group"
                        >
                          <div className="text-[10px] font-mono text-blue-400 font-bold truncate">
                            {team.teamCode || team.id}
                          </div>
                          <div className="text-xs font-bold text-white truncate group-hover:text-blue-300">
                            {team.projectName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {team.school}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Manual Code Input Form */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={manualScanInput}
                        onChange={(e) => setManualScanInput(e.target.value)}
                        placeholder="Or enter Team Code (e.g. CLB-COMM-01)"
                        className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (manualScanInput) {
                            handleScanCheckInCode(manualScanInput);
                            setManualScanInput('');
                          }
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Verify & Scan
                      </button>
                    </div>
                  </div>

                  {/* Scanned Team Detail & Confirmation Card */}
                  <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    {scannedCheckInTeam ? (
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                            Team QR Scanned
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/40">
                            {scannedCheckInTeam.teamCode || scannedCheckInTeam.id}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-base text-white">{scannedCheckInTeam.projectName}</h4>
                          <p className="text-slate-400 mt-0.5">{scannedCheckInTeam.school}</p>
                        </div>

                        <div className="space-y-1 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                          <div><strong className="text-slate-400">Team Leader:</strong> {scannedCheckInTeam.teamLeader}</div>
                          <div><strong className="text-slate-400">Category:</strong> {scannedCheckInTeam.category}</div>
                          <div><strong className="text-slate-400">Members:</strong> {scannedCheckInTeam.members?.length || 0} Registered</div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Duty Station Check-In Location:
                          </label>
                          <select
                            value={checkInStationName}
                            onChange={(e) => setCheckInStationName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Main Gate & Registration Desk">Main Gate & Registration Desk</option>
                            <option value="AV & Stage Technical Pod">AV & Stage Technical Pod</option>
                            <option value="Exhibition Pavilion Beta">Exhibition Pavilion Beta</option>
                            <option value="Press & Media Suite Room 104">Press & Media Suite Room 104</option>
                            <option value="VIP & Mentors Lounge">VIP & Mentors Lounge</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleConfirmStationCheckIn}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                        >
                          <CheckCircle2 size={16} />
                          <span>Confirm Station Check-In</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                          <QrCode size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-300">No Team Scanned Yet</p>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                          Click "Open Camera Scanner" or tap a 1-click test button above to preview team details and record check-in.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Station Check-In Live Activity Log */}
                {stationCheckInLogs.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-400" />
                        <span>Recent Station Check-In Log ({stationCheckInLogs.length})</span>
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                            <th className="py-2 px-2">Team Code</th>
                            <th className="py-2 px-2">Project Name</th>
                            <th className="py-2 px-2">Checked-In Station</th>
                            <th className="py-2 px-2">Time</th>
                            <th className="py-2 px-2">Verified By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {stationCheckInLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/40">
                              <td className="py-2 px-2 font-mono text-blue-400 font-bold">{log.teamCode}</td>
                              <td className="py-2 px-2 font-semibold text-white">{log.projectName}</td>
                              <td className="py-2 px-2 text-slate-400">{log.station}</td>
                              <td className="py-2 px-2 text-slate-400">{log.time}</td>
                              <td className="py-2 px-2">
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded text-[10px]">
                                  {log.volunteerName}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <UserPlus size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">Apply as Volunteer</h3>
                        <p className="text-xs text-slate-500">Fill out your details to join the event operations crew</p>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const name = formData.get('name') as string;
                        const email = formData.get('email') as string;
                        const phone = formData.get('phone') as string;
                        const school = formData.get('school') as string;
                        const department = formData.get('department') as string;
                        const shift = formData.get('shift') as string;

                        if (!name || !email) return;

                        const newVol: VolunteerLog = {
                          id: `vol-${Date.now().toString().slice(-4)}`,
                          name,
                          username: name.toLowerCase().replace(/\s+/g, ''),
                          email,
                          phone: phone || '+92 300 0000000',
                          school: school || 'Local Institution',
                          role: `${department} Crew`,
                          department: department || 'General',
                          hours: 0,
                          station: 'Booni Exhibition Venue',
                          shiftTime: shift || '09:00 AM – 05:00 PM PKT',
                          checkedIn: false,
                          duties: `Assigned to ${department} team.`,
                          dateJoined: 'Oct 2026',
                          status: 'Verified Active',
                          assignedTasks: ['Report to team lead on 31 Oct at 08:30 AM'],
                          completedTasks: []
                        };

                        setVolunteers([newVol, ...volunteers]);
                        setVolunteerSuccessMsg(`Thank you, ${name}! Your application for ${department} crew has been registered.`);
                        form.reset();
                        setTimeout(() => setVolunteerSuccessMsg(''), 5000);
                      }}
                      className="space-y-4"
                    >
                      {volunteerSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                          <span>{volunteerSuccessMsg}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Zahid Hussain"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="e.g. zahid@collabs.org"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                          <input
                            type="text"
                            name="phone"
                            placeholder="+92 345 0000000"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Shift</label>
                          <select
                            name="shift"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          >
                            <option value="08:00 AM – 01:00 PM PKT">Morning Shift (08:00 AM - 01:00 PM)</option>
                            <option value="01:00 PM – 06:00 PM PKT">Afternoon Shift (01:00 PM - 06:00 PM)</option>
                            <option value="08:00 AM – 06:00 PM PKT">Full Event Day (08:00 AM - 06:00 PM)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Department</label>
                        <select
                          name="department"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                        >
                          <option value="Venue Operations">Venue Operations & Logistics</option>
                          <option value="Technical">Tech & Registration Support</option>
                          <option value="Media & Coverage">Media & Coverage</option>
                          <option value="Guest Hospitality">Guest Hospitality & Protocol</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        <UserPlus size={16} />
                        <span>Submit Volunteer Application</span>
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Volunteer Roles & Specific Work</h3>
                      <p className="text-xs text-slate-500">Official responsibilities and specific on-ground duties for 31 October 2026</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                    {/* Role 1: Venue Operations & Logistics */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          <span>1. Venue Operations & Logistics Crew</span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Shift: 08:00 AM – 06:00 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        Primary Station: Main Auditorium & Outer Gate Queues
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-1">Specific Work & Assigned Duties:</div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>Stage & Seating Setup:</strong> Arrange 300+ chairs into designated delegate zones, setup keynote podium, and align stage backdrop.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>Crowd Flow & Queuing:</strong> Greet arriving school buses and route student contingents to assigned pavilion stalls without bottlenecking.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>Session Timekeeping:</strong> Assist session moderators with 5-minute and 1-minute visual signals for project pitches.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>Packdown & Venue Handover:</strong> Conduct equipment count after the ceremony, pack audio gear, and return the venue in clean condition.</span>
                        </div>
                      </div>
                    </div>

                    {/* Role 2: Tech, IT & Registration */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-all shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          <span>2. Tech & Digital Registration Support</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Shift: 08:00 AM – 03:00 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        Primary Station: Registration Helpdesk & Technical Control Pod
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-1">Specific Work & Assigned Duties:</div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>QR Code Scanning:</strong> Scan student team passes and delegate badges using the Collabs Check-In tool at entry.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Hardware & Display Fleet:</strong> Connect presentation laptops to HDMI projectors, test screen mirroring, and calibrate wireless clickers.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Live Scorecard Entry:</strong> Collect signed rubric score sheets from judging panels and input points into the live ranking system.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Tech Troubleshooting:</strong> Maintain reliable mobile hotspot connection and resolve sound/mic interference on stage.</span>
                        </div>
                      </div>
                    </div>

                    {/* Role 3: Exhibition Floor & Stalls */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-amber-300 transition-all shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                          <span>3. Exhibition Stalls & Prototype Coordination</span>
                        </div>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Shift: 08:30 AM – 05:00 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        Primary Station: Science, Arts & Food Innovation Pavilions
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-1">Specific Work & Assigned Duties:</div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Stall Power & Prototype Safety:</strong> Supply extension cords and ensure safe wiring for robotics, solar models, and hydro pumps.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Judge Escorting:</strong> Escort evaluation panels to numbered stalls (Stalls 01 to 10) according to the evaluation timeline.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Visitor Engagement:</strong> Prevent overcrowding at popular exhibits, allowing equal viewing time for all attendees.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Model Refills:</strong> Assist teams with clean water refills, stationery tape, display stands, and emergency supplies.</span>
                        </div>
                      </div>
                    </div>

                    {/* Role 4: Media, Coverage & Social Broadcast */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-purple-300 transition-all shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-purple-900">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                          <span>4. Media, Photography & Live Broadcast</span>
                        </div>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Shift: 09:00 AM – 05:30 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        Primary Station: Auditorium Floor, Interview Booth & Media Desk
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-1">Specific Work & Assigned Duties:</div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-purple-600 shrink-0 mt-0.5" />
                          <span><strong>High-Resolution Photo Coverage:</strong> Capture professional photos of student demos, judging interviews, and trophy awards.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-purple-600 shrink-0 mt-0.5" />
                          <span><strong>Short Spotlight Videos:</strong> Record 30-to-60 second pitch reels of team leaders and mentors for Collabs social media.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-purple-600 shrink-0 mt-0.5" />
                          <span><strong>Live Social Publishing:</strong> Post instant story updates, keynote quotes, and winner teasers to @collabs channels.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-purple-600 shrink-0 mt-0.5" />
                          <span><strong>Press Hospitality:</strong> Provide press kits, event agendas, and interview coordination for Chitral regional journalists.</span>
                        </div>
                      </div>
                    </div>

                    {/* Role 5: Guest Protocol & Hospitality */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-rose-300 transition-all shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                          <span>5. Guest Protocol, VIP Hospitality & Helpdesk</span>
                        </div>
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Shift: 08:30 AM – 04:30 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        Primary Station: VIP Lounge, Helpdesk & Staging Area
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-1">Specific Work & Assigned Duties:</div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-rose-600 shrink-0 mt-0.5" />
                          <span><strong>Dignitary Reception:</strong> Welcome guest speakers, institutional principals, and evaluators with traditional protocol.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-rose-600 shrink-0 mt-0.5" />
                          <span><strong>Lunch & Refreshments:</strong> Supervise distribution of hygienic lunch boxes, tea, and clean drinking water points.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-rose-600 shrink-0 mt-0.5" />
                          <span><strong>Award Ceremony Ushering:</strong> Guide winners and award presenters onto the stage for the Official Shield & Certificates.</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={13} className="text-rose-600 shrink-0 mt-0.5" />
                          <span><strong>Helpdesk & Lost & Found:</strong> Answer attendee questions, coordinate lost items, and support first-aid needs.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Crew Roster with Unique ID & Specific Work Assigned */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      <span>Registered Crew Roster & Unique IDs ({volunteers.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Search any Unique Volunteer ID above to view their full assigned responsibilities</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="py-3 px-3">Unique ID</th>
                        <th className="py-3 px-3">Volunteer Name</th>
                        <th className="py-3 px-3">Department & Role</th>
                        <th className="py-3 px-3">Specific Work & Assigned Duty</th>
                        <th className="py-3 px-3">Shift & Station</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Duty Lookup</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {volunteers.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 inline-block tracking-wider">
                              {v.id.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            <div>{v.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{v.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800">{v.role}</span>
                            <div className="text-[10px] text-slate-500">{v.department}</div>
                          </td>
                          <td className="py-3 px-3 max-w-[280px]">
                            <div className="font-semibold text-slate-800 leading-tight">
                              {v.duties || 'Support event setup, visitor guidance, and exhibition operations.'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <div>{v.shiftTime}</div>
                            <div className="text-[10px] text-slate-400">{v.station}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.status === 'Lead Volunteer'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              <CheckCircle size={10} />
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById('volunteers');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                window.dispatchEvent(new CustomEvent('collabs-lookup-volunteer', { detail: v.id }));
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer shadow-xs inline-flex items-center gap-1 active:scale-95"
                            >
                              <span>View Duties</span>
                              <span>→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium text-slate-300">First Mega Event of Collabs · Volunteer Crew Operations</p>
            <p className="text-slate-500 mt-1">31 October 2026 · Booni, Upper Chitral</p>
          </div>
        </footer>
      </div>
    );
  }

  const isCertificateRoute =
    normalizedPath === '/certificate' ||
    normalizedPath === '/certicate' ||
    normalizedPath.startsWith('/certificate') ||
    normalizedPath.startsWith('/certicate') ||
    normalizedHash.includes('certificate') ||
    normalizedHash.includes('certicate');

  if (isCertificateRoute) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer group text-left"
              >
                <img src={officialLogo} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-xs group-hover:scale-105 transition-transform" />
                <div>
                  <span className="font-heading text-2xl font-black tracking-tight text-slate-900 leading-none block">
                    Collabs.
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mt-0.5">
                    Certificate Portal
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/volunteer')}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Volunteer Portal
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </header>

        <main className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CertificatePortal
            certDatabase={certDatabase}
            setCertDatabase={setCertDatabase}
            currentCertId={currentCertId}
            setCurrentCertId={setCurrentCertId}
            activeCertificate={activeCertificate}
            qrCodeDataUrls={qrCodeDataUrls}
            handlePrintCertificate={handlePrintCertificate}
            handleCopyVerificationLink={handleCopyVerificationLink}
            copiedLink={copiedLink}
            handleOpenLookupForId={handleOpenLookupForId}
            setIsVerifyModalOpen={setIsVerifyModalOpen}
            officialLogo={officialLogo}
            isExpanded={true}
            onToggleExpand={() => {}}
          />
        </main>

        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium text-slate-300">Collabs Official Digital Certificate Verification Registry</p>
            <p className="text-slate-500 mt-1">First Mega Event of Collabs 2026 · Booni, Upper Chitral</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 1. Navigation Header - Clean, No "Official" or "Organization Platform" */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          
          {/* Logo - Official Collabs. */}
          <div className="flex items-center gap-3">
            <a href="#events" onClick={(e) => handleSmoothNavClick(e, 'events')} className="flex items-center gap-2.5 group">
              <img src={officialLogo} alt="Collabs. Official Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
              <span className="font-heading text-2xl font-black tracking-tight text-slate-900 leading-none">
                Collabs.
              </span>
            </a>
          </div>

          {/* Navigation Links with Smooth Scrolling & Animated Underline */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            {[
              { id: 'events', label: 'Events', href: '#events', sectionKey: undefined },
              { id: 'team', label: 'Team', href: '#team', sectionKey: 'teamDirectory' as const },
              { id: 'participants', label: 'Participants', href: '#team-participation', sectionKey: undefined },
              { id: 'judging', label: 'Judging', href: '#judging-criteria', sectionKey: undefined },
              { id: 'awards', label: 'Awards', href: '#awards', sectionKey: 'awardsShowcase' as const },
            ].map(tab => {
              const isActive = activeNavTab === tab.id;
              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  onClick={(e) => {
                    setActiveNavTab(tab.id);
                    handleSmoothNavClick(e, tab.href.replace('#', ''), tab.sectionKey);
                  }}
                  className={`relative py-2 transition-colors cursor-pointer group ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  ></span>
                </a>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdUwKtlCvMl4JJBpsa6e7xMJ7KirLBU5_B6ram88WUwza-p-g/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Register Now</span>
            </a>
          </div>

        </div>

        {/* Mobile Navigation Sub-bar with Smooth Scrolling */}
        <div className="lg:hidden border-t border-slate-100 bg-white/95 px-4 py-2 overflow-x-auto flex items-center gap-2 no-scrollbar text-xs font-semibold text-slate-600">
          <a
            href="#events"
            onClick={(e) => handleSmoothNavClick(e, 'events')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            Events
          </a>
          <a
            href="#team"
            onClick={(e) => handleSmoothNavClick(e, 'team', 'teamDirectory')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            Team
          </a>
          <a
            href="#participants"
            onClick={(e) => handleSmoothNavClick(e, 'team-participation')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            Participants
          </a>
          <a
            href="#judging"
            onClick={(e) => handleSmoothNavClick(e, 'judging-criteria')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            Judging
          </a>
          <a
            href="#awards"
            onClick={(e) => handleSmoothNavClick(e, 'awards', 'awardsShowcase')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            Awards
          </a>
        </div>
      </header>

      {/* Mega Event of Collabs Official Banner - Styled like reference image, compact to fit fully on main screen */}
      <section id="events" className="bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-slate-50 pt-4 pb-6 sm:pt-6 sm:pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200 scroll-mt-24">
        <div className="max-w-3xl mx-auto bg-white border-2 border-blue-600/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg shadow-blue-900/5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={officialLogo} alt="Collabs Official Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shadow-2xs" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1 uppercase leading-tight">
            <span className="text-[#1E293B] block">Mega Event of</span>
            <span className="text-[#059669]">Collabs 2026</span>
          </h1>

          <div className="h-1 bg-gradient-to-r from-blue-500 via-yellow-500 via-green-500 to-purple-500 w-24 mx-auto rounded-full my-2 sm:my-2.5"></div>

          <div className="text-[10px] sm:text-xs font-extrabold tracking-widest text-[#1E3A8A] uppercase mb-1.5">
            BUILDING TOMORROW'S INNOVATORS
          </div>

          <p className="text-xs text-slate-600 max-w-lg mx-auto mb-3 leading-relaxed">
            Empowering Youth. Building Tomorrow. Part of the Global Summit on Digital Literacy & Leadership.
          </p>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-0.5 text-[11px] font-bold text-emerald-700 mb-3.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Registration is Open</span>
          </div>

          {/* Functional Countdown Timer for 31 October 2026 - Compact & Clear */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md mx-auto mb-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 sm:py-2.5 sm:px-3 text-center">
              <div className="font-heading text-xl sm:text-2xl font-black text-[#1E3A8A]">{timeLeft.days}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Days</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 sm:py-2.5 sm:px-3 text-center">
              <div className="font-heading text-xl sm:text-2xl font-black text-[#1E3A8A]">{timeLeft.hours}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Hours</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 sm:py-2.5 sm:px-3 text-center">
              <div className="font-heading text-xl sm:text-2xl font-black text-[#1E3A8A]">{timeLeft.minutes}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Mins</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 sm:py-2.5 sm:px-3 text-center">
              <div className="font-heading text-xl sm:text-2xl font-black text-[#1E3A8A]">{timeLeft.seconds}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Secs</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium mb-4">
            until event day: 31 October 2026, Booni, Upper Chitral
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSdUwKtlCvMl4JJBpsa6e7xMJ7KirLBU5_B6ram88WUwza-p-g/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <CheckCircle2 size={14} />
              <span>Register Now</span>
            </a>
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-slate-50 text-[#1E3A8A] border-2 border-[#1E3A8A] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs hover:scale-102 cursor-pointer flex items-center gap-1.5"
            >
              <span>Read Event Guidelines</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 5 Core Pillars Section - Sleek and Compact */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-2xs hover:border-emerald-300 transition-all flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <User size={20} />
            </div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">Leadership</h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-2xs hover:border-amber-300 transition-all flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2">
              <Lightbulb size={20} />
            </div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">Innovation</h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-2xs hover:border-blue-300 transition-all flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Target size={20} />
            </div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">Capacity Building</h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-2xs hover:border-purple-300 transition-all flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <Globe size={20} />
            </div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">Creativity</h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-2xs hover:border-emerald-300 transition-all flex flex-col items-center justify-center col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Leaf size={20} />
            </div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">Empowerment</h3>
          </div>
        </div>
      </section>






      {/* 5. Team Members & Volunteers Section */}
      <section id="team" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 text-left space-y-5">
        {/* Core Team Header & Single-Line Scroll Track */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
                Community Organizers
              </span>
              <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                Collabs. Team
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Official team leading the First Mega Event in Upper Chitral. Scroll to explore members.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                {INITIAL_TEAM.length} Members
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollTeam('left')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 transition shadow-2xs cursor-pointer"
                  title="Scroll Left"
                  aria-label="Scroll Team Left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTeam('right')}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 transition shadow-2xs cursor-pointer"
                  title="Scroll Right"
                  aria-label="Scroll Team Right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={teamSliderRef}
            className="flex flex-nowrap overflow-x-auto gap-4 pb-3 pt-1 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          >
            {INITIAL_TEAM.map((member) => {
              const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={member.id}
                  className="shrink-0 w-72 sm:w-80 snap-start bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-4 sm:p-4.5 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {member.name}
                    </h3>
                    <div className="inline-block text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-lg mt-1 truncate max-w-full">
                      {member.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volunteers Header & Single-Line Scroll Track */}
        <div className="pt-5 border-t border-slate-200/70">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-extrabold text-[#800020] uppercase tracking-widest block mb-1">
                Field Operations Crew
              </span>
              <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                Event Volunteers
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Dedicated volunteers driving logistics, coordination, and attendee guidance. Scroll to view all volunteers.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-xs font-bold text-[#800020] bg-[#fbf0f2] px-3.5 py-1.5 rounded-xl border border-[#800020]/25 shrink-0">
                {volunteers.length} Active Volunteers
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollVolunteers('left')}
                  className="p-2 rounded-xl border border-[#800020]/25 bg-white hover:bg-[#fbf0f2] active:scale-95 text-[#800020] transition shadow-2xs cursor-pointer"
                  title="Scroll Left"
                  aria-label="Scroll Volunteers Left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollVolunteers('right')}
                  className="p-2 rounded-xl border border-[#800020]/25 bg-white hover:bg-[#fbf0f2] active:scale-95 text-[#800020] transition shadow-2xs cursor-pointer"
                  title="Scroll Right"
                  aria-label="Scroll Volunteers Right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={volunteerSliderRef}
            className="flex flex-nowrap overflow-x-auto gap-4 pb-3 pt-1 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          >
            {volunteers.map((vol) => {
              const initials = vol.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={vol.id}
                  className="shrink-0 w-72 sm:w-80 snap-start bg-white border border-slate-200/90 hover:border-[#800020] rounded-2xl p-4 sm:p-4.5 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#800020] via-[#6d001a] to-[#4d0012] text-rose-50 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#800020] transition-colors truncate">
                      {vol.name}
                    </h3>
                    <div className="inline-block text-[11px] sm:text-xs font-bold text-[#800020] bg-[#fbf0f2] border border-[#800020]/25 px-2.5 py-0.5 rounded-lg mt-1 truncate max-w-full">
                      {vol.role || 'Volunteer'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Team Participation Section */}
      <section id="team-participation" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 text-left">
        {/* Toast Alert for Team Ingestion */}
        {teamImportToast && (
          <div className="mb-6 p-4 bg-emerald-900 text-white rounded-2xl flex items-center justify-between shadow-lg animate-fadeIn border border-emerald-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">{teamImportToast}</span>
            </div>
            <button onClick={() => setTeamImportToast(null)} className="text-emerald-300 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">Team Participation</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Explore participating innovation teams, view member assignments, and access event passes. All teams are recognized as official event participants with cloud synchronization.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {hasMoreTeams && (
              <button
                type="button"
                onClick={() => setIsTeamsExpanded(!isTeamsExpanded)}
                className="p-2 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                title={isTeamsExpanded ? 'Collapse to 4 teams' : `Expand to all ${sortedAndFilteredTeams.length} teams`}
              >
                {isTeamsExpanded ? (
                  <>
                    <ChevronUp size={14} /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} /> View All ({sortedAndFilteredTeams.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Small Category Name Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6 pb-3 border-b border-slate-200">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mr-1 flex items-center gap-1">
            <Filter size={11} className="text-blue-600" />
            <span>Category:</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setParticipationCategoryFilter('All');
              setIsTeamsExpanded(true);
            }}
            className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer border flex items-center gap-1 ${
              participationCategoryFilter === 'All'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs scale-105'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>All Categories</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${participationCategoryFilter === 'All' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {teamParticipations.length}
            </span>
          </button>

          {availableCategories.map(cat => {
            const count = teamParticipations.filter(t => t.category === cat).length;
            const isSelected = participationCategoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setParticipationCategoryFilter(cat);
                  setIsTeamsExpanded(true);
                }}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs scale-105'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedAndFilteredTeams.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search size={24} />
            </div>
            <h4 className="font-heading font-black text-slate-900 text-base mb-1">No Matching Teams Found</h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              No participating teams matched your search criteria or selected filters. Try broadening your terms or reset the filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setParticipationSearch('');
                setParticipationStatusFilter('All');
                setParticipationCategoryFilter('All');
                setParticipationSort('name-asc');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Small, Creative & Engaging Grid of Participating Teams */}
        {participationViewMode === 'grid' && sortedAndFilteredTeams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
            {displayedTeams.map(p => {
              const categoryBadge = getTeamCategoryBadge(p.category);
              const { icon: awardIcon, style: awardBadgeStyle, label: awardLabel } = getTeamAwardDetails(p.award);
              const qr = teamCardQrs[p.id];

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedTeamForDetails(p)}
                  className={`group relative bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 p-3 flex flex-col justify-between cursor-pointer overflow-hidden border-l-[3px] ${categoryBadge.borderAccent}`}
                >
                  <div>
                    {/* Top Header: Category Tag & Status Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.category) {
                            setParticipationCategoryFilter(p.category);
                            setIsTeamsExpanded(true);
                          }
                        }}
                        className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition-transform hover:scale-105 ${categoryBadge.style}`}
                        title={`Show all ${p.category} teams`}
                      >
                        {categoryBadge.icon}
                        <span className="truncate max-w-[80px]">{categoryBadge.label}</span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-1 py-0.5 rounded">
                          {p.teamCode || p.id}
                        </span>
                        <span className="font-mono text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/90 px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
                          <MapPin size={9} className="text-indigo-600" />
                          {getTeamStallNumber(p)}
                        </span>
                        {getTeamStatusBadge(p.status)}
                        {isAdminMode && (
                          <button
                            onClick={async e => {
                              e.stopPropagation();
                              try {
                                await deleteTeamFromFirestore(p.id);
                              } catch (err) {
                                console.error('Error deleting team from Firebase:', err);
                              }
                              setTeamParticipations(prev => prev.filter(item => item.id !== p.id));
                            }}
                            className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50"
                            title="Delete Team"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Project Title */}
                    <h3
                      className="font-heading font-black text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug"
                      title={p.projectName}
                    >
                      {p.projectName}
                    </h3>

                    {/* School / Institution */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                      <GraduationCap size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">{p.school || 'Collabs Event'}</span>
                    </div>

                    {/* Creative Project Description Snippet */}
                    <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug bg-slate-50 p-1.5 rounded-lg border border-slate-100/90 mt-1.5 italic">
                      "{p.projectDescription}"
                    </p>

                    {/* Micro Data Badges: Leader, Roster & Stall */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 gap-1">
                      <span className="truncate max-w-[130px] font-semibold text-slate-800">
                        <span className="text-slate-400 font-normal">Lead:</span> {p.teamLeader}
                      </span>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[9px] shrink-0">
                        {p.members?.length || 0} members
                      </span>
                    </div>

                    <div className="text-[9px] text-slate-500 truncate flex items-center justify-between gap-1 mt-1 bg-slate-50 px-1.5 py-1 rounded-md border border-slate-100">
                      <span className="font-extrabold text-indigo-700 flex items-center gap-1">
                        <MapPin size={9} className="text-indigo-600 shrink-0" />
                        {getTeamStallNumber(p)}
                      </span>
                      <span className="text-slate-400 truncate max-w-[120px]">{p.location || 'Exhibition Zone'}</span>
                    </div>
                  </div>

                  {/* Card Footer: Award Badge & Quick Pass Trigger */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    {/* Award Tag */}
                    <div className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full ${awardBadgeStyle}`}>
                      {awardIcon}
                      <span className="font-bold">{awardLabel}</span>
                    </div>

                    {/* Action & Mini QR Peek */}
                    <div className="flex items-center gap-1 shrink-0">
                      {qr && (
                        <img
                          src={qr}
                          alt="QR Peek"
                          className="w-5 h-5 rounded border border-slate-200 bg-white p-0.5 hover:scale-125 transition-transform"
                          title="View attendee check-in pass"
                        />
                      )}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTeamForDetails(p);
                        }}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 group-hover:border-blue-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Pass</span>
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dense Table View Mode */}
        {participationViewMode === 'table' && sortedAndFilteredTeams.length > 0 && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3 pl-4">Team Code</th>
                    <th className="p-3 text-center">Stall #</th>
                    <th className="p-3">Project & Category</th>
                    <th className="p-3">School / Institution</th>
                    <th className="p-3">Team Leader</th>
                    <th className="p-3 text-center">Roster</th>
                    <th className="p-3 text-center">Recognition</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedTeams.map(p => {
                    const categoryBadge = getTeamCategoryBadge(p.category);
                    const { icon: awardIcon, style: awardBadgeStyle, label: awardLabel } = getTeamAwardDetails(p.award);

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedTeamForDetails(p)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="p-3 pl-4 font-mono font-bold text-slate-800 text-[11px]">
                          {p.teamCode || p.id}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-mono font-extrabold text-[10px]">
                            <MapPin size={10} className="text-indigo-600" />
                            {getTeamStallNumber(p)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {p.projectName}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            {categoryBadge.icon}
                            <span>{p.category || 'Innovation Sprint'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-700">
                          <div className="font-medium truncate max-w-[200px]">{p.school || 'Collabs Event'}</div>
                          {p.location && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin size={9} /> {p.location}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-slate-800 font-semibold">
                          {p.teamLeader}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-blue-600">
                          {p.members?.length || 0}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${awardBadgeStyle}`}>
                            {awardIcon} {awardLabel}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {getTeamStatusBadge(p.status)}
                        </td>
                        <td className="p-3 pr-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedTeamForDetails(p)}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                              title="View Team Pass & Roster Details"
                            >
                              <Eye size={12} /> View
                            </button>
                            {isAdminMode && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await deleteTeamFromFirestore(p.id);
                                  } catch (err) {
                                    console.error('Error deleting team:', err);
                                  }
                                  setTeamParticipations(prev => prev.filter(item => item.id !== p.id));
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Delete Team"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expand / Collapse Interactive Banner (Shows 3-4 teams initially with option to expand all) */}
        {hasMoreTeams && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
              <span>
                {isTeamsExpanded ? (
                  <>Showing all <strong className="text-slate-900">{sortedAndFilteredTeams.length}</strong> participating teams</>
                ) : (
                  <>Showing <strong className="text-slate-900">{INITIAL_TEAMS_LIMIT}</strong> of <strong className="text-slate-900">{sortedAndFilteredTeams.length}</strong> teams (Preview mode)</>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsTeamsExpanded(!isTeamsExpanded)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isTeamsExpanded ? (
                <>
                  <ChevronUp size={14} /> Show Less (Collapse to 4 Teams)
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> View All {sortedAndFilteredTeams.length} Teams
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* 5b. Judging Criteria & Expert Judges Panel Section */}
      <section id="judging-criteria" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Evaluation Standards</span>
            <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">Judging Criteria</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Innovation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-5 shadow-xs hover:border-emerald-300 transition-all">
            <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-600" strokeDasharray="25, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading font-black text-emerald-700 text-xs">25%</span>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-lg font-black text-slate-900 mb-1.5 flex items-center gap-2">
                <span>Innovation</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">25%</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Originality, creative problem-solving, and the unique value of the proposed STEM, Art, Food, or community project.
              </p>
            </div>
          </div>

          {/* Impact */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-5 shadow-xs hover:border-amber-300 transition-all">
            <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeDasharray="25, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading font-black text-amber-600 text-xs">25%</span>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-lg font-black text-slate-900 mb-1.5 flex items-center gap-2">
                <span>Impact</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">25%</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The importance of the community challenge being addressed in Upper Chitral, intended beneficiaries, and potential real-world value.
              </p>
            </div>
          </div>

          {/* Feasibility */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-5 shadow-xs hover:border-orange-300 transition-all">
            <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-orange-600" strokeDasharray="25, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading font-black text-orange-700 text-xs">25%</span>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-lg font-black text-slate-900 mb-1.5 flex items-center gap-2">
                <span>Feasibility</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">25%</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Practicality of implementation, effective collaboration among team members, realistic execution, and potential for further community development.
              </p>
            </div>
          </div>

          {/* Presentation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-5 shadow-xs hover:border-rose-300 transition-all">
            <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-rose-600" strokeDasharray="25, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading font-black text-rose-700 text-xs">25%</span>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-lg font-black text-slate-900 mb-1.5 flex items-center gap-2">
                <span>Presentation</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">25%</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Clarity of the project explanation, quality of the exhibition display or demonstration, organization, and effectiveness of communication.
              </p>
            </div>
          </div>
        </div>




      </section>

      {/* 5. Volunteer Portal */}
      {/* 7. Hall of Fame & Awards with Expand/Collapse */}
      <section id="awards" className="py-16 bg-white border-y border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Community Honors
              </span>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                  Hall of Fame & Awards
                </h2>
                <button
                  onClick={() => toggleSection('awardsShowcase')}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Expand or Collapse Awards Section"
                >
                  {sectionsExpanded.awardsShowcase ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Expand</>}
                </button>
              </div>
            </div>
          </div>

          {sectionsExpanded.awardsShowcase && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                {
                  id: 'aw-1',
                  award: 'Cash Prize with Official Winner Shield',
                  recipient: '1st Position',
                  initiative: 'Grand Prize Winner',
                  citation: 'The 1st position winner is awarded a 10,000 PKR Cash Prize and an Official Winner Shield for highest achievement in the mega exhibition.',
                  tier: '1st Position',
                  badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
                  iconBg: 'bg-amber-100 text-amber-700',
                  icon: Trophy
                },
                {
                  id: 'aw-2',
                  award: 'Official 2nd Position Certificate',
                  recipient: '2nd Position',
                  initiative: 'Runner-Up Honor',
                  citation: 'The 2nd position taker receives the official Second Position Certificate of Recognition honoring outstanding innovation.',
                  tier: '2nd Position',
                  badgeColor: 'text-slate-800 bg-slate-100 border-slate-300',
                  iconBg: 'bg-slate-200 text-slate-800',
                  icon: Award
                },
                {
                  id: 'aw-3',
                  award: '3rd Position Distinction Certificate',
                  recipient: '3rd Position',
                  initiative: 'Distinction Honor',
                  citation: 'The 3rd position taker receives the official Certificate of Distinction celebrating creative problem-solving.',
                  tier: '3rd Position',
                  badgeColor: 'text-orange-900 bg-orange-50 border-orange-200',
                  iconBg: 'bg-orange-100 text-orange-700',
                  icon: FileCheck2
                },
                {
                  id: 'aw-4',
                  award: 'Participation Certificate',
                  recipient: 'All Participants',
                  initiative: 'Every Contributor',
                  citation: 'Every active delegate, student innovator, and project builder receives an Official Participation Certificate.',
                  tier: 'Participation',
                  badgeColor: 'text-blue-800 bg-blue-50 border-blue-200',
                  iconBg: 'bg-blue-100 text-blue-700',
                  icon: FileCheck2
                }
              ].map(item => {
                const isAwardExpanded = expandedCards[item.id] ?? false;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                          <IconComponent size={20} />
                        </div>
                        <button
                          onClick={() => toggleCard(item.id)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer transition-colors"
                          title={isAwardExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isAwardExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      <h3 className="font-heading text-lg font-black text-slate-900 mb-1">
                        {item.recipient}
                      </h3>
                      <div className="text-xs font-bold text-blue-700 mb-2">
                        {item.award}
                      </div>

                      {isAwardExpanded ? (
                        <p className="text-xs text-slate-600 leading-relaxed italic mb-3">
                          "{item.citation}"
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 line-clamp-2 italic mb-3">
                          "{item.citation}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 truncate max-w-[150px]">
                        {item.initiative}
                      </span>
                      <button
                        onClick={() => toggleCard(item.id)}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        {isAwardExpanded ? 'Less' : 'More'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 8. Official Clean Footer */}
      <footer className="bg-[#0b101d] text-slate-400 text-xs text-left border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Main 2 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Column 1: Logo & Basic Info & Socials */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={officialLogo} alt="Collabs Logo" className="w-8 h-8 object-contain rounded-lg p-0.5 bg-white shadow-xs" />
                <span className="font-heading text-2xl font-black text-white tracking-tight">Collabs.</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                First Mega Event of Collabs · 31 October 2026
              </p>
              <div className="flex items-center gap-3 pt-1 text-slate-400">
                <a href="https://www.instagram.com/collabs_org/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="https://www.youtube.com/@collabsorg" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-white transition-colors">
                  <Youtube size={16} />
                </a>
                <a href="https://www.linkedin.com/company/collabsorg/posts/?feedView=all" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors">
                  <Linkedin size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Event Details */}
            <div>
              <h3 className="font-heading text-sm font-bold text-white mb-3 tracking-wide">Event Details</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-slate-400 font-medium">Date:</strong> 31 October 2026</li>
                <li><strong className="text-slate-400 font-medium">Location:</strong> Booni, Upper Chitral</li>
                <li><strong className="text-slate-400 font-medium">Venue:</strong> TMA Office Booni, Upper Chitral</li>
                <li className="pt-2">
                  <a
                    href="https://www.collabs.eu.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:text-blue-400 font-medium transition-colors block break-all"
                  >
                    https://www.collabs.eu.org/
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Horizontal Line & Sub-footer */}
          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 Collabs. Community. First Mega Event · Booni, Chitral.
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center text-slate-400">
              <a href="#about" onClick={(e) => handleSmoothNavClick(e, 'about')} className="hover:text-slate-200 transition-colors cursor-pointer">
                Community Charter
              </a>
              <span>·</span>
              <a href="#about" onClick={(e) => handleSmoothNavClick(e, 'about')} className="hover:text-slate-200 transition-colors cursor-pointer">
                Code of Conduct
              </a>
              <span>·</span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowUp size={13} />
                <span>Back to Top</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* MODAL 1: Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-left relative">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>

            {!regSuccessBadge ? (
              <div>
                <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Calendar size={14} /> 18 Oct Registration
                </div>
                <h3 className="font-heading text-xl font-black text-slate-900 mb-1">
                  {selectedEventForReg?.title || 'First Mega Event of Collabs'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Reserve your seat for 31 October 2026 in Booni, Chitral (Venue TBA).
                </p>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.fullName}
                      onChange={e => setRegForm({ ...regForm, fullName: e.target.value })}
                      placeholder="e.g. Asad Ullah"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Phone Number / Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.email}
                      onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="e.g. 0300-1234567 or asad@gmail.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      College / Village / Project
                    </label>
                    <input
                      type="text"
                      value={regForm.institution}
                      onChange={e => setRegForm({ ...regForm, institution: e.target.value })}
                      placeholder="e.g. Booni Degree College / Chitral"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Notes or Transport Questions
                    </label>
                    <input
                      type="text"
                      value={regForm.notes}
                      onChange={e => setRegForm({ ...regForm, notes: e.target.value })}
                      placeholder="Optional notes"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-blue-600/20 mt-2"
                  >
                    Confirm Registration for 31 October 2026
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>

                <div>
                  <h4 className="font-heading text-xl font-black text-slate-900">
                    Seat Reserved!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    You're registered for the First Mega Event of Collabs on 31 October 2026.
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-dashed border-blue-300 p-4 rounded-xl text-left space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                    <span>Collabs. BOONI PASS</span>
                    <span className="font-mono">{regSuccessBadge}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{regForm.fullName}</div>
                  <div className="text-xs text-slate-600">First Mega Event of Collabs</div>
                  <div className="text-[11px] text-slate-500">31 October 2026 · TMA Office Booni, Upper Chitral</div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      const newPassId = regSuccessBadge ? `CLB-PASS-${regSuccessBadge.replace('CLB-TKT-', '')}` : `CLB-PASS-2026-${Math.floor(100 + Math.random() * 900)}`;
                      setActivePass({
                        id: newPassId,
                        fullName: regForm.fullName,
                        affiliation: regForm.institution || 'Registered Attendee · Booni Mega Event',
                        accessLevel: 'Student Pass',
                        track: 'Track 1: AI, Software & Robotics Ideation Sprint',
                        seatZone: 'Zone B · Confirmed Seat',
                        avatarVariant: 1,
                        emergencyContact: '+92 345 9876543 (Event Ops)',
                        issueDate: '31 October 2026',
                        verified: true
                      });
                      setIsRegisterModalOpen(false);
                      setSectionsExpanded(prev => ({ ...prev, badgeGenerator: true }));
                      setBadgeSuccessNotice(`Generated official ID badge for ${regForm.fullName}!`);
                      setTimeout(() => {
                        const el = document.getElementById('attendee-pass');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    <IdCard size={15} /> Generate Official ID Badge & Pass Now →
                  </button>

                  <button
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Certificate Verification Engine */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-left relative">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <FileCheck2 size={16} /> Certificate Registry
            </div>
            <h3 className="font-heading text-xl font-black text-slate-900 mb-1">
              Verify Digital Certificate
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Scan QR or enter ID.
            </p>
            {isVerifyModalOpen && (
              <QRScannerComponent onScan={(text: string) => { setVerifySearchQuery(text); }} />
            )}
            
            <form onSubmit={handleVerifyQuery} className="flex gap-2 mb-4">
              <input
                type="text"
                required
                value={verifySearchQuery}
                onChange={e => setVerifySearchQuery(e.target.value)}
                placeholder="Enter ID, e.g. CLB-2026-892"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Search size={14} /> Query
              </button>
            </form>

            <div className="mb-4 text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
              <span>Quick Test IDs:</span>
              {['CLB-2026-892', 'CLB-2026-401', 'CLB-2026-105'].map(testId => (
                <button
                  key={testId}
                  onClick={() => {
                    setVerifySearchQuery(testId);
                    const match = certDatabase.find(c => c.id.toUpperCase() === testId);
                    if (match) {
                      setVerifyResult({ searched: true, found: true, record: match });
                    }
                  }}
                  className="text-blue-600 font-mono font-bold hover:underline cursor-pointer bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  {testId}
                </button>
              ))}
            </div>

            {verifyResult.searched && (
              <div className="pt-2">
                {verifyResult.found && verifyResult.record ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={12} /> VERIFIED AUTHENTIC
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {verifyResult.record.id}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <div className="text-slate-500 font-medium">Recipient:</div>
                        <div className="font-heading font-black text-slate-900 text-lg">
                          {verifyResult.record.recipientName}
                        </div>
                      </div>

                      {qrCodeDataUrls[verifyResult.record.id] && (
                        <div className="p-1 bg-white border border-emerald-200 rounded shrink-0">
                          <img
                            src={qrCodeDataUrls[verifyResult.record.id]}
                            alt="QR Verification"
                            className="w-14 h-14 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200">
                      <div>
                        <div className="text-[10px] text-slate-500">Achievement Type:</div>
                        <div className="font-bold text-slate-800">{verifyResult.record.achievementType}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Issue Date:</div>
                        <div className="font-bold text-slate-800">{verifyResult.record.issueDate}</div>
                      </div>
                    </div>

                    <div className="text-xs pt-1 border-t border-emerald-200">
                      <div className="text-[10px] text-slate-500">Program / Event:</div>
                      <div className="font-semibold text-slate-800">{verifyResult.record.eventName}</div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                      <button
                        onClick={() => handleCopyVerificationLink(verifyResult.record!.id)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={13} /> Copy Direct URL
                      </button>
                      <button
                        onClick={() => {
                          setCurrentCertId(verifyResult.record!.id);
                          setIsVerifyModalOpen(false);
                          const el = document.getElementById('certificates');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-blue-700 hover:underline"
                      >
                        View Full Certificate Canvas →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs text-center space-y-1">
                    <div className="font-bold text-rose-900">Certificate Record Not Found</div>
                    <p>
                      The queried credential ID does not match any record. Please confirm the number and try again.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}



      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRulesModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <img src={officialLogo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
              <div>
                <h3 className="font-heading text-xl font-black text-slate-900">Mega Event of Collabs</h3>
                <p className="text-xs text-slate-500">Official Rules & Guidelines</p>
              </div>
            </div>
            
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Submission Deadline</h4>
                <p>All final project submissions must be completed and uploaded by 27 Oct 2026 at 11:59 PM PKT. Late submissions are not accepted.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Team Eligibility & Members</h4>
                <p>Teams must consist of 1 to 3 members from Upper Chitral and partnering educational institutions. Each team may submit their primary creative or technical product.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Project Categories & Standards</h4>
                <p>Projects span across STEM, Art, as well as Food & community innovation, addressing local creativity, problem-solving, and practical community impact.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">4. Recognition & Awards Policy</h4>
                <p>The 1st position winner is awarded the Official Winner Shield and Cash Prize. 2nd and 3rd position achievers receive official achievement and distinction certificates.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">5. Code of Conduct</h4>
                <p>All participants must uphold integrity, collaboration, and respectful conduct in accordance with Collabs. community guidelines.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTeamMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTeamMemberModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                {selectedTeamMemberModal.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-heading text-xl font-black text-slate-900">{selectedTeamMemberModal.name}</h3>
                <p className="text-xs font-bold text-blue-600">{selectedTeamMemberModal.role} · <span className="text-slate-500 font-medium">{selectedTeamMemberModal.department}</span></p>
              </div>
            </div>
            
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
                <div className="font-bold text-blue-900 mb-1">Focus Area:</div>
                <div className="text-slate-800 font-semibold">{selectedTeamMemberModal.focus}</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Operational Responsibilities & Remit:</h4>
                <ul className="space-y-2">
                  {(selectedTeamMemberModal.responsibilities || []).map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTeamMemberModal(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Excel Team Import Modal */}
      {isBulkTeamImportOpen && (
        <BulkTeamImportModal
          isOpen={isBulkTeamImportOpen}
          onClose={() => setIsBulkTeamImportOpen(false)}
          onImport={handleBulkImportTeams}
          existingTeamsCount={teamParticipations.length}
        />
      )}

      {/* Team Details & Pass Modal */}
      <TeamDetailsModal
        team={selectedTeamForDetails}
        onClose={() => setSelectedTeamForDetails(null)}
        certDatabase={certDatabase}
        onViewCertificate={(certId) => {
          setCurrentCertId(certId);
          setSelectedTeamForDetails(null);
          const el = document.getElementById('certificates');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

    </div>
  );
}

const QRScannerComponent = ({ onScan }: { onScan: (text: string) => void }) => {
    React.useEffect(() => {
        let scanner: any;
        import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
            scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
            scanner.render((decodedText: string) => {
                onScan(decodedText);
                scanner.clear();
            }, (error: any) => console.warn(error));
        });
        return () => { if (scanner) scanner.clear(); };
    }, [onScan]);
    return <div id="qr-reader" className="w-full mb-4"></div>;
};
