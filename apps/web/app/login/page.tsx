"use client";

import { useState } from "react";
import posthog from "posthog-js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";

export default function LoginPage() {
  const auth = getFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  if (!auth) {
    return (
      <div className="glass rounded-xl p-6 text-sm text-slate-300">
        Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.
      </div>
    );
  }

  const handleLogin = async () => {
    setStatus("Signing in...");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const verified = result.user.emailVerified;
      posthog.capture("login_success", { verified });
      setStatus(
        verified
          ? "Signed in. Email verified."
          : "Signed in. Please verify your email."
      );
    } catch (error: any) {
      setStatus(error?.message || "Sign-in failed.");
    }
  };

  const handleRegister = async () => {
    setStatus("Creating account...");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      posthog.capture("signup_success");
      setStatus("Account created. Check your email to verify.");
    } catch (error: any) {
      setStatus(error?.message || "Sign-up failed.");
    }
  };

  const handleResend = async () => {
    if (!auth.currentUser) {
      setStatus("Sign in first.");
      return;
    }
    await sendEmailVerification(auth.currentUser);
    setStatus("Verification email sent.");
  };

  const handleReset = async () => {
    if (!email) {
      setStatus("Enter your email first.");
      return;
    }
    await sendPasswordResetEmail(auth, email);
    setStatus("Password reset email sent.");
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setStatus("Signed out.");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl font-semibold text-white">Sign in</h1>
      <div className="glass space-y-4 rounded-xl p-6">
        <label className="block text-sm text-slate-300">
          Email
          <input
            className="mt-2 w-full rounded-md bg-slate-900 px-3 py-2 text-slate-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            className="mt-2 w-full rounded-md bg-slate-900 px-3 py-2 text-slate-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="flex gap-3">
          <button
            className="rounded-md bg-horizon-500 px-4 py-2 text-sm font-semibold text-white"
            onClick={handleLogin}
          >
            Sign in
          </button>
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200"
            onClick={handleRegister}
          >
            Create account
          </button>
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
        <div className="flex gap-3 text-xs text-slate-300">
          <button onClick={handleResend} className="underline">
            Resend verification
          </button>
          <button onClick={handleReset} className="underline">
            Forgot password
          </button>
        </div>
        {status && <div className="text-xs text-slate-400">{status}</div>}
      </div>
    </div>
  );
}
