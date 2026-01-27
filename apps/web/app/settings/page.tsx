"use client";

import { useEffect, useState } from "react";
import { BillingButtons } from "../ui/BillingButtons";
import { getFirebaseAuth } from "../lib/firebase";
import { getApiBaseUrl } from "../lib/api";

export default function SettingsPage() {
  const auth = getFirebaseAuth();
  const [plan, setPlan] = useState<string>("unknown");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!auth?.currentUser) {
        return;
      }
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${getApiBaseUrl()}/me/entitlement`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setStatus("Failed to load entitlements.");
        return;
      }
      const data = await res.json();
      setPlan(data?.plan || "free");
    };

    load();
  }, [auth]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl font-semibold text-white">Settings</h1>
      <div className="glass space-y-4 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white">Billing</h2>
        <p className="text-sm text-slate-300">
          Manage your subscription and update payment details.
        </p>
        <div className="text-xs text-slate-400">Current plan: {plan}</div>
        {status ? <div className="text-xs text-slate-400">{status}</div> : null}
        <BillingButtons mode="portal" />
      </div>
    </div>
  );
}
