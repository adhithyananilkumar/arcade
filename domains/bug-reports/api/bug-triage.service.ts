import { api } from '@/infrastructure/http/api';
import type {
  BugCategory,
  BugCategoryBody,
  BugIntakeSettings,
  BugPage,
  BugPerson,
  BugReportDetail,
  BugReportSummary,
  BugTrackerFilters,
  BugTrackerStats,
  TransitionBody,
  TriageUpdateBody,
} from '../types/bug-report.types';

function qs(filters: BugTrackerFilters): string {
  const search = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, String(v)));
    else search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** Arc Console → Bugs. Every call is re-authorized server-side (platform.bugs.*). */
export class BugTriageService {
  static search(filters: BugTrackerFilters): Promise<BugPage<BugReportSummary>> {
    return api.get<BugPage<BugReportSummary>>(`/api/v1/console/bugs${qs(filters)}`);
  }

  static exportCsv(filters: BugTrackerFilters): Promise<void> {
    // The export is the whole filtered set, not the page on screen.
    return api.download(`/api/v1/console/bugs/export${qs({ ...filters, page: undefined, size: undefined })}`, 'arcade-bugs.csv');
  }

  static stats(): Promise<BugTrackerStats> {
    return api.get<BugTrackerStats>('/api/v1/console/bugs/stats');
  }

  static assignees(): Promise<BugPerson[]> {
    return api.get<BugPerson[]>('/api/v1/console/bugs/assignees');
  }

  static detail(id: string): Promise<BugReportDetail> {
    return api.get<BugReportDetail>(`/api/v1/console/bugs/${id}`);
  }

  static byNumber(number: number): Promise<BugReportDetail> {
    return api.get<BugReportDetail>(`/api/v1/console/bugs/by-number/${number}`);
  }

  static transition(id: string, body: TransitionBody): Promise<BugReportDetail> {
    return api.post<BugReportDetail>(`/api/v1/console/bugs/${id}/transition`, body);
  }

  static update(id: string, body: TriageUpdateBody): Promise<BugReportDetail> {
    return api.patch<BugReportDetail>(`/api/v1/console/bugs/${id}`, body);
  }

  static comment(id: string, body: string, internal: boolean): Promise<BugReportDetail> {
    return api.post<BugReportDetail>(`/api/v1/console/bugs/${id}/comments`, { body, internal });
  }

  static attach(id: string, file: Blob, fileName: string): Promise<BugReportDetail> {
    const form = new FormData();
    form.append('file', file, fileName);
    return api.post<BugReportDetail>(`/api/v1/console/bugs/${id}/attachments`, form);
  }

  static settings(): Promise<BugIntakeSettings> {
    return api.get<BugIntakeSettings>('/api/v1/console/bugs/settings');
  }

  static updateSettings(body: { mode: BugIntakeSettings['mode']; releaseLabel?: string | null; intakeMessage?: string | null }): Promise<BugIntakeSettings> {
    return api.put<BugIntakeSettings>('/api/v1/console/bugs/settings', body);
  }

  static categories(): Promise<BugCategory[]> {
    return api.get<BugCategory[]>('/api/v1/console/bugs/categories');
  }

  static createCategory(body: BugCategoryBody): Promise<BugCategory> {
    return api.post<BugCategory>('/api/v1/console/bugs/categories', body);
  }

  static updateCategory(id: string, body: BugCategoryBody): Promise<BugCategory> {
    return api.put<BugCategory>(`/api/v1/console/bugs/categories/${id}`, body);
  }
}
