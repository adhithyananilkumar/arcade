import { describe, expect, it } from 'vitest';
import { getNotificationTargetUrl } from './notificationMetadata';

describe('getNotificationTargetUrl', () => {
  it('follows a bug report notification to the tracker even though its text says "reported"', () => {
    expect(
      getNotificationTargetUrl({
        type: 'BUG_REPORT_FILED',
        title: 'BUG-1006 · Invitation notification missing',
        message: 'SONAMOL K I reported a major bug.',
        linkUrl: '/console/bugs?bug=abc',
        metadata: JSON.stringify({ reportId: 'abc' }),
      }),
    ).toBe('/console/bugs?bug=abc');
  });

  it('sends the reporter to their own report', () => {
    expect(
      getNotificationTargetUrl({ type: 'BUG_REPORT_RESPONDED', title: 'Your report BUG-1006', message: 'The team replied', linkUrl: '/bug-reports?id=abc' }),
    ).toBe('/bug-reports?id=abc');
  });

  it('still routes content reports to the inbox reports tab', () => {
    expect(
      getNotificationTargetUrl({ type: 'CONTENT_REPORTED', title: 'Content Reported', message: 'x', metadata: JSON.stringify({ contactMessageId: 'm1' }) }),
    ).toBe('/console/inbox?tab=reports&reportId=m1');
  });

  it('keeps the text heuristic for old link-less notifications', () => {
    expect(getNotificationTargetUrl({ type: 'LEGACY', title: 'New report', message: '', metadata: JSON.stringify({ id: 'r9' }) })).toBe(
      '/console/inbox?tab=reports&reportId=r9',
    );
  });
});
