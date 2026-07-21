// app/(authenticated)/dashboard/content/[type]/new/page.tsx
// Catches workshop, webinar, article types — Coming Soon stub.
// These routes are locked in from day one so no other teams get 404s.

import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, Radio, FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Coming Soon — Arcade",
};

const TYPE_META: Record<
  string,
  { label: string; desc: string; icon: React.ElementType; color: string; bg: string }
> = {
  workshop: {
    label: "Workshop / Bootcamp",
    desc: "Flexible container for videos, activities, and resources. Supports Online, Offline, and Hybrid delivery modes.",
    icon: Wrench,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  webinar: {
    label: "Webinar",
    desc: "Live sessions with Zoom meeting URL, date, time, timezone, and supporting materials.",
    icon: Radio,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  article: {
    label: "Article",
    desc: "Standalone rich document authored using the Arcade Tiptap editor.",
    icon: FileText,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
};

interface Props {
  params: Promise<{ type: string }>;
}

export default async function ContentTypeComingSoonPage({ params }: Props) {
  const { type } = await params;
  const meta = TYPE_META[type];

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Unknown content type.</p>
      </div>
    );
  }

  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <div
          className={`w-14 h-14 rounded-2xl ${meta.bg} flex items-center justify-center mx-auto mb-5`}
        >
          <Icon size={26} className={meta.color} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{meta.label}</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{meta.desc}</p>
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Coming in the next phase
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
