"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
import { ChevronRight, Mail, Lock, User, MapPin, Calendar, Loader2 } from "lucide-react";
import { useSignup } from "../hooks/useSignup";

function AuthContent() {
  const auth = getFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup, loading: signupLoading, error: signupError } = useSignup();

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
    zipCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (mode === "signup") {
      await signup(formData);
      return;
    }

    // Login Logic
    setLoading(true);
    if (!auth) {
      setError("Auth not initialized");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const displayLoading = loading || signupLoading;
  const displayError = error || signupError;

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 p-6"
      >
        <div className="glass-card rounded-3xl p-8 md:p-10 border-t border-white/10 shadow-2xl shadow-cyan-900/20 backdrop-blur-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === "login" ? "Welcome Back" : "Join the Elite"}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === "login" 
                ? "Access your institutional dashboard." 
                : "Begin your journey to professional trading."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input
                          name="firstName"
                          required
                          placeholder="John"
                          className="w-full rounded-xl bg-slate-900/50 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-600"
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                      <input
                        name="lastName"
                        required
                        placeholder="Doe"
                        className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-600"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input
                          name="age"
                          type="number"
                          required
                          placeholder="25"
                          className="w-full rounded-xl bg-slate-900/50 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-600"
                          value={formData.age}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zip Code</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input
                          name="zipCode"
                          required
                          placeholder="10001"
                          className="w-full rounded-xl bg-slate-900/50 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-600"
                          value={formData.zipCode}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="trader@example.com"
                  className="w-full rounded-xl bg-slate-900/50 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-600"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-900/50 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-600"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {displayError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={displayLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6 group"
            >
              {displayLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              {mode === "login" ? "Don't have an account?" : "Already a member?"}{" "}
              <button 
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="text-cyan-400 font-bold hover:underline"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>}>
      <AuthContent />
    </Suspense>
  );
}