export type ResourceType = 'COURSE' | 'WORKSHOP' | 'EVENT';

export type EnrollmentResultStatus = 'GRANTED' | 'PENDING_ACTION' | 'DENIED';

export interface EnrollmentResult {
  status: EnrollmentResultStatus;
  message?: string;
  reasonCode?: string;
  failedRequirement?: string;
  nextAction?: string;
  redirectUrl?: string;
  requestId?: string;
  recordId?: string;
}

export interface EnrollmentRequestDto {
  resourceType: ResourceType;
  resourceId: string;
  idempotencyKey: string;
}

// UI specific types mapping from projection status to EnrollmentButton initialState
export type UIEnrollmentState = 'ENROLLED' | 'WAITLISTED' | 'NOT_ENROLLED' | 'PENDING';
