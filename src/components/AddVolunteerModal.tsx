import React, { useState, useMemo } from 'react';
import {
  X,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  User,
  Building2,
  Briefcase,
  Clock,
  Shield,
  Check,
  Sparkles
} from 'lucide-react';
import { VolunteerLog } from '../App';

export interface AddVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVolunteer: (newVolunteer: VolunteerLog) => void;
  existingVolunteers: VolunteerLog[];
  availableSchools?: string[];
  availableDepartments?: string[];
}

const DEFAULT_SCHOOLS = [
  'Booni Degree College',
  'Pamir Public School & College',
  'Aga Khan Higher Secondary School Kuragh',
  'Government High School Booni',
  'Chitral Model College',
  'University of Chitral'
];

const DEFAULT_DEPARTMENTS = ['Technical', 'Logistics', 'Content', 'Outreach'];
const STATUSES = ['Verified Active', 'Lead Volunteer', 'Active', 'Pending', 'Inactive'];

// Phone normalization helper
export const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Check if two phone numbers refer to the same contact
export const phonesMatch = (phoneA?: string, phoneB?: string): boolean => {
  if (!phoneA || !phoneB) return false;
  const normA = normalizePhone(phoneA);
  const normB = normalizePhone(phoneB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  // Match last 9-10 digits to handle local 03... vs international 923...
  const suffixA = normA.length >= 9 ? normA.slice(-9) : normA;
  const suffixB = normB.length >= 9 ? normB.slice(-9) : normB;
  return suffixA === suffixB && suffixA.length >= 7;
};

export const AddVolunteerModal: React.FC<AddVolunteerModalProps> = ({
  isOpen,
  onClose,
  onAddVolunteer,
  existingVolunteers,
  availableSchools = DEFAULT_SCHOOLS,
  availableDepartments = DEFAULT_DEPARTMENTS
}) => {
  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    username: '',
    school: availableSchools[0] || 'Booni Degree College',
    customSchool: '',
    department: availableDepartments[0] || 'Technical',
    role: 'Volunteer Specialist',
    status: 'Verified Active' as const,
    hours: 15,
    duties: '',
    newTask: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when modal opens or closes
  const handleClose = () => {
    setFormData(initialFormState);
    setTouched({});
    onClose();
  };

  // Duplicate checks & Form Validation
  const validation = useMemo(() => {
    const errors: Record<string, string> = {};
    let duplicateEmailWarning: { volunteer: VolunteerLog; message: string } | null = null;
    let duplicatePhoneWarning: { volunteer: VolunteerLog; message: string } | null = null;
    let duplicateGeneralWarning: string | null = null;

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedPhone = formData.phone.trim();
    const trimmedUsername = formData.username.trim().toLowerCase();
    const targetSchool = formData.school === 'Other' ? formData.customSchool.trim() : formData.school;

    // 1. Name validation
    if (!trimmedName) {
      errors.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    // 2. Email format validation
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@collabs.org).';
    } else {
      // 3. Email DUPLICATE PREVENT CHECK
      const existingEmailVol = existingVolunteers.find(
        v => v.email && v.email.trim().toLowerCase() === trimmedEmail
      );
      if (existingEmailVol) {
        errors.email = `Email already registered to ${existingEmailVol.name} (${existingEmailVol.id})`;
        duplicateEmailWarning = {
          volunteer: existingEmailVol,
          message: `Duplicate Email: "${trimmedEmail}" is already registered to volunteer ${existingEmailVol.name} (ID: ${existingEmailVol.id}, Track: ${existingEmailVol.department}).`
        };
      }
    }

    // 4. Phone format & DUPLICATE PREVENT CHECK
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required for volunteer coordination.';
    } else if (normalizePhone(trimmedPhone).length < 7) {
      errors.phone = 'Please enter a valid phone number with area/country code (at least 7 digits).';
    } else {
      // Phone DUPLICATE CHECK
      const existingPhoneVol = existingVolunteers.find(v => phonesMatch(v.phone, trimmedPhone));
      if (existingPhoneVol) {
        errors.phone = `Phone number already assigned to ${existingPhoneVol.name} (${existingPhoneVol.id})`;
        duplicatePhoneWarning = {
          volunteer: existingPhoneVol,
          message: `Duplicate Phone: "${trimmedPhone}" is already assigned to volunteer ${existingPhoneVol.name} (ID: ${existingPhoneVol.id}, ${existingPhoneVol.school || 'Collabs'}).`
        };
      }
    }

    // 5. Username validation & uniqueness
    if (!trimmedUsername) {
      errors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
      errors.username = 'Username can only contain letters, numbers, dots, and hyphens.';
    } else {
      const existingUserVol = existingVolunteers.find(
        v => v.username && v.username.trim().toLowerCase() === trimmedUsername
      );
      if (existingUserVol) {
        errors.username = `Username @${trimmedUsername} is already taken by ${existingUserVol.name}`;
      }
    }

    // 6. Custom School validation
    if (formData.school === 'Other' && !formData.customSchool.trim()) {
      errors.customSchool = 'Please specify the name of the school or institution.';
    }

    // Combine duplicate alert message
    if (duplicateEmailWarning && duplicatePhoneWarning) {
      duplicateGeneralWarning = `Duplicate Entry: Both email (${trimmedEmail}) and phone (${trimmedPhone}) are already registered in the system!`;
    } else if (duplicateEmailWarning) {
      duplicateGeneralWarning = duplicateEmailWarning.message;
    } else if (duplicatePhoneWarning) {
      duplicateGeneralWarning = duplicatePhoneWarning.message;
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      errors,
      isValid,
      duplicateEmailWarning,
      duplicatePhoneWarning,
      duplicateGeneralWarning
    };
  }, [formData, existingVolunteers]);

  // Handle Form Change with Smart Suggestions
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };

    // Auto-suggest username from name if not manually modified
    if (field === 'name') {
      const suggestedUsername = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 16);
      if (!formData.username || formData.username === formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')) {
        updated.username = suggestedUsername;
      }
    }

    // Auto-suggest role when department changes if default role is used
    if (field === 'department') {
      if (!formData.role || formData.role.includes('Coordinator') || formData.role.includes('Specialist') || formData.role === 'Volunteer Specialist') {
        updated.role = `${value} Coordinator`;
      }
    }

    setFormData(updated);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      username: true,
      school: true,
      customSchool: true
    });

    if (!validation.isValid) {
      return;
    }

    const schoolName = formData.school === 'Other' ? formData.customSchool.trim() : formData.school;
    const newId = `vol-${Math.floor(100 + Math.random() * 900)}`;

    const newVolunteer: VolunteerLog = {
      id: newId,
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: 'collabs2026',
      school: schoolName,
      department: formData.department as any,
      role: formData.role.trim() || `${formData.department} Specialist`,
      hours: Number(formData.hours) || 0,
      duties: formData.duties.trim() || `Assigned to ${formData.department} for the Booni Mega Event.`,
      dateJoined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: formData.status,
      assignedTasks: formData.newTask.trim()
        ? [formData.newTask.trim(), `Report to ${formData.department} Lead at Booni Venue`]
        : [`Report to ${formData.department} Lead at Booni Venue`]
    };

    onAddVolunteer(newVolunteer);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-fadeIn text-left flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <UserPlus size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 font-heading">Register New Volunteer</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Duplicate Protected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add an individual volunteer record with institutional assignment and automated duplicate prevention.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
            title="Close modal (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
          {/* Duplicate Prevention Alert Banner */}
          {validation.duplicateGeneralWarning && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 text-xs text-red-900 animate-fadeIn">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-red-950 text-sm">Duplicate Entry Detected</div>
                <div className="leading-relaxed">{validation.duplicateGeneralWarning}</div>
                <div className="text-[11px] text-red-700 font-medium pt-1">
                  Volunteers must have a unique email and unique contact phone number to prevent duplicate badges and attendance mix-ups.
                </div>
              </div>
            </div>
          )}

          <form id="add-volunteer-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Full Name & System Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Zahra"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white transition-colors ${
                      touched.name && validation.errors.name
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>
                {touched.name && validation.errors.name && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{validation.errors.name}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  System Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                  <input
                    type="text"
                    required
                    placeholder="fatima"
                    value={formData.username}
                    onChange={e => handleInputChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    className={`w-full pl-7 pr-3 py-2.5 bg-slate-50 border rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white transition-colors ${
                      touched.username && validation.errors.username
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>
                {touched.username && validation.errors.username ? (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{validation.errors.username}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Used for volunteer duty portal sign-in</p>
                )}
              </div>
            </div>

            {/* Row 2: Email Address & Phone Number (THE TWO PRIMARY DUPLICATE CHECKS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Input with Live Uniqueness Check */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  {formData.email && !validation.errors.email && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Unique Email
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="fatima@collabs.org"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white transition-colors ${
                      validation.errors.email
                        ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>
                {validation.errors.email ? (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{validation.errors.email}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Official dispatch & certificate delivery</p>
                )}
              </div>

              {/* Phone Input with Live Uniqueness Check */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  {formData.phone && !validation.errors.phone && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Unique Phone
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="+92 345 1234567 or 0345-1234567"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white transition-colors ${
                      validation.errors.phone
                        ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>
                {validation.errors.phone ? (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{validation.errors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">For urgent on-ground communication at Booni</p>
                )}
              </div>
            </div>

            {/* Row 3: School / Institution Selection */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Partner School / College / Institution <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={formData.school}
                  onChange={e => handleInputChange('school', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  {availableSchools.map(sc => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                  <option value="Other">Other / Custom Institution...</option>
                </select>
              </div>

              {formData.school === 'Other' && (
                <div className="mt-2 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Enter school or university name"
                    value={formData.customSchool}
                    onChange={e => handleInputChange('customSchool', e.target.value)}
                    onBlur={() => handleBlur('customSchool')}
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white ${
                      touched.customSchool && validation.errors.customSchool
                        ? 'border-red-400'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {touched.customSchool && validation.errors.customSchool && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{validation.errors.customSchool}</p>
                  )}
                </div>
              )}
            </div>

            {/* Row 4: Department & Role & Status & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={e => handleInputChange('department', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  {availableDepartments.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stage Tech Lead"
                  value={formData.role}
                  onChange={e => handleInputChange('role', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Initial Hours</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={formData.hours}
                  onChange={e => handleInputChange('hours', Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Row 5: Duties & First Task */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Primary Duties & Focus Area
              </label>
              <textarea
                rows={2}
                placeholder="Key volunteer responsibilities during the Booni exhibition, e.g. manage laptop network, attendee reception..."
                value={formData.duties}
                onChange={e => handleInputChange('duties', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Initial Specific Task Assignment (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Conduct audio check in Main Hall by 09:00 AM on 31 Oct"
                value={formData.newTask}
                onChange={e => handleInputChange('newTask', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            {validation.isValid ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> Ready to register
              </span>
            ) : (
              <span className="text-slate-500">
                Please fix {Object.keys(validation.errors).length} highlighted field(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-volunteer-form"
              disabled={!validation.isValid}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                !validation.isValid
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'
              }`}
            >
              <Check size={15} /> Register Volunteer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVolunteerModal;
