"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";

/**
 * The content-review console.
 *
 * Governance lives here rather than under Channels because it is a content-review concern:
 * "must this channel's content be reviewed?" is the same question the queue answers one submission
 * at a time. Keeping them on one surface means a reviewer wondering why something bypassed them
 * can find the answer without leaving the console.
 *
 * The Governance tab is hidden from users with no governance authority anywhere; the backend
 * refuses the endpoints regardless, so this is presentation only.
 */
export default function ReviewsConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const showGovernance =
    AuthorizationService.canGovernPlatformContent(user) ||
    AuthorizationService.canGovernChannelContent(user);

  const tabs = [
    { href: "/console/reviews", label: "Queue", icon: ClipboardCheck, exact: true },
    ...(showGovernance
      ? [{ href: "/console/reviews/governance", label: "Governance", icon: ShieldCheck, exact: false }]
      : []),
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-full w-full flex-col">
      {tabs.length > 1 ? (
        <nav
          aria-label="Review console sections"
          className="mb-4 flex shrink-0 gap-1 border-b border-slate-200"
        >
          {tabs.map((tab) => {
            const active = isActive(tab.href, tab.exact);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-[13px] font-semibold transition-colors ${
                  active
                    ? "border-[#14142b] text-[#14142b]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
