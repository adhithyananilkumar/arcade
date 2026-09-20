import { describe, expect, it } from "vitest";
import { isPlanPublishable, planReadiness } from "./planReadiness";
import { buildQuestionSearchParams } from "../api";
import type { ExamPlanValidationResponse } from "../types";

function validation(
  overrides: Partial<ExamPlanValidationResponse> = {}
): ExamPlanValidationResponse {
  return {
    ok: true,
    planId: "plan-1",
    totalRequired: 10,
    rules: [
      {
        ruleId: "rule-1",
        sectionId: "sec-1",
        sectionTitle: "Part A",
        sourceLabel: "Java Medium",
        required: 10,
        available: 42,
        ok: true,
      },
    ],
    ...overrides,
  };
}

describe("planReadiness", () => {
  it("reports a satisfiable plan as ready", () => {
    const result = planReadiness(validation());
    expect(result.state).toBe("ready");
    expect(result.message).toContain("10 questions");
    expect(isPlanPublishable(validation())).toBe(true);
  });

  it("treats a plan that selects nothing as empty, not valid", () => {
    // The trap this guards: with no rules, "every rule is satisfied" is vacuously true, and a
    // plan that would hand candidates a blank paper would pass the publish gate.
    const result = planReadiness(validation({ totalRequired: 0, rules: [] }));
    expect(result.state).toBe("empty");
    expect(isPlanPublishable(validation({ totalRequired: 0, rules: [] }))).toBe(false);
  });

  it("names the source when exactly one line is short", () => {
    const result = planReadiness(
      validation({
        rules: [
          {
            ruleId: "rule-1",
            sectionId: "sec-1",
            sectionTitle: "Part A",
            sourceLabel: "Java Hard",
            required: 10,
            available: 7,
            ok: false,
          },
        ],
      })
    );
    expect(result.state).toBe("short");
    expect(result.message).toContain("Java Hard");
    expect(result.message).toContain("7");
    expect(result.message).toContain("10");
  });

  it("counts the lines when several are short", () => {
    const short = (id: string) => ({
      ruleId: id,
      sectionId: "sec-1",
      sectionTitle: "Part A",
      sourceLabel: "Pool",
      required: 10,
      available: 1,
      ok: false,
    });
    const result = planReadiness(validation({ rules: [short("a"), short("b")] }));
    expect(result.state).toBe("short");
    expect(result).toMatchObject({ shortRules: 2 });
  });

  it("is not publishable while any line is short", () => {
    expect(
      isPlanPublishable(
        validation({
          rules: [
            {
              ruleId: "rule-1",
              sectionId: "sec-1",
              sectionTitle: "Part A",
              sourceLabel: "Pool",
              required: 10,
              available: 3,
              ok: false,
            },
          ],
        })
      )
    ).toBe(false);
  });
});

describe("buildQuestionSearchParams", () => {
  it("always pages, so a large bank is never fetched whole", () => {
    const params = buildQuestionSearchParams();
    expect(params.get("offset")).toBe("0");
    expect(params.get("limit")).toBe("25");
  });

  it("repeats a key per facet value rather than joining them", () => {
    const params = buildQuestionSearchParams({
      difficulties: ["EASY", "HARD"],
      tags: ["oop", "generics, collections"],
    });
    expect(params.getAll("difficulty")).toEqual(["EASY", "HARD"]);
    // A tag containing a comma must survive intact — comma-joining would split it into two.
    expect(params.getAll("tag")).toEqual(["oop", "generics, collections"]);
  });

  it("omits a blank search instead of sending an empty filter", () => {
    expect(buildQuestionSearchParams({ search: "   " }).has("q")).toBe(false);
    expect(buildQuestionSearchParams({ search: "  inheritance " }).get("q")).toBe("inheritance");
  });
});
