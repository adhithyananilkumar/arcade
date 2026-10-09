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

  it('routes author review notifications to the content publishing tab', () => {
    expect(
      getNotificationTargetUrl({
        type: 'CONTENT_SUBMITTED',
        title: 'Event submitted for review',
        message: 'Your event was submitted',
        metadata: JSON.stringify({ contentType: 'EVENT', contentId: 'evt-123' }),
      }),
    ).toBe('/studio/content/event/evt-123?tab=publishing');

    expect(
      getNotificationTargetUrl({
        type: 'CONTENT_APPROVED',
        title: 'Course approved',
        message: 'Your course was approved',
        metadata: JSON.stringify({ contentType: 'COURSE', contentId: 'crs-456' }),
      }),
    ).toBe('/studio/content/course/crs-456?tab=publishing');

    expect(
      getNotificationTargetUrl({
        type: 'CONTENT_CHANGES_REQUESTED',
        title: 'Exam needs changes',
        message: 'Please revise',
        metadata: JSON.stringify({ contentType: 'EXAM', contentId: 'exm-789' }),
      }),
    ).toBe('/studio/content/exam/exm-789?tab=publishing');
  });

  it('normalizes legacy /studio/workshop/ links to /studio/content/event/...', () => {
    expect(
      getNotificationTargetUrl({
        type: 'CONTENT_CHANGES_REQUESTED',
        title: 'Workshop needs changes',
        message: 'Changes requested',
        linkUrl: '/studio/workshop/ws-101/edit',
      }),
    ).toBe('/studio/content/event/ws-101?tab=publishing');

    expect(
      getNotificationTargetUrl({
        type: 'OTHER',
        title: 'Other notification',
        message: 'Info',
        linkUrl: '/studio/workshop/ws-101/edit',
      }),
    ).toBe('/studio/content/event/ws-101?tab=publishing');
  });

  it('preserves reviewer queue and management links for reviewers', () => {
    expect(
      getNotificationTargetUrl({
        type: 'CONTENT_SUBMITTED',
        title: 'Review assigned to you',
        message: 'Please review',
        linkUrl: '/console/reviews/rev-1',
      }),
    ).toBe('/console/reviews/rev-1');

    expect(
      getNotificationTargetUrl({
        type: 'CONTENT_SUBMITTED',
        title: '1 submission awaiting organization review',
        message: 'Waiting for review',
        linkUrl: '/channels/ch-1/manage?tab=REVIEWS',
      }),
    ).toBe('/channels/ch-1/manage?tab=REVIEWS');
  });
});
