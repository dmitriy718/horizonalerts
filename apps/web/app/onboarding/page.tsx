"use client";
import { OnboardingWizard } from "../components/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">Setup Your Profile</h1>
        <p className="mb-12 text-slate-400">Help us tailor the algorithm to your risk profile.</p>
        <OnboardingWizard />
      </div>
    </div>
  );
}