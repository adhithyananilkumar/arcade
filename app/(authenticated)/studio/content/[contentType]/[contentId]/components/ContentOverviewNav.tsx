import type { Capability } from "../lib/capabilities";
import { CAPABILITY_LABEL } from "../lib/capabilities";

export type OverviewTab = "OVERVIEW" | Capability;

export function ContentOverviewNav({
  capabilities,
  activeTab,
  onChange,
}: {
  capabilities: Capability[];
  activeTab: OverviewTab;
  onChange: (tab: OverviewTab) => void;
}) {
  const tabs: { id: OverviewTab; label: string }[] = [
    { id: "OVERVIEW", label: "Overview" },
    ...capabilities.map((c) => ({ id: c, label: CAPABILITY_LABEL[c] })),
  ];

  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-slate-200/80 px-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === tab.id
              ? "border-[#14142b] text-[#14142b]"
              : "border-transparent text-slate-500 hover:text-[#14142b]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
