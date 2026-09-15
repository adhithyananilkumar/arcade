'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { UserService } from '@/domains/identity';
import { User } from '@/infrastructure/auth/auth.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { getAvatarUrl } from '@/shared/utils/avatar';

/**
 * Finds a user with no platform access yet and hands their id back to the caller, which opens
 * the access drawer for them. Deliberately never lists every user in the system — it only
 * searches once the admin has typed at least 2 characters, against the eligible-admins pool
 * (everyone who does NOT already hold platform access), so an existing admin can never be
 * "granted" a second time from here.
 *
 * The caller mounts this only while `open` is true (see UsersList) — that gives every field a
 * fresh initial state for free on each open, instead of an effect resetting state on close.
 */
export function GrantAccessDialog({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (user: User) => void;
}) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) return;
    let cancelled = false;
    setLoading(true);
    UserService.searchGrantCandidates(debounced, 0, 10)
      .then((page) => {
        if (!cancelled) setResults(page.content);
      })
      .catch(() => {
        if (!cancelled) toast.error('Search failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // Derived, not stored: results from a stale (now too-short) query are simply not shown rather
  // than cleared via a separate setState — the query itself already dictates what's displayed.
  const tooShort = debounced.length < 2;
  const showEmpty = !tooShort && !loading && results.length === 0;
  const showResults = !tooShort && !loading && results.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-[#14142b]" />
            <h2 className="text-sm font-bold text-gray-900">Grant Platform Access</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username, or email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-sm font-medium focus:border-[#14142b]/30 focus:bg-white focus:ring-1 focus:ring-slate-300 outline-none"
            />
          </div>

          <div className="min-h-[120px] max-h-[320px] overflow-y-auto">
            {tooShort ? (
              <p className="text-xs text-gray-400 text-center py-8">
                {query.length === 0 ? 'Start typing to search…' : 'Keep typing to search…'}
              </p>
            ) : loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : showEmpty ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No matching user without existing access found.
              </p>
            ) : showResults ? (
              <div className="space-y-1">
                {results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onSelect(user)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <Avatar className="h-9 w-9 border border-slate-200">
                      <AvatarImage
                        src={getAvatarUrl(user.avatarUrl)}
                        alt="Avatar"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="bg-slate-100 text-[#14142b] font-semibold text-xs">
                        {user.firstName ? user.firstName.charAt(0) : 'U'}
                        {user.lastName ? user.lastName.charAt(0) : ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
