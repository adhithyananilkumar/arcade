import Link from "next/link";
import { ReactNode } from "react";

export default async function ParticipantsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const tabs = [
    { name: "Registered Members", href: `/studio/events/${id}/participants` },
    { name: "Pending Approvals", href: `/studio/events/${id}/participants/pending` },
    { name: "Waitlist", href: `/studio/events/${id}/participants/waitlist` },
    { name: "Attendance", href: `/studio/events/${id}/participants/attendance` },
    { name: "Certificates", href: `/studio/events/${id}/participants/certificates` },
    { name: "Messages", href: `/studio/events/${id}/participants/messages` },
    { name: "Analytics", href: `/studio/events/${id}/participants/analytics` },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Participant Management
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage everyone who has registered for this workshop.
        </p>
      </div>

      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6">
        <nav className="flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
