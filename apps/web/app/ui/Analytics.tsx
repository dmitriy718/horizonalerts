"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

export function Analytics() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
    if (!key) {
      return;
    }

    // GDPR: only initialize analytics after explicit consent
    const consent = typeof window !== "undefined" ? localStorage.getItem("horizon_cookie_consent") : null;
    if (consent !== "true") return;

    posthog.init(key, { api_host: host, autocapture: true });
    initialized.current = true;
  }, []);

  return null;
}
