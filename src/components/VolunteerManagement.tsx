import React, { useState, useMemo } from 'react';
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
  Clock,
  UserCheck,
  Shield,
  Briefcase,
  Mail,
  Phone,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserPlus,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { VolunteerLog } from '../App';
import { AddVolunteerModal } from './AddVolunteerModal';

interface VolunteerManagementProps {
  volunteers: VolunteerLog[];
  setVolunteers: React.Dispatch<React.SetStateAction<VolunteerLog[]>>;
  exportCSV: (data: any[], filename: string) => void;
  isDark?: boolean;
}

const COMMON_SCHOOLS = [
  'Booni Degree College',
  'Pamir Public School & College',
  'Aga Khan Higher Secondary School Kuragh',
  'Government High School Booni',
  'Chitral Model College',
  'University of Chitral'
];

const DEPARTMENTS = ['Technical', 'Logistics', 'Content', 'Outreach'];
const STATUSES = ['Verified Active', 'Lead Volunteer', 'Active', 'Pending', 'Inactive'];

export const VolunteerManagement: React.FC<VolunteerManagementProps> = ({
  volunteers,
  setVolunteers,
  exportCSV,
  isDark = false
}) => {
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'hours' | 'dateJoined' | 'school'>('hours');
  const [sortAsc, setSortAsc] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerLog | null>(null);
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerLog | null>(null);
  const [deleteConfirmVolunteer, setDeleteConfirmVolunteer] = useState<VolunteerLog | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState<Partial<VolunteerLog>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Dynamic list of schools present in data + common
  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    COMMON_SCHOOLS.forEach(s => set.add(s));
    volunteers.forEach(v => {
      if (v.school) set.add(v.school);
    });
    return Array.from(set).sort();
  }, [volunteers]);

  // Dynamic roles / departments present
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    DEPARTMENTS.forEach(d => set.add(d));
    volunteers.forEach(v => {
      if (v.department) set.add(v.department);
    });
    return Array.from(set);
  }, [volunteers]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open Edit Modal
  const openEditModal = (vol: VolunteerLog) => {
    setEditingVolunteer(vol);
    setEditFormData({ ...vol });
    setEditErrors({});
  };

  // Submit Edit Volunteer
  const handleEditVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer) return;

    const errors: Record<string, string> = {};
    const trimmedEmail = (editFormData.email || '').trim().toLowerCase();
    const trimmedUsername = (editFormData.username || '').trim().toLowerCase();

    if (!editFormData.name?.trim()) {
      errors.name = 'Name is required.';
    }

    // Check duplicate email (excluding self)
    if (trimmedEmail) {
      const dupEmail = volunteers.find(
        v => v.id !== editingVolunteer.id && v.email?.toLowerCase() === trimmedEmail
      );
      if (dupEmail) {
        errors.email = `Email already used by ${dupEmail.name} (${dupEmail.id})`;
      }
    }

    // Check duplicate username (excluding self)
    if (trimmedUsername) {
      const dupUsername = volunteers.find(
        v => v.id !== editingVolunteer.id && v.username?.toLowerCase() === trimmedUsername
      );
      if (dupUsername) {
        errors.username = `Username already used by ${dupUsername.name}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setVolunteers(prev =>
      prev.map(v => (v.id === editingVolunteer.id ? ({ ...v, ...editFormData } as VolunteerLog) : v))
    );

    // If detail modal is also viewing this volunteer, update it
    if (selectedVolunteer && selectedVolunteer.id === editingVolunteer.id) {
      setSelectedVolunteer({ ...selectedVolunteer, ...editFormData } as VolunteerLog);
    }

    setEditingVolunteer(null);
    showToast(`Volunteer record for ${editingVolunteer.name} updated successfully.`);
  };

  // Delete Volunteer
  const handleDeleteVolunteer = () => {
    if (!deleteConfirmVolunteer) return;
    setVolunteers(prev => prev.filter(v => v.id !== deleteConfirmVolunteer.id));
    if (selectedVolunteer?.id === deleteConfirmVolunteer.id) {
      setSelectedVolunteer(null);
    }
    showToast(`Removed volunteer ${deleteConfirmVolunteer.name} (${deleteConfirmVolunteer.id}).`);
    setDeleteConfirmVolunteer(null);
  };

  // Quick Hours Adjustment (+5 / +10)
  const handleAdjustHours = (volId: string, delta: number) => {
    setVolunteers(prev =>
      prev.map(v => {
        if (v.id === volId) {
          const updatedHours = Math.max(0, (v.hours || 0) + delta);
          return { ...v, hours: updatedHours };
        }
        return v;
      })
    );

    if (selectedVolunteer && selectedVolunteer.id === volId) {
      setSelectedVolunteer(prev => (prev ? { ...prev, hours: Math.max(0, (prev.hours || 0) + delta) } : null));
    }
    showToast(`Updated hours for volunteer.`);
  };

  // Quick Status Toggle in Profile View
  const handleToggleStatus = (volId: string, newStatus: string) => {
    setVolunteers(prev =>
      prev.map(v => (v.id === volId ? { ...v, status: newStatus as any } : v))
    );
    if (selectedVolunteer && selectedVolunteer.id === volId) {
      setSelectedVolunteer(prev => (prev ? { ...prev, status: newStatus as any } : null));
    }
    showToast(`Status updated to ${newStatus}`);
  };

  // Add Task to Volunteer directly
  const [quickNewTask, setQuickNewTask] = useState('');
  const handleAddQuickTask = (volId: string) => {
    if (!quickNewTask.trim()) return;
    setVolunteers(prev =>
      prev.map(v => {
        if (v.id === volId) {
          const tasks = v.assignedTasks || [];
          return { ...v, assignedTasks: [...tasks, quickNewTask.trim()] };
        }
        return v;
      })
    );
    if (selectedVolunteer && selectedVolunteer.id === volId) {
      setSelectedVolunteer(prev =>
        prev
          ? {
              ...prev,
              assignedTasks: [...(prev.assignedTasks || []), quickNewTask.trim()]
            }
          : null
      );
    }
    setQuickNewTask('');
    showToast(`Assigned new task to volunteer.`);
  };

  // Filter & Sort Logic
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(vol => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        vol.name.toLowerCase().includes(q) ||
        vol.username.toLowerCase().includes(q) ||
        (vol.email && vol.email.toLowerCase().includes(q)) ||
        vol.id.toLowerCase().includes(q) ||
        (vol.school && vol.school.toLowerCase().includes(q)) ||
        (vol.role && vol.role.toLowerCase().includes(q)) ||
        (vol.department && vol.department.toLowerCase().includes(q)) ||
        (vol.duties && vol.duties.toLowerCase().includes(q));

      // School filter
      const matchesSchool = schoolFilter === 'All' || vol.school === schoolFilter;

      // Status filter
      const matchesStatus = statusFilter === 'All' || vol.status === statusFilter;

      // Role / Department filter
      const matchesRole =
        roleFilter === 'All' ||
        vol.department === roleFilter ||
        (vol.role && vol.role.toLowerCase().includes(roleFilter.toLowerCase()));

      return matchesSearch && matchesSchool && matchesStatus && matchesRole;
    }).sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';

      if (sortField === 'hours') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [volunteers, searchQuery, schoolFilter, statusFilter, roleFilter, sortField, sortAsc]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = volunteers.length;
    const verified = volunteers.filter(v => v.status === 'Verified Active').length;
    const leads = volunteers.filter(v => v.status === 'Lead Volunteer').length;
    const totalHours = volunteers.reduce((acc, v) => acc + (v.hours || 0), 0);
    const schoolsCount = new Set(volunteers.map(v => v.school).filter(Boolean)).size;

    return { total, verified, leads, totalHours, schoolsCount };
  }, [volunteers]);

  // Export filtered list to CSV
  const handleExportFiltered = () => {
    const exportData = filteredVolunteers.map(v => ({
      ID: v.id,
      Name: v.name,
      Username: v.username,
      Email: v.email || 'N/A',
      Phone: v.phone || 'N/A',
      School: v.school || 'Unassigned',
      Department: v.department,
      Role: v.role || 'Volunteer',
      Status: v.status,
      Hours: v.hours,
      DateJoined: v.dateJoined,
      Duties: v.duties,
      TaskCount: v.assignedTasks?.length || 0
    }));

    exportCSV(exportData, `volunteers_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSchoolFilter('All');
    setStatusFilter('All');
    setRoleFilter('All');
  };

  const isFiltered = searchQuery || schoolFilter !== 'All' || statusFilter !== 'All' || roleFilter !== 'All';

  return (
    <div className="space-y-6">
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

      {/* Summary KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`p-5 rounded-2xl border transition-colors ${isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'}`}>
          <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Total Volunteers</div>
          <div className={`text-2xl font-black font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Enrolled in organization</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'}`}>
          <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Verified Active</div>
          <div className="text-2xl font-black text-emerald-500 font-mono tabular-nums">{stats.verified}</div>
          <div className="text-[11px] text-slate-400 mt-1">Confirmed on-ground</div>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'}`}>
          <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Lead Volunteers</div>
          <div className="text-2xl font-black text-blue-500 font-mono tabular-nums">{stats.leads}</div>
          <div className="text-[11px] text-slate-400 mt-1">Supervisors & Leads</div>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'}`}>
          <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Contributed Hours</div>
          <div className="text-2xl font-black text-purple-400 font-mono tabular-nums">{stats.totalHours} hrs</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all tracks</div>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors col-span-2 md:col-span-1 ${isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'}`}>
          <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Partner Schools</div>
          <div className="text-2xl font-black text-amber-500 font-mono tabular-nums">{stats.schoolsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Chitral & District</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={`rounded-3xl border shadow-xs overflow-hidden transition-colors ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Module Header & Action Toolbar */}
        <div className={`p-6 md:p-8 border-b space-y-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Personnel & Roster</div>
              <h2 className={`text-2xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>Volunteer Management</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Monitor volunteer rosters, filter by school institution, supervise work assignments, and manage credentials.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleExportFiltered}
                className={`px-4 py-2.5 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer border ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                }`}
                title="Export filtered records as CSV"
              >
                <Download size={15} /> Export CSV ({filteredVolunteers.length})
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <UserPlus size={16} /> Add Volunteer
              </button>
            </div>
          </div>

          {/* Filtering and Search Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, ID, school, role, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
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
                  className={`w-full py-2.5 pl-3 pr-8 rounded-xl text-xs font-medium appearance-none cursor-pointer border ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white'
                  }`}
                >
                  <option value="All" className={isDark ? 'bg-slate-900 text-white' : ''}>All Schools & Institutions ({volunteers.length})</option>
                  {availableSchools.map(school => (
                    <option key={school} value={school} className={isDark ? 'bg-slate-900 text-white' : ''}>
                      {school}
                    </option>
                  ))}
                </select>
                <Building2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={`w-full py-2.5 pl-3 pr-8 rounded-xl text-xs font-medium appearance-none cursor-pointer border ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white'
                  }`}
                >
                  <option value="All" className={isDark ? 'bg-slate-900 text-white' : ''}>All Statuses</option>
                  {STATUSES.map(st => (
                    <option key={st} value={st} className={isDark ? 'bg-slate-900 text-white' : ''}>
                      {st}
                    </option>
                  ))}
                </select>
                <UserCheck size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Role / Department Filter */}
            <div className="lg:col-span-2">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className={`w-full py-2.5 pl-3 pr-8 rounded-xl text-xs font-medium appearance-none cursor-pointer border ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white'
                  }`}
                >
                  <option value="All" className={isDark ? 'bg-slate-900 text-white' : ''}>All Roles / Depts</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept} className={isDark ? 'bg-slate-900 text-white' : ''}>
                      {dept}
                    </option>
                  ))}
                </select>
                <Briefcase size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Toggle */}
            <div className="lg:col-span-1 flex items-center justify-end">
              {isFiltered ? (
                <button
                  onClick={resetFilters}
                  className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800/60'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                  title="Reset all search and filters"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              ) : (
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className={`w-full py-2.5 px-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                  title={`Sorted by ${sortField} (${sortAsc ? 'Ascending' : 'Descending'})`}
                >
                  <ArrowUpDown size={13} /> {sortAsc ? 'Asc' : 'Desc'}
                </button>
              )}
            </div>
          </div>

          {/* Active filter counter metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredVolunteers.length}</strong> of{' '}
                <strong className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{volunteers.length}</strong> total volunteers
              </span>
              {isFiltered && (
                <span className="text-blue-500 font-medium">· Filtered results</span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <span>Sort by:</span>
              {(['hours', 'name', 'school', 'dateJoined'] as const).map(field => (
                <button
                  key={field}
                  onClick={() => {
                    if (sortField === field) {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortField(field);
                      setSortAsc(false);
                    }
                  }}
                  className={`capitalize transition-colors ${
                    sortField === field ? 'font-bold text-blue-500 underline' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {field === 'dateJoined' ? 'Date Joined' : field}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-50/70 border-slate-200 text-slate-500'
              }`}>
                <th className="py-4 px-6">Volunteer Profile</th>
                <th className="py-4 px-6">School / Institution</th>
                <th className="py-4 px-6">Role & Track</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Hours Logged</th>
                <th className="py-4 px-6">Assigned Duties & Tasks</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map(vol => {
                  // Initials
                  const initials = vol.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  // Status styling
                  const isLead = vol.status === 'Lead Volunteer';
                  const isVerified = vol.status === 'Verified Active';
                  const isPending = vol.status === 'Pending';

                  return (
                    <tr
                      key={vol.id}
                      className={`transition-colors group cursor-pointer ${
                        isDark ? 'hover:bg-slate-900/70' : 'hover:bg-slate-50/80'
                      }`}
                      onClick={() => setSelectedVolunteer(vol)}
                    >
                      {/* Volunteer Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isLead
                                ? isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-800 border border-blue-200'
                                : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className={`font-bold transition-colors flex items-center gap-1.5 ${
                              isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                            }`}>
                              {vol.name}
                              {isLead && (
                                <span title="Lead Volunteer">
                                  <Shield size={13} className="text-blue-500" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className={`font-mono font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{vol.id}</span>
                              <span aria-hidden="true">·</span>
                              <span>@{vol.username}</span>
                              {vol.email && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="truncate max-w-[140px] text-slate-400">{vol.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School / Institution */}
                      <td className="py-4 px-6">
                        <div className={`font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                          <span>{vol.school || 'Collabs Central Organization'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-5">Upper Chitral District</div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-4 px-6">
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{vol.role || `${vol.department} Team`}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                          <span>{vol.department} Track</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            isLead
                              ? isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                              : isVerified
                              ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPending
                              ? isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                              : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLead
                                ? 'bg-blue-500'
                                : isVerified
                                ? 'bg-emerald-500'
                                : isPending
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          ></span>
                          {vol.status}
                        </span>
                      </td>

                      {/* Hours Logged */}
                      <td className="py-4 px-6 text-right font-mono tabular-nums">
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{vol.hours || 0} hrs</div>
                        <div className={`w-20 ml-auto h-1.5 rounded-full mt-1.5 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, ((vol.hours || 0) / 100) * 100)}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Duties / Tasks Preview */}
                      <td className="py-4 px-6 max-w-xs">
                        <p className={`line-clamp-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`} title={vol.duties}>
                          {vol.duties || 'General operations support'}
                        </p>
                        {vol.assignedTasks && vol.assignedTasks.length > 0 && (
                          <div className="text-[11px] text-blue-500 font-semibold mt-0.5">
                            {vol.assignedTasks.length} active assignment{vol.assignedTasks.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedVolunteer(vol)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="View Full Volunteer Profile"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(vol)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title="Edit Volunteer Details"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmVolunteer(vol)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete Volunteer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className={`py-12 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                        isDark ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Search size={22} />
                      </div>
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>No volunteers match your criteria</div>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search terms or clearing your school and role filters.
                      </p>
                      <button
                        onClick={resetFilters}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                          isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <RotateCcw size={13} /> Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD VOLUNTEER WITH EMAIL & PHONE DUPLICATE PREVENTION VALIDATION */}
      {/* ========================================================================= */}
      <AddVolunteerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddVolunteer={(newVolunteer) => {
          setVolunteers(prev => [newVolunteer, ...prev]);
          showToast(`Volunteer ${newVolunteer.name} successfully registered with ID ${newVolunteer.id}`);
        }}
        existingVolunteers={volunteers}
        availableSchools={availableSchools}
        availableDepartments={availableDepartments}
        isDark={isDark}
      />

      {/* ========================================================================= */}
      {/* MODAL 2: VOLUNTEER DETAIL & DUTY DRAWER MODAL */}
      {/* ========================================================================= */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className={`${
            isDark ? 'bg-slate-900 border-slate-700 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          } rounded-3xl max-w-xl w-full p-6 sm:p-8 border my-8 animate-fadeIn text-left space-y-6 transition-colors`}>
            {/* Header */}
            <div className={`flex items-start justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-600/20">
                  {selectedVolunteer.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xl font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVolunteer.name}</h3>
                    <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedVolunteer.id}
                    </span>
                  </div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedVolunteer.role} · @{selectedVolunteer.username}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Institutional Affiliation</div>
                <div className={`font-bold mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Building2 size={13} className="text-blue-500 shrink-0" />
                  <span>{selectedVolunteer.school || 'Collabs Central Organization'}</span>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Department & Track</div>
                <div className={`font-bold mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Briefcase size={13} className="text-blue-500 shrink-0" />
                  <span>{selectedVolunteer.department} Track</span>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Contact Information</div>
                <div className={`mt-0.5 space-y-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" />
                    <span>{selectedVolunteer.email || 'No email registered'}</span>
                  </div>
                  {selectedVolunteer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      <span>{selectedVolunteer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Date Enrolled</div>
                <div className={`font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedVolunteer.dateJoined || 'Booni Event Season 2026'}
                </div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Registered Credential
                </div>
              </div>
            </div>

            {/* Quick Status & Hours Controls */}
            <div className={`p-4 rounded-2xl space-y-3 border ${
              isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-bold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Contribution Hours</div>
                  <div className="text-2xl font-black text-blue-500 font-mono tabular-nums">
                    {selectedVolunteer.hours || 0} Hours
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustHours(selectedVolunteer.id, 5)}
                    className={`px-3 py-1.5 border text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs ${
                      isDark
                        ? 'bg-slate-900 border-blue-500/40 text-blue-300 hover:bg-slate-800'
                        : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    +5 hrs
                  </button>
                  <button
                    onClick={() => handleAdjustHours(selectedVolunteer.id, 10)}
                    className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
                  >
                    +10 hrs
                  </button>
                </div>
              </div>

              <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                isDark ? 'border-blue-900/50' : 'border-blue-100'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Change Status:</span>
                <div className="flex items-center gap-1.5">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleToggleStatus(selectedVolunteer.id, s)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                        selectedVolunteer.status === s
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duties description */}
            <div className="space-y-1 text-xs">
              <div className="font-bold uppercase tracking-wider text-[11px] text-slate-400">Primary Responsibilities</div>
              <p className={`p-3 rounded-xl leading-relaxed border ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                {selectedVolunteer.duties || 'General operations and student delegation assistance.'}
              </p>
            </div>

            {/* Assigned Tasks Checklist */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                  Assigned Operational Tasks ({selectedVolunteer.assignedTasks?.length || 0})
                </div>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedVolunteer.assignedTasks && selectedVolunteer.assignedTasks.length > 0 ? (
                  selectedVolunteer.assignedTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl flex items-start gap-2.5 border ${
                        isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs">{task}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-xs">No specific tasks currently assigned.</p>
                )}
              </div>

              {/* Quick Add Task Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Assign new task to this volunteer..."
                  value={quickNewTask}
                  onChange={e => setQuickNewTask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuickTask(selectedVolunteer.id);
                    }
                  }}
                  className={`flex-1 p-2 rounded-xl text-xs border ${
                    isDark
                      ? 'bg-slate-800 text-white placeholder-slate-500 border-slate-700 focus:outline-none focus:border-blue-500'
                      : 'bg-slate-50 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600'
                  }`}
                />
                <button
                  onClick={() => handleAddQuickTask(selectedVolunteer.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => {
                  const vol = selectedVolunteer;
                  setSelectedVolunteer(null);
                  openEditModal(vol);
                }}
                className={`px-4 py-2 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <Edit3 size={14} /> Edit Information
              </button>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className={`px-5 py-2 font-bold text-xs rounded-xl cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT VOLUNTEER MODAL */}
      {/* ========================================================================= */}
      {editingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className={`${
            isDark ? 'bg-slate-900 border-slate-700 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          } rounded-3xl max-w-xl w-full p-6 sm:p-8 border my-8 animate-fadeIn text-left transition-colors`}>
            <div className={`flex items-start justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <h3 className={`text-lg font-black font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Edit Volunteer: {editingVolunteer.name}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ID: {editingVolunteer.id}</p>
              </div>
              <button
                onClick={() => setEditingVolunteer(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditVolunteerSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  />
                  {editErrors.name && <p className="text-[11px] text-red-500 mt-1">{editErrors.name}</p>}
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Email</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  />
                  {editErrors.email && <p className="text-[11px] text-red-500 mt-1">{editErrors.email}</p>}
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Username</label>
                  <input
                    type="text"
                    required
                    value={editFormData.username || ''}
                    onChange={e => setEditFormData({ ...editFormData, username: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs font-mono border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  />
                  {editErrors.username && <p className="text-[11px] text-red-500 mt-1">{editErrors.username}</p>}
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>School / Institution</label>
                  <select
                    value={editFormData.school || availableSchools[0]}
                    onChange={e => setEditFormData({ ...editFormData, school: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  >
                    {availableSchools.map(s => (
                      <option key={s} value={s} className={isDark ? 'bg-slate-900 text-white' : ''}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Department</label>
                  <select
                    value={editFormData.department || 'Technical'}
                    onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d} className={isDark ? 'bg-slate-900 text-white' : ''}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Role Title</label>
                  <input
                    type="text"
                    value={editFormData.role || ''}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Status</label>
                  <select
                    value={editFormData.status || 'Verified Active'}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl text-xs border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  >
                    {STATUSES.map(st => (
                      <option key={st} value={st} className={isDark ? 'bg-slate-900 text-white' : ''}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Logged Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.hours || 0}
                    onChange={e => setEditFormData({ ...editFormData, hours: Number(e.target.value) })}
                    className={`w-full p-2.5 rounded-xl text-xs font-mono border ${
                      isDark
                        ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Duties</label>
                <textarea
                  rows={2}
                  value={editFormData.duties || ''}
                  onChange={e => setEditFormData({ ...editFormData, duties: e.target.value })}
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    isDark
                      ? 'bg-slate-800 text-white border-slate-700 focus:outline-none focus:border-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setEditingVolunteer(null)}
                  className={`px-4 py-2 font-bold text-xs rounded-xl cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {deleteConfirmVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`${
            isDark ? 'bg-slate-900 border-slate-700 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          } rounded-3xl max-w-sm w-full p-6 border animate-fadeIn text-center space-y-4`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              isDark ? 'bg-red-950/60 text-red-400 border border-red-800/60' : 'bg-red-50 text-red-600'
            }`}>
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Remove Volunteer Record?</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Are you sure you want to remove <strong className={isDark ? 'text-white' : 'text-slate-900'}>{deleteConfirmVolunteer.name}</strong> ({deleteConfirmVolunteer.id})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmVolunteer(null)}
                className={`px-4 py-2 font-bold text-xs rounded-xl cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVolunteer}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
