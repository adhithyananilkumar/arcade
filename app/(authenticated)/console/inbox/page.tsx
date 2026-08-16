'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import {
  Inbox,
  Mail,
  Search,
  CheckCircle2,
  Archive,
  Trash2,
  RefreshCw,
  MailOpen,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { api } from '@/infrastructure/http/api';
import { toast } from 'sonner';

export interface ContactMessage {
  id: string;
  type: 'CONTACT' | 'COURSE_REPORT' | 'LESSON_REPORT';
  name: string;
  email: string;
  subject: string;
  message: string;
  contentId?: string | null;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

function ConsoleInboxContent() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canManageSettings(user)) {
    notFound();
  }

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const idParam =
    searchParams.get('messageId') ||
    searchParams.get('reportId') ||
    searchParams.get('id') ||
    searchParams.get('contactMessageId');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'ARCHIVED'>('ALL');
  const [primaryTab, setPrimaryTab] = useState<'REACH_US' | 'REPORTS'>('REACH_US');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ContactMessage[]>('/api/v1/console/messages');
      setMessages(data || []);
      if (selectedMessage) {
        const updatedSelected = (data || []).find((m) => m.id === selectedMessage.id);
        if (updatedSelected) {
          setSelectedMessage(updatedSelected);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (tabParam) {
      const normalized = tabParam.toUpperCase().replace('-', '_');
      if (normalized === 'REACH_US' || normalized === 'REACHUS' || normalized === 'CONTACT') {
        setPrimaryTab('REACH_US');
      } else if (
        normalized === 'REPORTS' ||
        normalized === 'REPORT' ||
        normalized === 'COURSE_REPORT' ||
        normalized === 'LESSON_REPORT'
      ) {
        setPrimaryTab('REPORTS');
      }
    }
  }, [tabParam]);

  useEffect(() => {
    if (idParam && messages.length > 0) {
      const target = messages.find((m) => m.id === idParam);
      if (target) {
        if (target.type === 'CONTACT') {
          setPrimaryTab('REACH_US');
        } else if (target.type === 'COURSE_REPORT' || target.type === 'LESSON_REPORT') {
          setPrimaryTab('REPORTS');
        }
        handleSelectMessage(target);
      }
    }
  }, [messages, idParam]);

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'UNREAD') {
      const optimisticMsg: ContactMessage = { ...msg, status: 'READ' };
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? optimisticMsg : m)));
      setSelectedMessage(optimisticMsg);
      try {
        const updated = await api.patch<ContactMessage>(`/api/v1/console/messages/${msg.id}/status`, {
          status: 'READ',
        });
        if (updated && updated.status) {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
          setSelectedMessage(updated);
        }
        window.dispatchEvent(new Event('inbox-updated'));
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'UNREAD' | 'READ' | 'ARCHIVED') => {
    try {
      const updated = await api.patch<ContactMessage>(`/api/v1/console/messages/${id}/status`, {
        status: newStatus,
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (selectedMessage?.id === id) {
        setSelectedMessage(updated);
      }
      window.dispatchEvent(new Event('inbox-updated'));
      toast.success(`Message marked as ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update message status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/api/v1/console/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      window.dispatchEvent(new Event('inbox-updated'));
      toast.success('Message deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete message');
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // 1. Primary Source Tab filter
      if (primaryTab === 'REACH_US') {
        if (msg.type !== 'CONTACT') return false;
      } else if (primaryTab === 'REPORTS') {
        if (msg.type !== 'COURSE_REPORT' && msg.type !== 'LESSON_REPORT') return false;
      }

      // 2. Status filter within the selected section
      if (statusFilter === 'UNREAD' && msg.status !== 'UNREAD') return false;
      if (statusFilter === 'READ' && msg.status !== 'READ') return false;
      if (statusFilter === 'ARCHIVED' && msg.status !== 'ARCHIVED') return false;

      // 3. Search term filter
      const matchesSearch =
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [messages, primaryTab, statusFilter, searchTerm]);

  const counts = useMemo(() => {
    const reachUsItems = messages.filter((m) => m.type === 'CONTACT');
    const reportItems = messages.filter((m) => m.type === 'COURSE_REPORT' || m.type === 'LESSON_REPORT');

    const activeSectionItems = primaryTab === 'REACH_US' ? reachUsItems : reportItems;
    const activeUnreadCount = activeSectionItems.filter((m) => m.status === 'UNREAD').length;

    return {
      reachUsUnread: reachUsItems.filter((m) => m.status === 'UNREAD').length,
      reportsUnread: reportItems.filter((m) => m.status === 'UNREAD').length,
      activeUnreadCount,
    };
  }, [messages, primaryTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14142b] sm:text-3xl">
            Console Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View reach-us contact submissions and user course/lesson reports.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={isLoading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 sm:self-auto transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Primary Source Tabs & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Primary Source Tabs: Reach Us | Reports */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            <button
              onClick={() => setPrimaryTab('REACH_US')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                primaryTab === 'REACH_US'
                  ? 'bg-white text-[#14142b] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare size={14} />
              Reach Us
              {counts.reachUsUnread > 0 && (
                <span className="rounded-full bg-blue-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                  {counts.reachUsUnread}
                </span>
              )}
            </button>

            <button
              onClick={() => setPrimaryTab('REPORTS')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                primaryTab === 'REPORTS'
                  ? 'bg-white text-[#14142b] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle size={14} className="text-amber-500" />
              Reports
              {counts.reportsUnread > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                  {counts.reportsUnread}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inbox..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: Secondary Status Filter */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/70 p-1 w-fit backdrop-blur-md">
          {(['ALL', 'UNREAD', 'READ', 'ARCHIVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === tab
                  ? 'bg-[#14142b] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              {tab === 'UNREAD' && counts.activeUnreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] text-white font-extrabold">
                  {counts.activeUnreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area: List + Detail */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Messages List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-2.5">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw size={20} className="animate-spin text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Loading inbox...</span>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
              <Inbox size={32} className="mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No messages found</p>
              <p className="text-xs text-slate-400">Submissions and reports will appear here.</p>
            </div>
          ) : (
            <div className="max-h-[620px] overflow-y-auto space-y-2 pr-1">
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = msg.status === 'UNREAD';
                const isReport = msg.type === 'COURSE_REPORT' || msg.type === 'LESSON_REPORT';

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`group relative cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : isUnread
                        ? isReport
                          ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                          : 'border-blue-200 bg-blue-50/20 hover:border-blue-300'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Header Row: Sender & Timestamp */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold text-xs text-[#14142b] truncate max-w-[180px]">
                        {msg.name}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Source / Type Label */}
                    <div className="mb-2 flex items-center gap-1.5">
                      {msg.type === 'LESSON_REPORT' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-100/80 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 border border-purple-200">
                          <BookOpen size={10} />
                          LESSON REPORT
                        </span>
                      ) : msg.type === 'COURSE_REPORT' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                          <AlertTriangle size={10} />
                          COURSE REPORT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-100/80 px-2 py-0.5 text-[10px] font-extrabold text-sky-800 border border-sky-200">
                          <MessageSquare size={10} />
                          REACH US
                        </span>
                      )}
                    </div>

                    {/* Subject / Lesson Details */}
                    <div className="text-xs text-slate-800 truncate mb-1">
                      {msg.subject.includes('\n') ? (
                        <div>
                          <div className="font-bold text-slate-900">{msg.subject.split('\n')[0]}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{msg.subject.split('\n')[1]}</div>
                        </div>
                      ) : (
                        <div className="font-semibold text-slate-800">{msg.subject}</div>
                      )}
                    </div>

                    {/* Snippet */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>

                    {/* Footer Row: Email & Status */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {msg.email}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          msg.status === 'UNREAD'
                            ? 'bg-blue-100 text-blue-700'
                            : msg.status === 'READ'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Message Detail View (7 cols on lg) */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
              {/* Top Meta Bar */}
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedMessage.type === 'LESSON_REPORT' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2.5 py-1 text-[11px] font-extrabold text-purple-800 border border-purple-300">
                        <BookOpen size={12} />
                        LESSON REPORT
                      </span>
                    ) : selectedMessage.type === 'COURSE_REPORT' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-800 border border-amber-300">
                        <AlertTriangle size={12} />
                        COURSE REPORT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2.5 py-1 text-[11px] font-extrabold text-sky-800 border border-sky-300">
                        <MessageSquare size={12} />
                        REACH US
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        selectedMessage.status === 'UNREAD'
                          ? 'bg-blue-100 text-blue-700'
                          : selectedMessage.status === 'READ'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {selectedMessage.status}
                    </span>
                  </div>

                  {selectedMessage.type === 'LESSON_REPORT' || selectedMessage.type === 'COURSE_REPORT' ? (
                    <div className="space-y-1.5">
                      {selectedMessage.subject.includes('\n') ? (
                        <div>
                          <div className="text-base font-bold text-[#14142b]">
                            {selectedMessage.subject.split('\n')[0]}
                          </div>
                          <div className="text-xs font-semibold text-slate-500">
                            {selectedMessage.subject.split('\n')[1]}
                          </div>
                        </div>
                      ) : (
                        <div className="text-base font-bold text-[#14142b]">
                          {selectedMessage.subject}
                        </div>
                      )}

                      {selectedMessage.contentId && (() => {
                        const isLessonReport = selectedMessage.type === 'LESSON_REPORT' || selectedMessage.subject.includes(' · ');
                        const lessonIdMatch = selectedMessage.message?.match(/Lesson ID:\s*([a-f0-9-]{36})/i);
                        const targetLessonId = lessonIdMatch ? lessonIdMatch[1] : null;

                        if (isLessonReport) {
                          const lessonHref = targetLessonId
                            ? `/learn/${selectedMessage.contentId}/learn?lesson=${targetLessonId}`
                            : `/learn/${selectedMessage.contentId}/learn`;

                          return (
                            <div>
                              <Link
                                href={lessonHref}
                                className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                              >
                                <span>View Lesson</span>
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                          );
                        }

                        return (
                          <div>
                            <Link
                              href={`/courses/${selectedMessage.contentId}`}
                              className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                            >
                              <span>View Course Page</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        );
                      })()}

                      <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                        <span className="font-semibold text-slate-700">Reported by:</span>
                        <span>{selectedMessage.name}</span>
                        <span className="text-slate-300">•</span>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-0.5"
                        >
                          {selectedMessage.email}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-[#14142b]">{selectedMessage.subject}</h2>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{selectedMessage.name}</span>
                        <span className="text-slate-300">•</span>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-0.5"
                        >
                          {selectedMessage.email}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-400 shrink-0 sm:text-right">
                  <div className="font-medium text-slate-600">Submitted:</div>
                  {new Date(selectedMessage.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedMessage.type === 'COURSE_REPORT' ? 'Report Message / Reason:' : 'Message:'}
                </div>
                <div className="min-h-[160px] text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    <Mail size={14} />
                    Reply via Email
                  </a>

                  {selectedMessage.status === 'READ' && (
                    <button
                      onClick={() => handleStatusChange(selectedMessage.id, 'UNREAD')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MailOpen size={14} />
                      Mark Unread
                    </button>
                  )}

                  {selectedMessage.status !== 'ARCHIVED' ? (
                    <button
                      onClick={() => handleStatusChange(selectedMessage.id, 'ARCHIVED')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Archive size={14} />
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(selectedMessage.id, 'READ')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <CheckCircle2 size={14} />
                      Unarchive
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
              <Mail size={36} className="mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No item selected</p>
              <p className="text-xs text-slate-400">Select an item from the list to view its details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConsoleInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-xs font-semibold text-slate-500">
          Loading inbox...
        </div>
      }
    >
      <ConsoleInboxContent />
    </Suspense>
  );
}
