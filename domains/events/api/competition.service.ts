import { api, apiUploadWithProgress } from '@/infrastructure/http/api';
import type {
  AdminSubmission,
  AdminSubmissionDetail,
  Competition,
  CompetitionAward,
  CompetitionJudge,
  CompetitionSubmission,
  CompetitionSummary,
  CompetitionTeam,
  CompetitionTrack,
  EvaluationRequest,
  InviteResults,
  JoinPreview,
  JudgingAssignment,
  JudgingCriterion,
  JudgingDetail,
  JudgingQueue,
  LeaderboardEntry,
  SubmissionEvaluation,
  SubmissionField,
  SubmissionFieldRequest,
  SubmissionRequest,
  UploadedFile,
  TeamBoard,
  TeamCard,
  TeamRequest,
  UpdateCompetitionRequest,
} from '../types/competition.types';

const base = (eventId: string) => `/api/v1/events/${eventId}/competition`;

/** The organiser's competition console. */
export class CompetitionAdminService {
  /** `null` when the event has no competition yet (the API answers 204). */
  static async get(eventId: string): Promise<Competition | null> {
    const res = await api.get<Competition | undefined>(base(eventId));
    return res ?? null;
  }

  static update(eventId: string, body: UpdateCompetitionRequest) {
    return api.put<Competition>(base(eventId), body);
  }

  static addField(eventId: string, body: SubmissionFieldRequest) {
    return api.post<SubmissionField>(`${base(eventId)}/fields`, body);
  }
  static updateField(eventId: string, id: string, body: SubmissionFieldRequest) {
    return api.put<SubmissionField>(`${base(eventId)}/fields/${id}`, body);
  }
  static reorderFields(eventId: string, fieldIds: string[]) {
    return api.put<SubmissionField[]>(`${base(eventId)}/fields/order`, { fieldIds });
  }
  static deleteField(eventId: string, id: string) {
    return api.delete<void>(`${base(eventId)}/fields/${id}`);
  }

  static addTrack(eventId: string, body: { name: string; description?: string | null }) {
    return api.post<CompetitionTrack>(`${base(eventId)}/tracks`, body);
  }
  static updateTrack(eventId: string, id: string, body: { name: string; description?: string | null; position?: number }) {
    return api.put<CompetitionTrack>(`${base(eventId)}/tracks/${id}`, body);
  }
  static deleteTrack(eventId: string, id: string) {
    return api.delete<void>(`${base(eventId)}/tracks/${id}`);
  }

  static addCriterion(eventId: string, body: Partial<JudgingCriterion> & { name: string }) {
    return api.post<JudgingCriterion>(`${base(eventId)}/criteria`, body);
  }
  static updateCriterion(eventId: string, id: string, body: Partial<JudgingCriterion> & { name: string }) {
    return api.put<JudgingCriterion>(`${base(eventId)}/criteria/${id}`, body);
  }
  static deleteCriterion(eventId: string, id: string) {
    return api.delete<void>(`${base(eventId)}/criteria/${id}`);
  }

  static addAward(eventId: string, body: { name: string; description?: string | null; prize?: string | null; trackId?: string | null }) {
    return api.post<CompetitionAward>(`${base(eventId)}/awards`, body);
  }
  static updateAward(eventId: string, id: string, body: { name: string; description?: string | null; prize?: string | null; trackId?: string | null }) {
    return api.put<CompetitionAward>(`${base(eventId)}/awards/${id}`, body);
  }
  static setWinner(eventId: string, id: string, teamId: string | null) {
    return api.put<CompetitionAward>(`${base(eventId)}/awards/${id}/winner`, { teamId });
  }
  static deleteAward(eventId: string, id: string) {
    return api.delete<void>(`${base(eventId)}/awards/${id}`);
  }

  static judges(eventId: string) {
    return api.get<CompetitionJudge[]>(`${base(eventId)}/judges`);
  }
  /** Invites by email or @username; the judge accepts before they can score. */
  static inviteJudge(eventId: string, identifier: string, trackId?: string | null) {
    return api.post<CompetitionJudge[]>(`${base(eventId)}/judges`, { identifier, trackId: trackId || null });
  }
  static removeJudge(eventId: string, judgeId: string) {
    return api.delete<void>(`${base(eventId)}/judges/${judgeId}`);
  }

  static summary(eventId: string) {
    return api.get<CompetitionSummary>(`${base(eventId)}/summary`);
  }
  static teams(eventId: string) {
    return api.get<CompetitionTeam[]>(`${base(eventId)}/teams`);
  }
  static disqualify(eventId: string, teamId: string, reason: string) {
    return api.post<void>(`${base(eventId)}/teams/${teamId}/disqualify`, { reason });
  }
  static reinstate(eventId: string, teamId: string) {
    return api.post<void>(`${base(eventId)}/teams/${teamId}/reinstate`);
  }
  static submissions(eventId: string) {
    return api.get<AdminSubmission[]>(`${base(eventId)}/submissions`);
  }
  static submission(eventId: string, submissionId: string) {
    return api.get<AdminSubmissionDetail>(`${base(eventId)}/submissions/${submissionId}`);
  }
  static leaderboard(eventId: string) {
    return api.get<LeaderboardEntry[]>(`${base(eventId)}/leaderboard`);
  }
  static publishResults(eventId: string) {
    return api.post<Competition>(`${base(eventId)}/results/publish`);
  }
  static unpublishResults(eventId: string) {
    return api.post<Competition>(`${base(eventId)}/results/unpublish`);
  }
}

/** The participant's team board. Mutations answer with the refreshed board. */
export class TeamBoardService {
  private static me = (eventId: string) => `${base(eventId)}/me`;

  /** The public brief (rules, tracks, prizes) — `null` when the event has no competition. */
  static async competition(eventId: string): Promise<Competition | null> {
    const res = await api.get<Competition | undefined>(base(eventId));
    return res ?? null;
  }
  static board(eventId: string) {
    return api.get<TeamBoard>(TeamBoardService.me(eventId));
  }
  static browse(eventId: string) {
    return api.get<TeamCard[]>(`${TeamBoardService.me(eventId)}/teams`);
  }
  static preview(eventId: string, code: string) {
    return api.get<JoinPreview>(`${TeamBoardService.me(eventId)}/join-preview?code=${encodeURIComponent(code)}`);
  }
  static gallery(eventId: string) {
    return api.get<CompetitionSubmission[]>(`${TeamBoardService.me(eventId)}/gallery`);
  }
  static createTeam(eventId: string, body: TeamRequest) {
    return api.post<TeamBoard>(`${TeamBoardService.me(eventId)}/team`, body);
  }
  static updateTeam(eventId: string, body: TeamRequest) {
    return api.put<TeamBoard>(`${TeamBoardService.me(eventId)}/team`, body);
  }
  static rotateCode(eventId: string) {
    return api.post<TeamBoard>(`${TeamBoardService.me(eventId)}/team/rotate-code`);
  }
  static leave(eventId: string) {
    return api.post<TeamBoard>(`${TeamBoardService.me(eventId)}/team/leave`);
  }
  static removeMember(eventId: string, userId: string) {
    return api.delete<TeamBoard>(`${TeamBoardService.me(eventId)}/team/members/${userId}`);
  }
  static makeCaptain(eventId: string, userId: string) {
    return api.post<TeamBoard>(`${TeamBoardService.me(eventId)}/team/captain`, { userId });
  }
  static inviteFriends(eventId: string, identifiers: string[], message?: string) {
    return api.post<InviteResults>(`${TeamBoardService.me(eventId)}/team/invites`, { identifiers, message: message || null });
  }
  static joinByCode(eventId: string, code: string) {
    return api.post<TeamBoard>(`${TeamBoardService.me(eventId)}/join`, { code });
  }
  static requestToJoin(eventId: string, teamId: string, message?: string) {
    return api.post<TeamBoard>(`${TeamBoardService.me(eventId)}/teams/${teamId}/requests`, { message: message || null });
  }
  static decide(eventId: string, requestId: string, action: 'accept' | 'decline' | 'cancel') {
    return api.post<TeamBoard>(`${TeamBoardService.me(eventId)}/requests/${requestId}/${action}`);
  }
  static saveSubmission(eventId: string, body: SubmissionRequest) {
    return api.put<CompetitionSubmission>(`${TeamBoardService.me(eventId)}/submission`, body);
  }
  /** Uploads one file for a FILE question; save the result as (part of) that question's answer. */
  static uploadFile(eventId: string, fieldId: string, file: File, onProgress?: (percent: number) => void) {
    const q = `fieldId=${encodeURIComponent(fieldId)}&fileName=${encodeURIComponent(file.name)}`;
    return apiUploadWithProgress<UploadedFile>(
      `${TeamBoardService.me(eventId)}/files?${q}`,
      file,
      file.type || 'application/octet-stream',
      onProgress,
    );
  }
  static submit(eventId: string) {
    return api.post<CompetitionSubmission>(`${TeamBoardService.me(eventId)}/submission/submit`);
  }
  static withdraw(eventId: string) {
    return api.post<CompetitionSubmission>(`${TeamBoardService.me(eventId)}/submission/withdraw`);
  }
}

/** The judge's workspace. */
export class JudgingService {
  /** Every judging invite and assignment for the signed-in user. */
  static assignments() {
    return api.get<JudgingAssignment[]>('/api/v1/me/judging');
  }
  static respond(judgeId: string, accept: boolean) {
    return api.post<JudgingAssignment[]>(`/api/v1/me/judging/${judgeId}/${accept ? 'accept' : 'decline'}`);
  }
  static queue(eventId: string) {
    return api.get<JudgingQueue>(`${base(eventId)}/judging`);
  }
  static detail(eventId: string, submissionId: string) {
    return api.get<JudgingDetail>(`${base(eventId)}/judging/${submissionId}`);
  }
  static evaluate(eventId: string, submissionId: string, body: EvaluationRequest) {
    return api.put<SubmissionEvaluation>(`${base(eventId)}/judging/${submissionId}`, body);
  }
}
