import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { StudioEditorBody } from "./StudioShell";

/**
 * Regression coverage for the viewport-contract bug the forensic audit traced: content
 * previously rendered behind the Studio top bar because a workspace's own top-clearance padding
 * lived on a different element than the one that actually scrolled (or, in the exam editor's
 * case, on the *same* element as `overflow-y-auto`, which scrolls the padding itself away).
 *
 * `StudioEditorBody`'s `<main>` is now the single element responsible for both header-safe
 * padding and scroll ownership. These tests pin that down structurally, so a future edit that
 * reintroduces the split (or moves padding onto a child) fails here rather than shipping as a
 * visual bug discovered by a screenshot.
 */
describe("StudioEditorBody viewport contract", () => {
  function renderBody(props: Partial<Parameters<typeof StudioEditorBody>[0]> = {}) {
    const { container } = render(
      <StudioEditorBody sidebarTitle="Test" sidebarTree={<div>tree</div>} {...props}>
        <div data-testid="canvas-content">content</div>
      </StudioEditorBody>
    );
    const main = container.querySelector("main");
    if (!main) throw new Error("StudioEditorBody did not render a <main> viewport");
    return main;
  }

  it("puts scroll ownership and header-safe padding on the same element", () => {
    const main = renderBody();
    // Both properties must live on `<main>` together — this is the exact split (padding on one
    // element, overflow-y-auto on a differently-scrolled one) that let exam content scroll up
    // behind the header.
    expect(main.className).toContain("overflow-y-auto");
    expect(main.className).toContain("pt-20");
  });

  it("clears the floating rich-text toolbar by default", () => {
    // Every editor render mounts ArcadeEditor's toolbar in its steady state; the default must
    // match that, not the leaner "no editor mounted" offset.
    const main = renderBody();
    expect(main.className).toContain("pt-20");
    expect(main.className).not.toContain("pt-6");
  });

  it("uses the smaller offset only when the caller declares no toolbar is mounted", () => {
    const main = renderBody({ toolbarClearance: false });
    expect(main.className).toContain("pt-6");
    expect(main.className).not.toContain("pt-20");
  });

  it("renders workspace content inside the single header-safe scroll region", () => {
    const main = renderBody();
    expect(main.querySelector('[data-testid="canvas-content"]')).not.toBeNull();
  });
});
