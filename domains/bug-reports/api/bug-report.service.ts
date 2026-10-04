import { api } from '@/infrastructure/http/api';
import type {
  BugIntake,
  BugReportDetail,
  BugReportSummary,
  CreateBugReportBody,
} from '../types/bug-report.types';

/** The reporter's side: the bug button and "My bug reports". Only ever reaches the caller's own reports. */
export class BugReportService {
  /** Whether to show the bug button for this account, and what to offer. Never rejects with 403. */
  static intake(): Promise<BugIntake> {
    return api.get<BugIntake>('/api/v1/bug-reports/intake');
  }

  static file(body: CreateBugReportBody): Promise<BugReportDetail> {
    return api.post<BugReportDetail>('/api/v1/bug-reports', body);
  }

  static mine(): Promise<BugReportSummary[]> {
    return api.get<BugReportSummary[]>('/api/v1/bug-reports/mine');
  }

  static detail(id: string): Promise<BugReportDetail> {
    return api.get<BugReportDetail>(`/api/v1/bug-reports/mine/${id}`);
  }

  static comment(id: string, body: string): Promise<BugReportDetail> {
    return api.post<BugReportDetail>(`/api/v1/bug-reports/mine/${id}/comments`, { body });
  }

  /** Answer to "fixed — please check": confirm it, or say it still happens. */
  static verdict(id: string, stillHappening: boolean, note?: string): Promise<BugReportDetail> {
    return api.post<BugReportDetail>(`/api/v1/bug-reports/mine/${id}/verdict`, { stillHappening, note });
  }

  static attach(id: string, file: Blob, fileName: string): Promise<BugReportDetail> {
    const form = new FormData();
    form.append('file', file, fileName);
    return api.post<BugReportDetail>(`/api/v1/bug-reports/mine/${id}/attachments`, form);
  }
}
