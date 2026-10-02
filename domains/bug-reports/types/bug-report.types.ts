/** Mirrors com.arcade.backend.platform.bugreport.dto.BugReportDtos. */

export type BugStatus = "NEW" | "TRIAGED" | "IN_PROGRESS" | "NEEDS_INFO" | "RESOLVED" | "CLOSED";
export type BugResolution = "FIXED" | "DUPLICATE" | "WONT_FIX" | "CANNOT_REPRODUCE" | "NOT_A_BUG";
export type BugImpact = "BLOCKER" | "MAJOR" | "MINOR";
export type BugSeverity = "S1" | "S2" | "S3" | "S4";
export type BugPriority = "P0" | "P1" | "P2" | "P3";
export type BugIntakeMode = "OFF" | "TESTERS" | "EVERYONE";
export type BugActivityVisibility = "PUBLIC" | "INTERNAL";
export type BugActivityKind =
  | "CREATED"
  | "COMMENT"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "SEVERITY_CHANGED"
  | "PRIORITY_CHANGED"
  | "CATEGORY_CHANGED"
  | "ATTACHMENT_ADDED"
  | "REOPENED"
  | "CONFIRMED_FIXED";

/** What the viewer may do next on a report. Decided by the backend. */
export type BugAction = "COMMENT" | "NOTE" | "ATTACH" | "VERDICT" | "EDIT_TRIAGE";

export interface BugCategory {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  active: boolean;
}

export interface BugIntake {
  enabled: boolean;
  mode: BugIntakeMode;
  releaseLabel: string | null;
  intakeMessage: string | null;
  categories: BugCategory[];
  canTriage: boolean;
}

export interface BugPerson {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface BugAttachment {
  id: string;
  /** Short-lived signed link; refetch the report for a fresh one. */
  url: string;
  fileName: string | null;
  contentType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface BugActivity {
  id: string;
  kind: BugActivityKind;
  visibility: BugActivityVisibility;
  actor: BugPerson | null;
  staff: boolean;
  body: string | null;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
}

export interface BugReportSummary {
  id: string;
  key: string;
  number: number;
  title: string;
  status: BugStatus;
  resolution: BugResolution | null;
  impact: BugImpact;
  severity: BugSeverity | null;
  priority: BugPriority | null;
  category: BugCategory;
  reporter: BugPerson | null;
  assignee: BugPerson | null;
  route: string | null;
  releaseLabel: string | null;
  attachmentCount: number;
  commentCount: number;
  createdAt: string;
  lastActivityAt: string;
}

export interface BugConsoleEntry {
  level?: string;
  message?: string;
  at?: string;
}

export interface BugReportDetail {
  summary: BugReportSummary;
  description: string;
  expected: string | null;
  pageUrl: string | null;
  appVersion: string | null;
  userAgent: string | null;
  environment: Record<string, unknown> | null;
  consoleLog: BugConsoleEntry[] | null;
  duplicateOfKey: string | null;
  duplicateOfId: string | null;
  resolvedAt: string | null;
  attachments: BugAttachment[];
  activity: BugActivity[];
  allowedActions: BugAction[];
  allowedTransitions: BugStatus[];
}

export interface CreateBugReportBody {
  categoryId: string;
  title?: string;
  description: string;
  expected?: string;
  impact: BugImpact;
  pageUrl?: string;
  route?: string;
  appVersion?: string;
  environment?: Record<string, unknown>;
  consoleLog?: BugConsoleEntry[];
}

export interface TransitionBody {
  status: BugStatus;
  resolution?: BugResolution;
  duplicateOfNumber?: number;
  note?: string;
  notifyReporter?: boolean;
}

export type TriageField = "severity" | "priority" | "assigneeId" | "categoryId";

export interface TriageUpdateBody {
  fields: TriageField[];
  severity?: BugSeverity | null;
  priority?: BugPriority | null;
  assigneeId?: string | null;
  categoryId?: string | null;
}

export interface BugTrackerFilters {
  status?: string[];
  categoryId?: string;
  impact?: BugImpact;
  severity?: BugSeverity;
  priority?: BugPriority;
  /** A user id, "me" or "none". */
  assignee?: string;
  reporterId?: string;
  q?: string;
  sort?: "activity" | "newest" | "oldest" | "priority" | "impact";
  page?: number;
  size?: number;
}

export interface BugPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BugCountRow {
  key: string;
  label: string;
  count: number;
}

export interface BugTrackerStats {
  open: number;
  newCount: number;
  unassignedOpen: number;
  blockersOpen: number;
  needsInfo: number;
  resolvedLast7Days: number;
  medianHoursToResolve: number | null;
  byStatus: BugCountRow[];
  openByCategory: BugCountRow[];
  openByImpact: BugCountRow[];
  openByPriority: BugCountRow[];
  topRoutes: BugCountRow[];
  last14Days: { day: string; created: number; resolved: number }[];
}

export interface BugIntakeSettings {
  mode: BugIntakeMode;
  releaseLabel: string | null;
  intakeMessage: string | null;
  updatedBy: BugPerson | null;
  updatedAt: string;
  testers: BugPerson[];
}

export interface BugCategoryBody {
  code?: string;
  label: string;
  description?: string | null;
  icon: string;
  sortOrder?: number;
  active?: boolean;
}
