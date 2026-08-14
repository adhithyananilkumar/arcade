"use client";

import { useState, useEffect } from "react";
import { Users, GraduationCap, Star, Award, CheckCircle2, Radio, FileText, Search, ExternalLink, MessageSquare, BookOpen, Download, FolderArchive, Clock, Code2, Trophy } from "lucide-react";

export interface LearnerRecord {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  isLive: boolean;
  status: "Active" | "Completed" | "In Progress";
}

export interface AssessmentRecord {
  name: string;
  takers: number;
  passRate: number;
  avgScore: number;
}

export interface FeedbackRecord {
  id: string;
  studentName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CertificateRecord {
  id: string;
  studentName: string;
  certificateCode: string;
  earnedAt: string;
  score: number;
}

const MOCK_LEARNERS: LearnerRecord[] = [
  { id: "1", name: "Alex Morgan", email: "alex.morgan@example.com", enrolledAt: "2026-08-12", progress: 85, isLive: true, status: "Active" },
  { id: "2", name: "Sarah Jenkins", email: "sarah.j@example.com", enrolledAt: "2026-08-10", progress: 100, isLive: false, status: "Completed" },
  { id: "3", name: "David Kumar", email: "david.k@example.com", enrolledAt: "2026-08-08", progress: 100, isLive: false, status: "Completed" },
  { id: "4", name: "Elena Rostova", email: "elena.r@example.com", enrolledAt: "2026-08-14", progress: 42, isLive: true, status: "In Progress" },
  { id: "5", name: "Marcus Vance", email: "marcus.vance@example.com", enrolledAt: "2026-08-05", progress: 92, isLive: true, status: "Active" },
  { id: "6", name: "Amina Al-Mansoor", email: "amina.m@example.com", enrolledAt: "2026-08-03", progress: 100, isLive: false, status: "Completed" },
];

const MOCK_ASSESSMENTS: AssessmentRecord[] = [
  { name: "Module 1: Foundations Quiz", takers: 1240, passRate: 96, avgScore: 92 },
  { name: "Module 2: Midterm Evaluation", takers: 980, passRate: 91, avgScore: 86 },
  { name: "Final Capstone Certification Exam", takers: 892, passRate: 88, avgScore: 84 },
];

const MOCK_FEEDBACKS: FeedbackRecord[] = [
  {
    id: "f1",
    studentName: "Elena Rostova",
    avatar: "E",
    rating: 5,
    comment: "Exceptional course material! The practical examples and clear modular progression made complex topics effortless to grasp.",
    date: "14 Aug 2026",
  },
  {
    id: "f2",
    studentName: "Marcus Vance",
    avatar: "M",
    rating: 5,
    comment: "Super helpful assessment quizzes and prompt evaluation feedback. Highly recommended for anyone mastering this field!",
    date: "12 Aug 2026",
  },
  {
    id: "f3",
    studentName: "Sarah Jenkins",
    avatar: "S",
    rating: 5,
    comment: "Clear structure and instant certificate issuance upon passing the capstone exam. Truly professional experience.",
    date: "10 Aug 2026",
  },
];

const MOCK_CERTIFICATES: CertificateRecord[] = [
  { id: "c1", studentName: "Sarah Jenkins", certificateCode: "CERT-2026-8941", earnedAt: "10 Aug 2026", score: 96 },
  { id: "c2", studentName: "David Kumar", certificateCode: "CERT-2026-8930", earnedAt: "08 Aug 2026", score: 94 },
  { id: "c3", studentName: "Amina Al-Mansoor", certificateCode: "CERT-2026-8912", earnedAt: "05 Aug 2026", score: 98 },
];

export function LearnersAnalyticsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"learners" | "exams" | "feedback" | "certificates" | "curriculum">("learners");
  const [liveCount, setLiveCount] = useState(14);

  // Dynamic real-time heartbeat ticker for live active learners
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      setLiveCount((prev) => Math.min(22, Math.max(11, prev + delta)));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const filteredLearners = MOCK_LEARNERS.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Section Navigation Tabs (Middle Portion Centered) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none flex-wrap">
            <button
              onClick={() => setActiveSubTab("learners")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "learners"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users size={14} /> Enrolled Students {MOCK_LEARNERS.length}
            </button>
            <button
              onClick={() => setActiveSubTab("exams")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "exams"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText size={14} /> Assessment & Exams
            </button>
            <button
              onClick={() => setActiveSubTab("feedback")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "feedback"
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <MessageSquare size={14} /> Reviews & Feedbacks
            </button>
            <button
              onClick={() => setActiveSubTab("certificates")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "certificates"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Award size={14} /> Certificate Recipients
            </button>
            <button
              onClick={() => setActiveSubTab("curriculum")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "curriculum"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <BookOpen size={14} /> Syllabus & Resources
            </button>
          </div>
        </div>

        {/* 3. SUB-TAB CONTENT PANELS */}

        {/* TAB 1: Enrolled Learners & Live Active List */}
        {activeSubTab === "learners" && (
          <div className="rounded-[24px] border-[1.5px] border-blue-400/80 bg-gradient-to-b from-blue-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#BFDBFE] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Enrolled Students Roster
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-blue-100 text-[10px] font-black uppercase tracking-wider text-blue-600">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Course Progress</th>
                    <th className="py-3 px-3 text-right">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLearners.map((learner) => (
                    <tr key={learner.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative grid size-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white font-black text-xs">
                            {learner.name.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-slate-900 truncate">{learner.name}</span>
                            <span className="text-[11px] font-medium text-slate-400 truncate">{learner.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {learner.isLive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            <Radio size={10} className="text-emerald-600 animate-pulse" /> Live Now
                          </span>
                        ) : learner.status === "Completed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            <CheckCircle2 size={10} className="text-blue-600" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 min-w-[160px]">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                              style={{ width: `${learner.progress}%` }}
                            />
                          </div>
                          <span className="font-black text-slate-700 text-[11px] w-8 text-right">
                            {learner.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-500">
                        {new Date(learner.enrolledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Assessments & Exam Performance */}
        {activeSubTab === "exams" && (
          <div className="rounded-[24px] border-[1.5px] border-indigo-400/80 bg-gradient-to-b from-indigo-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#C7D2FE] flex flex-col gap-4">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              Assessment & Exam Performance
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {MOCK_ASSESSMENTS.map((exam, idx) => {
                const colors = [
                  "from-blue-600 via-indigo-600 to-purple-600",
                  "from-indigo-600 via-purple-600 to-pink-600",
                  "from-emerald-500 via-teal-600 to-indigo-600",
                ];
                const cornerBg = colors[idx % colors.length];
                return (
                  <div
                    key={exam.name}
                    className="relative overflow-hidden flex flex-col justify-between p-5 rounded-[22px] border border-indigo-200/90 bg-gradient-to-b from-indigo-50/20 via-white to-white shadow-[3px_-3px_0px_0px_#C7D2FE] transition-all duration-200 hover:scale-[1.01]"
                  >
                    {/* Top-Right Side Triangular Color Accent */}
                    <div className={`absolute top-0 right-0 size-8 bg-gradient-to-bl ${cornerBg} [clip-path:polygon(100%_0,0_0,100%_100%)] shadow-2xs`} />

                    <div className="flex flex-col gap-1 pr-6">
                      <span className="text-xs font-black text-slate-900 leading-snug">{exam.name}</span>
                      <span className="text-[11px] font-medium text-slate-400">{exam.takers} students evaluated</span>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-indigo-100/70 mt-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Pass Rate</span>
                        <span className="text-xl font-black text-slate-900">{exam.passRate}%</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Avg Score</span>
                        <span className="text-xl font-black text-slate-900">{exam.avgScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Ratings & Student Feedbacks */}
        {activeSubTab === "feedback" && (
          <div className="rounded-[24px] border-[1.5px] border-amber-400/80 bg-gradient-to-b from-amber-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#FDE68A] flex flex-col gap-4">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-600" />
              Student Reviews & Course Feedback
            </h3>
            <div className="flex flex-col gap-3">
              {MOCK_FEEDBACKS.map((review) => (
                <div key={review.id} className="flex flex-col gap-2 p-4 rounded-2xl border border-amber-200/80 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-amber-500 text-white font-black text-xs">
                        {review.avatar}
                      </div>
                      <span className="text-xs font-black text-slate-900">{review.studentName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-xs font-black text-slate-700">{review.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 pl-11 italic">"{review.comment}"</p>
                  <span className="text-[10px] font-bold text-slate-400 self-end">{review.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Certificate Recipients */}
        {activeSubTab === "certificates" && (
          <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#A7F3D0] flex flex-col gap-4">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-emerald-600" />
              Verified Certificate Graduates
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-emerald-100 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    <th className="py-3 px-3">Graduate</th>
                    <th className="py-3 px-3">Certificate Code</th>
                    <th className="py-3 px-3">Final Score</th>
                    <th className="py-3 px-3 text-right">Date of Issue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_CERTIFICATES.map((cert) => (
                    <tr key={cert.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">{cert.studentName}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-0.5">
                          {cert.certificateCode} <ExternalLink size={10} />
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-black text-slate-800">{cert.score}%</td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-500">{cert.earnedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Course Syllabus & Downloadable Resources */}
        {activeSubTab === "curriculum" && (
          <div className="rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#E9D5FF] flex flex-col gap-6">
            {/* Section 1: Curriculum & Structure Breakdown */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
                <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-600" />
                  Curriculum & Structure Breakdown
                </h3>
                <span className="rounded-full border border-purple-200 bg-purple-100 text-purple-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  12 Modules
                </span>
              </div>

              {/* Quick Stats Line (No Inner Box Cards) */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 py-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Lessons</span>
                  <span className="text-2xl font-black text-slate-900">48</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Duration</span>
                  <span className="text-2xl font-black text-slate-900">6h 30m</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Code Labs</span>
                  <span className="text-2xl font-black text-slate-900">14</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Capstones</span>
                  <span className="text-2xl font-black text-slate-900">3</span>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="border-t border-purple-200/70" />

            {/* Section 2: Downloadable Course Resources */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
                <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <Download size={18} className="text-emerald-600" />
                  Downloadable Course Resources
                </h3>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 text-emerald-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  3 Files
                </span>
              </div>

              {/* Interactive Resource Rows with Hover Effects */}
              <div className="flex flex-col gap-1 divide-y divide-purple-100/60">
                {[
                  { name: "Capstone-Project-Starter.zip", size: "14.2 MB", type: "Code Archive", downloads: "1.2k downloads", icon: FolderArchive },
                  { name: "System-Architecture-Cheatsheet.pdf", size: "3.8 MB", type: "PDF Guide", downloads: "890 downloads", icon: FileText },
                  { name: "API-Security-Best-Practices.pdf", size: "2.4 MB", type: "Reference Doc", downloads: "640 downloads", icon: FileText },
                ].map((file) => {
                  const IconComponent = file.icon;
                  return (
                    <div
                      key={file.name}
                      className="group flex items-center justify-between gap-3 py-3 px-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-100/70 hover:via-indigo-50/50 hover:to-purple-50/30 rounded-2xl border border-transparent hover:border-purple-200/90 hover:shadow-xs hover:translate-x-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-purple-100/60 text-purple-600 border border-purple-200/60 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:scale-110 transition-all duration-200 shadow-2xs">
                          <IconComponent size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-slate-900 truncate group-hover:text-purple-950 transition-colors">{file.name}</span>
                          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">{file.type} &nbsp;·&nbsp; {file.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-purple-700 bg-purple-100/70 border border-purple-200 rounded-full px-3 py-1 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-200 shadow-2xs">
                          {file.downloads}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
