'use client';

import React, { useEffect, useState } from "react";
import { Users, CheckCircle, Clock, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { roadmapProgressService } from "../services/progress";
import type { RoadmapAnalyticsData } from "../types";

interface RoadmapAnalyticsPanelProps {
  roadmapId: string;
}

export function RoadmapAnalyticsPanel({ roadmapId }: RoadmapAnalyticsPanelProps) {
  const [data, setData] = useState<RoadmapAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    roadmapProgressService.getAnalytics(roadmapId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [roadmapId]);

  if (loading) return <div className="p-8 flex items-center justify-center text-gray-500">Loading analytics...</div>;
  if (error || !data) return <div className="p-8 text-red-500 flex items-center justify-center">Failed to load analytics: {error}</div>;

  const sortedNodesByTime = [...data.nodeStats].sort((a, b) => b.averageTimeSpentSeconds - a.averageTimeSpentSeconds);
  const hardestNode = sortedNodesByTime.length > 0 ? sortedNodesByTime[0] : null;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Roadmap Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor learner progress and identify learning bottlenecks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Learners" 
            value={data.totalLearners} 
            icon={<Users className="text-blue-600" size={20} />} 
            bg="bg-blue-50"
            color="border-blue-100"
          />
          <StatCard 
            title="Overall Completion" 
            value={`${Math.round(data.completionRate)}%`} 
            icon={<CheckCircle className="text-emerald-600" size={20} />} 
            bg="bg-emerald-50"
            color="border-emerald-100"
          />
          <StatCard 
            title="Active Learners" 
            value={data.activeLearners} 
            icon={<Target className="text-indigo-600" size={20} />} 
            bg="bg-indigo-50"
            color="border-indigo-100"
          />
          <StatCard 
            title="Hardest Module" 
            value={hardestNode ? `${Math.round(hardestNode.averageTimeSpentSeconds / 60)}m avg` : "N/A"} 
            icon={<AlertTriangle className="text-orange-600" size={20} />} 
            bg="bg-orange-50"
            color="border-orange-100"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Module Performance Breakdown</h3>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <TrendingDown size={14} /> Higher time = harder module
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Node ID</th>
                  <th className="px-6 py-3">Learners Reached</th>
                  <th className="px-6 py-3">Completion Rate</th>
                  <th className="px-6 py-3">Avg Time Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.nodeStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No node activity recorded yet.</td>
                  </tr>
                ) : (
                  data.nodeStats.map(node => (
                    <tr key={node.nodeId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{node.nodeId}</td>
                      <td className="px-6 py-4 text-gray-600">{node.totalLearners}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">{Math.round(node.completionRate)}%</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${node.completionRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400" />
                          {Math.floor(node.averageTimeSpentSeconds / 60)}m {node.averageTimeSpentSeconds % 60}s
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg, color }: { title: string, value: string | number, icon: React.ReactNode, bg: string, color: string }) {
  return (
    <div className={`bg-white rounded-2xl border ${color} shadow-sm p-6 flex flex-col`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">
        {value}
      </div>
    </div>
  );
}
