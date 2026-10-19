import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AdminPage from './pages/Admin.tsx';
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
  Facebook,
  Twitter,
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
  Layers
} from 'lucide-react';

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
  focus: string;
  department: string;
  responsibilities: string[];
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
}

interface CertificateRecord {
  id: string;
  recipientName: string;
  achievementType: 'Excellence' | 'Volunteer Leadership' | 'Active Participation';
  eventName: string;
  issueDate: string;
  verified: boolean;
  issuer: string;
}

export interface ParticipantMember {
  name: string;
  role: string;
  email: string;
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
  category?: string;
  capacity?: number;
  members: ParticipantMember[];
  projectDescription: string;
  award?: 'First Place' | 'Second Place' | 'Third Place' | 'Participation';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
  qrCodeUrl?: string;
}

const INITIAL_TEAM_PARTICIPATIONS: TeamParticipation[] = [
  {
    id: 'tp-1',
    teamCode: 'CLB-ROBO-01',
    projectName: 'AI Robotics Sprint',
    category: 'AI & Robotics',
    school: 'Booni Degree College',
    campus: 'Main Science Campus',
    location: 'Lab Block A · Room 102',
    capacity: 6,
    teamLeader: 'Fatima Zahra',
    coLeader: 'Elena Rostova',
    supervisor: 'Prof. Jamshed Ali',
    members: [
      { name: 'Fatima Zahra', role: 'Team Lead', email: 'fatima@collabs.org', school: 'Booni Degree College' },
      { name: 'Elena Rostova', role: 'Robotics Dev', email: 'elena.rostova@collabs.org', school: 'Booni Degree College' },
      { name: 'Jordan Hayes', role: 'Hardware Assistant', email: 'jordan.hayes@collabs.org', school: 'Booni Degree College' }
    ],
    projectDescription: 'Developing autonomous robots for high-altitude emergency supply navigation and environmental monitoring in Upper Chitral.',
    award: 'First Place',
    status: 'Approved',
    createdAt: 'Oct 2026'
  },
  {
    id: 'tp-2',
    teamCode: 'CLB-AGRI-02',
    projectName: 'Smart Agriculture Tool',
    category: 'Climate & Smart Ag',
    school: 'Pamir Public School & College',
    campus: 'Higher Secondary Wing',
    location: 'Agritech Innovation Pod',
    capacity: 5,
    teamLeader: 'Ahmad Khan',
    coLeader: 'Marcus Vance',
    supervisor: 'Dr. Tariq Hussain',
    members: [
      { name: 'Ahmad Khan', role: 'Developer', email: 'ahmad@example.com', school: 'Pamir Public School & College' },
      { name: 'Marcus Vance', role: 'Field Operations', email: 'marcus.vance@collabs.org', school: 'Pamir Public School & College' },
      { name: 'Chloe Bennett', role: 'Documentation', email: 'chloe.bennett@collabs.org', school: 'Pamir Public School & College' }
    ],
    projectDescription: 'IoT-based soil moisture and cold-snap early warning system designed specifically for high-elevation apple and walnut orchards.',
    award: 'Second Place',
    status: 'Approved',
    createdAt: 'Oct 2026'
  },
  {
    id: 'tp-3',
    teamCode: 'CLB-COMM-03',
    projectName: 'Clean Stream Chitral',
    category: 'Water & Environment',
    school: 'Aga Khan Higher Secondary School Kuragh',
    campus: 'Kuragh Campus',
    location: 'Eco Station Beta',
    capacity: 4,
    teamLeader: 'Amina Nour',
    supervisor: 'Ms. Samina Bibi',
    members: [
      { name: 'Amina Nour', role: 'Project Coordinator', email: 'amina.nour@collabs.org', school: 'Aga Khan Higher Secondary School Kuragh' },
      { name: 'Devon Takahashi', role: 'Data Analysis', email: 'devon.t@collabs.org', school: 'Aga Khan Higher Secondary School Kuragh' }
    ],
    projectDescription: 'Community water filtration and microplastic sampling initiative along the Mastuj River tributaries.',
    award: 'Participation',
    status: 'Approved',
    createdAt: 'Oct 2026'
  }
];


const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    title: 'First Mega Event of Collabs',
    category: 'Upcoming',
    date: '31 October 2026',
    time: '09:30 AM – 05:30 PM PKT',
    venue: 'Anywhere in Booni, Chitral (Venue TBA)',
    description: 'The landmark first mega gathering of Collabs in Chitral. Bringing together youth innovators, builders, students, and mentors for hands-on collaboration, workshops, and recognition.',
    seatsLeft: 85,
    totalSeats: 300,
    agendaItems: [
      '09:30 AM: Opening Assembly & Welcome from Community Organizers',
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
    members: 'Syed Farhan Danish (Founder) & Umme Kulsoom (Director)',
    responsibilities: [
      'Oversee the entire exhibition timeline, budget, and overall vision.',
      'Coordinate between different departments and make final executive decisions.',
      'Handle official communications, external guests, and key institutional stakeholders.'
    ]
  },
  {
    id: 'role-2',
    title: 'Role 2: Operations, Logistics & External Relations',
    members: 'Aarish Salik (IT Team Lead), Shahan (Relations Manager), & Zeeshan (Event Manager)',
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
  {
    id: 'tm-1',
    name: 'Syed Farhan Danish',
    role: 'Founder',
    department: 'Role 1: Leadership & Strategy',
    focus: 'Overall Exhibition Timeline, Budget & Vision',
    responsibilities: [
      'Oversee the entire exhibition timeline, budget, and overall vision',
      'Coordinate between different departments and make final executive decisions',
      'Handle official communications, external guests, and key institutional stakeholders'
    ]
  },
  {
    id: 'tm-2',
    name: 'Umme Kulsoom',
    role: 'Director',
    department: 'Role 1: Leadership & Strategy',
    focus: 'Executive Direction & Department Coordination',
    responsibilities: [
      'Oversee the entire exhibition timeline, budget, and overall vision',
      'Coordinate between different departments and make final executive decisions',
      'Handle official communications, external guests, and key institutional stakeholders'
    ]
  },
  {
    id: 'tm-3',
    name: 'Aarish Salik',
    role: 'IT Team Lead',
    department: 'Role 2: Operations & Logistics',
    focus: 'IT & Tech Support, Registration & Screens',
    responsibilities: [
      'Manage registration software, presentations, screens, and technical troubleshooting during the event',
      'Ensure reliable local IT infrastructure for Booni exhibition venue'
    ]
  },
  {
    id: 'tm-4',
    name: 'Shahan',
    role: 'Relations Manager',
    department: 'Role 2: Operations & Logistics',
    focus: 'External Coordination, Sponsorships & Partnerships',
    responsibilities: [
      'Manage guest relations, sponsorships, partnerships, and institutional announcements',
      'Coordinate external stakeholder welcomes across Upper Chitral'
    ]
  },
  {
    id: 'tm-5',
    name: 'Zeeshan',
    role: 'Event Manager',
    department: 'Role 2: Operations & Logistics',
    focus: 'Exhibition Setup & Crowd Flow',
    responsibilities: [
      'Handle venue setup, seating, scheduling, and general attendee management',
      'Supervise on-ground staging and participant hospitality in Booni'
    ]
  },
  {
    id: 'tm-6',
    name: 'Ayan Afzal',
    role: 'Media Team Lead',
    department: 'Role 3: Media & Branding',
    focus: 'Photography, Videography & Media Lead',
    responsibilities: [
      'Capture high-quality photography and videography throughout the exhibition',
      'Manage media booth setup, visitor interviews, and post-event highlight reels'
    ]
  },
  {
    id: 'tm-7',
    name: 'Mazhar',
    role: 'Media Team',
    department: 'Role 3: Media & Branding',
    focus: 'Social Media Coverage & Live Updates',
    responsibilities: [
      'Manage live updates, social media coverage, and promotional content',
      'Assist with video recording and live streaming of exhibition sessions'
    ]
  },
  {
    id: 'tm-8',
    name: 'Afroza',
    role: 'Media Team',
    department: 'Role 3: Media & Branding',
    focus: 'Visitor Interviews & Highlight Reels',
    responsibilities: [
      'Handle media booth setup, visitor interviews, and post-event highlight reels',
      'Document participant testimonials and project demos'
    ]
  }
];

const INITIAL_VOLUNTEERS: VolunteerLog[] = [
  {
    id: 'vol-101',
    name: 'Elena Rostova',
    username: 'elena',
    email: 'elena.rostova@collabs.org',
    phone: '+92 345 1122334',
    school: 'Booni Degree College',
    role: 'Lead Systems Engineer',
    password: 'collabs2026',
    department: 'Technical',
    hours: 142,
    duties: 'Built attendee verification portal and managed projector/display hardware.',
    dateJoined: 'Jan 2026',
    status: 'Lead Volunteer',
    assignedTasks: [
      'Setup registration desk laptops & check-in software by 08:30 AM',
      'Test projector and display audio in main Booni auditorium',
      'Assist keynote speakers with slide presentations'
    ]
  },
  {
    id: 'vol-102',
    name: 'Marcus Vance',
    username: 'marcus',
    email: 'marcus.vance@collabs.org',
    phone: '+92 345 2233445',
    school: 'Pamir Public School & College',
    role: 'Logistics Supervisor',
    password: 'collabs2026',
    department: 'Logistics',
    hours: 98,
    duties: 'Staging coordinator, registration desk supervisor, and venue equipment arrangement in Booni.',
    dateJoined: 'Mar 2026',
    status: 'Verified Active',
    assignedTasks: [
      'Supervise main entrance crowd flow at Booni venue',
      'Coordinate seating arrangements for VIP guests and community elders',
      'Distribute official welcome kits and badges'
    ]
  },
  {
    id: 'vol-103',
    name: 'Devon Takahashi',
    username: 'devon',
    email: 'devon.t@collabs.org',
    phone: '+92 345 3344556',
    school: 'Aga Khan Higher Secondary School Kuragh',
    role: 'Content & Editorial Lead',
    password: 'collabs2026',
    department: 'Content',
    hours: 115,
    duties: 'Editor of event workbooks, bilingual community notices, and presentation slide packs.',
    dateJoined: 'Nov 2025',
    status: 'Lead Volunteer',
    assignedTasks: [
      'Prepare digital workshop booklets for attendees',
      'Capture session notes and feedback forms',
      'Coordinate bilingual announcements (Khowar & English)'
    ]
  },
  {
    id: 'vol-104',
    name: 'Amina Nour',
    username: 'amina',
    email: 'amina.nour@collabs.org',
    phone: '+92 345 4455667',
    school: 'Government High School Booni',
    role: 'Campus Outreach Liaison',
    password: 'collabs2026',
    department: 'Outreach',
    hours: 84,
    duties: 'Liaison with colleges and student networks across Chitral.',
    dateJoined: 'Apr 2026',
    status: 'Verified Active',
    assignedTasks: [
      'Liaison with Chitral student delegates and colleges',
      'Guide participants to workshop break-out rooms',
      'Assist registration helpdesk'
    ]
  },
  {
    id: 'vol-105',
    name: 'Jordan Hayes',
    username: 'jordan',
    email: 'jordan.hayes@collabs.org',
    phone: '+92 345 5566778',
    school: 'Booni Degree College',
    role: 'Lab & Hardware Assistant',
    password: 'collabs2026',
    department: 'Technical',
    hours: 67,
    duties: 'Workshop assistant, laptop lab setup, and digital certificate record keeper.',
    dateJoined: 'Jun 2026',
    status: 'Verified Active',
    assignedTasks: [
      'Assist technical team with cable management and backup power',
      'Distribute digital certificates upon completion'
    ]
  },
  {
    id: 'vol-106',
    name: 'Chloe Bennett',
    username: 'chloe',
    email: 'chloe.bennett@collabs.org',
    phone: '+92 345 6677889',
    school: 'Pamir Public School & College',
    role: 'Hospitality & Badge Coordinator',
    password: 'collabs2026',
    department: 'Logistics',
    hours: 56,
    duties: 'Participant badges, welcome kit distribution, and volunteer snack stations.',
    dateJoined: 'Aug 2026',
    status: 'Verified Active',
    assignedTasks: [
      'Manage volunteer break room and refreshment stations',
      'Assist event manager with badge printing'
    ]
  }
];

const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'CLB-2026-892',
    recipientName: 'Jordan Hayes',
    achievementType: 'Excellence',
    eventName: 'First Mega Event of Collabs',
    issueDate: '31 October 2026',
    verified: true,
    issuer: 'Collabs. Community Board'
  },
  {
    id: 'CLB-2026-401',
    recipientName: 'Samantha Wu',
    achievementType: 'Volunteer Leadership',
    eventName: 'First Mega Event of Collabs Operations',
    issueDate: '31 October 2026',
    verified: true,
    issuer: 'Sofia Morales, Volunteer Coordinator'
  },
  {
    id: 'CLB-2026-105',
    recipientName: 'Devon Takahashi',
    achievementType: 'Active Participation',
    eventName: 'First Mega Event of Collabs',
    issueDate: '31 October 2026',
    verified: true,
    issuer: 'Alex Rivera, Lead Organizer'
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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);

  // Events filter
  const [eventFilter, setEventFilter] = useState<'All' | 'Upcoming' | 'Workshops' | 'Completed'>('All');

  // Participation filter
  const [participationSearch, setParticipationSearch] = useState('');
  const [participationAwardFilter, setParticipationAwardFilter] = useState<'All' | 'First Place' | 'Second Place' | 'Third Place' | 'Participation'>('All');

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
      } else {
        setVolLoginError('Invalid password. Default test password is: collabs2026');
      }
    } else {
      setVolLoginError('Volunteer username not found. Try test usernames: elena, marcus, devon, amina, jordan, chloe');
    }
  };

  // Certificate Generator State
  const [certDatabase, setCertDatabase] = useState<CertificateRecord[]>(INITIAL_CERTIFICATES);
  const [certForm, setCertForm] = useState({
    recipientName: 'Ali Ahmad',
    achievementType: 'Excellence' as 'Excellence' | 'Volunteer Leadership' | 'Active Participation',
    eventName: 'First Mega Event of Collabs',
    issueDate: '31 October 2026'
  });
  const [teamParticipations, setTeamParticipations] = useState<TeamParticipation[]>(INITIAL_TEAM_PARTICIPATIONS);
  const [eventsList, setEventsList] = useState<EventItem[]>(INITIAL_EVENTS);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
// ...

  const [activePass, setActivePass] = useState<any>(null);
  const [badgeSuccessNotice, setBadgeSuccessNotice] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'collabs2026') {
      setIsAdminMode(true);
      setIsAdminModalOpen(false);
      navigate('/admin');
      setAdminUsername('');
      setAdminPassword('');
      setAdminLoginError('');
    } else {
      setAdminLoginError('Invalid credentials');
    }
  };
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
      recipientName: certForm.recipientName,
      achievementType: certForm.achievementType,
      eventName: certForm.eventName,
      issueDate: certForm.issueDate || '31 October 2026',
      verified: true,
      issuer: 'Collabs. Community Board'
    };
    setCertDatabase([newCert, ...certDatabase]);
    setCurrentCertId(newId);
    setGeneratorSuccess(true);
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

  if (location.pathname === '/admin') {
    return <AdminPage 
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
    />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 1. Navigation Header - Clean, No "Official" or "Organization Platform" */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          
          {/* Logo - Official Collabs. */}
          <div className="flex items-center gap-3">
            <a href="#about" onClick={(e) => handleSmoothNavClick(e, 'about')} className="flex items-center gap-2.5 group">
              <img src={officialLogo} alt="Collabs. Official Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
              <span className="font-heading text-2xl font-black tracking-tight text-slate-900 leading-none">
                Collabs.
              </span>
            </a>
          </div>

          {/* Navigation Links with Smooth Scrolling */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a
              href="#about"
              onClick={(e) => handleSmoothNavClick(e, 'about')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              About
            </a>
            <a
              href="#events"
              onClick={(e) => handleSmoothNavClick(e, 'events', 'eventsHub')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Events
            </a>
            <a
              href="#team"
              onClick={(e) => handleSmoothNavClick(e, 'team', 'teamDirectory')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Team
            </a>
            <a
              href="#volunteers"
              onClick={(e) => handleSmoothNavClick(e, 'volunteers', 'volunteerNetwork')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Volunteers
            </a>
            <a
              href="#certificates"
              onClick={(e) => handleSmoothNavClick(e, 'certificates', 'certificatePortal')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Certificates
            </a>
            <a
              href="#awards"
              onClick={(e) => handleSmoothNavClick(e, 'awards', 'awardsShowcase')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Awards
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">

            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Admin</span>
            </button>
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
            href="#about"
            onClick={(e) => handleSmoothNavClick(e, 'about')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            About
          </a>
          <a
            href="#events"
            onClick={(e) => handleSmoothNavClick(e, 'events', 'eventsHub')}
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
            href="#volunteers"
            onClick={(e) => handleSmoothNavClick(e, 'volunteers', 'volunteerNetwork')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            Volunteers
          </a>
          <a
            href="#certificates"
            onClick={(e) => handleSmoothNavClick(e, 'certificates', 'certificatePortal')}
            className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-blue-600 shrink-0 transition-colors cursor-pointer"
          >
            Certificates
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

      {/* Mega Event of Collabs Official Banner - Styled like reference image */}
      <section className="bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-slate-50 pt-6 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto bg-white border-2 border-blue-600/20 rounded-3xl p-6 sm:p-10 shadow-xl shadow-blue-900/5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={officialLogo} alt="Collabs Official Logo" className="w-10 h-10 object-contain rounded-xl shadow-sm" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-1 uppercase">
            <span className="text-[#1E293B] block">Mega Event of</span>
            <span className="text-[#059669]">Collabs 2026</span>
          </h1>

          <div className="h-1 bg-gradient-to-r from-blue-500 via-yellow-500 via-green-500 to-purple-500 w-32 mx-auto rounded-full my-3"></div>

          <div className="text-xs sm:text-sm font-extrabold tracking-widest text-[#1E3A8A] uppercase mb-2">
            BUILDING TOMORROW'S INNOVATORS
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-5 leading-relaxed">
            Empowering Youth. Building Tomorrow. Part of the Global Summit on Digital Literacy & Leadership.
          </p>

          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1 text-xs font-bold text-emerald-700 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Registration is Open</span>
          </div>

          {/* Functional Countdown Timer for 31 October 2026 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto mb-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <div className="font-heading text-2xl sm:text-3xl font-black text-[#1E3A8A]">{timeLeft.days}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Days</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <div className="font-heading text-2xl sm:text-3xl font-black text-[#1E3A8A]">{timeLeft.hours}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Hours</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <div className="font-heading text-2xl sm:text-3xl font-black text-[#1E3A8A]">{timeLeft.minutes}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Mins</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <div className="font-heading text-2xl sm:text-3xl font-black text-[#1E3A8A]">{timeLeft.seconds}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Secs</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium mb-6">
            until event day: 31 October 2026, Booni, Upper Chitral
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSdUwKtlCvMl4JJBpsa6e7xMJ7KirLBU5_B6ram88WUwza-p-g/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <CheckCircle2 size={15} />
              <span>Register Now</span>
            </a>
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-[#1E3A8A] border-2 border-[#1E3A8A] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <span>Read Event Guidelines</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>



      {/* 3. Events Hub with Expand/Collapse Features */}
      <section id="events" className="py-16 bg-white border-y border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-left">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Event Schedule & Milestones
              </span>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                  Events Hub
                </h2>
                <button
                  onClick={() => toggleSection('eventsHub')}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Expand or Collapse Events Section"
                >
                  {sectionsExpanded.eventsHub ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Expand</>}
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Upcoming gatherings and events for Collabs. community members.
              </p>
            </div>

            {sectionsExpanded.eventsHub && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
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
            )}
          </div>

          {sectionsExpanded.eventsHub && (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 text-left">
              {filteredEvents.map(event => {
                const isFull = event.seatsLeft === 0;
                const isCardExpanded = expandedCards[event.id] ?? (event.id === 'ev-1');

                return (
                  <div
                    key={event.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
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

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCard(event.id)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                            title={isCardExpanded ? 'Collapse Details' : 'Expand Details'}
                          >
                            {isCardExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      <h3 className="font-heading text-xl font-black text-slate-900 mb-2">
                        {event.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {event.description}
                      </p>

                      {/* Expandable Agenda Breakdown */}
                      {isCardExpanded && event.agendaItems && (
                        <div className="mb-4 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                          <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                            <Clock size={13} className="text-blue-600" />
                            <span>Schedule & Agenda Outline:</span>
                          </div>
                          <ul className="space-y-1 text-slate-600 text-[11px]">
                            {event.agendaItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-900">{event.date}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-800">{event.venue}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCard(event.id)}
                          className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                        >
                          {isCardExpanded ? 'Collapse Agenda' : 'Expand Agenda'}
                        </button>
                        {!isFull && (
                          <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSdUwKtlCvMl4JJBpsa6e7xMJ7KirLBU5_B6ram88WUwza-p-g/viewform"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                          >
                            Register
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>


      {/* 5. Team Members & Responsibilities Directory with Expand/Collapse */}
      <section id="team" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Community Leads
            </span>
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                Team Members & Responsibilities
              </h2>
              <button
                onClick={() => toggleSection('teamDirectory')}
                className="px-2.5 py-1 text-xs font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Expand or Collapse Team Directory"
              >
                {sectionsExpanded.teamDirectory ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Expand</>}
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Meet the coordinators leading the First Mega Event of Collabs in Upper Chitral.
            </p>
          </div>
        </div>

        {sectionsExpanded.teamDirectory && (
          <div className="space-y-8 text-left">

            {/* Team Directory List with Short Titles */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Team Directory — Click any coordinator to view details:
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {INITIAL_TEAM.map(member => {
                  const isSelected = selectedTeamMemberId === member.id;
                  return (
                    <button
                      key={'dir-' + member.id}
                      onClick={() => setSelectedTeamMemberId(member.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer group shadow-2xs ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-900'
                      }`}
                    >
                      <div className={`font-heading font-black text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>
                        {member.name}
                      </div>
                      <div className={`text-[11px] font-semibold truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-700'}`}>
                        {member.role}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Specific Person Detail Card (Only this shown) */}
            {(() => {
              const member = INITIAL_TEAM.find(m => m.id === selectedTeamMemberId) || INITIAL_TEAM[0];
              const isMemberExpanded = expandedCards[member.id] ?? true;

              return (
                <div
                  key={member.id}
                  id={'team-member-' + member.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                          Selected Coordinator Profile
                        </span>
                        <h3 className="font-heading text-2xl font-black text-slate-900">
                          {member.name}
                        </h3>
                        <div className="text-sm font-bold text-blue-600 mt-0.5">
                          {member.role}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                          {member.department}
                        </span>
                        <button
                          onClick={() => toggleCard(member.id)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer transition-colors"
                          title={isMemberExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isMemberExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                        Focus Area:
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {member.focus}
                      </div>
                    </div>

                    {isMemberExpanded && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                          Operational Remit:
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                          {member.responsibilities.map((resp, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleCard(member.id)}
                      className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {isMemberExpanded ? 'Collapse Details' : 'Expand Details'}
                    </button>
                    <span className="text-slate-400 text-xs font-medium">Booni Upper Chitral 2026 Core Lead</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* 5. Team Participation Section */}
      <section id="team-participation" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">Team Participation</h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search participants..."
              value={participationSearch}
              onChange={e => setParticipationSearch(e.target.value)}
              className="p-2.5 border rounded-xl border-slate-300 text-sm focus:border-blue-600 focus:outline-none"
            />
            <select
              value={participationAwardFilter}
              onChange={e => setParticipationAwardFilter(e.target.value as any)}
              className="p-2.5 border rounded-xl border-slate-300 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Awards</option>
              <option value="First Place">First Place</option>
              <option value="Second Place">Second Place</option>
              <option value="Third Place">Third Place</option>
              <option value="Participation">Participation</option>
            </select>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamParticipations
            .filter(p => 
              (participationAwardFilter === 'All' || p.award === participationAwardFilter) &&
              (p.teamLeader.toLowerCase().includes(participationSearch.toLowerCase()) || 
               p.projectName.toLowerCase().includes(participationSearch.toLowerCase()))
            )
              .map(p => {
              const getAwardDetails = (award?: string) => {
                  switch(award) {
                      case 'First Place': return { icon: <Trophy size={16} className="text-amber-600" />, style: 'bg-amber-100 text-amber-800', prize: '10,000 PKR Cash Prize + Official Winner Shield' };
                      case 'Second Place': return { icon: <Shield size={16} className="text-slate-500" />, style: 'bg-slate-100 text-slate-800', prize: 'Runner-up Shield + Certificate of Excellence' };
                      case 'Third Place': return { icon: <Medal size={16} className="text-orange-700" />, style: 'bg-orange-100 text-orange-800', prize: 'Runner-up Shield + Certificate of Excellence' };
                      default: return { icon: <Award size={16} className="text-blue-600" />, style: 'bg-blue-100 text-blue-800', prize: 'Official Participation Certificate' };
                  }
              };
              const { icon: awardIcon, style: awardBadgeStyle, prize } = getAwardDetails(p.award);

              return (
                <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{p.projectName}</h3>
                      {isAdminMode && (
                          <div className="flex gap-2">
                              <button onClick={() => {/* edit logic placeholder */}} className="text-blue-600 text-xs font-bold">Edit</button>
                              <button onClick={() => setTeamParticipations(prev => prev.filter(item => item.id !== p.id))} className="text-red-600 text-xs font-bold">Delete</button>
                          </div>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mt-1">Leader: <span className="font-semibold">{p.teamLeader}</span></p>
                    <p className="text-slate-600 text-sm">Members: {p.members.length}</p>
                    <p className="text-slate-500 text-xs mt-2 italic">{p.projectDescription}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Check-in QR</p>
                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                      {/* Placeholder for QR code generation logic specific to team */}
                      <span className="text-[10px] text-slate-400">QR CODE</span>
                    </div>
                  </div>
                  <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full w-fit ${awardBadgeStyle}`}>
                    {awardIcon} {p.award || 'Participation'}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 font-medium">{prize}</p>
                </div>
              );
            })}
        </div>
      </section>

      {/* 5. Volunteer Portal & Secure Login */}
      <section id="volunteers" className="py-16 bg-white border-y border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Volunteer Portal
              </span>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                  Volunteer Secure Work Assignment Login
                </h2>
                <button
                  onClick={() => toggleSection('volunteerNetwork')}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Expand or Collapse Volunteer Section"
                >
                  {sectionsExpanded.volunteerNetwork ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Expand</>}
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Volunteers can log in with their assigned credentials to view their specific duties, schedule, and assigned tasks for the 31 Oct Booni event.
              </p>
            </div>
          </div>

          {sectionsExpanded.volunteerNetwork && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Volunteer Login or Logged-in Dashboard */}
              <div className="lg:col-span-12 text-left">
                {loggedInVolunteer ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading text-2xl font-black text-slate-900">
                            {loggedInVolunteer.name}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {loggedInVolunteer.department}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {loggedInVolunteer.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Username: <span className="font-mono font-bold text-slate-800">@{loggedInVolunteer.username}</span> | Joined: {loggedInVolunteer.dateJoined} | Total Hours: <strong className="text-blue-600">{loggedInVolunteer.hours} hrs</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => setLoggedInVolunteer(null)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        Log Out
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-heading text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                          General Duties Summary
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">
                          {loggedInVolunteer.duties}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-heading text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                          Assigned Tasks for 31 October 2026 (Booni Upper Chitral)
                        </h4>
                        <div className="space-y-2">
                          {loggedInVolunteer.assignedTasks && loggedInVolunteer.assignedTasks.length > 0 ? (
                            loggedInVolunteer.assignedTasks.map((task, idx) => (
                              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-slate-800">
                                <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <span>{task}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 italic">No specific sub-tasks assigned yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Users size={22} />
                      <h3 className="font-heading text-xl font-black text-slate-900">
                        Volunteer Sign-In Portal
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Enter your assigned username and password to access your personalized work assignments, shift timings, and team lead instructions.
                    </p>

                    {volLoginError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                        {volLoginError}
                      </div>
                    )}

                    <form onSubmit={handleVolunteerLogin} className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Volunteer Username *
                        </label>
                        <input
                          type="text"
                          required
                          value={volLoginUsername}
                          onChange={e => setVolLoginUsername(e.target.value)}
                          placeholder="e.g. elena, marcus, devon"
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={volLoginPassword}
                          onChange={e => setVolLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        Access My Assigned Work
                      </button>

                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 space-y-1">
                        <div className="font-bold">Test Volunteer Credentials:</div>
                        <div>Usernames: <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">elena</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">marcus</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">devon</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">amina</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">jordan</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">chloe</code></div>
                        <div>Password: <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">collabs2026</code></div>
                      </div>
                    </form>
                  </div>
                )}
              </div>



            </div>
          )}

        </div>
      </section>

      {/* 6. Digital Certificate Generator with QR Codes & Expand/Collapse */}
      <section id="certificates" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Credentials
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                Digital Certificate Generator & QR Verification
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                <CheckCircle2 size={13} className="text-emerald-600" /> QR Verified
              </span>
              <button
                onClick={() => toggleSection('certificatePortal')}
                className="px-2.5 py-1 text-xs font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Expand or Collapse Certificate Section"
              >
                {sectionsExpanded.certificatePortal ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Expand</>}
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Printable certificates with instant QR verification linking directly to our validation database.
            </p>
          </div>
        </div>

        {sectionsExpanded.certificatePortal && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Generator Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 size={20} className="text-blue-600" />
                  <h3 className="font-heading text-lg font-black text-slate-900">
                    Certificate Builder
                  </h3>
                </div>
              </div>

              <form onSubmit={handleGenerateCertificate} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={certForm.recipientName}
                    onChange={e => setCertForm({ ...certForm, recipientName: e.target.value })}
                    placeholder="e.g. Jordan Hayes"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Achievement Category
                  </label>
                  <select
                    value={certForm.achievementType}
                    onChange={e => setCertForm({ ...certForm, achievementType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Excellence">Certificate of Excellence</option>
                    <option value="Volunteer Leadership">Certificate of Volunteer Leadership</option>
                    <option value="Active Participation">Certificate of Active Participation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Associated Event / Program
                  </label>
                  <select
                    value={certForm.eventName}
                    onChange={e => setCertForm({ ...certForm, eventName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="First Mega Event of Collabs">First Mega Event of Collabs (18 Oct)</option>
                    <option value="Collaborative Problem Solving & Digital Skills Workshop">Collaborative Problem Solving & Digital Skills Workshop</option>
                    <option value="Youth Leadership & Team Coordination Lab">Youth Leadership & Team Coordination Lab</option>
                    <option value="Booni Volunteer Service Roster 2026">Booni Volunteer Service Roster 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={certForm.issueDate}
                    onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                    placeholder="31 October 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} /> Update Certificate & QR
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Printer size={14} /> Print / Save PDF
                  </button>
                </div>
              </form>

              {/* Direct QR Link Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <QrCode size={14} className="text-blue-600" /> Scannable Verification Link
                  </span>
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {activeCertificate.id}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyVerificationLink(activeCertificate.id)}
                    className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-700">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Link
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenLookupForId(activeCertificate.id)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ExternalLink size={14} /> Test
                  </button>
                </div>
              </div>
            </div>

            {/* Certificate Canvas */}
            <div className="lg:col-span-7">
              <div className="bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-300 shadow-inner">
                
                {/* Print Element */}
                <div
                  id="printable-certificate"
                  className="bg-white border-8 border-double border-blue-900 p-6 sm:p-10 rounded-lg shadow-xl text-center relative overflow-hidden select-none"
                >
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-blue-900 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-blue-900 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-blue-900 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-blue-900 pointer-events-none" />

                  {/* Official Collabs. Header */}
                  <div className="flex flex-col items-center mb-6">
                    <img src={officialLogo} alt="Collabs. Official Logo" className="w-14 h-14 object-contain rounded-full mb-2 border-2 border-blue-900 shadow-sm bg-white p-0.5" />
                    <span className="font-heading text-xl font-black text-slate-900 tracking-wider">
                      Collabs.
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      Certificate of Achievement & Recognition
                    </span>
                  </div>

                  <div className="text-xs uppercase font-bold tracking-widest text-blue-700 mb-2">
                    THIS CREDENTIAL IS PROUDLY CONFERRED UPON
                  </div>

                  <div className="font-heading text-2xl sm:text-4xl font-black text-slate-900 py-2 border-b-2 border-slate-200 max-w-md mx-auto mb-4 tracking-tight">
                    {activeCertificate.recipientName}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed mb-6">
                    in formal recognition of outstanding <strong className="text-blue-900">{activeCertificate.achievementType}</strong> demonstrated during the initiative:
                  </p>

                  <div className="font-heading text-base sm:text-lg font-bold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200 max-w-md mx-auto mb-6">
                    {activeCertificate.eventName}
                  </div>

                  {/* Signatures & Scannable QR Code */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-6 border-t border-slate-200 text-left">
                    <div>
                      <div className="font-serif italic text-base text-slate-800 border-b border-slate-400 pb-1">
                        Alex Rivera
                      </div>
                      <div className="text-[9px] font-bold uppercase text-slate-500 mt-1">
                        Lead Organizer
                      </div>
                      <div className="text-[8px] text-slate-400">Collabs. Community</div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div
                        onClick={() => handleOpenLookupForId(activeCertificate.id)}
                        className="group cursor-pointer flex flex-col items-center transition-transform hover:scale-105"
                        title="Click or scan with camera to verify"
                      >
                        {qrCodeDataUrls[activeCertificate.id] ? (
                          <div className="p-1.5 bg-white border-2 border-blue-900 rounded-lg shadow-sm">
                            <img
                              src={qrCodeDataUrls[activeCertificate.id]}
                              alt={`QR verification for ${activeCertificate.id}`}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-contain block"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                            <QrCode size={24} className="text-slate-400 animate-spin" />
                          </div>
                        )}
                        <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-blue-900 mt-1 text-center">
                          SCAN TO VERIFY
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif italic text-base text-slate-800 border-b border-slate-400 pb-1">
                        Sofia Morales
                      </div>
                      <div className="text-[9px] font-bold uppercase text-slate-500 mt-1">
                        Volunteer Registrar
                      </div>
                      <div className="text-[8px] text-slate-400">Booni Summit Secretariat</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-slate-400 font-mono">
                    <span>Issued: {activeCertificate.issueDate}</span>
                    <button
                      onClick={() => handleOpenLookupForId(activeCertificate.id)}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      REGISTRY ID: {activeCertificate.id}
                    </button>
                    <span className="text-[9px] text-slate-400">
                      Booni, Chitral
                    </span>
                  </div>

                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-2">
                  <span>Print-Ready with <code className="text-blue-600">@media print</code></span>
                  <button
                    onClick={handlePrintCertificate}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Printer size={14} /> Direct Print
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}
      </section>

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
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Official prizes, honors, and credentials breakdown for participants at the First Mega Event of Collabs in Booni, Upper Chitral.
              </p>
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
                  tier: '1st Position · Gold',
                  badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
                  iconBg: 'bg-amber-100 text-amber-700',
                  icon: Trophy
                },
                {
                  id: 'aw-2',
                  award: 'Runner-up Shield with Certificate',
                  recipient: '2nd Position',
                  initiative: 'Runner-Up Honor',
                  citation: 'The 2nd position runner-up is presented with the official Runner-up Shield and a Certificate of Excellence honoring outstanding innovation.',
                  tier: '2nd Position · Silver',
                  badgeColor: 'text-slate-800 bg-slate-100 border-slate-300',
                  iconBg: 'bg-slate-200 text-slate-800',
                  icon: Shield
                },
                {
                  id: 'aw-3',
                  award: 'Runner-up Shield with Certificate',
                  recipient: '3rd Position',
                  initiative: 'Distinction Honor',
                  citation: 'The 3rd position winner receives the Runner-up Shield alongside a Certificate of Excellence celebrating creative problem-solving.',
                  tier: '3rd Position · Bronze',
                  badgeColor: 'text-orange-900 bg-orange-50 border-orange-200',
                  iconBg: 'bg-orange-100 text-orange-700',
                  icon: Award
                },
                {
                  id: 'aw-4',
                  award: 'Participation Certificate',
                  recipient: 'All Participants',
                  initiative: 'Every Contributor',
                  citation: 'Every active delegate, student innovator, and project builder receives an Official Participation Certificate.',
                  tier: 'Participation Honor',
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

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mb-2 ${item.badgeColor}`}>
                        {item.tier}
                      </span>
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

      {/* 8. Clean Footer */}
      <footer className="bg-slate-900 text-slate-400 py-14 px-4 sm:px-6 lg:px-8 text-xs text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img src={officialLogo} alt="Collabs. Official Logo" className="w-8 h-8 object-contain rounded bg-white p-0.5" />
              <span className="font-heading text-xl font-black text-white">
                Collabs.
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              First Mega Event of Collabs · 31 October 2026<br />
              Anywhere in Booni, Chitral (Venue TBA).
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white"><Instagram size={18} /></a>
              <a href="#" className="text-slate-400 hover:text-white"><Facebook size={18} /></a>
              <a href="#" className="text-slate-400 hover:text-white"><Twitter size={18} /></a>
            </div>

          </div>

          <div>
            <div className="font-heading text-white font-bold text-sm mb-3">
              Navigation
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleSmoothNavClick(e, 'about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  First Mega Event Overview
                </a>
              </li>
              <li>
                <a
                  href="#events"
                  onClick={(e) => handleSmoothNavClick(e, 'events', 'eventsHub')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Booni Schedule & Workshops
                </a>
              </li>
              <li>
                <a
                  href="#attendee-pass"
                  onClick={(e) => handleSmoothNavClick(e, 'attendee-pass', 'badgeGenerator')}
                  className="hover:text-white transition-colors cursor-pointer text-blue-400 font-semibold"
                >
                  Attendee Pass & ID Badge
                </a>
              </li>
              <li>
                <a
                  href="#team"
                  onClick={(e) => handleSmoothNavClick(e, 'team', 'teamDirectory')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Community Team Leads
                </a>
              </li>
              <li>
                <a
                  href="#volunteers"
                  onClick={(e) => handleSmoothNavClick(e, 'volunteers', 'volunteerNetwork')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Volunteer Opportunities
                </a>
              </li>
              <li>
                <a
                  href="#certificates"
                  onClick={(e) => handleSmoothNavClick(e, 'certificates', 'certificatePortal')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Digital Certificates
                </a>
              </li>
              <li>
                <a
                  href="#awards"
                  onClick={(e) => handleSmoothNavClick(e, 'awards', 'awardsShowcase')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Awards & Hall of Fame
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-heading text-white font-bold text-sm mb-3">
              Event Details
            </div>
            <p className="leading-relaxed mb-2 text-slate-300">
              Date: 31 October 2026<br />
              Location: Booni, Chitral<br />
              Venue: To Be Announced (TBA)
            </p>
              <a href="https://www.collabs.eu.org/" className="text-blue-400 font-semibold hover:underline">
                https://www.collabs.eu.org/
              </a>
          </div>

          <div>
            <div className="font-heading text-white font-bold text-sm mb-3">
              Verification & QR
            </div>
            <p className="mb-2 text-slate-400">
              Query any certificate ID issued for the Booni Mega Event or test QR code links.
            </p>
            <button
              onClick={() => {
                setVerifySearchQuery('');
                setVerifyResult({ searched: false, found: false });
                setIsVerifyModalOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Open Lookup Registry
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            © 2026 Collabs. Community. First Mega Event · Booni, Chitral.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300">Community Charter</span>
            <span>·</span>
            <span className="hover:text-slate-300">Code of Conduct</span>
            <span>·</span>
            <a
              href="#about"
              onClick={(e) => handleSmoothNavClick(e, 'about')}
              className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowUp size={12} /> Back to Top
            </a>
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
                    Confirm Registration for 18 Oct
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
                    You're registered for the First Mega Event of Collabs on 18 Oct.
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-dashed border-blue-300 p-4 rounded-xl text-left space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                    <span>Collabs. BOONI PASS</span>
                    <span className="font-mono">{regSuccessBadge}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{regForm.fullName}</div>
                  <div className="text-xs text-slate-600">First Mega Event of Collabs</div>
                  <div className="text-[11px] text-slate-500">18 Oct 2026 · Booni, Chitral (Venue TBA)</div>
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

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-left relative">
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="font-heading text-xl font-black text-slate-900 mb-1">Admin Login</h3>
            <p className="text-xs text-slate-500 mb-4">Use management credentials to access admin features.</p>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Username *</label>
                <input type="text" placeholder="admin" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Password *</label>
                <input type="password" placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900" />
              </div>
              {adminLoginError && <p className="text-xs text-red-600 font-medium">{adminLoginError}</p>}
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer shadow-xs mt-1">Login to Admin Portal</button>
            </form>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 space-y-0.5">
              <div className="font-bold">Admin Portal:</div>
              <div>The administrator is responsible for managing all aspects of team participation, event details, and volunteer management.</div>
            </div>
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
                <h4 className="font-bold text-slate-900 text-sm mb-1">4. Code of Conduct</h4>
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
