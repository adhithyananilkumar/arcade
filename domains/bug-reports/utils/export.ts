import type { BugPerson, BugReportDetail } from '../types/bug-report.types';
import { describeActivity, IMPACT_LABEL, RESOLUTION_LABEL, STATUS_LABEL } from './labels';

/** Bump when a field is renamed or removed; adding fields does not need a bump. */
export const BUG_EXPORT_VERSION = 1;

const SCREENSHOT_FETCH_TIMEOUT_MS = 10_000;

function person(p: BugPerson | null) {
  return p ? { id: p.id, name: p.name, email: p.email } : null;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** The image bytes as a data: URL, or null when storage refuses a cross-origin read. */
async function embed(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SCREENSHOT_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, credentials: 'omit' });
    if (!res.ok) return null;
    return await blobToDataUrl(await res.blob());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Everything the viewer can see about one report as a single self-contained JSON document — for
 * handing to a developer, attaching to an issue, or pasting into a tool. Screenshots are embedded
 * as data URLs when storage allows it; otherwise the short-lived signed link is kept and marked.
 * Contains INTERNAL activity when the viewer is staff, so treat the file as internal.
 */
export async function buildBugReportExport(
  d: BugReportDetail,
  opts: { trackerUrl: string; exportedBy?: BugPerson | null; names?: Record<string, string>; embedScreenshots?: boolean },
) {
  const s = d.summary;
  const screenshots = await Promise.all(
    d.attachments.map(async (a) => {
      const dataUrl = opts.embedScreenshots === false ? null : await embed(a.url);
      return {
        id: a.id,
        fileName: a.fileName,
        contentType: a.contentType,
        sizeBytes: a.sizeBytes,
        width: a.width,
        height: a.height,
        createdAt: a.createdAt,
        ...(dataUrl ? { dataUrl } : { url: a.url, note: 'Signed link — expires about 30 minutes after export.' }),
      };
    }),
  );

  return {
    format: 'arcade.bug-report',
    version: BUG_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy: person(opts.exportedBy ?? null),
    trackerUrl: opts.trackerUrl,
    report: {
      id: s.id,
      key: s.key,
      number: s.number,
      title: s.title,
      status: s.status,
      statusLabel: STATUS_LABEL[s.status],
      resolution: s.resolution,
      resolutionLabel: s.resolution ? RESOLUTION_LABEL[s.resolution] : null,
      duplicateOf: d.duplicateOfKey ? { id: d.duplicateOfId, key: d.duplicateOfKey } : null,
      impact: s.impact,
      impactLabel: IMPACT_LABEL[s.impact],
      severity: s.severity,
      priority: s.priority,
      category: { id: s.category.id, code: s.category.code, label: s.category.label },
      reporter: person(s.reporter),
      assignee: person(s.assignee),
      releaseLabel: s.releaseLabel,
      createdAt: s.createdAt,
      lastActivityAt: s.lastActivityAt,
      resolvedAt: d.resolvedAt,
    },
    description: d.description,
    expected: d.expected,
    context: {
      pageUrl: d.pageUrl,
      route: s.route,
      appVersion: d.appVersion,
      userAgent: d.userAgent,
      environment: d.environment,
    },
    consoleLog: d.consoleLog ?? [],
    screenshots,
    activity: d.activity.map((e) => ({
      id: e.id,
      at: e.createdAt,
      kind: e.kind,
      visibility: e.visibility,
      actor: person(e.actor),
      staff: e.staff,
      summary: e.kind === 'COMMENT' ? null : `${e.actor?.name ?? 'Arcade'} ${describeActivity(e, { reporter: false, names: opts.names })}`,
      body: e.body,
      from: e.fromValue,
      to: e.toValue,
    })),
  };
}

/** Saves `data` as a pretty-printed .json file through the browser's download flow. */
export function downloadJson(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
