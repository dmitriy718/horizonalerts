"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("horizon_cookie_consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("horizon_cookie_consent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    // In a real implementation, this would disable non-essential tracking
    localStorage.setItem("horizon_cookie_consent", "false");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl shadow-black/50">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-cyan-500/10 p-3 text-cyan-400">
                  <Cookie size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white">We value your privacy</h3>
                  <p className="text-sm text-slate-400 max-w-xl">
                    We use cookies to enhance your trading experience, analyze performance, and ensure security. 
                    We do not sell your data to third parties. By continuing, you agree to our use of cookies.
                    See our <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link> and <Link href="/cookies" className="text-cyan-400 hover:underline">Cookie Policy</Link>.
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-3">
                <button
                  onClick={handleDecline}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
