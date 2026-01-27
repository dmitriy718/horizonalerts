"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "../lib/firebase";
import { getApiBaseUrl } from "../lib/api";

type Mode = "checkout" | "portal";

export function BillingButtons({ mode }: { mode: Mode }) {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const [status, setStatus] = useState<string>("");

  const handleClick = async () => {
    setStatus("");
    if (!auth?.currentUser) {
      setStatus("Please sign in first.");
      return;
    }
    if (!auth.currentUser.emailVerified) {
      setStatus("Please verify your email to continue.");
      return;
    }
    if (!db) {
      setStatus("Onboarding data unavailable.");
      return;
    }

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const onboardingComplete = Boolean(userDoc.data()?.onboardingComplete);
    if (!onboardingComplete) {
      setStatus("Complete onboarding before upgrading.");
      return;
    }

    const token = await auth.currentUser.getIdToken();
    const endpoint =
      mode === "checkout" ? "/billing/checkout-session" : "/billing/portal-session";
    posthog.capture("billing_initiated", { mode });
    const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      setStatus("Billing request failed.");
      return;
    }

    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    setStatus("Billing session unavailable.");
  };

  const label = mode === "checkout" ? "Start Pro" : "Manage billing";

  return (
    <div className="space-y-2">
      <button
        className="w-full rounded-md bg-horizon-500 px-4 py-2 text-sm font-semibold text-white"
        onClick={handleClick}
      >
        {label}
      </button>
      {status ? <div className="text-xs text-slate-400">{status}</div> : null}
    </div>
  );
}
