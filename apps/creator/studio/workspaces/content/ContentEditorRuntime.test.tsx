import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Architectural regression coverage for the Course/Event split.
 *
 * <p>These are not behavioural tests (rendering the runtime needs a live backend for its
 * bootstrap fetch) — they are static assertions on the actual source text, chosen because the
 * whole point of this split was eliminating a specific, countable defect: a single file branching
 * on `contentType` throughout. A future edit that reintroduces that branching, or that has
 * `studio/core` reach into a workspace, fails here rather than being noticed by inspection.
 */

// This test file lives at studio/workspaces/content/ — one level up is studio/workspaces/
// (where course/event/exam/content live), two levels up is studio/ itself (where core/ lives).
const WORKSPACES_ROOT = path.resolve(__dirname, "..");
const STUDIO_ROOT = path.resolve(__dirname, "../..");

function read(relPath: string): string {
  return fs.readFileSync(path.join(WORKSPACES_ROOT, relPath), "utf-8");
}

function readCore(relPath: string): string {
  return fs.readFileSync(path.join(STUDIO_ROOT, relPath), "utf-8");
}

function listFiles(root: string, dir: string, exts = [".ts", ".tsx"]): string[] {
  const abs = path.join(root, dir);
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(root, rel, exts));
    else if (exts.includes(path.extname(entry.name)) && !entry.name.endsWith(".test.tsx")) out.push(rel);
  }
  return out;
}

describe("Course/Event workspace split", () => {
  it("CourseWorkspace and EventWorkspace contain zero contentType branches", () => {
    const course = read("course/CourseWorkspace.tsx");
    const event = read("event/EventWorkspace.tsx");
    expect(course).not.toMatch(/contentType\s*===/);
    expect(event).not.toMatch(/contentType\s*===/);
  });

  it("the shared runtime contains zero contentType branches — Course/Event only differ via props", () => {
    const runtime = read("content/ContentEditorRuntime.tsx");
    expect(runtime).not.toMatch(/contentType\s*===/);
  });

  it("CourseWorkspace never imports EventAdapter, EventWorkspace, or Event-only dialogs", () => {
    const course = read("course/CourseWorkspace.tsx");
    expect(course).not.toMatch(/EventAdapter|EventWorkspace|SessionSettingsDialog/);
  });

  it("EventWorkspace never imports CourseAdapter or CourseWorkspace", () => {
    const event = read("event/EventWorkspace.tsx");
    expect(event).not.toMatch(/CourseAdapter|CourseWorkspace/);
  });
});

describe("Studio Core dependency direction", () => {
  it("no file under studio/core imports from studio/workspaces", () => {
    const coreFiles = listFiles(STUDIO_ROOT, "core");
    expect(coreFiles.length).toBeGreaterThan(0);
    for (const file of coreFiles) {
      const content = readCore(file);
      expect(content, `${file} must not import from studio/workspaces`).not.toMatch(/studio\/workspaces/);
    }
  });

  it("no workspace imports another workspace's internals directly (Exam vs Course/Event)", () => {
    const examFiles = listFiles(WORKSPACES_ROOT, "exam");
    for (const file of examFiles) {
      const content = read(file);
      expect(content, `${file} must not import Course/Event workspace internals`).not.toMatch(
        /workspaces\/(content|course|event)\//
      );
    }

    const contentFiles = [
      ...listFiles(WORKSPACES_ROOT, "content"),
      ...listFiles(WORKSPACES_ROOT, "course"),
      ...listFiles(WORKSPACES_ROOT, "event"),
    ];
    for (const file of contentFiles) {
      const content = read(file);
      expect(content, `${file} must not import Exam workspace internals`).not.toMatch(/workspaces\/exam\//);
    }
  });
});
