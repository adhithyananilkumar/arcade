'use client';

import { useState, useEffect } from 'react';
import { ChannelAuditLogEntry, channelService } from "@/domains/channels";
import { toast } from 'sonner';
import { History } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/design-system/ui/table';
import { Badge } from '@/shared/design-system/ui/badge';
import { Skeleton } from '@/shared/design-system/ui/skeleton';

const ACTION_STYLES: Record<string, string> = {
  APPROVED: 'text-emerald-700 border-emerald-100 bg-emerald-50',
  REACTIVATED: 'text-emerald-700 border-emerald-100 bg-emerald-50',
  SUSPENDED: 'text-red-700 border-red-100 bg-red-50',
  DELETION_APPROVED: 'text-red-700 border-red-100 bg-red-50',
  DELETION_REQUESTED: 'text-orange-700 border-orange-100 bg-orange-50',
  DELETION_REJECTED: 'text-gray-700 border-gray-200 bg-gray-50',
};

const ACTION_LABELS: Record<string, string> = {
  APPROVED: 'Channel Approved',
  REACTIVATED: 'Reactivated',
  SUSPENDED: 'Suspended',
  DELETION_APPROVED: 'Deletion Approved',
  DELETION_REQUESTED: 'Deletion Requested',
  DELETION_REJECTED: 'Deletion Rejected',
};

// Lets a platform owner audit what other admins are doing to channels — every whole-channel
// moderation action (approve, suspend, reactivate, deletion-request review) is logged here.
// Channel-internal actions (staff/role changes) are deliberately NOT included — that's the
// channel's own governance, not the platform's business.
export function ChannelAuditLog() {
  const [entries, setEntries] = useState<ChannelAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    channelService
      .getAuditLog()
      .then(setEntries)
      .catch(() => toast.error('Failed to load audit log'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center flex flex-col items-center gap-2">
        <History size={24} className="text-gray-300" />
        No administrative actions recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium text-gray-900">{entry.channelName}</TableCell>
              <TableCell>
                <Badge variant="outline" className={ACTION_STYLES[entry.action] || 'text-gray-700 border-gray-200 bg-gray-50'}>
                  {ACTION_LABELS[entry.action] || entry.action}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">{entry.actorName || 'Owner (self-service)'}</TableCell>
              <TableCell className="text-gray-500 max-w-xs truncate" title={entry.details}>{entry.details || '—'}</TableCell>
              <TableCell className="text-gray-500 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
