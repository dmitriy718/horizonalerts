"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "../lib/firebase";

const questions = [
  { id: "style", label: "Trading style", options: ["Day", "Swing", "Investor"] },
  { id: "risk", label: "Risk budget", options: ["Low", "Medium", "High"] },
  { id: "intent", label: "Primary intent", options: ["Income", "Growth", "Preservation"] },
  { id: "time", label: "Typical hold time", options: ["Minutes", "Days", "Weeks"] },
  { id: "market", label: "Markets", options: ["US", "Canada", "Crypto"] },
  { id: "vol", label: "Volatility tolerance", options: ["Low", "Balanced", "Aggressive"] }
];

export default function OnboardingPage() {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>("");

  const handleSave = async () => {
    setStatus("");
    if (!auth?.currentUser || !db) {
      setStatus("Please sign in first.");
      return;
    }
    if (!auth.currentUser.emailVerified) {
      setStatus("Verify your email before saving.");
      return;
    }

    const uid = auth.currentUser.uid;
    await setDoc(
      doc(db, "users", uid),
      {
        email: auth.currentUser.email,
        verifiedEmail: true,
        onboardingComplete: true,
        answers,
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );

    posthog.capture("onboarding_completed", { uid });
    setStatus("Saved.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold text-white">Onboarding</h1>
      <div className="glass space-y-5 rounded-xl p-6">
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <div className="text-sm font-semibold text-slate-200">{q.label}</div>
            <div className="flex flex-wrap gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  className={`rounded-md border px-3 py-2 text-xs ${
                    answers[q.id] === option
                      ? "border-horizon-500 text-white"
                      : "border-slate-700 text-slate-300"
                  }`}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: option }))
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          className="rounded-md bg-horizon-500 px-4 py-2 text-sm font-semibold text-white"
          onClick={handleSave}
        >
          Save profile
        </button>
        {status ? <div className="text-xs text-slate-400">{status}</div> : null}
      </div>
    </div>
  );
}
