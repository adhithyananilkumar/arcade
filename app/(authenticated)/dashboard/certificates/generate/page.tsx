'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, ArrowLeft, Loader2, Play, Cpu, Server, Database, CheckCircle2, User, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { CertificateService } from '@/services/certificate.service';
import { useAuthStore } from '@/store/auth.store';

const DEMO_COURSES = [
  {
    id: 'demo-react',
    name: 'React Foundations',
    duration: '4 weeks',
    url: 'https://arcade.ajce.in/courses/react-foundations'
  },
  {
    id: 'demo-blockchain',
    name: 'Blockchain for Web Apps',
    duration: '6 weeks',
    url: 'https://arcade.ajce.in/courses/blockchain-web-apps'
  }
];

function inferCourseNameFromUrl(input: string): string {
  try {
    const parsed = new URL(input.trim());
    const segments = parsed.pathname.split('/').filter(Boolean);
    const leaf = segments[segments.length - 1] || '';
    if (!leaf) return '';
    return decodeURIComponent(leaf)
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
  } catch {
    return '';
  }
}

export default function GenerateCertificatePage() {
  const { user } = useAuthStore();
  
  const [participantName, setParticipantName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseUrl, setCourseUrl] = useState('');
  
  const [isMining, setIsMining] = useState(false);
  const [miningStep, setMiningStep] = useState(0);
  const [showManualForm, setShowManualForm] = useState(false);

  const router = useRouter();

  const steps = [
    { text: 'Hashing Certificate Metadata...', icon: Cpu },
    { text: 'Retrieving Latest Blockchain Node...', icon: Server },
    { text: 'Calculating Previous Hash Link...', icon: Database },
    { text: 'Mining Block & Broadcasting Transaction...', icon: Loader2 },
    { text: 'Ledger Registry Confirmed!', icon: CheckCircle2 },
  ];

  const handleDemoIssue = async (course: typeof DEMO_COURSES[0]) => {
    setIsMining(true);
    setMiningStep(0);
    startMiningAnimation();

    try {
      const response = await CertificateService.issueFromDemoCourse({
        courseName: course.name,
        courseUrl: course.url,
      });
      finishMiningAnimation(response.id);
    } catch (err) {
      handleMiningError(err);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantName.trim() || !courseName.trim()) {
      toast.error('Please fill in all details');
      return;
    }

    let resolvedCourseUrl = courseUrl.trim();
    if (!resolvedCourseUrl) {
      resolvedCourseUrl = 'https://arcade.ajce.in/courses/' + encodeURIComponent(courseName.trim().toLowerCase().replace(/\s+/g, '-'));
    }

    setIsMining(true);
    setMiningStep(0);
    startMiningAnimation();

    try {
      const response = await CertificateService.generate({
        participantName: participantName.trim(),
        courseName: courseName.trim(),
        courseUrl: resolvedCourseUrl,
      });
      finishMiningAnimation(response.id);
    } catch (err) {
      handleMiningError(err);
    }
  };

  let miningInterval: NodeJS.Timeout;

  const startMiningAnimation = () => {
    miningInterval = setInterval(() => {
      setMiningStep((prev) => {
        if (prev < steps.length - 2) {
          return prev + 1;
        } else {
          clearInterval(miningInterval);
          return prev;
        }
      });
    }, 900);
  };

  const finishMiningAnimation = (certificateId: string) => {
    setTimeout(() => {
      setMiningStep(steps.length - 1);
      setTimeout(() => {
        clearInterval(miningInterval);
        setIsMining(false);
        toast.success('Certificate mined and registered on ledger!');
        router.push(`/dashboard/certificates/${certificateId}`);
      }, 1000);
    }, 3500);
  };

  const handleMiningError = (err: any) => {
    clearInterval(miningInterval);
    setIsMining(false);
    console.error(err);
    toast.error('Failed to register certificate on blockchain');
  };

  if (isMining) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center space-y-6"
        >
          {/* Spinner/Status Icons */}
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
            {(() => {
              const CurrentIcon = steps[miningStep].icon;
              return (
                <CurrentIcon
                  className={`h-8 w-8 text-indigo-600 ${
                    miningStep === 3 ? 'animate-spin' : ''
                  }`}
                />
              );
            })()}
          </div>

          {/* Progress Steps Timeline */}
          <div className="space-y-4 w-full max-w-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900">Cryptographic Registering</h3>
              <p className="text-xs text-gray-400 mt-1">Arcade Ledgers Network</p>
            </div>

            <div className="space-y-2.5 text-left bg-white border border-gray-150 shadow-sm rounded-2xl p-4">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isDone = idx < miningStep;
                const isCurrent = idx === miningStep;
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs transition-colors duration-300 ${
                      isDone 
                        ? 'text-green-600 font-semibold' 
                        : isCurrent 
                        ? 'text-indigo-600 font-bold' 
                        : 'text-gray-450 opacity-50'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={15} className="text-green-600" />
                    ) : (
                      <StepIcon size={15} className={isCurrent && idx === 3 ? 'animate-spin' : ''} />
                    )}
                    <span>{step.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/certificates"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Ledger
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-indigo-600 h-7 w-7" />
              Course Certificates
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Complete a course below to trigger an automatic blockchain certificate issuance.
            </p>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="bg-indigo-100 p-1.5 rounded-full">
              <User size={16} className="text-indigo-700" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Logged in as</p>
              <p className="text-sm font-semibold text-indigo-900">{user?.fullName || 'Guest User'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Available Demo Courses</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {DEMO_COURSES.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group bg-gradient-to-br from-white to-gray-50/50">
                <div className="flex items-start justify-between">
                  <div className="bg-indigo-100 p-2.5 rounded-xl group-hover:bg-indigo-600 transition-colors">
                    <BookOpen className="text-indigo-600 group-hover:text-white transition-colors" size={20} />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm">
                    {course.duration}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mt-4 text-lg">{course.name}</h3>
                <p className="text-xs text-gray-500 mt-1 truncate">{course.url}</p>
                <button
                  onClick={() => handleDemoIssue(course)}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition-all duration-200"
                >
                  <Play size={15} fill="currentColor" />
                  Complete & Issue
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center justify-between w-full text-left focus:outline-none group"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Admin Testing / Custom Entry</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manually enter a name and course URL to mine a custom certificate.</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-full border border-gray-200 group-hover:bg-gray-100 transition-colors">
              {showManualForm ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
            </div>
          </button>

          <AnimatePresence>
            {showManualForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
                onSubmit={handleManualSubmit}
              >
                <div className="space-y-5 mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Participant Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Johnathan Doe"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Course Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Web Development Boot Camp"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Course URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://arcade.ajce.in/courses/full-stack-web-development"
                      value={courseUrl}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        setCourseUrl(nextUrl);
                        if (!courseName.trim()) {
                          const inferred = inferCourseNameFromUrl(nextUrl);
                          if (inferred) setCourseName(inferred);
                        }
                      }}
                      onBlur={(e) => {
                        if (!courseName.trim()) {
                          const inferred = inferCourseNameFromUrl(e.target.value);
                          if (inferred) setCourseName(inferred);
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-md hover:bg-gray-800 transition-all duration-200"
                    >
                      <Cpu size={16} />
                      Mine Custom Blockchain Certificate
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
