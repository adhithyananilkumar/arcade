'use client';

import { useState } from 'react';
import {
  Rocket,
  Calendar,
  Clock,
  BookOpen,
  Video,
  Award,
  Star,
  DollarSign,
  Plus,
  BarChart3,
  Settings,
  Archive,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export interface BootcampItem {
  id: string;
  title: string;
  banner: string;
  instructor: string;
  instructorAvatar: string;
  duration: string;
  modulesCount: number;
  liveSessionsCount: number;
  projectsCount: number;
  studentsEnrolled: number;
  completionPercentage: number;
  certificatesIssued: number;
  rating: number;
  revenue: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

const mockBootcamps: BootcampItem[] = [
  {
    id: 'boot-1',
    title: 'Full-Stack AI Engineer Intensive Bootcamp (Cohort 8)',
    banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    instructor: 'Dr. Sarah Chen & Alex Rivera',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    duration: '12 Weeks (Live Cohort)',
    modulesCount: 16,
    liveSessionsCount: 36,
    projectsCount: 4,
    studentsEnrolled: 240,
    completionPercentage: 94.2,
    certificatesIssued: 210,
    rating: 4.96,
    revenue: '$288,000',
    status: 'ACTIVE',
  },
  {
    id: 'boot-2',
    title: 'LLM Fine-Tuning & Custom Model Evaluation Bootcamp',
    banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    instructor: 'Prof. Michael Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    duration: '6 Weeks (Weekend Cohort)',
    modulesCount: 8,
    liveSessionsCount: 18,
    projectsCount: 2,
    studentsEnrolled: 180,
    completionPercentage: 88.0,
    certificatesIssued: 145,
    rating: 4.92,
    revenue: '$162,000',
    status: 'UPCOMING',
  },
];

export function BootcampManagementSection() {
  const [bootcamps] = useState<BootcampItem[]>(mockBootcamps);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#14142b]">
            Bootcamp Cohort Management
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Cohort-based immersive programs with live mentoring, code reviews, and capstone projects
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info('Opening Bootcamp Creation Wizard...')}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>Create New Bootcamp</span>
        </button>
      </div>

      {/* Bootcamp Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {bootcamps.map((bootcamp) => (
          <motion.div
            key={bootcamp.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(20,20,43,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Banner Container */}
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 mb-5">
                <img
                  src={bootcamp.banner}
                  alt={bootcamp.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-0.5 text-[11px] font-black text-white ${
                      bootcamp.status === 'ACTIVE'
                        ? 'bg-emerald-500 shadow-md animate-pulse'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {bootcamp.status}
                  </span>
                  <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-0.5 text-[11px] font-bold text-white">
                    {bootcamp.duration}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {bootcamp.rating} / 5.0 Rating
                  </span>
                  <span className="text-emerald-400 font-extrabold text-sm">
                    {bootcamp.revenue} Revenue
                  </span>
                </div>
              </div>

              {/* Title & Instructor */}
              <h3 className="text-base font-black text-[#14142b] leading-snug">
                {bootcamp.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Lead Instructors: <span className="text-slate-800 font-bold">{bootcamp.instructor}</span>
              </p>

              {/* Curriculum Breakdown Grid */}
              <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-3.5 text-center text-xs font-semibold">
                <div>
                  <p className="text-[10px] uppercase text-slate-400">Modules</p>
                  <p className="font-extrabold text-slate-900">{bootcamp.modulesCount}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">Live Sessions</p>
                  <p className="font-extrabold text-indigo-600">{bootcamp.liveSessionsCount}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">Projects</p>
                  <p className="font-extrabold text-purple-600">{bootcamp.projectsCount}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">Students</p>
                  <p className="font-extrabold text-emerald-600">{bootcamp.studentsEnrolled}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Cohort Completion</span>
                  <span className="text-emerald-600">{bootcamp.completionPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${bootcamp.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                <Award size={14} className="text-amber-500" />
                {bootcamp.certificatesIssued} Certificates Issued
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toast.info(`Viewing analytics for ${bootcamp.title}`)}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                  title="Analytics"
                >
                  <BarChart3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info(`Managing schedule for ${bootcamp.title}`)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => toast.info(`Managing bootcamp ${bootcamp.title}`)}
                  className="rounded-xl bg-[#14142b] px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-900"
                >
                  Manage Cohort
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
