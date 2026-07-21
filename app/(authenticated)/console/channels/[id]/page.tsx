'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { platformChannelService, Channel, ChannelStatisticsResponse, ChannelActivityResponse } from '@/domains/channels';
import { ChannelStaff } from '@/domains/channels/api/channel-staff.service';
import { Shield, ArrowLeft, Tv, Activity, Users, FileText, CheckCircle, XCircle, LayoutDashboard, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformChannelInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STATISTICS' | 'STAFF' | 'CONTENT' | 'ACTIVITY'>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [statistics, setStatistics] = useState<ChannelStatisticsResponse | null>(null);
  const [staff, setStaff] = useState<ChannelStaff[]>([]);
  const [activity, setActivity] = useState<ChannelActivityResponse[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [channelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [channelData, statsData, staffData, activityData, coursesData, roadmapsData, mediaData] = await Promise.all([
        platformChannelService.getChannelDetails(channelId),
        platformChannelService.getChannelStatistics(channelId),
        platformChannelService.getChannelStaff(channelId),
        platformChannelService.getChannelActivity(channelId),
        platformChannelService.getChannelCourses(channelId),
        platformChannelService.getChannelRoadmaps(channelId),
        platformChannelService.getChannelMedia(channelId)
      ]);
      setChannel(channelData);
      setStatistics(statsData);
      setStaff(staffData);
      setActivity(activityData);
      setCourses(coursesData);
      setRoadmaps(roadmapsData);
      setMedia(mediaData);
    } catch (error) {
      toast.error('Failed to load channel data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await platformChannelService.approveChannel(channelId);
      toast.success('Channel approved');
      fetchData();
    } catch (e) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await platformChannelService.rejectChannel(channelId);
      toast.success('Channel rejected');
      router.push('/console/channels');
    } catch (e) {
      toast.error('Failed to reject');
    }
  };

  const handleSuspend = async () => {
    try {
      await platformChannelService.suspendChannel(channelId);
      toast.success('Channel suspended');
      router.refresh();
      fetchData();
    } catch (e) {
      toast.error('Failed to suspend');
    }
  };

  const handleRestore = async () => {
    try {
      await platformChannelService.restoreChannel(channelId);
      toast.success('Channel restored');
      router.refresh();
      fetchData();
    } catch (e) {
      toast.error('Failed to restore');
    }
  };

  const handleVerify = async () => {
    try {
      await platformChannelService.verifyChannel(channelId);
      toast.success('Channel verified');
      fetchData();
    } catch (e) {
      toast.error('Failed to verify');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading channel data...</div>;
  }

  if (!channel) {
    return <div className="p-8 text-red-500">Channel not found.</div>;
  }

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <Shield size={24} className="text-indigo-600" />
              Platform Inspection
            </h1>
            <p className="text-gray-500">Read-only platform oversight for {channel.name}</p>
          </div>
        </div>

        {/* Governance Actions */}
        <div className="flex gap-2">
          {channel.status === 'PENDING' ? (
            <>
              <button onClick={handleApprove} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
                <CheckCircle size={16} /> Approve
              </button>
              <button onClick={handleReject} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors flex items-center gap-2">
                <XCircle size={16} /> Reject
              </button>
            </>
          ) : (
            <>
              {channel.status !== 'VERIFIED' && (
                <button onClick={handleVerify} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors flex items-center gap-2">
                  <CheckCircle size={16} /> Verify
                </button>
              )}
              {channel.status !== 'SUSPENDED' && (
                <button onClick={handleSuspend} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors flex items-center gap-2">
                  <XCircle size={16} /> Suspend
                </button>
              )}
              {channel.status === 'SUSPENDED' && (
                <button onClick={handleRestore} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium rounded-lg transition-colors flex items-center gap-2">
                  <CheckCircle size={16} /> Restore
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
          { id: 'STATISTICS', label: 'Statistics', icon: Activity },
          { id: 'STAFF', label: 'Staff', icon: Users },
          { id: 'CONTENT', label: 'Content', icon: FileText },
          { id: 'ACTIVITY', label: 'Audit Activity', icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 overflow-hidden shrink-0 border border-indigo-100">
                {channel.iconUrl ? (
                  <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
                ) : (
                  <Tv size={40} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{channel.name}</h2>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{channel.isPersonal ? 'Personal' : 'Organization'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    channel.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    channel.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    channel.status === 'VERIFIED' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {channel.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Owner Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Name</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {channel.ownerName || ((channel as any).owner ? `${(channel as any).owner.firstName || ''} ${(channel as any).owner.lastName || ''}`.trim() : 'Unknown User') || 'Unknown User'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Email</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {channel.ownerEmail || (channel as any).owner?.email || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">System Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Channel ID</div>
                    <div className="text-sm font-mono text-gray-900">{channel.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Created On</div>
                    <div className="text-sm font-semibold text-gray-900">{new Date(channel.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {channel.description && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-gray-600">{channel.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'STATISTICS' && statistics && (
          <div className="grid grid-cols-3 gap-6">
            <StatCard label="Total Courses" value={statistics.totalCourses} />
            <StatCard label="Published Courses" value={statistics.publishedCourses} />
            <StatCard label="Draft Courses" value={statistics.draftCourses} />
            <StatCard label="Total Roadmaps" value={statistics.totalRoadmaps} />
            <StatCard label="Total Media Assets" value={statistics.totalMedia} />
            <StatCard label="Staff Count" value={statistics.totalStaff} />
            <StatCard label="Student Count" value={statistics.totalStudents} />
          </div>
        )}

        {activeTab === 'STAFF' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{member.userName}</div>
                      <div className="text-gray-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{member.roleName}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(member.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No staff found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'CONTENT' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">Courses <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{courses.length}</span></h3>
              <div className="grid grid-cols-2 gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                    <div className="font-semibold text-gray-900 truncate">{course.title}</div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>{course.status}</span>
                      <span>By: {course.authorName}</span>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && <div className="text-sm text-gray-500">No courses found.</div>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">Roadmaps <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{roadmaps.length}</span></h3>
              <div className="grid grid-cols-2 gap-4">
                {roadmaps.map(roadmap => (
                  <div key={roadmap.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                    <div className="font-semibold text-gray-900 truncate">{roadmap.title}</div>
                  </div>
                ))}
                {roadmaps.length === 0 && <div className="text-sm text-gray-500">No roadmaps found.</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ACTIVITY' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activity.map(act => (
                  <tr key={act.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-indigo-600">{act.actionType}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{act.actorName}</td>
                    <td className="px-6 py-4 text-gray-600">{act.description}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(act.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {activity.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent activity.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
