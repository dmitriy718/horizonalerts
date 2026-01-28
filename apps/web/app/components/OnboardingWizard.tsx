"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Check, ChevronRight, BarChart3, Zap, ShieldAlert, CreditCard, Lock, Mail, User, MapPin, Calendar, Loader2 } from "lucide-react";
import { useSignup } from "../hooks/useSignup";

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
  
  // Auth Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    zipCode: "",
    email: "",
    password: ""
  });

  const { signup, loading, error } = useSignup();

  const handleQuizSelect = (optionId: string) => {
    setSelections({ ...selections, [quizSteps[step].id]: optionId });
    setTimeout(() => setStep(step + 1), 200);
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({
      ...formData,
      preferences: { ...selections, plan }
    });
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

    // 2. Auth Step (Final)
    if (step === 3) {
      return (
        <form onSubmit={handleAuthSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input required name="firstName" value={formData.firstName} onChange={handleAuthChange} type="text" className="w-full rounded-xl bg-black/40 border border-white/10 pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="John" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
              <input required name="lastName" value={formData.lastName} onChange={handleAuthChange} type="text" className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="Doe" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Age</label>
              <div className="relative mt-2">
                <Calendar className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input required name="age" value={formData.age} onChange={handleAuthChange} type="number" className="w-full rounded-xl bg-black/40 border border-white/10 pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="25" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Zip Code</label>
              <div className="relative mt-2">
                <MapPin className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input required name="zipCode" value={formData.zipCode} onChange={handleAuthChange} type="text" className="w-full rounded-xl bg-black/40 border border-white/10 pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="10001" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input required name="email" value={formData.email} onChange={handleAuthChange} type="email" className="w-full rounded-xl bg-black/40 border border-white/10 pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="trader@example.com" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Password</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input required name="password" value={formData.password} onChange={handleAuthChange} type="password" className="w-full rounded-xl bg-black/40 border border-white/10 pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="••••••••" />
              </div>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

          <button disabled={loading} className="w-full btn-primary py-4 text-lg shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Create Account & Start"}
          </button>
        </form>
      );
    }
  };

  const getTitle = () => {
    if (step < 3) return quizSteps[step].question;
    return "Create Your Account";
  };

  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            Step {step + 1} of 4
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {step === 3 ? "Final Step" : "Profile Setup"}
          </span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
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