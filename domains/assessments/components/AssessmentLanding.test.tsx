import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssessmentLanding } from "./AssessmentLanding";
import type { AssessmentLandingResponse } from "../types";

vi.mock("@/domains/learning", () => ({
  TiptapContentView: ({ body }: { body: string }) => <div>{body}</div>,
}));

function mockLanding(
  overrides: Partial<AssessmentLandingResponse> = {}
): AssessmentLandingResponse {
  return {
    examId: "exam-1",
    title: "Introduction to Microservices Quiz",
    purpose: "Module assessment",
    instructions: null,
    placementId: "placement-1",
    requiredForCompletion: true,
    planId: "plan-1",
    planName: "Standard Plan",
    planDescription: "Standard 30-min quiz.",
    durationMinutes: 30,
    maxAttempts: 3,
    passPercentage: 70,
    questionCount: 10,
    deliveryMode: "ON_DEMAND",
    opensAt: null,
    closesAt: null,
    openNow: true,
    proctoringRequired: false,
    identityVerificationRequired: false,
    fullscreenRequired: false,
    registrationRequired: false,
    registered: true,
    outcome: "GRADE_CARD",
    attemptsUsed: 0,
    attemptsRemaining: 3,
    openAttemptId: null,
    history: [],
    startable: true,
    blockedReason: null,
    blockedMessage: null,
    assessmentType: "GRADED_ASSESSMENT",
    badgeName: null,
    gradingPolicy: "HIGHEST_SCORE",
    latestAttempt: null,
    bestAttempt: null,
    passed: null,
    score: null,
    ...overrides,
  };
}

describe("AssessmentLanding", () => {
  it("renders State A (Never Attempted) when history is empty", () => {
    const landing = mockLanding({ history: [], attemptsUsed: 0 });
    render(<AssessmentLanding landing={landing} />);

    expect(screen.getByText("Start assessment")).toBeDefined();
    expect(screen.getByText("Pass mark")).toBeDefined();
    expect(screen.getByText("70%")).toBeDefined();
    expect(screen.getByText("Duration")).toBeDefined();
    expect(screen.getByText("30 min")).toBeDefined();
    expect(screen.getByText("0 of 3")).toBeDefined();
    expect(screen.queryByText("You passed!")).toBeNull();
    expect(screen.queryByText("Not passed yet")).toBeNull();
  });

  it("renders State B (Attempted - Passed) with score, threshold and action buttons", () => {
    const onStart = vi.fn();
    const onViewGradeCard = vi.fn();
    const onNextItem = vi.fn();

    const landing = mockLanding({
      attemptsUsed: 1,
      attemptsRemaining: 2,
      passed: true,
      score: 85,
      latestAttempt: {
        attemptId: "att-1",
        attemptNumber: 1,
        status: "SUBMITTED",
        submittedAt: "2026-09-22T10:00:00Z",
        percentage: 85,
        passed: true,
        awaitingReview: false,
        gradeCardId: "card-1",
      },
      bestAttempt: {
        attemptId: "att-1",
        attemptNumber: 1,
        status: "SUBMITTED",
        submittedAt: "2026-09-22T10:00:00Z",
        percentage: 85,
        passed: true,
        awaitingReview: false,
        gradeCardId: "card-1",
      },
      history: [
        {
          attemptId: "att-1",
          attemptNumber: 1,
          status: "SUBMITTED",
          submittedAt: "2026-09-22T10:00:00Z",
          percentage: 85,
          passed: true,
          awaitingReview: false,
          gradeCardId: "card-1",
        },
      ],
    });

    render(
      <AssessmentLanding
        landing={landing}
        onStart={onStart}
        onViewGradeCard={onViewGradeCard}
        onNextItem={onNextItem}
      />
    );

    // Header & Badge
    expect(screen.getByText("Graded Assessment")).toBeDefined();
    expect(screen.getByText("Introduction to Microservices Quiz")).toBeDefined();

    // Result Card
    expect(screen.getByText("You passed!")).toBeDefined();
    expect(screen.getAllByText("85%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("To pass you need a grade of at least 70%.")).toBeDefined();
    expect(screen.getByText("What to expect")).toBeDefined();
    expect(screen.getByText("3 attempts allowed")).toBeDefined();
    expect(screen.getByText("2 remaining")).toBeDefined();

    // Actions
    const nextButton = screen.getByText("Go to next item");
    expect(nextButton).toBeDefined();
    fireEvent.click(nextButton);
    expect(onNextItem).toHaveBeenCalledTimes(1);

    const retakeButton = screen.getByText("Retake assessment");
    expect(retakeButton).toBeDefined();

    // Feedback
    const feedbackButtons = screen.getAllByText("View feedback");
    expect(feedbackButtons.length).toBeGreaterThan(0);
    fireEvent.click(feedbackButtons[0]);
    expect(onViewGradeCard).toHaveBeenCalledWith("card-1");
  });

  it("renders State B (Attempted - Failed) with retry action", () => {
    const onStart = vi.fn();

    const landing = mockLanding({
      attemptsUsed: 1,
      attemptsRemaining: 2,
      passed: false,
      score: 60,
      latestAttempt: {
        attemptId: "att-1",
        attemptNumber: 1,
        status: "SUBMITTED",
        submittedAt: "2026-09-22T10:00:00Z",
        percentage: 60,
        passed: false,
        awaitingReview: false,
        gradeCardId: null,
      },
      bestAttempt: {
        attemptId: "att-1",
        attemptNumber: 1,
        status: "SUBMITTED",
        submittedAt: "2026-09-22T10:00:00Z",
        percentage: 60,
        passed: false,
        awaitingReview: false,
        gradeCardId: null,
      },
      history: [
        {
          attemptId: "att-1",
          attemptNumber: 1,
          status: "SUBMITTED",
          submittedAt: "2026-09-22T10:00:00Z",
          percentage: 60,
          passed: false,
          awaitingReview: false,
          gradeCardId: null,
        },
      ],
    });

    render(<AssessmentLanding landing={landing} onStart={onStart} />);

    expect(screen.getByText("Not passed yet")).toBeDefined();
    expect(screen.getAllByText("60%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Try again")).toBeDefined();
  });

  it("renders State B (Attempts Exhausted) when no remaining attempts", () => {
    const landing = mockLanding({
      attemptsUsed: 3,
      attemptsRemaining: 0,
      startable: false,
      blockedReason: "ATTEMPTS_EXHAUSTED",
      blockedMessage: "You've used all 3 attempts.",
      passed: false,
      score: 55,
      history: [
        {
          attemptId: "att-3",
          attemptNumber: 3,
          status: "SUBMITTED",
          submittedAt: "2026-09-22T12:00:00Z",
          percentage: 55,
          passed: false,
          awaitingReview: false,
          gradeCardId: null,
        },
      ],
    });

    render(<AssessmentLanding landing={landing} />);

    expect(screen.getByText("You've used all 3 attempts.")).toBeDefined();
    expect(screen.queryByText("Try again")).toBeNull();
    expect(screen.queryByText("Start assessment")).toBeNull();
    expect(screen.getByText("All attempts used")).toBeDefined();
  });

  it("renders Badge Exam styling when assessmentType is BADGE_EXAM", () => {
    const landing = mockLanding({
      assessmentType: "BADGE_EXAM",
      badgeName: "Cloud Specialist Badge",
      history: [
        {
          attemptId: "att-1",
          attemptNumber: 1,
          status: "SUBMITTED",
          submittedAt: "2026-09-22T10:00:00Z",
          percentage: 90,
          passed: true,
          awaitingReview: false,
          gradeCardId: "card-1",
        },
      ],
    });

    render(<AssessmentLanding landing={landing} />);

    expect(screen.getByText("Badge Exam")).toBeDefined();
    expect(screen.getByText("Cloud Specialist Badge")).toBeDefined();
  });
});
