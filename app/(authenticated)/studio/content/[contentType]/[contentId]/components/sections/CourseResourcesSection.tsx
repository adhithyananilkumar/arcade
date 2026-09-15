"use client";

import { Download, FileText, FolderArchive, MessageSquare, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function CourseResourcesSection() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Downloadable Course Attachments & Assets */}
      <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/40 via-white to-white p-6 sm:p-7 shadow-[4px_-4px_0px_0px_#A7F3D0] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-1 border-b border-emerald-100 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Download size={18} className="text-emerald-600" />
              Downloadable Course Resources
            </h3>
            <span className="rounded-full border border-emerald-200 bg-emerald-100 text-emerald-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
              3 Files
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Source code repositories, PDF guides, and reference materials
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { name: "Capstone-Project-Starter.zip", size: "14.2 MB", type: "Code Archive", downloads: "1.2k downloads", icon: FolderArchive },
            { name: "System-Architecture-Cheatsheet.pdf", size: "3.8 MB", type: "PDF Guide", downloads: "890 downloads", icon: FileText },
            { name: "API-Security-Best-Practices.pdf", size: "2.4 MB", type: "Reference Doc", downloads: "640 downloads", icon: FileText },
          ].map((file) => {
            const IconComponent = file.icon;
            return (
              <div
                key={file.name}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-emerald-200/80 bg-white hover:bg-emerald-50/40 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <IconComponent size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate">{file.name}</span>
                    <span className="text-[11px] font-medium text-slate-400">{file.type} · {file.size}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 shrink-0">
                  {file.downloads}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Student Q&A & Community Discussion Hub */}
      <div className="rounded-[24px] border-[1.5px] border-amber-400/80 bg-gradient-to-b from-amber-50/40 via-white to-white p-6 sm:p-7 shadow-[4px_-4px_0px_0px_#FDE68A] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-1 border-b border-amber-100 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-600" />
              Student Q&A & Discussion Hub
            </h3>
            <span className="rounded-full border border-amber-300 bg-amber-100 text-amber-900 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider animate-pulse">
              4 Unanswered
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Address student questions and clarify course concepts
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            {
              author: "Alex Morgan",
              question: "How do we handle token expiration during capstone auth flow?",
              time: "2h ago",
              unanswered: true,
            },
            {
              author: "Marcus Vance",
              question: "Recommended deployment target for Spring Boot backend?",
              time: "1d ago",
              unanswered: false,
            },
          ].map((item) => (
            <div
              key={item.question}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-amber-200/80 bg-white hover:bg-amber-50/40 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white font-black text-xs">
                  {item.author.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-slate-900 truncate">{item.question}</span>
                  <span className="text-[11px] font-medium text-slate-400">Asked by {item.author} · {item.time}</span>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl bg-amber-500 text-white px-3 py-1 text-[11px] font-black hover:bg-amber-600 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Reply <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
