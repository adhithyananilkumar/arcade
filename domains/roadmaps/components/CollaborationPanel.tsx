import React, { useState, useEffect } from "react";
import { Users, MessageSquare, Activity, UserPlus, Clock, Check, MoreVertical } from "lucide-react";
import { collaborationService } from "../services/collaboration";
import type { CollaboratorData, CommentData, ActivityData } from "../types";

interface CollaborationPanelProps {
  roadmapId: string;
}

export function CollaborationPanel({ roadmapId }: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<"members" | "comments" | "activity">("members");
  
  const [collaborators, setCollaborators] = useState<CollaboratorData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [collabs, comms, acts] = await Promise.all([
        collaborationService.getCollaborators(roadmapId),
        collaborationService.getComments(roadmapId),
        collaborationService.getActivities(roadmapId)
      ]);
      setCollaborators(collabs);
      setComments(comms);
      setActivities(acts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
    // In a real app, this would be a WebSocket or polling
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [roadmapId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setLoading(true);
    try {
      await collaborationService.inviteCollaborator(roadmapId, inviteEmail, inviteRole);
      setInviteEmail("");
      fetchAll();
    } catch (err: any) {
      alert("Failed to invite: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-96 bg-white border-l border-gray-200 h-full">
      <div className="flex items-center justify-around border-b border-gray-200 p-2">
        <button 
          onClick={() => setActiveTab("members")}
          className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "members" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Users size={16} /> Members
        </button>
        <button 
          onClick={() => setActiveTab("comments")}
          className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "comments" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <MessageSquare size={16} /> Comments
        </button>
        <button 
          onClick={() => setActiveTab("activity")}
          className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "activity" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Activity size={16} /> Activity
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        
        {activeTab === "members" && (
          <div className="space-y-6">
            <form onSubmit={handleInvite} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <UserPlus size={16} className="text-indigo-600"/> Invite Collaborator
              </h3>
              <div>
                <input 
                  type="email" 
                  required
                  placeholder="Email address"
                  className="w-full text-sm rounded-lg border-gray-300 mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <select 
                    className="text-sm rounded-lg border-gray-300 flex-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="bg-indigo-600 text-white px-4 rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Team</h3>
              {collaborators.map(c => (
                <div key={c.userId} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <img src={c.avatarUrl || "https://ui-avatars.com/api/?name=" + c.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    c.role === "OWNER" ? "bg-amber-100 text-amber-800" :
                    c.role === "EDITOR" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {c.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-4">
            {comments.filter(c => !c.resolved).length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No active comments.</div>
            ) : (
              comments.filter(c => !c.resolved).map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={c.authorAvatar || "https://ui-avatars.com/api/?name=" + c.authorName} className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-bold text-gray-900">{c.authorName}</span>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  {c.nodeId && (
                    <div className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded w-fit mb-1">On node: {c.nodeId.substring(0,6)}...</div>
                  )}
                  <p className="text-sm text-gray-700">{c.content}</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={async () => {
                        await collaborationService.resolveComment(roadmapId, c.id);
                        fetchAll();
                      }}
                      className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Check size={14} /> Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
             {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No recent activity.</div>
            ) : (
              <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-6">
                {activities.map(a => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full" />
                    <p className="text-sm text-gray-900">
                      <span className="font-bold">{a.userName}</span> {a.description}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
