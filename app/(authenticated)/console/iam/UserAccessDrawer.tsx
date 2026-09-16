'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserService, roleService, type Role } from '@/domains/identity';
import { User, useAuthStore } from '@/infrastructure/auth/auth.store';
import { AccessPoliciesPanel, AssignPolicyDialog, ConfirmDialog } from '@/domains/iam';
import { AuditService, type RoleAssignmentAuditLog } from '@/infrastructure/monitoring/audit.service';
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

const PLATFORM_OWNER = 'PLATFORM_OWNER';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function UserAccessDrawer({
  user: initialUser,
  open,
  onOpenChange,
  canManageAdminRole,
  onChanged,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManageAdminRole: boolean;
  onChanged?: () => void;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [allPolicies, setAllPolicies] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [activity, setActivity] = useState<RoleAssignmentAuditLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUser(initialUser);
  }, [open, initialUser]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    roleService
      .getAllRoles()
      .then((roles) => {
        if (!cancelled) setAllPolicies(roles);
      })
      .catch(() => toast.error('Failed to load policy catalog'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !user?.id) return;
    let cancelled = false;
    setActivityLoading(true);
    AuditService.getRoleAssignmentAuditLogs(user.id, 0, 10)
      .then((page) => {
        if (!cancelled) setActivity(page.content);
      })
      .catch(() => {
        // Non-fatal: the drawer works without activity history (e.g. caller lacks
        // platform.audit.view — the section below simply renders nothing).
      })
      .finally(() => !cancelled && setActivityLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, user?.id]);

  const assignedIds = useMemo(() => new Set((user?.platformRoles ?? []).map((r) => r.id)), [user]);
  const assignedPolicies = useMemo(
    () => allPolicies.filter((p) => assignedIds.has(p.id)),
    [allPolicies, assignedIds]
  );
  const availablePolicies = useMemo(
    () => allPolicies.filter((p) => !assignedIds.has(p.id)),
    [allPolicies, assignedIds]
  );

  const runMutation = async (fn: () => Promise<User>, successMessage: string) => {
    setBusy(true);
    try {
      const updated = await fn();
      setUser(updated);
      // Managing your OWN access (e.g. an owner testing a policy on their own account) must take
      // effect immediately, not just after the next token refresh/relogin — the backend
      // re-evaluates permissions live on every request, but the frontend's nav/page gating reads
      // the global auth store's cached `user.permissions`, which otherwise only updates when the
      // access token naturally refreshes.
      if (updated.id === useAuthStore.getState().user?.id) {
        useAuthStore.getState().updateUser(updated);
      }
      toast.success(successMessage);
      onChanged?.();
    } catch (error: unknown) {
      const message = error instanceof ApiError || error instanceof Error ? error.message : undefined;
      toast.error(message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const [pendingOwnerAssign, setPendingOwnerAssign] = useState<string | null>(null);

  const handleAssignPolicy = async (policyId: string) => {
    if (!user) return;
    const policy = allPolicies.find((p) => p.id === policyId);
    if (policy?.code === PLATFORM_OWNER) {
      // Granting Platform Owner is unrestricted access to everything — confirm explicitly
      // rather than folding it into the same one-click flow as every other policy.
      setPendingOwnerAssign(policyId);
      setAssignOpen(false);
      return;
    }
    await runMutation(async () => {
      const nextIds = [...(user.platformRoles ?? []).map((r) => r.id), policyId];
      return UserService.assignRolesToUser(user.id, nextIds);
    }, `${policy?.displayName ?? 'Policy'} assigned`);
    setAssignOpen(false);
  };

  const confirmOwnerAssign = async () => {
    if (!user || !pendingOwnerAssign) return;
    const policy = allPolicies.find((p) => p.id === pendingOwnerAssign);
    await runMutation(async () => {
      const nextIds = [...(user.platformRoles ?? []).map((r) => r.id), pendingOwnerAssign];
      return UserService.assignRolesToUser(user.id, nextIds);
    }, `${policy?.displayName ?? 'Platform Owner'} assigned`);
    setPendingOwnerAssign(null);
  };

  const handleRemovePolicy = async (policyId: string) => {
    if (!user) return;
    const policy = allPolicies.find((p) => p.id === policyId);
    await runMutation(
      () => UserService.revokeRoleFromUser(user.id, policyId),
      `${policy?.displayName ?? 'Policy'} removed`
    );
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!max-w-xl w-full sm:!max-w-xl">
        <SheetHeader>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-slate-200">
                <AvatarImage
                  src={getAvatarUrl(user.avatarUrl)}
                  alt="Avatar"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-slate-100 text-[#14142b] font-semibold text-sm">
                  {user.firstName?.charAt(0) ?? 'U'}
                  {user.lastName?.charAt(0) ?? ''}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="truncate">
                  {user.firstName} {user.lastName}
                </SheetTitle>
                <SheetDescription className="truncate">{user.email}</SheetDescription>
              </div>
            </div>
          ) : (
            <SheetTitle>Manage Access</SheetTitle>
          )}
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 space-y-6">
          {loading || !user ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : (
            <>
              <AccessPoliciesPanel
                userName={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email}
                assignedPolicies={assignedPolicies}
                busy={busy}
                canManage={canManageAdminRole}
                onRemovePolicy={handleRemovePolicy}
                onOpenAssign={() => setAssignOpen(true)}
              />

              {(activityLoading || activity.length > 0) && (
                <section className="space-y-2 pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
                  {activityLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {activity.map((entry) => (
                        <li key={entry.id} className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">{entry.actorName ?? 'System'}</span>{' '}
                          {(entry.action ?? 'PLATFORM_ROLES_REPLACED').toLowerCase().replace(/_/g, ' ')}
                          {entry.addedRoles && <span className="text-emerald-600"> +{entry.addedRoles}</span>}
                          {entry.removedRoles && <span className="text-rose-600"> -{entry.removedRoles}</span>}
                          <span className="text-gray-400"> · {timeAgo(entry.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {/* Deliberately rendered OUTSIDE <Sheet>: Base UI's Dialog.Root applies inert/dimming to
        its own subtree while open, which made a nested dialog rendered as a Sheet child look
        washed out (the whole modal, not just its backdrop). As independent siblings, these two
        overlays get their own unaffected stacking context. */}
    {assignOpen && user && (
      <AssignPolicyDialog
        userName={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email}
        availablePolicies={availablePolicies}
        busy={busy}
        onAssign={handleAssignPolicy}
        onClose={() => setAssignOpen(false)}
      />
    )}

    <ConfirmDialog
      open={pendingOwnerAssign !== null}
      title={`Grant Platform Owner to ${user?.firstName ?? 'this user'}?`}
      description={<p>This grants unrestricted access to every permission on the platform. Grant with care.</p>}
      danger
      busy={busy}
      confirmLabel="Grant Platform Owner"
      onConfirm={confirmOwnerAssign}
      onCancel={() => setPendingOwnerAssign(null)}
    />
    </>
  );
}
