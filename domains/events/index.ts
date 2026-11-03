/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Events
 *
 * Purpose:
 * Public API for the Events domain — registration, ticketing,
 * check-in and invitations.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

// Authoring + publishing HTTP, moved here from app/(authenticated)/studio/events/api/*. Kept as
// function exports rather than rewritten into service classes: relocating them is a move, and
// changing every call site's shape at the same time would hide a regression inside a refactor.
export {
  createEvent,
  updateEvent,
  getEvent,
  createEventSession,
  updateEventSession,
  deleteEventSession,
} from './api/event';
export {
  validateEvent,
  getEventPreview,
  submitEvent,
  approveEvent,
  rejectEvent,
  editEvent,
  getEventStatusHistory,
  unpublishEvent,
  archiveEvent,
} from './api/publish';

export {
  EventDiscoveryService,
  getPublishedEvents,
  getPublishedEventCards,
  getPublishedFacets,
  getEventById,
  getEventBySlug,
  getEventBySlugOrId,
} from './api/eventDiscovery.service';

export { getEventDeleteImpact } from './api/dashboardApi';
export { EventRegistrationService } from './api/eventRegistration.service';
export { EventTicketService, MyEventTicketService } from './api/eventTicket.service';
export {
  EventInvitationService,
  EventInvitationClaimService,
} from './api/eventInvitation.service';

export {
  eventKeys,
  usePublishedEventCardsQuery,
  usePublishedEventFacetsQuery,
  useMyEventRegistrationQuery,
  useMyTicketsQuery,
  useMyTicketQuery,
  useEventTicketsQuery,
  useEventInvitationsQuery,
  useRegisterForEventMutation,
  useIssueGuestTicketMutation,
  useCancelTicketMutation,
  useCheckInMutation,
  useInviteToEventMutation,
  useBulkInviteToEventMutation,
  useRevokeInvitationMutation,
} from './api/events.queries';

// Team competitions (hackathons): organiser console, participant team board, judging.
export { CompetitionAdminService, TeamBoardService, JudgingService } from './api/competition.service';
export type {
  CompetitionPhase,
  CompetitionPerson,
  CompetitionSettings,
  CompetitionTrack,
  JudgingCriterion,
  CompetitionAward,
  Competition,
  TeamMember,
  TeamCard,
  JoinRequestKind,
  TeamJoinRequest,
  CompetitionTeam,
  CompetitionSubmission,
  SubmissionEvaluation,
  CompetitionJudge,
  LeaderboardEntry,
  AdminSubmission,
  AdminSubmissionDetail,
  CompetitionSummary,
  CompetitionResults,
  TeamBoard,
  InviteResult,
  InviteResults,
  JoinPreview,
  JudgingQueueItem,
  JudgingQueue,
  JudgingDetail,
  JudgingAssignment,
  UpdateCompetitionRequest,
  TeamRequest,
  SubmissionRequest,
  EvaluationRequest,
  SubmissionField,
  SubmissionFieldType,
  SubmissionFieldRequest,
  SubmissionAnswer,
  JudgeStatus,
  UploadedFile,
} from './types/competition.types';

export {
  AvatarStack,
  Chip as CompetitionChip,
  Countdown,
  LeaderboardTable,
  PersonAvatar,
  PhaseTimeline,
  Podium,
  TeamCardView,
  PHASE_LABEL,
  formatCompetitionDate,
  nextMilestone,
} from './components/competition/CompetitionUI';

export { SubmissionFormFields, SubmissionAnswersView, FIELD_TYPE_LABEL } from './components/competition/SubmissionForm';

export { EventTicketCard } from './components/EventTicketCard';
export { TicketCheckInPanel } from './components/TicketCheckInPanel';
export { EventInvitationManager } from './components/EventInvitationManager';
export { EventPublicView } from './components/EventPublicView';

export type * from './types/event.types';
export { toEventCardView } from './lib/toEventCardView';

export type {
  EventDto,
  PublishedEventCard,
  EventFacets,
  EventFacet,
  EventCardView,
  PagedEvents,
  PublishedEventsQuery,
  EventStatus,
  EventTypeName,
  EventDeliveryMode,
  EventDifficulty,
  EventVisibility,
} from './types/eventDiscovery.types';

export type {
  ResourceType,
  EventTicket as EventTicketDto,
  MyEventTicket,
  EventTicketStatus,
  TicketSource,
  CheckInMethod,
  CheckInRequest,
  CheckInResponse,
  IssueGuestTicketRequest,
  EventInvitation,
  BulkInviteResult,
  BulkInviteResponse,
  EventInvitationStatus,
  EventInvitationValidation,
  MyEventRegistration,
  EventRegistrationStatus,
  EventPaymentStatus,
} from './types/events.types';
