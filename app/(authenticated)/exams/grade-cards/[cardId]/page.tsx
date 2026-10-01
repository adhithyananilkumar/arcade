'use client';

// A grade card: one finished sitting of any plan, or a course/event's assessment transcript. This is
// where a candidate reads their result in full — the exam page and the post-submit screen only point
// here. Everything shown was frozen when the card was issued.

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleSlash,
  Clock,
  Download,
  FileText,
  Hash,
  Hourglass,
  ListChecks,
  Loader2,
  Printer,
  ShieldAlert,
  Target,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  downloadGradeCardPdf,
  getGradeCard,
  planKindLabel,
  planTypeMeta,
  type GradeCardResponse,
} from '@/domains/assessments';
import { examRoutes } from '@/shared/routes/content.routes';

export default function GradeCardPage() {
  const params = useParams();
  const cardId = params.cardId as string;
  const [card, setCard] = useState<GradeCardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getGradeCard(cardId)
      .then(setCard)
      .catch((err) => setError(err?.message ?? 'Could not load this grade card.'));
  }, [cardId]);

  const download = async () => {
    if (!card) return;
    setDownloading(true);
    try {
      await downloadGradeCardPdf(card.id, card.credentialCode);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-ink print:bg-white">
      <div className="arcade-wash w-full print:bg-none">
        <div className="mx-auto w-full max-w-4xl px-5 pb-32 pt-28 sm:px-8 sm:pt-32 print:pb-6 print:pt-6">
          {error ? (
            <p className="py-24 text-center text-[14px] font-semibold text-rose-600">{error}</p>
          ) : !card ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-slate-400" size={26} />
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between gap-3 print:hidden">
                <nav aria-label="Breadcrumb">
                  <ol className="flex flex-wrap items-center gap-2 text-[13.5px] font-bold">
                    <li>
                      <Link href={examRoutes.mine} className="inline-flex items-center gap-1.5 text-slate-700 hover:text-ink">
                        <ArrowLeft size={14} /> My exams
                      </Link>
                    </li>
                  </ol>
                </nav>
                <div className="flex items-center gap-2">
                  <Link
                    href={examRoutes.landing(card.examId)}
                    className="rounded-full border border-line bg-paper px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Exam page
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Printer size={14} /> Print
                  </button>
                  <button
                    type="button"
                    onClick={download}
                    disabled={downloading}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download PDF
                  </button>
                </div>
              </div>
              <Card card={card} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Card({ card }: { card: GradeCardResponse }) {
  const transcript = card.kind === 'CONTENT_TRANSCRIPT';
  const sitting = card.sitting;
  // Only an ungraded assessment lacks pass/fail; a transcript and an older card without sitting
  // details are always pass/fail.
  const graded = sitting ? sitting.graded : true;
  const kindLabel = transcript
    ? 'Assessment transcript'
    : sitting?.planType
    ? planKindLabel(sitting.planType, sitting.graded)
    : 'Grade card';
  const chip = sitting?.planType ? planTypeMeta(sitting.planType).chip : 'bg-violet-50 text-violet-700';

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(20,20,43,0.08)] print:shadow-none">
      {card.revoked && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-7 py-3 text-[13px] font-semibold text-rose-700">
          <ShieldAlert size={16} /> Revoked{card.revokedReason ? `: ${card.revokedReason}` : ''}
        </div>
      )}

      {/* Identity of the card */}
      <header className="border-b border-slate-100 px-7 py-7 sm:px-9">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${chip}`}>
            {transcript || sitting?.planType !== 'ASSESSMENT' ? <Award size={12} /> : <FileText size={12} />}
            {kindLabel}
          </span>
          {sitting && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Attempt {sitting.attemptNumber}
            </span>
          )}
        </div>
        <h1
          className="mt-4 text-[1.9rem] font-bold leading-[1.1] tracking-tight text-ink sm:text-[2.3rem]"
          style={{ fontFamily: '"Clash Display", var(--font-sora), sans-serif' }}
        >
          {card.examTitle}
        </h1>
        {card.planName && <p className="mt-1.5 text-[14px] font-semibold text-slate-500">{card.planName}</p>}
        <p className="mt-5 text-[14px] font-medium text-slate-600">
          Issued to <b className="text-ink">{card.candidateName}</b> on {formatDate(card.issuedAt)}
        </p>
      </header>

      <CertificateStatus card={card} />

      {/* The result */}
      <section className="grid gap-6 border-b border-slate-100 px-7 py-7 sm:grid-cols-[auto_1fr] sm:items-center sm:px-9">
        <ScoreRing percentage={card.percentage} tone={!graded ? 'neutral' : card.passed ? 'pass' : 'fail'} />
        <div>
          <ResultBadge graded={graded} passed={card.passed} />
          <p className="mt-3 text-[2rem] font-bold leading-none tabular-nums text-ink">
            {fmt(card.marksObtained)}
            <span className="text-[1.1rem] font-semibold text-slate-400"> / {fmt(card.maximumMarks)} marks</span>
          </p>
          <p className="mt-2 text-[13px] font-medium text-slate-500">
            {graded
              ? `Pass mark ${fmt(card.passPercentage)}% · you scored ${fmt(card.percentage)}%`
              : 'A practice assessment — your score is for your own reference and carries no pass or fail.'}
          </p>
        </div>
      </section>

      {/* The sitting */}
      {sitting && (
        <section className="border-b border-slate-100 px-7 py-6 sm:px-9">
          <SectionTitle>Sitting details</SectionTitle>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact icon={<CheckCircle2 size={14} />} label="Correct" value={String(sitting.correctAnswers)} tone="text-emerald-600" />
            <Fact icon={<XCircle size={14} />} label="Wrong" value={String(sitting.wrongAnswers)} tone="text-rose-500" />
            <Fact icon={<CircleSlash size={14} />} label="Skipped" value={String(sitting.unanswered)} tone="text-slate-500" />
            <Fact icon={<ListChecks size={14} />} label="Questions" value={String(sitting.totalQuestions)} />
            <Fact icon={<Target size={14} />} label="Accuracy" value={accuracy(sitting.correctAnswers, sitting.totalQuestions - sitting.unanswered)} />
            <Fact icon={<Clock size={14} />} label="Time taken" value={formatDuration(sitting.timeTakenSeconds)} />
            <Fact icon={<CalendarDays size={14} />} label="Started" value={sitting.startedAt ? formatDateTime(sitting.startedAt) : '—'} small />
            <Fact icon={<CalendarDays size={14} />} label="Submitted" value={sitting.submittedAt ? formatDateTime(sitting.submittedAt) : '—'} small />
          </dl>
        </section>
      )}

      {/* Per section */}
      {!transcript && card.sections.length > 0 && (
        <section className="border-b border-slate-100 px-7 py-6 sm:px-9">
          <SectionTitle>Section-wise marks</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3 font-bold">Section</th>
                  <th className="py-2 px-3 text-right font-bold">Questions</th>
                  <th className="py-2 px-3 text-right font-bold">Attempted</th>
                  <th className="py-2 px-3 text-right font-bold">Correct</th>
                  <th className="py-2 px-3 text-right font-bold">Marks</th>
                  <th className="w-32 py-2 pl-3 font-bold">Score</th>
                </tr>
              </thead>
              <tbody>
                {card.sections.map((sec, i) => {
                  const pct = sec.maximumMarks > 0 ? Math.round((sec.marksObtained / sec.maximumMarks) * 100) : 0;
                  return (
                    <tr key={sec.sectionId ?? i} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 pr-3 font-semibold text-ink">{sec.sectionTitle}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-600">{sec.questions}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-600">{sec.attempted}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-600">{sec.correct}</td>
                      <td className="py-3 px-3 text-right font-semibold tabular-nums text-ink">
                        {fmt(sec.marksObtained)} / {fmt(sec.maximumMarks)}
                      </td>
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-9 text-right text-[12px] font-semibold tabular-nums text-slate-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* A transcript's assessments */}
      {transcript && card.lineItems.length > 0 && (
        <section className="border-b border-slate-100 px-7 py-6 sm:px-9">
          <SectionTitle>Assessments</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3 font-bold">Assessment</th>
                  <th className="py-2 px-3 font-bold">Type</th>
                  <th className="py-2 px-3 text-right font-bold">Marks</th>
                  <th className="py-2 px-3 text-right font-bold">Score</th>
                  <th className="py-2 pl-3 text-right font-bold">Result</th>
                </tr>
              </thead>
              <tbody>
                {card.lineItems.map((item) => (
                  <tr key={item.planId} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-3 font-semibold text-ink">{item.planName}</td>
                    <td className="py-3 px-3 text-slate-500">{planKindLabel(item.planType, true)}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                      {item.percentage === null ? '—' : `${fmt(item.marksObtained)} / ${fmt(item.maximumMarks)}`}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums text-ink">
                      {item.percentage === null ? '—' : `${fmt(item.percentage)}%`}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      {item.percentage === null ? (
                        <span className="text-[12px] font-medium text-slate-400">Not sat</span>
                      ) : item.passed ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                          <CheckCircle2 size={13} /> Passed
                        </span>
                      ) : (
                        <span className="text-[12px] font-semibold text-slate-500">Not passed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 px-7 py-4 text-[12px] font-medium text-slate-500 sm:px-9">
        <span className="inline-flex items-center gap-1.5">
          <Hash size={13} /> Grade card no.{' '}
          <b className="font-mono tracking-wider text-ink">{card.credentialCode}</b>
          <Link
            href={`/credentials/verify?id=${encodeURIComponent(card.credentialCode)}`}
            className="ml-1 font-semibold text-[#2962D6] hover:underline print:hidden"
          >
            Verify
          </Link>
        </span>
        {card.certificateIssued && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-violet-700">
            <BadgeCheck size={14} /> Certificate issued
          </span>
        )}
      </footer>
    </article>
  );
}

/** What happened to the certificate this sitting earns — only shown for a passed certification. */
function CertificateStatus({ card }: { card: GradeCardResponse }) {
  const status = card.certificateStatus;
  if (!status || status === 'NOT_APPLICABLE') return null;

  if (status === 'ISSUED') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/70 px-7 py-4 sm:px-9 print:hidden">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-emerald-800">
          <BadgeCheck size={16} /> Certificate issued
          {card.certificateCode && <span className="font-mono text-[12px] tracking-wider">{card.certificateCode}</span>}
        </span>
        <span className="flex items-center gap-2">
          <Link
            href="/achievements"
            className="rounded-full bg-emerald-700 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-800"
          >
            View certificate
          </Link>
          {card.certificateCode && (
            <Link
              href={`/credentials/verify?id=${encodeURIComponent(card.certificateCode)}`}
              className="rounded-full border border-emerald-300 px-4 py-1.5 text-[12px] font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Verify
            </Link>
          )}
        </span>
      </div>
    );
  }

  const copy: Record<Exclude<typeof status, 'ISSUED' | 'NOT_APPLICABLE'>, { tone: string; icon: ReactNode; text: string }> = {
    AWAITING_IDENTITY_REVIEW: {
      tone: 'border-amber-100 bg-amber-50/80 text-amber-900',
      icon: <Hourglass size={16} />,
      text: 'You passed. Your certificate will be issued once the exam administrator approves your identity photo.',
    },
    AWAITING_ISSUE: {
      tone: 'border-amber-100 bg-amber-50/80 text-amber-900',
      icon: <Hourglass size={16} />,
      text: 'You passed. Your certificate is being issued — refresh this page in a moment.',
    },
    IDENTITY_REJECTED: {
      tone: 'border-rose-100 bg-rose-50/80 text-rose-800',
      icon: <ShieldAlert size={16} />,
      text: 'No certificate was issued: the exam administrator did not accept your identity photo.',
    },
    WITHHELD: {
      tone: 'border-rose-100 bg-rose-50/80 text-rose-800',
      icon: <ShieldAlert size={16} />,
      text: 'No certificate was issued because this grade card was revoked.',
    },
  };
  const c = copy[status];
  return (
    <div className={`flex items-start gap-2 border-b px-7 py-4 text-[13px] font-semibold sm:px-9 print:hidden ${c.tone}`}>
      <span className="mt-0.5 shrink-0">{c.icon}</span>
      {c.text}
    </div>
  );
}

function ScoreRing({ percentage, tone }: { percentage: number; tone: 'pass' | 'fail' | 'neutral' }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const stroke = tone === 'pass' ? '#059669' : tone === 'fail' ? '#94a3b8' : '#0284c7';
  return (
    <div className="relative mx-auto size-32 sm:mx-0">
      <svg viewBox="0 0 112 112" className="size-full -rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[1.6rem] font-bold tabular-nums text-ink">
        {fmt(pct)}%
      </span>
    </div>
  );
}

function ResultBadge({ graded, passed }: { graded: boolean; passed: boolean }) {
  if (!graded) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[12px] font-bold text-sky-700">
        <FileText size={13} /> Not graded
      </span>
    );
  }
  return passed ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
      <CheckCircle2 size={13} /> Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-600">
      <XCircle size={13} /> Not passed
    </span>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-slate-400">{children}</h2>;
}

function Fact({
  icon,
  label,
  value,
  tone = 'text-ink',
  small = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3">
      <dt className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className={`${small ? 'text-[13px]' : 'text-[17px]'} font-bold tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}

/** Marks arrive as decimals (e.g. 8.00); show them without trailing zeros. */
function fmt(n: number): string {
  const v = Number(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function accuracy(correct: number, attempted: number): string {
  return attempted > 0 ? `${Math.round((correct / attempted) * 100)}%` : '—';
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
