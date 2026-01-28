"use client";

import { useEffect } from "react";
import { getApiBaseUrl } from "../lib/api";

export function TransparencyLogger() {
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/public-feed/candidates`);
        if (res.ok) {
          const data = await res.json();
          console.group("🔍 Horizon AI Transparency Log");
          console.log("Generating signals from the following AI-curated watchlists:");
          console.log("%c Day Trading Candidates:", "color: #22d3ee; font-weight: bold;");
          console.table(data.day);
          console.log("%c Swing Trading Candidates:", "color: #34d399; font-weight: bold;");
          console.table(data.swing);
          console.log("%c Long-Term Investing Candidates:", "color: #8b5cf6; font-weight: bold;");
          console.table(data.invest);
          console.groupEnd();
        }
      } catch (e) {
        // silent fail
      }
    };

    fetchCandidates();
  }, []);

  return null;
}
