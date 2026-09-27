'use client';

// A grade card: one certification sitting, or a course/event's assessment transcript. Everything
// shown was frozen when the card was issued.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Award, CheckCircle2, Loader2, Printer, ShieldAlert, XCircle } from 'lucide-react';
import { getGradeCard, planKindLabel, type GradeCardResponse } from '@/domains/assessments';
import { examRoutes } from '@/shared/routes/content.routes';

const pageBg = {
  background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
};

export default function GradeCardPage() {
  const params = useParams();
  const cardId = params.cardId as string;
  const [card, setCard] = useState<GradeCardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGradeCard(cardId)
      .then(setCard)
      .catch((err) => setError(err?.message ?? 'Could not load this grade card.'));
  }, [cardId]);

  return (
    <main className="min-h-screen pb-32 print:bg-white" style={pageBg}>
      <div className="mx-auto w-full max-w-3xl px-4 pt-28 sm:px-6 md:pt-32 print:pt-6">
        {error ? (
          <p className="py-24 text-center text-[14px] font-semibold text-rose-600">{error}</p>
        ) : !card ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-slate-400" size={26} />
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between print:hidden">
              <Link
                href={examRoutes.landing(card.examId)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-[#14142b]"
              >
                <ArrowLeft size={14} /> Back
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer size={14} /> Print
              </button>
            </div>
            <Card card={card} />
          </>
        )}
      </div>
    </main>
  );
}

function Card({ card }: { card: GradeCardResponse }) {
  const transcript = card.kind === 'CONTENT_TRANSCRIPT';
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(20,20,43,0.08)]">
      {card.revoked && (
        <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-6 py-3 text-[13px] font-semibold text-rose-700">
          <ShieldAlert size={16} /> Revoked{card.revokedReason ? `: ${card.revokedReason}` : ''}
        </div>
      )}

      <header className="border-b border-slate-100 px-7 py-7">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {transcript ? 'Assessment transcript' : 'Grade card'}
        </p>
        <h1 className="mt-1.5 text-[1.5rem] font-bold leading-tight tracking-tight text-[#14142b]">{card.examTitle}</h1>
        {card.planName && <p className="mt-1 text-[13px] font-semibold text-slate-500">{card.planName}</p>}
        <p className="mt-4 text-[14px] font-medium text-slate-600">
          Awarded to <b className="text-[#14142b]">{card.candidateName}</b> on{' '}
          {new Date(card.issuedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 border-b border-slate-100 px-7 py-6 sm:grid-cols-4">
        <Stat label="Score" value={`${card.percentage}%`} />
        <Stat label="Marks" value={`${card.marksObtained} / ${card.maximumMarks}`} />
        <Stat label="Pass mark" value={`${card.passPercentage}%`} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Result</p>
          <p
            className={`mt-1 inline-flex items-center gap-1.5 text-[15px] font-bold ${
              card.passed ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            {card.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {card.passed ? 'Passed' : 'Not passed'}
          </p>
        </div>
      </section>

      {transcript && card.lineItems.length > 0 && (
        <section className="px-7 py-6">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">Assessments</h2>
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="py-2 font-bold">Assessment</th>
                <th className="py-2 font-bold">Type</th>
                <th className="py-2 text-right font-bold">Score</th>
              </tr>
            </thead>
            <tbody>
              {card.lineItems.map((item) => (
                <tr key={item.planId} className="border-b border-slate-50">
                  <td className="py-2.5 font-semibold text-[#14142b]">{item.planName}</td>
                  <td className="py-2.5 text-slate-500">{planKindLabel(item.planType, true)}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {item.percentage === null ? '—' : `${item.percentage}%`}
                    {item.passed && <CheckCircle2 size={13} className="ml-1.5 inline text-emerald-600" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {!transcript && card.sections.length > 0 && (
        <section className="px-7 py-6">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">By section</h2>
          <div className="space-y-3">
            {card.sections.map((sec, i) => {
              const pct = sec.maximumMarks > 0 ? Math.round((sec.marksObtained / sec.maximumMarks) * 100) : 0;
              return (
                <div key={sec.sectionId ?? i}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="font-semibold text-[#14142b]">{sec.sectionTitle}</span>
                    <span className="tabular-nums text-slate-500">
                      {sec.marksObtained} / {sec.maximumMarks} · {sec.correct}/{sec.questions} correct
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#14142b]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 px-7 py-4 text-[12px] font-medium text-slate-500">
        <span>
          Verification code <b className="font-mono tracking-wider text-[#14142b]">{card.verificationCode}</b>
        </span>
        {card.certificateIssued && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-violet-700">
            <Award size={14} /> Certificate issued
          </span>
        )}
      </footer>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-[15px] font-bold tabular-nums text-[#14142b]">{value}</p>
    </div>
  );
}
