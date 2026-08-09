"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import {
  MoreHorizontal,
  Mail,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
} from "lucide-react";

export default function RegisteredMembersPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeParticipant, setActiveParticipant] = useState<any | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api.get<any[]>(`/api/v1/workshops/${id}/participants`)
        .then(data => {
          setParticipants(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch participants:', err);
          setLoading(false);
        });
    }
  }, [id]);

  const toggleSelectAll = () => {
    if (selected.size === participants.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(participants.map((p) => p.id)));
    }
  };

  const toggleSelect = (pid: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(pid)) {
      newSelected.delete(pid);
    } else {
      newSelected.add(pid);
    }
    setSelected(newSelected);
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading participants...</div>;
  }

  return (
    <div className="flex h-full w-full gap-6">
      {/* Main Table Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${activeParticipant ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search participants..."
                className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Add Participant
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selected.size === participants.length && participants.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-4">Participant</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {participants.map((p) => (
                <tr 
                  key={p.id} 
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${activeParticipant?.id === p.id ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}`}
                  onClick={() => setActiveParticipant(p)}
                >
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'User')}&background=random`} alt={p.name || 'User'} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</div>
                        <div className="text-xs text-zinc-500">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {format(p.registrationDate, 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.paymentStatus === 'PAID' || p.paymentStatus === 'FREE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      p.paymentStatus === 'PENDING' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      p.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      p.paymentStatus === 'REFUNDED' ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400' :
                      p.paymentStatus === 'PARTIAL_REFUND' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setActionMenuId(actionMenuId === p.id ? null : p.id)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {actionMenuId === p.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActionMenuId(null)}
                        />
                        <div className="absolute right-8 top-10 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 flex flex-col items-start overflow-hidden">
                          <button 
                            onClick={async () => {
                              setActionMenuId(null);
                              if (confirm('Are you sure you want to remove this participant?')) {
                                try {
                                  await api.delete(`/api/v1/workshops/${id}/participants/${p.id}`);
                                  setParticipants(prev => prev.filter(participant => participant.id !== p.id));
                                  if (activeParticipant?.id === p.id) setActiveParticipant(null);
                                  import('sonner').then(({ toast }) => toast.success('Participant removed'));
                                } catch (err) {
                                  import('sonner').then(({ toast }) => toast.error('Failed to remove participant'));
                                }
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove Participant
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      {activeParticipant && (
        <div className="w-1/3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Participant Details</h2>
            <button onClick={() => setActiveParticipant(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col items-center text-center mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <img src={activeParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeParticipant.name || 'User')}&background=random`} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-zinc-50 dark:border-zinc-800 mb-4" />
            <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">{activeParticipant.name}</h3>
            <p className="text-sm text-zinc-500 mb-4">{activeParticipant.email}</p>
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                <Mail className="w-4 h-4 mr-2" /> Message
              </button>
              <button className="flex items-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                <Download className="w-4 h-4 mr-2" /> Export
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Registration Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1">Status</div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{activeParticipant.status}</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1">Attendance</div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{activeParticipant.attendance}%</div>
                </div>
              </div>
            </div>
            
            {/* Payment Details Section */}
            <div>
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Payment Details</h4>
              <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {activeParticipant.paymentStatus === 'FREE' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Amount Paid:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Payment Method:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">Not Required</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Status:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Transaction ID:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">N/A</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Amount:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">Amount & Currency</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Status:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{activeParticipant.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Transaction ID:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">TXN-XXXXXX</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Payment Method:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">Credit Card / Gateway</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Payment Date:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {activeParticipant.registrationDate ? format(activeParticipant.registrationDate, 'MMM d, yyyy') : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end space-x-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        View Invoice
                      </button>
                      {(activeParticipant.paymentStatus === 'PAID' || activeParticipant.paymentStatus === 'PARTIAL_REFUND') && (
                        <button className="px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                          Refund
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Instructor Notes</h4>
              <textarea 
                className="w-full h-24 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-zinc-900 dark:text-zinc-100"
                placeholder="Add notes about this participant..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button 
                onClick={async () => {
                  if (confirm('Are you sure you want to remove this participant?')) {
                    try {
                      await api.delete(`/api/v1/workshops/${id}/participants/${activeParticipant.id}`);
                      setParticipants(prev => prev.filter(p => p.id !== activeParticipant.id));
                      setActiveParticipant(null);
                      import('sonner').then(({ toast }) => toast.success('Participant removed'));
                    } catch (err) {
                      import('sonner').then(({ toast }) => toast.error('Failed to remove participant'));
                    }
                  }
                }}
                className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors">
                Remove
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
