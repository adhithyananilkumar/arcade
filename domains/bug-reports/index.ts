/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Bug reports
 *
 * Purpose:
 * Test-release bug reporting: the reporter's form and thread, and the platform tracker's
 * vocabulary. Who may report, which transitions are allowed and what each viewer may see are
 * decided by the backend (platform/bugreport) — this domain renders what it is given.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { BugReportService } from './api/bug-report.service';
export { BugTriageService } from './api/bug-triage.service';
export { BugReportComposer, MAX_SCREENSHOTS } from './components/BugReportComposer';
export type { BugDraft } from './components/BugReportComposer';
export { BugReportThread } from './components/BugReportThread';
export { MyBugReportsList } from './components/MyBugReportsList';
export { BugTimeline, BugAttachmentGallery } from './components/BugTimeline';
export type { BugTimelineFilter } from './components/BugTimeline';
export { BugChatComposer } from './components/BugChatComposer';
export { buildBugReportExport, downloadJson, BUG_EXPORT_VERSION } from './utils/export';
export { ScreenshotAnnotator } from './components/ScreenshotAnnotator';
export {
  BugStatusBadge,
  BugImpactBadge,
  BugPriorityBadge,
  CategoryIcon,
  CATEGORY_ICONS,
  PersonAvatar,
  MessageTicks,
} from './components/BugBadges';
export {
  STATUS_LABEL,
  REPORTER_STATUS_LABEL,
  STATUS_ORDER,
  RESOLUTION_LABEL,
  IMPACT_LABEL,
  IMPACT_SHORT,
  SEVERITY_LABEL,
  PRIORITY_LABEL,
  INTAKE_MODE_LABEL,
  INTAKE_MODE_HINT,
  relativeTime,
  absoluteTime,
  listTime,
  receiptState,
} from './utils/labels';
export type { ReceiptState } from './utils/labels';
export type {
  BugStatus,
  BugResolution,
  BugImpact,
  BugSeverity,
  BugPriority,
  BugIntakeMode,
  BugAction,
  BugActivity,
  BugAttachment,
  BugCategory,
  BugCategoryBody,
  BugIntake,
  BugIntakeSettings,
  BugPage,
  BugPerson,
  BugReportDetail,
  BugReportSummary,
  BugLastMessage,
  BugReceipts,
  BugTrackerFilters,
  BugTrackerStats,
  BugCountRow,
  CreateBugReportBody,
  TransitionBody,
  TriageField,
  TriageUpdateBody,
} from './types/bug-report.types';
