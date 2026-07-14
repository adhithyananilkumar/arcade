'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, ArrowLeft, Loader2, Play, Cpu, Server, Database, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { CertificateService } from '@/services/certificate.service';

export default function GenerateCertificatePage() {
  const [participantName, setParticipantName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [miningStep, setMiningStep] = useState(0);

  const router = useRouter();

  const steps = [
    { text: 'Hashing Certificate Metadata...', icon: Cpu },
    { text: 'Retrieving Latest Blockchain Node...', icon: Server },
    { text: 'Calculating Previous Hash Link...', icon: Database },
    { text: 'Mining Block & Broadcasting Transaction...', icon: Loader2 },
    { text: 'Ledger Registry Confirmed!', icon: CheckCircle2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantName.trim() || !courseName.trim()) {
      toast.error('Please fill in all details');
      return;
    }

    setIsMining(true);
    setMiningStep(0);

    // Simulate mining timeline
    const interval = setInterval(() => {
      setMiningStep((prev) => {
        if (prev < steps.length - 2) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 900);

    try {
      const generatedCourseUrl = 'https://arcade.ajce.in/courses/' + encodeURIComponent(courseName.trim().toLowerCase().replace(/\s+/g, '-'));

      const response = await CertificateService.generate({
        participantName: participantName.trim(),
        courseName: courseName.trim(),
        courseUrl: generatedCourseUrl,
      });

      // Complete mining animation steps
      setTimeout(() => {
        setMiningStep(steps.length - 1);
        setTimeout(() => {
          clearInterval(interval);
          setIsMining(false);
          toast.success('Certificate mined and registered on ledger!');
          router.push(`/dashboard/certificates/${response.id}`);
        }, 1000);
      }, 3500);

    } catch (err) {
      clearInterval(interval);
      setIsMining(false);
      console.error(err);
      toast.error('Failed to register certificate on blockchain');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/certificates"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Ledger
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="text-indigo-600 h-6 w-6" />
          Issue Unique Certificate
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Provide details to mine a new block in the local blockchain ledger and sign the student certificate.
        </p>

        <AnimatePresence mode="wait">
          {!isMining ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-5 mt-6"
            >
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Course or Learning Module Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Web Development Boot Camp"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all duration-200 cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  Mine Blockchain Certificate
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 py-10 flex flex-col items-center justify-center text-center space-y-6"
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

                <div className="space-y-2.5 text-left bg-gray-50 border border-gray-150 rounded-2xl p-4">
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
