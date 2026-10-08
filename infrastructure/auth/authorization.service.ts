import { User } from '@/infrastructure/auth/auth.store';

export const AuthorizationService = {
  hasPermission: (user: User | null | undefined, permission: string) => {
    if (!user) return false;
    return user.permissions?.includes('ALL') || user.permissions?.includes(permission) || false;
  },

  /**
   * Whether the "Console" entry point (navbar link, dock icon, /console landing redirect)
   * should be shown at all — true if the user has real access to ANY Console surface. Composed
   * from the same per-surface checks that gate each surface's own nav item/page (see
   * console/layout.tsx and console/page.tsx), so a new surface can never be forgotten here the
   * way platform.content.manage/platform.categories.manage briefly were.
   */
  canAccessConsole: (user: User | null | undefined) =>
    AuthorizationService.canManageChannels(user) ||
    AuthorizationService.canReviewContent(user) ||
    AuthorizationService.canManageContent(user) ||
    AuthorizationService.canManageCategories(user) ||
    AuthorizationService.canManageExams(user) ||
    AuthorizationService.canViewPayments(user) ||
    AuthorizationService.canManageInbox(user) ||
    AuthorizationService.canManageRecognition(user) ||
    AuthorizationService.canManageCredentials(user) ||
    AuthorizationService.canManageHandles(user) ||
    AuthorizationService.canManageAppearance(user) ||
    AuthorizationService.canOpenBugConsole(user) ||
    AuthorizationService.canAccessIamConsole(user),

  canManageChannels: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.channels.manage'),

  /**
   * Console -> Recognition: defining badges and granting or revoking them.
   *
   * Deliberately NOT implied by user management. Changing what an account may DO and changing
   * what the platform publicly ASSERTS about it are different powers — an organization may well
   * want a trust-and-safety reviewer who can verify accounts without also handing out
   * permissions. Mirrors the backend's platform.recognition.manage, which is the real gate.
   */
  canManageRecognition: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.recognition.manage'),

  /**
   * Console -> Honours: conferring Distinguished honours (Level 5) and
   * revoking issued credentials. Mirrors the backend's platform.credentials.manage.
   */
  canManageCredentials: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.credentials.manage'),

  /**
   * Console -> Handles: deciding appeals and reassigning a handle from one holder to another.
   *
   * There is no channel-level equivalent: a channel admin may rename their own channel, but
   * nobody below the platform may rename somebody else's.
   */
  canManageHandles: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.handles.manage'),

  /**
   * Console -> Appearance: curating the wallpaper gallery glass mode draws from. Choosing your own
   * theme needs no permission. Mirrors the backend's platform.appearance.manage, the real gate.
   */
  canManageAppearance: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.appearance.manage'),

  /** Accepts platform.content.review, legacy platform.courses.review, or channel.content.review. */
  canReviewContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.content.review') ||
    AuthorizationService.hasPermission(user, 'platform.courses.review') ||
    AuthorizationService.hasPermission(user, 'channel.content.review'),

  /**
   * Console -> Reviews: the platform-stage queue. Platform reviewers act on it; platform
   * administrators (governance) see it read-only. Organization-stage reviews are not here — they
   * live on each channel's dashboard. Mirrors the backend's ReviewerScope.seesPlatformQueue.
   */
  canAccessPlatformReviews: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.content.review') ||
    AuthorizationService.hasPermission(user, 'platform.courses.review') ||
    AuthorizationService.hasPermission(user, 'platform.content.governance'),

  /** Checks if the user is a platform/global reviewer */
  canReviewPlatformContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.content.review') ||
    AuthorizationService.hasPermission(user, 'platform.courses.review'),

  /** Checks if the user is a channel reviewer */
  canReviewChannelContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'channel.content.review'),

  /**
   * Console -> Reviews -> Governance: deciding whether a channel's content must be reviewed at all.
   *
   * Deliberately NOT implied by canReviewPlatformContent. A reviewer decides submissions; a
   * governor decides whether submissions must be reviewed. Bundling them would mean every reviewer
   * could exempt a channel from their own oversight.
   */
  canGovernPlatformContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.content.governance'),

  /**
   * A channel administrator's authority over their OWN channel's review policy and author
   * exemptions. Scoped to the org-review stage only - it can never waive platform review, which is
   * enforced on the backend by the absence of any code path from this permission to a
   * platform-governed column.
   *
   * Presentation hint only: the backend re-resolves per-channel authority on every call, because a
   * permission code alone does not say WHICH channel.
   */
  canGovernChannelContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'channel.content.governance'),

  /** @deprecated Use canReviewContent */
  canReviewCourses: (user: User | null | undefined) => AuthorizationService.canReviewContent(user),

  /**
   * Console → Exam standards: setting the platform's per-type exam standards (locked settings,
   * defaults, limits, certification fee) is its own capability, gated on platform.exams.manage
   * alone. Deliberately does NOT fall back to content-review authority — holding "Reviewer" must
   * never implicitly unlock it (ExamStandardsController enforces the same rule).
   */
  canManageExams: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.exams.manage'),

  /**
   * Console → Content Manage: suspending/unsuspending published courses and viewing their
   * analysis is its own capability (platform.content.manage), distinct from platform.content.review
   * (the publish/reject decision) — see ConsoleContentController. Managing categories also lives
   * on this surface, with its own permission (canManageCategories below).
   */
  canManageContent: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.content.manage'),

  /** Console → Inbox: contact-us submissions and content/lesson reports. */
  canManageInbox: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.inbox.manage'),

  /**
   * Console → Bugs: working the test-release bug tracker. Presentation hint only — every tracker
   * endpoint re-checks platform.bugs.manage. Who may FILE a report is not decided here at all: the
   * bug button asks the backend (/api/v1/bug-reports/intake).
   */
  canManageBugs: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.bugs.manage'),
  /** Console → Bugs → Settings: intake mode, release label, categories (platform.bugs.configure). */
  canConfigureBugs: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.bugs.configure'),
  canOpenBugConsole: (user: User | null | undefined) =>
    AuthorizationService.canManageBugs(user) || AuthorizationService.canConfigureBugs(user),

  canManageUsers: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.users.manage'),
  canManageRoles: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.roles.manage'),

  /** Console → IAM: managing who holds a policy, or managing policies themselves. */
  canAccessIamConsole: (user: User | null | undefined) =>
    AuthorizationService.canManageUsers(user) || AuthorizationService.canManageRoles(user),

  canManageCategories: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.categories.manage'),

  canViewAuditLogs: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.audit.view'),

  canViewPayments: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.payments.view'),
  /** Presentation hint only — the refund endpoint re-checks platform.payments.refund. */
  canRefundPayments: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.payments.refund'),
  /** Presentation hint only — the commission endpoints re-check platform.payments.commission. */
  canManageCommission: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.payments.commission'),
};
