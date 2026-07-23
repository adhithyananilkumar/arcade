'use client';

import { useState, useEffect } from 'react';
import { api } from '@/infrastructure/http/api';
import { ReviewRoundResponse } from '@/shared/api/review.api';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export function CreatorVersionTimeline({ courseId }: { courseId: string }) {
  const [rounds, setRounds] = useState<ReviewRoundResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRounds() {
      try {
        const data = await api.get<ReviewRoundResponse[]>(`/api/courses/${courseId}/reviews`);
        setRounds(data);
      } catch (e) {
        console.error("Failed to load review history", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRounds();
  }, [courseId]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading version history...</div>;
  }

  if (rounds.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center pt-24">
        <GitCommit size={32} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No versions submitted yet</h3>
        <p className="text-gray-500 max-w-md mt-2">
          When you submit this course for review, a snapshot of its current state will be taken and appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-40">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Version History</h2>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        
        {rounds.map((round) => {
          let StatusIcon = Clock;
          let statusColor = "text-slate-500";
          let bgStatus = "bg-slate-100";
          
          if (round.status === 'COMPLETED') {
            if (round.decision === 'APPROVED') {
              StatusIcon = CheckCircle2;
              statusColor = "text-emerald-500";
              bgStatus = "bg-emerald-50";
            } else if (round.decision === 'CHANGES_REQUESTED') {
              StatusIcon = AlertTriangle;
              statusColor = "text-amber-500";
              bgStatus = "bg-amber-50";
            }
          } else {
            statusColor = "text-indigo-500";
            bgStatus = "bg-indigo-50";
          }

          return (
            <div key={round.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${bgStatus} z-10`}>
                <StatusIcon size={16} className={statusColor} />
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">
                    Version {round.versionNumber}
                  </h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    round.status === 'PENDING' ? 'bg-indigo-100 text-indigo-800' :
                    round.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {round.status === 'PENDING' ? 'Pending Review' : 
                     round.decision === 'APPROVED' ? 'Published' : 'Changes Requested'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-4 space-y-1">
                  <p>Submitted {formatDistanceToNow(new Date(round.submittedAt))} ago</p>
                  {round.resolvedAt && (
                    <p>Reviewed by {round.reviewerName} {formatDistanceToNow(new Date(round.resolvedAt))} ago</p>
                  )}
                </div>

                {round.decisionReason && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">Reviewer Note</h4>
                    <p className="text-sm text-gray-600 italic">"{round.decisionReason}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
