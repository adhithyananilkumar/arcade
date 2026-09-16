import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression coverage for "there is exactly ONE Studio top-bar implementation, and Studio Core
 * stays domain-neutral." Static source-text audits, like `ContentEditorRuntime.test.tsx` — the
 * canonical top bar's actual data flow needs a live backend bootstrap to render, so these pin the
 * architectural invariants (single implementation, no per-workspace duplicates, no layer leaks)
 * that a screenshot comparison can't catch and that fail loudly if reintroduced.
 */

const STUDIO_ROOT = path.resolve(__dirname, "..");

function read(relPath: string): string {
  return fs.readFileSync(path.join(STUDIO_ROOT, relPath), "utf-8");
}

function listFiles(dir: string, exts = [".ts", ".tsx"]): string[] {
  const abs = path.join(STUDIO_ROOT, dir);
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(rel, exts));
    else if (exts.includes(path.extname(entry.name)) && !entry.name.endsWith(".test.tsx")) out.push(rel);
  }
  return out;
}

describe("Canonical Studio top bar — single implementation", () => {
  it("StudioEditorTopBar is defined exactly once, in studio/core/StudioShell.tsx", () => {
    const allFiles = [...listFiles("core"), ...listFiles("workspaces")];
    const definitions = allFiles.filter((f) => /export function StudioEditorTopBar\b/.test(read(f)));
    expect(definitions).toEqual([path.join("core", "StudioShell.tsx")]);
  });

  it("CourseWorkspace (via ContentEditorRuntime) renders the canonical StudioEditorTopBar", () => {
    const runtime = read(path.join("workspaces", "content", "ContentEditorRuntime.tsx"));
    expect(runtime).toMatch(/<StudioEditorTopBar\b/);
    expect(runtime).toMatch(/import\s*{[^}]*StudioEditorTopBar[^}]*}\s*from\s*["']@\/apps\/creator\/studio\/core\/StudioShell["']/);
  });

  it("ExamWorkspace renders the canonical StudioEditorTopBar, not a bespoke header", () => {
    const exam = read(path.join("workspaces", "exam", "ExamWorkspace.tsx"));
    expect(exam).toMatch(/<StudioEditorTopBar\b/);
    expect(exam).toMatch(/import\s*{[^}]*StudioEditorTopBar[^}]*}\s*from\s*["']@\/apps\/creator\/studio\/core\/StudioShell["']/);
  });

  it("no file under workspaces/ defines its own TopBar/HeaderActions component", () => {
    const workspaceFiles = listFiles("workspaces");
    for (const file of workspaceFiles) {
      const content = read(file);
      expect(content, `${file} must not define its own top-bar component`).not.toMatch(
        /export function \w*(TopBar|HeaderActions)\b/
      );
    }
  });

  it("EventWorkspace supplies its actions through headerExtras composition, not a header of its own", () => {
    const event = read(path.join("workspaces", "event", "EventWorkspace.tsx"));
    expect(event).not.toMatch(/<StudioEditorTopBar\b/);
    expect(event).toMatch(/headerExtras=/);
  });
});

describe("Canonical Studio top bar — Save/Share/Publish are Studio-owned, not workspace-owned", () => {
  it("StudioEditorTopBar has no generic `actions` escape hatch — Studio owns Save/Presence/Share/Panel/primary-action directly", () => {
    const shell = read(path.join("core", "StudioShell.tsx"));
    // The old free-form ReactNode slot a workspace could use to inject a replacement
    // implementation of any shared control. It must not come back.
    expect(shell).not.toMatch(/actions\?\s*:\s*ReactNode/);
    expect(shell).toMatch(/saveState\?:/);
    expect(shell).toMatch(/primaryAction\?:/);
    expect(shell).toMatch(/share\?:/);
    expect(shell).toMatch(/<StudioSaveStatus\b/);
    expect(shell).toMatch(/<StudioPresenceStack\b/);
    expect(shell).toMatch(/<StudioShareControl\b/);
    expect(shell).toMatch(/<StudioPanelToggle\b/);
    expect(shell).toMatch(/<StudioActionButton\b/);
  });

  it("no workspace passes a generic `actions` prop to StudioEditorTopBar", () => {
    // Bounded to the <StudioEditorTopBar> ... <StudioRightPanel> region specifically — a
    // whole-file check would false-positive on unrelated `actions=` props elsewhere in the same
    // file (e.g. QuestionEditorCard's own `actions` prop, a different component entirely).
    for (const file of listFiles("workspaces")) {
      const content = read(file);
      const start = content.indexOf("<StudioEditorTopBar");
      if (start === -1) continue;
      const end = content.indexOf("<StudioRightPanel", start);
      const block = end === -1 ? content.slice(start) : content.slice(start, end);
      expect(block, `${file} must not pass a free-form actions prop to StudioEditorTopBar`).not.toMatch(
        /\bactions=\{/
      );
    }
  });

  it("StudioSaveStatus is defined exactly once, in studio/core/StudioHeader.tsx", () => {
    const allFiles = [...listFiles("core"), ...listFiles("workspaces")];
    const definitions = allFiles.filter((f) => /export function StudioSaveStatus\b/.test(read(f)));
    expect(definitions).toEqual([path.join("core", "StudioHeader.tsx")]);
  });

  it("no workspace defines or imports a save-indicator component of its own for the header", () => {
    for (const file of listFiles("workspaces")) {
      const content = read(file);
      expect(content, `${file} must not define its own SaveIndicator`).not.toMatch(
        /function SaveIndicator\b/
      );
      expect(content, `${file} must not import a domain-specific SaveIndicator`).not.toMatch(
        /import\s*{[^}]*\bSaveIndicator\b[^}]*}/
      );
    }
  });

  it("ExamWorkspace feeds saveState/collaborators/share/primaryAction as data, not JSX, into the top bar", () => {
    const exam = read(path.join("workspaces", "exam", "ExamWorkspace.tsx"));
    expect(exam).toMatch(/saveState=\{saveState\}/);
    expect(exam).toMatch(/primaryAction=\{/);
    expect(exam).not.toMatch(/<SaveIndicator\b/);
    expect(exam).not.toMatch(/<StudioActionButton\b/); // rendered by StudioEditorTopBar itself now
  });

  it("ContentEditorRuntime (Course/Event) feeds primaryAction/share as data, not JSX, into the top bar", () => {
    const runtime = read(path.join("workspaces", "content", "ContentEditorRuntime.tsx"));
    expect(runtime).toMatch(/primaryAction=\{/);
    expect(runtime).not.toMatch(/<StudioActionButton\b/);
    expect(runtime).not.toMatch(/<StudioShareControl\b/);
    expect(runtime).not.toMatch(/<StudioPresenceStack\b/);
  });
});

describe("Studio Core domain neutrality (top bar + right panel)", () => {
  it("no file under studio/core imports from an app/ route module", () => {
    for (const file of listFiles("core")) {
      const content = read(file);
      expect(content, `${file} must not import from app/`).not.toMatch(/from\s*["']@\/app\//);
    }
  });

  it("no file under studio/core mentions Course/Event/Exam-specific API paths", () => {
    for (const file of listFiles("core")) {
      const content = read(file);
      expect(content, `${file} must not hardcode a content-type-specific endpoint`).not.toMatch(
        /\/api\/v1\/(courses|events|exams)\//
      );
    }
  });

  it("StudioRightPanel/useStudioPanel use a Studio-owned collaborator type, not an Event-specific one", () => {
    const panel = read(path.join("core", "StudioRightPanel.tsx"));
    const hook = read(path.join("core", "useStudioPanel.ts"));
    expect(panel + hook).not.toMatch(/events\/api\/collaboration/);
    expect(panel).toMatch(/StudioCollaborator/);
    expect(panel).not.toMatch(/eventCollaborators/);
    expect(hook).not.toMatch(/eventCollaborators/);
  });
});
