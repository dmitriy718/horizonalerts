"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

const steps = [
  {
    id: "experience",
    question: "What is your trading experience?",
    options: [
      { label: "Beginner", desc: "I'm just starting out." },
      { label: "Intermediate", desc: "I understand the basics (calls, puts)." },
      { label: "Advanced", desc: "I trade full-time or professionally." },
    ],
  },
  {
    id: "style",
    question: "What is your preferred trading style?",
    options: [
      { label: "Day Trading", desc: "In and out same day. High action." },
      { label: "Swing Trading", desc: "Holding for days/weeks. Balanced." },
      { label: "Investing", desc: "Long term wealth building." },
    ],
  },
  {
    id: "risk",
    question: "How do you manage risk?",
    options: [
      { label: "Conservative", desc: "Preservation first. 1% risk per trade." },
      { label: "Aggressive", desc: "Growth first. I want big runners." },
      { label: "Degen", desc: "YOLO. (Not recommended, but we support you)." },
    ],
  },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSelect = (option: string) => {
    setSelections({ ...selections, [steps[step].id]: option });
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Complete
      console.log("Wizard Complete:", selections);
      window.location.href = "/dashboard"; // Or trigger profile update
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex justify-between">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i <= step ? "bg-cyan-500 text-black" : "bg-white/10 text-slate-500"
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">{s.id}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-2xl p-8"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">{steps[step].question}</h2>
          <div className="grid gap-4">
            {steps[step].options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.label)}
                className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-cyan-500/50"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-cyan-400">{opt.label}</div>
                  <div className="text-sm text-slate-400">{opt.desc}</div>
                </div>
                <ChevronRight className="text-slate-600 opacity-0 transition-all group-hover:opacity-100 group-hover:text-cyan-400" />
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
