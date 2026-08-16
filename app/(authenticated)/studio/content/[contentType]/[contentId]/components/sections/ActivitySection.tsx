import { Clock, AlertTriangle, CheckCircle2, Send, AlertCircle, Edit3, UserPlus, BookOpen, Video, Rocket } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface TimelineEntry {
  id: string;
  title: string;
  actorName: string;
  createdAt: string;
  type?: string;
}

export function cleanActivityTitle(title: string): string {
  if (!title) return "";
  const parts = title.split(":");
  if (parts.length === 2 && parts[0].trim().toLowerCase() === parts[1].trim().toLowerCase()) {
    return parts[0].trim();
  }
  return title;
}

export function getActivityIcon(type?: string, title?: string) {
  const text = `${type || ''} ${title || ''}`.toUpperCase();
  if (text.includes("PUBLISH") || text.includes("COURSE")) return BookOpen;
  if (text.includes("STAFF") || text.includes("JOINED") || text.includes("MEMBER")) return UserPlus;
  if (text.includes("WEBINAR") || text.includes("VIDEO")) return Video;
  if (text.includes("BOOTCAMP") || text.includes("START")) return Rocket;
  return CheckCircle2;
}

export function getActivityTheme(type?: string, title?: string) {
  const text = `${type || ''} ${title || ''}`.toUpperCase();

  if (text.includes("PUBLISH") || text.includes("APPROV") || text.includes("COURSE")) {
    return {
      cardBg: "bg-gradient-to-r from-emerald-100/90 via-teal-50 to-emerald-100/80",
      cardBorder: "border-[1.5px] border-emerald-400/90",
      cardShadow: "shadow-[4px_-4px_0px_0px_#A7F3D0]",
      badgeCls: "bg-emerald-600 text-white border-emerald-700 shadow-2xs",
      nodeBg: "bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-100",
      textColor: "text-emerald-950",
      label: "Published",
      Icon: BookOpen,
    };
  }
  if (text.includes("STAFF") || text.includes("JOINED") || text.includes("MEMBER") || text.includes("INVITE")) {
    return {
      cardBg: "bg-gradient-to-r from-purple-100/90 via-indigo-50 to-purple-100/80",
      cardBorder: "border-[1.5px] border-purple-400/90",
      cardShadow: "shadow-[4px_-4px_0px_0px_#E9D5FF]",
      badgeCls: "bg-purple-600 text-white border-purple-700 shadow-2xs",
      nodeBg: "bg-purple-600 text-white border-purple-400 ring-4 ring-purple-100",
      textColor: "text-purple-950",
      label: "Team",
      Icon: UserPlus,
    };
  }
  if (text.includes("WEBINAR") || text.includes("VIDEO")) {
    return {
      cardBg: "bg-gradient-to-r from-sky-100/90 via-blue-50 to-sky-100/80",
      cardBorder: "border-[1.5px] border-sky-400/90",
      cardShadow: "shadow-[4px_-4px_0px_0px_#BAE6FD]",
      badgeCls: "bg-sky-600 text-white border-sky-700 shadow-2xs",
      nodeBg: "bg-sky-600 text-white border-sky-400 ring-4 ring-sky-100",
      textColor: "text-sky-950",
      label: "Webinar",
      Icon: Video,
    };
  }
  if (text.includes("BOOTCAMP") || text.includes("START")) {
    return {
      cardBg: "bg-gradient-to-r from-pink-100/90 via-rose-50 to-pink-100/80",
      cardBorder: "border-[1.5px] border-pink-400/90",
      cardShadow: "shadow-[4px_-4px_0px_0px_#FBCFE8]",
      badgeCls: "bg-pink-600 text-white border-pink-700 shadow-2xs",
      nodeBg: "bg-pink-600 text-white border-pink-400 ring-4 ring-pink-100",
      textColor: "text-pink-950",
      label: "Cohort",
      Icon: Rocket,
    };
  }
  return {
    cardBg: "bg-gradient-to-r from-indigo-100/90 via-blue-50 to-indigo-100/80",
    cardBorder: "border-[1.5px] border-indigo-400/90",
    cardShadow: "shadow-[4px_-4px_0px_0px_#C7D2FE]",
    badgeCls: "bg-indigo-600 text-white border-indigo-700 shadow-2xs",
    nodeBg: "bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-100",
    textColor: "text-indigo-950",
    label: "Update",
    Icon: CheckCircle2,
  };
}

export function ActivitySection({
  entries,
  unavailable,
  emptyTitle = "No activity yet",
  emptyDescription = "Changes and publishing events will appear here.",
}: {
  entries?: TimelineEntry[];
  unavailable?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  hideBadges?: boolean;
}) {
  if (unavailable) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        <AlertTriangle size={14} /> Temporarily unavailable — try again shortly.
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="relative w-full pl-10 sm:pl-12 space-y-4 my-2">
      {/* Dashed Vertical Connecting Line */}
      <div className="absolute left-[19px] sm:left-[23px] top-4 bottom-4 w-0 border-l-2 border-dashed border-indigo-300 pointer-events-none" />

      {entries.map((entry) => {
        const theme = getActivityTheme(entry.type, entry.title);
        const IconComponent = theme.Icon;
        const titleText = cleanActivityTitle(entry.title);

        return (
          <div key={entry.id} className="relative group">
            {/* Left Circular Icon Node outside the card */}
            <div className={`absolute -left-[40px] sm:-left-[48px] top-4 flex size-9 shrink-0 items-center justify-center rounded-full ${theme.nodeBg} shadow-sm z-10 transition-transform duration-200 group-hover:scale-110`}>
              <IconComponent size={16} />
            </div>

            {/* Mirrored Ribbon Right Card */}
            <div
              className={`relative flex flex-col justify-between gap-2.5 p-4 sm:p-5 rounded-2xl ${theme.cardBorder} ${theme.cardBg} ${theme.cardShadow} transition-all duration-200 hover:shadow-md pr-12`}
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, calc(100% - 22px) 50%, 100% 100%, 0% 100%)",
              }}
            >
              {/* Single Top Row: Title + Badge + Action By + Timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  <h4 className={`text-xs sm:text-sm font-black tracking-tight truncate ${theme.textColor}`}>
                    {titleText}
                  </h4>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${theme.badgeCls}`}>
                    {theme.label}
                  </span>
                  <span className="text-slate-300">·</span>
                  {/* Action by author added to the same row */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <div className="grid size-5 place-items-center rounded-full bg-slate-900 text-white font-extrabold text-[9px]">
                      {entry.actorName ? entry.actorName.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span className="text-[11px]">
                      Action by: <strong className="text-slate-900 font-black">{entry.actorName}</strong>
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0">
                  <Clock size={12} />
                  {new Date(entry.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              {/* Subtitle / Description */}
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                "{titleText}" was updated by <span className="font-extrabold text-slate-800">{entry.actorName}</span>.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
