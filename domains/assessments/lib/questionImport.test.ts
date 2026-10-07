import { describe, expect, it } from "vitest";
import { parseQuestionImport, QUESTION_IMPORT_EXAMPLE } from "./questionImport";

describe("parseQuestionImport", () => {
  it("accepts the published example unchanged", () => {
    const r = parseQuestionImport(QUESTION_IMPORT_EXAMPLE);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.questionCount).toBe(4);
    expect(r.sections.map((s) => s.title)).toEqual(["Algebra", "General"]);
    const [single, multiple] = r.sections[0].questions;
    expect(single).toMatchObject({ type: "SINGLE", difficulty: "EASY", points: 1, tags: ["arithmetic"] });
    expect(multiple.options.filter((o) => o.correct).map((o) => o.text)).toEqual(["2", "5"]);
    const [tf, sentence] = r.sections[1].questions;
    expect(tf.options).toEqual([
      { text: "True", correct: true },
      { text: "False", correct: false },
    ]);
    expect(sentence).toMatchObject({ type: "SENTENCE", points: 5, options: [] });
    expect(sentence.prompt.type).toBe("doc");
  });

  it("accepts a bare question list as an untitled section, with lenient spelling", () => {
    const r = parseQuestionImport(
      JSON.stringify([{ type: "mcq", difficulty: "hard", prompt: "Q", options: ["a", "b"], answer: "B" }])
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sections[0].title).toBeNull();
    expect(r.sections[0].questions[0]).toMatchObject({ type: "SINGLE", difficulty: "HARD" });
    expect(r.sections[0].questions[0].options[1].correct).toBe(true);
  });

  it("merges sections that share a title", () => {
    const q = { type: "TRUE_FALSE", prompt: "Q", answer: false };
    const r = parseQuestionImport(
      JSON.stringify({ sections: [{ title: "A", questions: [q] }, { title: "a", questions: [q, q] }] })
    );
    expect(r.ok && r.sections.length === 1 && r.sections[0].questions.length === 3).toBe(true);
  });

  it("reports every problem with its location", () => {
    const r = parseQuestionImport(
      JSON.stringify({
        sections: [
          {
            title: "S",
            questions: [
              { type: "ESSAY", prompt: "x" },
              { type: "SINGLE", prompt: "x", options: ["a", "b"], answer: ["a", "b"] },
              { type: "SINGLE", prompt: "", options: ["a", "b"], answer: "a" },
              { type: "MULTIPLE", prompt: "x", options: ["a", "b"], answer: "c" },
            ],
          },
        ],
      })
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toHaveLength(4);
    expect(r.errors[0]).toContain('"S" › Question 1');
    expect(r.errors[1]).toContain("exactly one correct");
  });

  it("rejects invalid JSON and empty input", () => {
    expect(parseQuestionImport("{ nope").ok).toBe(false);
    expect(parseQuestionImport('{"sections": []}').ok).toBe(false);
  });
});
