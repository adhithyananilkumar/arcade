'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Award,
  Search,
  Mail,
  Phone,
  BookOpen,
  FileText,
  Video,
  Rocket,
  Plus,
  MoreVertical,
  Send,
  Edit3,
  UserX,
  CheckCircle2,
  Calendar,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { StaffDetailsModal, ExtendedStaffMember } from './StaffDetailsModal';

const LinkedinIcon = ({ size = 13, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 13, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const mockStaff: ExtendedStaffMember[] = [
  {
    id: 'staff-1',
    name: 'Dr. Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    role: 'Lead AI Scientist & Professor',
    department: 'AI & Data Science',
    joiningDate: 'Jan 15, 2024',
    assignedCourses: 12,
    articlesPublished: 28,
    webinarsConducted: 8,
    bootcampsManaged: 4,
    experience: '10+ years',
    email: 'sarah.chen@arcade.ai',
    phone: '+1 (555) 234-5678',
    status: 'ACTIVE',
    performanceScore: 98,
  },
  {
    id: 'staff-2',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'Senior Prompt Engineer',
    department: 'Generative AI',
    joiningDate: 'Mar 10, 2024',
    assignedCourses: 8,
    articlesPublished: 19,
    webinarsConducted: 5,
    bootcampsManaged: 2,
    experience: '6 years',
    email: 'alex.rivera@arcade.ai',
    phone: '+1 (555) 876-5432',
    status: 'ACTIVE',
    performanceScore: 95,
  },
  {
    id: 'staff-3',
    name: 'Prof. Michael Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'Head of Curriculum',
    department: 'Educational Engineering',
    joiningDate: 'Nov 01, 2023',
    assignedCourses: 15,
    articlesPublished: 42,
    webinarsConducted: 14,
    bootcampsManaged: 6,
    experience: '14 years',
    email: 'michael.vance@arcade.ai',
    phone: '+1 (555) 345-6789',
    status: 'ACTIVE',
    performanceScore: 96,
  },
  {
    id: 'staff-4',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    role: 'MLOps Lead Instructor',
    department: 'Cloud & Infrastructure',
    joiningDate: 'Feb 20, 2025',
    assignedCourses: 6,
    articlesPublished: 14,
    webinarsConducted: 4,
    bootcampsManaged: 1,
    experience: '8 years',
    email: 'elena.rostova@arcade.ai',
    phone: '+1 (555) 901-2345',
    status: 'INACTIVE',
    performanceScore: 92,
  },
];

interface StaffManagementSectionProps {
  onInviteStaff?: () => void;
}

export function StaffManagementSection({ onInviteStaff }: StaffManagementSectionProps) {
  const [staffList, setStaffList] = useState<ExtendedStaffMember[]>(mockStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<ExtendedStaffMember | null>(null);

  const departments = useMemo(
    () => ['ALL', ...Array.from(new Set(staffList.map((s) => s.department)))],
    [staffList],
  );

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
      const matchesStatus =
        selectedStatusTab === 'ALL'
          ? true
          : selectedStatusTab === 'ACTIVE'
          ? s.status === 'ACTIVE' || s.status === 'AWAY'
          : s.status === 'INACTIVE';
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staffList, searchQuery, selectedDept, selectedStatusTab]);

  const activeCount = useMemo(() => staffList.filter((s) => s.status !== 'INACTIVE').length, [staffList]);
  const inactiveCount = useMemo(() => staffList.filter((s) => s.status === 'INACTIVE').length, [staffList]);

  const handleToggleStatus = (id: string, targetStatus?: 'ACTIVE' | 'INACTIVE') => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newStatus = targetStatus ?? (s.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE');
        toast.success(
          newStatus === 'ACTIVE'
            ? `Staff member "${s.name}" is now Active`
            : `Staff member "${s.name}" marked as Inactive`,
        );

        if (selectedStaffForModal && selectedStaffForModal.id === id) {
          setSelectedStaffForModal({ ...selectedStaffForModal, status: newStatus });
        }

        return { ...s, status: newStatus };
      }),
    );
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Staff Summary Widgets */}
      <div>
        <h2 className="text-lg font-black tracking-tight text-[#14142b] mb-3">
          Staff & Faculty Directory
        </h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
              <span className="flex items-center gap-1.5"><Users size={15} /> Total Staff</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px]">{staffList.length} Total</span>
            </div>
            <p className="mt-2 text-2xl font-black text-[#14142b]">{staffList.length}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">Across 6 departments</p>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
              <span className="flex items-center gap-1.5"><UserCheck size={15} /> Active Staff</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px]">{activeCount}</span>
            </div>
            <p className="mt-2 text-2xl font-black text-[#14142b]">{activeCount}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">Currently active</p>
          </div>

          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-rose-700">
              <span className="flex items-center gap-1.5"><UserX size={15} /> Inactive Staff</span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px]">{inactiveCount}</span>
            </div>
            <p className="mt-2 text-2xl font-black text-[#14142b]">{inactiveCount}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-rose-600">Marked as Inactive</p>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700">
              <span className="flex items-center gap-1.5"><Clock size={15} /> Pending Invites</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px]">3 Awaiting</span>
            </div>
            <p className="mt-2 text-2xl font-black text-[#14142b]">3</p>
            <p className="mt-0.5 text-[11px] font-semibold text-amber-600">Sent last 7 days</p>
          </div>

          <div className="rounded-2xl border border-teal-200/80 bg-teal-50/70 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-teal-700">
              <span className="flex items-center gap-1.5"><Award size={15} /> Top Performer</span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px]">98/100</span>
            </div>
            <p className="mt-2 text-sm font-black text-[#14142b] truncate">Dr. Sarah Chen</p>
            <p className="mt-0.5 text-[11px] font-semibold text-teal-600">12 courses · Joined 2024</p>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => setSelectedStatusTab('ALL')}
              className={`rounded-xl px-3 py-1.5 transition-all ${
                selectedStatusTab === 'ALL' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              All Staff
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('ACTIVE')}
              className={`rounded-xl px-3 py-1.5 transition-all ${
                selectedStatusTab === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('INACTIVE')}
              className={`rounded-xl px-3 py-1.5 transition-all ${
                selectedStatusTab === 'INACTIVE' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.filter((d) => d !== 'ALL').map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onInviteStaff || (() => toast.info('Opening Staff Invite Modal...'))}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <UserPlus size={15} />
            <span>Invite Staff</span>
          </button>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {filteredStaff.map((member) => {
          const isInactive = member.status === 'INACTIVE';
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedStaffForModal(member)}
              className={`relative overflow-hidden rounded-3xl border p-6 shadow-[0_4px_20px_rgba(20,20,43,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isInactive
                  ? 'border-rose-200/80 bg-rose-50/30 opacity-80'
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              <div>
                {/* Header: Avatar, Name, Status, Quick Menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                          isInactive
                            ? 'bg-rose-500'
                            : member.status === 'ACTIVE'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-extrabold text-[#14142b] truncate">{member.name}</h3>
                        {!isInactive && <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />}
                      </div>
                      <p className="text-xs font-bold text-indigo-600 truncate">{member.role}</p>
                      <p className="text-[11px] font-semibold text-slate-400">{member.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge & Toggle Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(member.id);
                      }}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold border transition-all ${
                        isInactive
                          ? 'bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={isInactive ? 'Click to Activate Staff' : 'Click to Mark Inactive'}
                    >
                      {isInactive ? <UserX size={12} /> : <UserCheck size={12} />}
                      <span>{isInactive ? 'Inactive Staff' : 'Active'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === member.id ? null : member.id);
                      }}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Stats Metrics Row */}
                <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs font-semibold">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Courses</p>
                    <p className="font-extrabold text-slate-900">{member.assignedCourses}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Articles</p>
                    <p className="font-extrabold text-slate-900">{member.articlesPublished}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Webinars</p>
                    <p className="font-extrabold text-slate-900">{member.webinarsConducted}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Bootcamps</p>
                    <p className="font-extrabold text-slate-900">{member.bootcampsManaged}</p>
                  </div>
                </div>

                {/* Joining Date & Social Icons (LinkedIn, GitHub, Mail - No Instagram) */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                  <p className="flex items-center gap-1.5 text-indigo-600 font-bold">
                    <Calendar size={13} className="shrink-0" />
                    <span>Date of Joining: {member.joiningDate}</span>
                  </p>

                  <div className="flex items-center gap-1.5">
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-blue-600 hover:text-white transition-colors"
                      title="LinkedIn"
                    >
                      <LinkedinIcon size={13} />
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors"
                      title="GitHub"
                    >
                      <GithubIcon size={13} />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(`Emailing ${member.email}`);
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-indigo-600 hover:text-white transition-colors"
                      title="Email Staff"
                    >
                      <Mail size={13} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold text-slate-400">Exp: {member.experience}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStaffForModal(member);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    <Eye size={13} className="text-indigo-600" />
                    <span>View Published Content</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(member.id);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
                      isInactive
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isInactive ? <UserCheck size={13} /> : <UserX size={13} />}
                    <span>{isInactive ? 'Activate' : 'Mark Inactive'}</span>
                  </button>
                </div>
              </div>

              {/* Staff Context Dropdown */}
              <AnimatePresence>
                {activeMenuId === member.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-14 right-6 z-30 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStaffForModal(member);
                        setActiveMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Eye size={14} className="text-indigo-600" />
                      <span>View Published Content</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(member.id);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                        isInactive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      {isInactive ? <UserCheck size={14} /> : <UserX size={14} />}
                      <span>{isInactive ? 'Activate Staff' : 'Mark as Inactive'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Staff Published Content Details Modal */}
      <StaffDetailsModal
        isOpen={selectedStaffForModal !== null}
        onClose={() => setSelectedStaffForModal(null)}
        staff={selectedStaffForModal}
        onStatusToggle={(id, newStatus) => handleToggleStatus(id, newStatus)}
      />
    </div>
  );
}
