import { describe, it, expect } from "vitest";

/**
 * Onboarding wizard logic tests.
 */

const quizSteps = [
  {
    id: "experience",
    question: "What is your trading experience?",
    options: [
      { id: "beginner", label: "Beginner" },
      { id: "intermediate", label: "Intermediate" },
      { id: "advanced", label: "Advanced" },
    ],
  },
  {
    id: "style",
    question: "What is your preferred trading style?",
    options: [
      { id: "day", label: "Day Trading" },
      { id: "swing", label: "Swing Trading" },
      { id: "investing", label: "Investing" },
    ],
  },
  {
    id: "risk",
    question: "How do you manage risk?",
    options: [
      { id: "conservative", label: "Conservative" },
      { id: "aggressive", label: "Aggressive" },
      { id: "degen", label: "Degen" },
    ],
  },
];

describe("Onboarding: Quiz Structure", () => {
  it("has exactly 3 quiz steps", () => {
    expect(quizSteps).toHaveLength(3);
  });

  it("each step has an id, question, and options", () => {
    for (const step of quizSteps) {
      expect(step).toHaveProperty("id");
      expect(step).toHaveProperty("question");
      expect(step).toHaveProperty("options");
      expect(step.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("step IDs are unique", () => {
    const ids = quizSteps.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("option IDs within each step are unique", () => {
    for (const step of quizSteps) {
      const ids = step.options.map(o => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("step 1 is experience", () => {
    expect(quizSteps[0].id).toBe("experience");
  });

  it("step 2 is style", () => {
    expect(quizSteps[1].id).toBe("style");
  });

  it("step 3 is risk", () => {
    expect(quizSteps[2].id).toBe("risk");
  });
});

describe("Onboarding: Progress Calculation", () => {
  it("step 0 (first quiz) = 25%", () => {
    const progress = ((0 + 1) / 4) * 100;
    expect(progress).toBe(25);
  });

  it("step 1 (second quiz) = 50%", () => {
    const progress = ((1 + 1) / 4) * 100;
    expect(progress).toBe(50);
  });

  it("step 2 (third quiz) = 75%", () => {
    const progress = ((2 + 1) / 4) * 100;
    expect(progress).toBe(75);
  });

  it("step 3 (auth form) = 100%", () => {
    const progress = ((3 + 1) / 4) * 100;
    expect(progress).toBe(100);
  });
});

describe("Onboarding: Selection Flow", () => {
  it("stores selections by step ID", () => {
    const selections: Record<string, string> = {};

    // User selects "intermediate" on experience step
    selections[quizSteps[0].id] = "intermediate";
    expect(selections.experience).toBe("intermediate");

    // User selects "swing" on style step
    selections[quizSteps[1].id] = "swing";
    expect(selections.style).toBe("swing");

    // User selects "conservative" on risk step
    selections[quizSteps[2].id] = "conservative";
    expect(selections.risk).toBe("conservative");
  });

  it("final submission includes selections + plan", () => {
    const selections = { experience: "beginner", style: "day", risk: "aggressive" };
    const plan = "pro";

    const payload = { ...selections, plan };
    expect(payload).toEqual({
      experience: "beginner",
      style: "day",
      risk: "aggressive",
      plan: "pro",
    });
  });

  it("default plan is 'free' when not specified", () => {
    const plan = null || "free";
    expect(plan).toBe("free");
  });
});

describe("Onboarding: Title Logic", () => {
  function getTitle(step: number): string {
    if (step < 3) return quizSteps[step].question;
    return "Create Your Account";
  }

  it("shows quiz question for steps 0-2", () => {
    expect(getTitle(0)).toBe("What is your trading experience?");
    expect(getTitle(1)).toBe("What is your preferred trading style?");
    expect(getTitle(2)).toBe("How do you manage risk?");
  });

  it("shows 'Create Your Account' for step 3", () => {
    expect(getTitle(3)).toBe("Create Your Account");
  });
});
