/**
 * Team competitions (hackathons) on events. Mirrors backend `event.competition.dto`.
 * Every rule — who may join, when teams lock, what a submission still needs — is decided by the
 * backend and arrives as data (`teamsOpen`, `missingRequirements`, …); the UI only renders it.
 */

export type CompetitionPhase = 'TEAM_FORMATION' | 'SUBMISSIONS_OPEN' | 'JUDGING' | 'RESULTS';

export interface CompetitionPerson {
  userId: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  /** Only for event staff. */
  email: string | null;
}

export interface CompetitionSettings {
  eventId: string;
  /** What the organiser calls the event ("Buildathon"). */
  formatLabel: string;
  enabled: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  maxTeams: number | null;
  teamFormationDeadline: string | null;
  submissionOpensAt: string | null;
  submissionDeadline: string | null;
  judgingDeadline: string | null;
  resultsPublishedAt: string | null;
  galleryAfterResults: boolean;
  rules: string | null;
  phase: CompetitionPhase;
  teamsOpen: boolean;
  submissionsOpen: boolean;
  judgingOpen: boolean;
}

export interface CompetitionTrack { id: string; name: string; description: string | null; position: number }

export interface JudgingCriterion {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  maxScore: number;
  position: number;
}

export interface CompetitionAward {
  id: string;
  name: string;
  description: string | null;
  prize: string | null;
  trackId: string | null;
  position: number;
  teamId: string | null;
  teamName: string | null;
}

export type SubmissionFieldType = "SHORT_TEXT" | "LONG_TEXT" | "URL" | "NUMBER" | "EMAIL" | "SELECT" | "MULTI_SELECT" | "CHECKBOX" | "FILE";

/** One question on the organiser-built submission form. */
export interface SubmissionField {
  id: string;
  label: string;
  helpText: string | null;
  type: SubmissionFieldType;
  required: boolean;
  options: string[];
  /** Hidden from judges and the public gallery. */
  privateToOrganisers: boolean;
  position: number;
  /** FILE only: per-file cap in MB, how many files, allowed extensions (empty = any). */
  maxFileMb: number | null;
  maxFiles: number | null;
  allowedFormats: string[];
}

/** One uploaded file in a FILE answer. `url` is a short-lived signed link (absent while editing offline). */
export interface UploadedFile {
  key: string;
  name: string;
  size: number;
  contentType: string | null;
  url?: string | null;
}

export type SubmissionAnswer = string | number | boolean | string[] | UploadedFile[];

export interface Competition {
  settings: CompetitionSettings;
  tracks: CompetitionTrack[];
  criteria: JudgingCriterion[];
  awards: CompetitionAward[];
  fields: SubmissionField[];
}

export interface TeamMember { person: CompetitionPerson; captain: boolean; joinedAt: string }

export interface TeamCard {
  id: string;
  name: string;
  tagline: string | null;
  trackId: string | null;
  trackName: string | null;
  memberCount: number;
  maxTeamSize: number;
  lookingForMembers: boolean;
  skillsWanted: string[];
  members: CompetitionPerson[];
  requestPending: boolean;
}

export type JoinRequestKind = 'REQUEST' | 'INVITE';

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  teamName: string | null;
  kind: JoinRequestKind;
  status: string;
  message: string | null;
  person: CompetitionPerson | null;
  invitedEmail: string | null;
  invitedBy: CompetitionPerson | null;
  createdAt: string;
}

export interface CompetitionTeam {
  id: string;
  name: string;
  tagline: string | null;
  trackId: string | null;
  trackName: string | null;
  lookingForMembers: boolean;
  skillsWanted: string[];
  status: 'ACTIVE' | 'DISQUALIFIED';
  statusReason: string | null;
  captainUserId: string | null;
  joinCode: string | null;
  members: TeamMember[];
  pendingRequests: TeamJoinRequest[] | null;
  submissionStatus: 'NONE' | 'DRAFT' | 'SUBMITTED';
  createdAt: string;
}

export interface CompetitionSubmission {
  id: string;
  teamId: string;
  teamName: string | null;
  trackId: string | null;
  trackName: string | null;
  title: string;
  tagline: string | null;
  /** fieldId → answer. */
  answers: Record<string, SubmissionAnswer>;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt: string | null;
  revision: number;
  updatedAt: string;
  missingRequirements: string[];
}

export interface SubmissionEvaluation {
  id: string;
  submissionId: string;
  judge: CompetitionPerson | null;
  scores: Record<string, number>;
  totalScore: number | null;
  comment: string | null;
  feedback: string | null;
  status: 'DRAFT' | 'FINAL';
  updatedAt: string;
}

export type JudgeStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED';

export interface CompetitionJudge {
  id: string;
  /** null for an email invite to someone without an account yet. */
  person: CompetitionPerson | null;
  invitedEmail: string | null;
  status: JudgeStatus;
  trackId: string | null;
  trackName: string | null;
  assigned: number;
  finalized: number;
  invitedAt: string;
  respondedAt: string | null;
}

export interface LeaderboardEntry {
  /** 0 when the project has no final scores yet. */
  rank: number;
  submissionId: string;
  teamId: string;
  teamName: string;
  title: string;
  trackId: string | null;
  trackName: string | null;
  averageScore: number | null;
  finalEvaluations: number;
  criterionAverages: Record<string, number | null>;
  awards: string[];
}

export interface AdminSubmission {
  submission: CompetitionSubmission;
  members: CompetitionPerson[];
  finalEvaluations: number;
  draftEvaluations: number;
  judgesAssigned: number;
  averageScore: number | null;
  rank: number | null;
}

export interface AdminSubmissionDetail {
  summary: AdminSubmission;
  criteria: JudgingCriterion[];
  evaluations: SubmissionEvaluation[];
}

export interface CompetitionSummary {
  phase: CompetitionPhase;
  registeredParticipants: number;
  participantsInTeams: number;
  teams: number;
  activeTeams: number;
  draftSubmissions: number;
  submittedSubmissions: number;
  judges: number;
  finalEvaluations: number;
  expectedEvaluations: number;
  resultsPublishedAt: string | null;
}

export interface CompetitionResults {
  publishedAt: string;
  leaderboard: LeaderboardEntry[];
  awards: CompetitionAward[];
  myFeedback: string[];
  myRank: number | null;
}

/** The whole team board for the signed-in participant. */
export interface TeamBoard {
  competition: Competition;
  registered: boolean;
  judge: boolean;
  team: CompetitionTeam | null;
  invites: TeamJoinRequest[];
  myRequests: TeamJoinRequest[];
  submission: CompetitionSubmission | null;
  results: CompetitionResults | null;
}

export interface InviteResult { identifier: string; outcome: 'INVITED' | 'EMAILED' | 'SKIPPED'; detail: string | null }
export interface InviteResults { sent: number; results: InviteResult[]; inviteLink: string }

export interface JoinPreview {
  teamId: string;
  teamName: string;
  tagline: string | null;
  memberCount: number;
  maxTeamSize: number;
  members: CompetitionPerson[];
}

export interface JudgingQueueItem {
  submissionId: string;
  /** Blind judging: a stable number instead of the team. */
  entryNumber: number;
  title: string;
  tagline: string | null;
  trackId: string | null;
  trackName: string | null;
  submittedAt: string | null;
  myStatus: 'NOT_STARTED' | 'DRAFT' | 'FINAL';
  myTotal: number | null;
}

export interface JudgingQueue { eventTitle: string | null; settings: CompetitionSettings; criteria: JudgingCriterion[]; items: JudgingQueueItem[] }

export interface JudgingDetail {
  submission: CompetitionSubmission;
  entryNumber: number;
  /** The form questions a judge may see (private ones withheld). */
  fields: SubmissionField[];
  criteria: JudgingCriterion[];
  myEvaluation: SubmissionEvaluation | null;
  judgingOpen: boolean;
}

export interface JudgingAssignment {
  judgeId: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  formatLabel: string;
  channelName: string | null;
  status: JudgeStatus;
  trackName: string | null;
  phase: CompetitionPhase;
  judgingOpen: boolean;
  submissionDeadline: string | null;
  judgingDeadline: string | null;
  toScore: number;
  finalized: number;
  invitedAt: string;
}

// ── requests ──

export interface UpdateCompetitionRequest {
  enabled?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  maxTeams?: number | null;
  teamFormationDeadline?: string | null;
  submissionOpensAt?: string | null;
  submissionDeadline?: string | null;
  judgingDeadline?: string | null;
  galleryAfterResults?: boolean;
  rules?: string | null;
}

export interface TeamRequest {
  name: string;
  tagline?: string | null;
  trackId?: string | null;
  lookingForMembers?: boolean;
  skillsWanted?: string[];
}

export interface SubmissionRequest {
  title: string;
  tagline?: string | null;
  answers: Record<string, SubmissionAnswer>;
  trackId?: string | null;
}

export interface SubmissionFieldRequest {
  label: string;
  helpText?: string | null;
  type: SubmissionFieldType;
  required?: boolean;
  options?: string[];
  privateToOrganisers?: boolean;
  position?: number;
  maxFileMb?: number | null;
  maxFiles?: number | null;
  allowedFormats?: string[];
}

export interface EvaluationRequest {
  scores: Record<string, number>;
  comment?: string | null;
  feedback?: string | null;
  submitFinal?: boolean;
}
