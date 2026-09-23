/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Events
 *
 * Types for event registration, ticketing and invitations. These
 * mirror the backend DTOs exactly; nothing here is invented client-side.
 * ------------------------------------------------------------------
 */

/** Mirrors the backend `ResourceType` enum. `WORKSHOP` was removed — EVENT is canonical. */
export type ResourceType = 'COURSE' | 'EVENT' | 'EXAM';

export type EventTicketStatus =
  | 'HELD'
  | 'ISSUED'
  | 'CHECKED_IN'
  | 'CANCELLED'
  | 'EXPIRED';

export type TicketSource = 'PLATFORM' | 'PARTNER_API' | 'IMPORT' | 'MANUAL';

export type CheckInMethod = 'QR' | 'CODE' | 'MANUAL';

/** A ticket as its holder sees it. The only shape carrying `qrPayload`. */
export interface MyEventTicket {
  id: string;
  eventId: string;
  eventTitle: string | null;
  code: string;
  /**
   * The bearer credential encoded into the QR image. Anyone holding this string can be admitted
   * as the holder, so it is never logged, never put in a URL and never rendered as text.
   */
  qrPayload: string;
  status: EventTicketStatus;
  holdExpiresAt: string | null;
  issuedAt: string | null;
}

/** A ticket as an organiser sees it — deliberately without any credential. */
export interface EventTicket {
  id: string;
  eventId: string;
  enrollmentId: string | null;
  userId: string | null;
  holderEmail: string | null;
  holderName: string | null;
  code: string;
  status: EventTicketStatus;
  source: TicketSource;
  holdExpiresAt: string | null;
  issuedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface IssueGuestTicketRequest {
  email: string;
  name?: string;
  /** ISO instant. Present means "reserve the seat", absent means "admit immediately". */
  holdUntil?: string;
}

export interface CheckInRequest {
  /** Exactly one of these two. They are separate because they are not equally strong. */
  qrPayload?: string;
  code?: string;
  sessionId?: string;
}

export interface CheckInResponse {
  ticketId: string;
  holderName: string | null;
  holderEmail: string | null;
  code: string;
  /** Not an error. A second scan at the same door is how a queue behaves. */
  alreadyAdmitted: boolean;
  checkedInAt: string;
  method: CheckInMethod;
}

export type EventInvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface EventInvitation {
  id: string;
  eventId: string;
  invitedEmail: string;
  status: EventInvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

/**
 * What the invitation landing page is told before anybody signs in.
 *
 * `accountExists` is what lets the page choose between "accept" and "sign up first" — the whole
 * reason an invitation can be addressed to somebody with no account.
 */
export interface EventInvitationValidation {
  valid: boolean;
  expired: boolean;
  alreadyAccepted: boolean;
  eventId: string | null;
  eventTitle: string | null;
  invitedEmail: string | null;
  accountExists: boolean;
}

export type EventRegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITLISTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type EventPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIAL_REFUND'
  | 'FREE'
  | 'NOT_APPLICABLE';

/** The caller's own registration. A DTO server-side, not the raw entity it used to return. */
export interface MyEventRegistration {
  id: string;
  eventId: string;
  registrationStatus: EventRegistrationStatus;
  paymentStatus: EventPaymentStatus;
  registrationDate: string;
  attendanceStatus: string | null;
  joinTime: string | null;
  leaveTime: string | null;
}
