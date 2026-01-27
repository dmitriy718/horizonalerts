"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Check, ChevronRight, BarChart3, Zap, ShieldAlert, CreditCard, Lock, Mail } from "lucide-react";

// Types
interface Option {
  id: string;
  label: string;
  desc: string;
  icon?: React.ReactNode | string;
  color?: string;
}

const quizSteps: { id: string; question: string; options: Option[] }[] = [
  {
    id: "experience",
    question: "What is your trading experience?",
    options: [
      { id: "beginner", label: "Beginner", desc: "I'm just starting out.", icon: "🌱" },
      { id: "intermediate", label: "Intermediate", desc: "I understand the basics (calls, puts).", icon: "🌿" },
      { id: "advanced", label: "Advanced", desc: "I trade full-time or professionally.", icon: "🌳" },
    ],
  },
  {
    id: "style",
    question: "What is your preferred trading style?",
    options: [
      { id: "day", label: "Day Trading", desc: "In and out same day. High action.", icon: <Zap size={20} /> },
      { id: "swing", label: "Swing Trading", desc: "Holding for days/weeks. Balanced.", icon: <BarChart3 size={20} /> },
      { id: "investing", label: "Investing", desc: "Long term wealth building.", icon: <ShieldAlert size={20} /> },
    ],
  },
  {
    id: "risk",
    question: "How do you manage risk?",
    options: [
      { id: "conservative", label: "Conservative", desc: "Preservation first. 1% risk per trade.", color: "text-blue-400", icon: "🛡️" },
      { id: "aggressive", label: "Aggressive", desc: "Growth first. I want big runners.", color: "text-orange-400", icon: "🚀" },
      { id: "degen", label: "Degen", desc: "YOLO. (Not recommended, but we support you).", color: "text-red-500", icon: "🎰" },
    ],
  },
];

export function OnboardingWizard() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Steps: Quiz (0-2) -> Auth (3) -> Payment (4, if pro)
  const totalSteps = plan === "pro" ? 5 : 4;

  const handleQuizSelect = (optionId: string) => {
    setSelections({ ...selections, [quizSteps[step].id]: optionId });
    setTimeout(() => setStep(step + 1), 200);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate Auth
    setTimeout(() => {
      setIsProcessing(false);
      if (plan === "pro") {
        setStep(4); // Go to payment
      } else {
        window.location.href = "/dashboard";
      }
    }, 1000);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate Stripe Processing
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  };

  // Render Logic
  const renderContent = () => {
    // 1. Quiz Steps
    if (step < 3) {
      const currentQuiz = quizSteps[step];
      return (
        <div className="grid gap-4 relative z-10">
          {currentQuiz.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleQuizSelect(opt.id)}
              className="group flex w-full items-center gap-6 rounded-2xl border border-white/5 bg-white/5 p-5 text-left transition-all hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-900/20"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/40 text-xl ${opt.color || "text-cyan-400"}`}>
                {opt.icon}
              </div>
              <div className="flex-1">
                <div className={`text-lg font-bold text-white group-hover:text-cyan-400 transition-colors`}>{opt.label}</div>
                <div className="text-sm text-slate-400 mt-1">{opt.desc}</div>
              </div>
              <ChevronRight className="text-slate-700 opacity-0 transition-all group-hover:opacity-100 group-hover:text-cyan-400 -ml-4 group-hover:ml-0" />
            </button>
          ))}
        </div>
      );
    }

    // 2. Auth Step
    if (step === 3) {
      return (
        <form onSubmit={handleAuthSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input required type="email" className="w-full rounded-xl bg-black/40 border border-white/10 pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="trader@example.com" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Password</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input required type="password" className="w-full rounded-xl bg-black/40 border border-white/10 pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="••••••••" />
              </div>
            </div>
          </div>
          <button disabled={isProcessing} className="w-full btn-primary py-4 text-lg shadow-xl shadow-cyan-500/20">
            {isProcessing ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      );
    }

    // 3. Payment Step (Pro Only)
    if (step === 4) {
      return (
        <form onSubmit={handlePaymentSubmit} className="space-y-6 relative z-10">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-cyan-200">Horizon Pro Subscription</span>
              <span className="font-bold text-white">$49.00 / mo</span>
            </div>
          </div>

          {/* Visual Mock of Stripe Elements */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Card Information</label>
              <div className="relative mt-2 rounded-xl border border-white/10 bg-black/40 p-3 flex items-center gap-3">
                <CreditCard className="text-slate-400" size={20} />
                <input required type="text" className="bg-transparent text-white focus:outline-none flex-1 placeholder:text-slate-600" placeholder="4242 4242 4242 4242" />
                <div className="flex gap-2">
                  <input required type="text" className="w-16 bg-transparent text-white focus:outline-none placeholder:text-slate-600 text-center" placeholder="MM/YY" />
                  <input required type="text" className="w-12 bg-transparent text-white focus:outline-none placeholder:text-slate-600 text-center" placeholder="CVC" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Name on Card</label>
              <input required type="text" className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="Full Name" />
            </div>
          </div>

          <button disabled={isProcessing} className="w-full btn-primary py-4 text-lg shadow-xl shadow-cyan-500/20">
            {isProcessing ? "Processing Payment..." : "Pay $49.00 & Start"}
          </button>
          
          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Lock size={12} /> Secure 256-bit SSL Encrypted Payment
          </p>
        </form>
      );
    }
  };

  const getTitle = () => {
    if (step < 3) return quizSteps[step].question;
    if (step === 3) return "Create Your Account";
    if (step === 4) return "Secure Payment";
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} className={`text-[10px] font-bold uppercase tracking-widest ${i <= step ? "text-cyan-400" : "text-slate-600"}`}>
              {i === 3 ? "Auth" : i === 4 ? "Pay" : `Step ${i + 1}`}
            </span>
          ))}
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-[80px]" />

          <h2 className="mb-8 text-3xl font-bold text-white relative z-10">{getTitle()}</h2>
          
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
