"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { sendEmailVerification } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Email verification polling — use stable deps to avoid re-creating interval
  useEffect(() => {
    if (loading || !user || user.emailVerified) return;

    setShowVerificationModal(true);
    const auth = getFirebaseAuth();
    if (!auth) return;

    const interval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        clearInterval(interval);
        return;
      }
      await currentUser.reload();
      if (currentUser.emailVerified) {
        setShowVerificationModal(false);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user?.uid, user?.emailVerified, loading]);

  const handleResend = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser;
    if (currentUser) {
      await sendEmailVerification(currentUser);
      setEmailSent(true);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading Dashboard...</div>;
  if (!user) return null;

  return (
    <>
      <div className={showVerificationModal ? "blur-sm pointer-events-none select-none h-screen overflow-hidden" : ""}>
        {children}
      </div>

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-yellow-500/30 shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-slate-300 mb-6">
              To access your trading dashboard, we need to verify your identity. Please check your inbox for a link.
            </p>
            <button
              onClick={handleResend}
              disabled={emailSent}
              className="btn-primary w-full"
            >
              {emailSent ? "Sent! Check Inbox" : "Resend Verification Email"}
            </button>
            <p className="mt-4 text-xs text-slate-500">
              We are checking verification status automatically...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
