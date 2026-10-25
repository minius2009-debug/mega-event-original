import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Upload,
  User,
  Building2,
  Calendar,
  Lock,
  Unlock,
  Check,
  X,
  AlertCircle,
  Plus,
  FileCheck2,
  FileText,
  Sparkles,
  QrCode,
  MapPin,
  ClipboardList,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';
import { VolunteerLog } from '../App';

interface VolunteerDutyTrackerProps {
  volunteers: VolunteerLog[];
  setVolunteers: React.Dispatch<React.SetStateAction<VolunteerLog[]>>;
  isAdminMode?: boolean;
  setIsAdminMode?: (isAdmin: boolean) => void;
}

export interface DutyTaskItem {
  id: string;
  title: string;
  category: 'Setup & Prep' | 'Active Operation' | 'Participant Support' | 'Closing & Clearance';
  completed: boolean;
  completedAt?: string;
  decidedBy?: string;
  notes?: string;
}

export const VolunteerDutyTracker: React.FC<VolunteerDutyTrackerProps> = ({
  volunteers,
  setVolunteers,
  isAdminMode = false,
  setIsAdminMode
}) => {
  // Input search / upload state
  const [inputVolunteerId, setInputVolunteerId] = useState<string>('VOL-201');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('vol-201');
  const [idNotFound, setIdNotFound] = useState<string | null>(null);

  // Admin authentication inline modal/gate
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // New task input state for admin
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<DutyTaskItem['category']>('Active Operation');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Upload file state
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Listen for global custom event to lookup volunteer from anywhere
  useEffect(() => {
    const handleCustomLookup = (e: any) => {
      if (e.detail) {
        handleLookupId(e.detail);
      }
    };
    window.addEventListener('collabs-lookup-volunteer', handleCustomLookup);
    return () => window.removeEventListener('collabs-lookup-volunteer', handleCustomLookup);
  }, [volunteers]);

  // Lookup current volunteer
  const activeVolunteer = useMemo(() => {
    return volunteers.find(v => v.id.toLowerCase() === selectedVolunteerId.toLowerCase()) || volunteers[0];
  }, [volunteers, selectedVolunteerId]);

  // Derive duty tasks for active volunteer
  const dutyTasks: DutyTaskItem[] = useMemo(() => {
    if (!activeVolunteer) return [];

    const completedSet = new Set<string>(activeVolunteer.completedTasks || []);

    // If activeVolunteer has custom assignedTasks, use them
    if (activeVolunteer.assignedTasks && activeVolunteer.assignedTasks.length > 0) {
      return activeVolunteer.assignedTasks.map((taskText, idx) => {
        const isDone = completedSet.has(taskText) || completedSet.has(`task-${idx}`);
        return {
          id: `task-${idx}`,
          title: taskText,
          category: idx === 0 ? 'Setup & Prep' : idx === activeVolunteer.assignedTasks!.length - 1 ? 'Closing & Clearance' : 'Active Operation',
          completed: isDone,
          completedAt: isDone ? '31 Oct 2026' : undefined,
          decidedBy: isDone ? 'Event Administrator' : undefined
        };
      });
    }

    // Otherwise derive specific tasks from their duties and station
    const baseTasks: { title: string; category: DutyTaskItem['category'] }[] = [
      {
        title: `Morning Station Briefing & Setup at ${activeVolunteer.station || 'Assigned Zone'}`,
        category: 'Setup & Prep'
      },
      {
        title: activeVolunteer.duties || `Carry out assigned duties for ${activeVolunteer.department}`,
        category: 'Active Operation'
      },
      {
        title: 'Guide team participants and answer visitor inquiries in assigned zone',
        category: 'Participant Support'
      },
      {
        title: 'Final shift station handover, waste clearance & log sign-off',
        category: 'Closing & Clearance'
      }
    ];

    return baseTasks.map((t, idx) => {
      const isDone = completedSet.has(t.title) || completedSet.has(`task-${idx}`);
      return {
        id: `task-${idx}`,
        title: t.title,
        category: t.category,
        completed: isDone,
        completedAt: isDone ? '31 Oct 2026' : undefined,
        decidedBy: isDone ? 'Event Administrator' : undefined
      };
    });
  }, [activeVolunteer]);

  // Handle ID search / upload submission
  const handleLookupId = (idToLookup: string) => {
    const cleanId = idToLookup.trim();
    if (!cleanId) return;

    const normalizedQuery = cleanId.toLowerCase().replace(/[^a-z0-9]/g, '');

    const match = volunteers.find(v => {
      const vIdNorm = v.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const vNum = v.id.toLowerCase().replace('vol-', '').replace('vol', '');
      const queryNum = cleanId.toLowerCase().replace('vol-', '').replace('vol', '');
      
      return (
        v.id.toLowerCase() === cleanId.toLowerCase() ||
        vIdNorm === normalizedQuery ||
        (queryNum && vNum === queryNum) ||
        v.name.toLowerCase().includes(cleanId.toLowerCase()) ||
        v.username.toLowerCase() === cleanId.toLowerCase()
      );
    });

    if (match) {
      setSelectedVolunteerId(match.id);
      setInputVolunteerId(match.id.toUpperCase());
      setIdNotFound(null);
    } else {
      setIdNotFound(`No volunteer found matching "${cleanId}". Try VOL-201, VOL-202, or click a volunteer in the roster below.`);
    }
  };

  // Handle simulated file upload (e.g. badge text or ID card)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Extract volunteer ID (e.g., vol-xxx)
      const match = content.match(/vol-\d+/i) || content.match(/[A-Za-z0-9_-]{4,15}/);
      if (match) {
        const foundId = match[0];
        handleLookupId(foundId);
        setUploadNotice(`Loaded ID from file: ${foundId}`);
        setTimeout(() => setUploadNotice(null), 4000);
      } else {
        setUploadNotice(`File processed (${file.name}). Please enter ID manually if not detected.`);
        setTimeout(() => setUploadNotice(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Toggle task completion (Admin Only)
  const handleToggleTask = (taskTitle: string) => {
    if (!isAdminMode) {
      setShowAdminLoginModal(true);
      return;
    }

    if (!activeVolunteer) return;

    const currentCompleted = activeVolunteer.completedTasks || [];
    const isCompleted = currentCompleted.includes(taskTitle);

    let updatedCompleted: string[];
    if (isCompleted) {
      updatedCompleted = currentCompleted.filter(t => t !== taskTitle);
    } else {
      updatedCompleted = [...currentCompleted, taskTitle];
    }

    const updatedVol: VolunteerLog = {
      ...activeVolunteer,
      completedTasks: updatedCompleted
    };

    setVolunteers(prev => prev.map(v => (v.id === updatedVol.id ? updatedVol : v)));
  };

  // Mark all tasks completed / pending (Admin Only)
  const handleSetAllTasks = (completed: boolean) => {
    if (!isAdminMode) {
      setShowAdminLoginModal(true);
      return;
    }
    if (!activeVolunteer) return;

    const allTitles = dutyTasks.map(t => t.title);
    const updatedVol: VolunteerLog = {
      ...activeVolunteer,
      completedTasks: completed ? allTitles : []
    };

    setVolunteers(prev => prev.map(v => (v.id === updatedVol.id ? updatedVol : v)));
  };

  // Add new specific task (Admin Only)
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminMode) {
      setShowAdminLoginModal(true);
      return;
    }
    if (!activeVolunteer || !newTaskTitle.trim()) return;

    const currentAssigned = activeVolunteer.assignedTasks && activeVolunteer.assignedTasks.length > 0
      ? activeVolunteer.assignedTasks
      : dutyTasks.map(t => t.title);

    const updatedTasks = [...currentAssigned, newTaskTitle.trim()];

    const updatedVol: VolunteerLog = {
      ...activeVolunteer,
      assignedTasks: updatedTasks
    };

    setVolunteers(prev => prev.map(v => (v.id === updatedVol.id ? updatedVol : v)));
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  // Verify Admin Passcode
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = adminPasscode.trim();
    if (cleanPass === 'collabs2026' || cleanPass === 'admin123') {
      if (setIsAdminMode) setIsAdminMode(true);
      setShowAdminLoginModal(false);
      setAdminPasscode('');
      setAdminAuthError(null);
    } else {
      setAdminAuthError('Incorrect passcode. Use standard organizer code: collabs2026');
    }
  };

  // Calculate completion percentage
  const completedCount = dutyTasks.filter(t => t.completed).length;
  const totalTasks = dutyTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const isFullyCleared = totalTasks > 0 && completedCount === totalTasks;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden text-left mb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-blue-400/30 flex items-center gap-1">
                <ClipboardList size={11} />
                <span>Duty & Clearance Tracker</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                First Mega Event of Collabs · Booni 2026
              </span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
              Volunteer Task Assignment & Completion
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every volunteer has a unique ID. Enter or upload their ID to inspect their assigned station duties. Task completion status is decided and officially cleared by the event Admin.
            </p>
          </div>

          {/* Admin Mode Status Badge / Quick Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdminMode ? (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Admin Decision Mode Active</span>
                {setIsAdminMode && (
                  <button
                    type="button"
                    onClick={() => setIsAdminMode(false)}
                    className="ml-1 text-[10px] text-emerald-300 underline hover:text-white cursor-pointer"
                  >
                    Lock
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAdminLoginModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <Lock size={14} />
                <span>Admin Unlock</span>
              </button>
            )}
          </div>
        </div>

        {/* Volunteer ID Lookup & File Upload Form */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookupId(inputVolunteerId);
            }}
            className="flex flex-col sm:flex-row gap-2.5 max-w-3xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
              <input
                type="text"
                value={inputVolunteerId}
                onChange={(e) => setInputVolunteerId(e.target.value)}
                placeholder="Enter Volunteer ID, e.g. vol-201, vol-202, vol-226"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 shrink-0"
            >
              <Search size={14} />
              <span>Lookup Volunteer Tasks</span>
            </button>

            {/* Optional File Upload button */}
            <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95 shrink-0">
              <Upload size={14} className="text-blue-400" />
              <span>Upload ID File</span>
              <input
                type="file"
                accept=".txt,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </form>

          {/* Quick Preset ID Selection Pills */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Select Volunteer:</span>
            {[
              { id: 'vol-201', name: 'Salman Ali', zone: 'Science' },
              { id: 'vol-202', name: 'Faizan Ali', zone: 'Science' },
              { id: 'vol-203', name: 'Syed Sameem', zone: 'Tech' },
              { id: 'vol-208', name: 'Rubama Hayat', zone: 'Art' },
              { id: 'vol-212', name: 'Anita Mehak', zone: 'Food' },
              { id: 'vol-218', name: 'Rashid Khan', zone: 'Security' }
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleLookupId(v.id)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                  activeVolunteer?.id.toLowerCase() === v.id.toLowerCase()
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
                }`}
              >
                {v.id} ({v.name.split(' ')[0]})
              </button>
            ))}
          </div>

          {/* Alerts / Error Notices */}
          {idNotFound && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
                <span>{idNotFound}</span>
              </div>
              <button onClick={() => setIdNotFound(null)} className="text-xs opacity-70 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          )}

          {uploadNotice && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{uploadNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeVolunteer ? (
        <div className="p-6 sm:p-8 space-y-6">
          {/* Volunteer Profile Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                {activeVolunteer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                    {activeVolunteer.name}
                  </h3>
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {activeVolunteer.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isFullyCleared
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {isFullyCleared ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    <span>{isFullyCleared ? 'Admin Clearance Approved' : 'Duty In Progress'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 flex-wrap">
                  <span className="font-semibold text-blue-700">
                    {activeVolunteer.department} ({activeVolunteer.role || 'Crew Member'})
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <MapPin size={13} className="text-indigo-600" />
                    {activeVolunteer.station || 'Main Exhibition Grounds'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Clock size={13} className="text-amber-600" />
                    {activeVolunteer.shiftTime || '08:00 AM – 05:00 PM PKT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Completion Progress Metric Bar */}
            <div className="lg:w-64 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">Completion Status:</span>
                <span className="font-black text-blue-700">{completedCount} of {totalTasks} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFullyCleared ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 text-center font-medium">
                {isFullyCleared ? 'All specific assigned tasks verified!' : 'Awaiting admin verification & sign-off'}
              </div>
            </div>
          </div>

          {/* Primary Specific Work & Responsibility Spotlight Card */}
          <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl mb-6 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-[11px] font-black uppercase text-blue-900 tracking-wider">
                  Assigned Responsibilities & Specific Work for {activeVolunteer.name} ({activeVolunteer.id.toUpperCase()})
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200 shadow-2xs">
                Station: {activeVolunteer.station || 'Main Venue'}
              </span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                "{activeVolunteer.duties || 'Support event setup, visitor guidance, and exhibition operations.'}"
              </p>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
              <span><strong>Shift Timing:</strong> {activeVolunteer.shiftTime || '08:00 AM – 05:00 PM PKT'}</span>
              <span>•</span>
              <span><strong>Assigned Department:</strong> {activeVolunteer.department}</span>
              <span>•</span>
              <span><strong>Role:</strong> {activeVolunteer.role || 'Crew Member'}</span>
            </div>
          </div>

          {/* Specific Assigned Work Form / Checklist */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileCheck2 size={18} className="text-blue-600" />
                  <span>Specific Assigned Work Checklist (Form View)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {isAdminMode
                    ? 'As Admin, click the toggle buttons below to decide whether each assigned task is Completed or Pending.'
                    : 'Task completion status is decided by the Admin. Volunteers can review their assigned duties and current verified status.'}
                </p>
              </div>

              {/* Admin Actions Bar */}
              {isAdminMode && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSetAllTasks(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Check size={13} />
                    <span>Mark All Completed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetAllTasks(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <RotateCcw size={13} />
                    <span>Reset All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus size={13} />
                    <span>Add Task</span>
                  </button>
                </div>
              )}
            </div>

            {/* Admin Add Task Form */}
            {isAdminMode && isAddingTask && (
              <form onSubmit={handleAddNewTask} className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Inspect fire extinguishers and emergency exits at Zone 1"
                  className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
                >
                  Save Task
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shrink-0"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Task Form Cards List */}
            <div className="space-y-3">
              {dutyTasks.map((task, index) => {
                return (
                  <div
                    key={task.id || `task-${index}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      task.completed
                        ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        task.completed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {task.completed ? <Check size={16} /> : index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {task.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            task.completed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {task.completed ? (
                              <><CheckCircle2 size={11} /> Completed</>
                            ) : (
                              <><Clock size={11} /> In Progress / Pending</>
                            )}
                          </span>
                        </div>

                        <p className={`text-xs sm:text-sm font-semibold leading-snug ${
                          task.completed ? 'text-slate-800' : 'text-slate-900'
                        }`}>
                          {task.title}
                        </p>

                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>Decision Authority: <strong className="text-slate-700">Admin</strong></span>
                          <span>·</span>
                          <span>{task.completed ? 'Verified by Admin on 31 Oct 2026' : 'Pending Admin Verification'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Interactive Toggle / Decider */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isAdminMode ? (
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.title)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                            task.completed
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                          }`}
                          title="Click to toggle status as Admin"
                        >
                          {task.completed ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Admin: Completed</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-amber-500" />
                              <span>Admin: Mark Completed</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${
                            task.completed
                              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {task.completed ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Clock size={13} className="text-amber-600" />}
                            <span>{task.completed ? 'Completed' : 'Pending Admin'}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Duty Summary & Sign-off Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-blue-600 shrink-0" />
              <span>
                Official Volunteer Record · <strong>ID: {activeVolunteer.id}</strong> · Upper Chitral Collabs Operations
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isAdminMode && (
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Lock size={12} />
                  <span>Admin Sign-off Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">
          <User size={32} className="mx-auto mb-2 text-slate-400" />
          <p className="font-semibold text-slate-700">No Volunteer Selected</p>
          <p className="text-xs">Enter a Volunteer ID above or select from the preset list.</p>
        </div>
      )}

      {/* Admin Passcode Modal */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-left relative animate-fadeIn">
            <button
              onClick={() => {
                setShowAdminLoginModal(false);
                setAdminAuthError(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-heading text-lg font-black text-slate-900">Admin Authorization Required</h3>
                <p className="text-xs text-slate-500">Only authorized event organizers can decide task completion</p>
              </div>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Admin Passcode:
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. collabs2026)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              {adminAuthError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminPasscode('collabs2026');
                    setAdminAuthError(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Quick Fill Demo Passcode
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Unlock Admin Controls
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
