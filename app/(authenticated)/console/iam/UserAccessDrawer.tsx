'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { pipelineService, type IamPipelineStatus } from '@/domains/identity';
import { UserPipelinePanel } from '@/domains/iam';
import { ApiError } from '@/infrastructure/http/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { getAvatarUrl } from '@/shared/utils/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/design-system/ui/sheet';

export function UserAccessDrawer({
  userId,
  open,
  onOpenChange,
  canManageAdminRole,
  onChanged,
}: {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManageAdminRole: boolean;
  onChanged?: () => void;
}) {
  const [status, setStatus] = useState<IamPipelineStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await pipelineService.getPipelineStatus(userId);
        if (!cancelled) setStatus(res);
      } catch {
        if (!cancelled) toast.error('Failed to load user access');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const runMutation = async (fn: () => Promise<IamPipelineStatus>, successMessage: string) => {
    if (!userId) return;
    setBusy(true);
    try {
      const res = await fn();
      setStatus(res);
      toast.success(successMessage);
      onChanged?.();
    } catch (error: unknown) {
      const message = error instanceof ApiError || error instanceof Error ? error.message : undefined;
      toast.error(message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!max-w-xl w-full sm:!max-w-xl">
        <SheetHeader>
          {status ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-slate-200">
                <AvatarImage
                  src={getAvatarUrl(status.user.avatarUrl)}
                  alt="Avatar"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-slate-100 text-[#14142b] font-semibold text-sm">
                  {status.user.firstName?.charAt(0) ?? 'U'}
                  {status.user.lastName?.charAt(0) ?? ''}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="truncate">{status.user.fullName}</SheetTitle>
                <SheetDescription className="truncate">{status.user.email}</SheetDescription>
              </div>
            </div>
          ) : (
            <SheetTitle>Manage Access</SheetTitle>
          )}
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
          {loading || !status ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : (
            <UserPipelinePanel
              status={status}
              busy={busy}
              canManageAdminRole={canManageAdminRole}
              onAssignPolicy={(policyId) => {
                const nextIds = [...status.assignedPolicies.map((p) => p.id), policyId];
                runMutation(
                  () => pipelineService.assignPolicies(userId!, nextIds),
                  'Policy assigned'
                );
              }}
              onRevokePolicy={(policyId) => {
                runMutation(
                  () => pipelineService.revokePolicy(userId!, policyId),
                  'Policy revoked'
                );
              }}
              onSavePermissions={(permissionIds) =>
                runMutation(
                  () => pipelineService.assignPermissions(userId!, permissionIds),
                  'Permissions updated'
                )
              }
              onAssignTask={(taskCode) =>
                runMutation(
                  () => pipelineService.assignTasks(userId!, [
                    ...status.assignedTasks.map((t) => t.code),
                    taskCode,
                  ]),
                  'Task assigned'
                )
              }
              onRevokeTask={(taskCode) =>
                runMutation(() => pipelineService.revokeTask(userId!, taskCode), 'Task revoked')
              }
              onSetAdminRole={(roleCode, enable) => {
                if (
                  !window.confirm(
                    enable
                      ? `Grant ${roleCode.replace('_', ' ')} to ${status.user.fullName}?`
                      : `Revoke ${roleCode.replace('_', ' ')} from ${status.user.fullName}?`
                  )
                ) {
                  return;
                }
                runMutation(
                  () => pipelineService.setArcadeAdminRole(userId!, enable, roleCode),
                  enable ? 'Admin role granted' : 'Admin role revoked'
                );
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
