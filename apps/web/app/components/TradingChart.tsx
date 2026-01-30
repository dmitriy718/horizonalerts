"use client";
import { useEffect, useRef, memo } from "react";

interface TradingChartProps {
  symbol: string;
}

function TradingChartComponent({ symbol }: TradingChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clean up previous script if any
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "5",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "8", // Heikin Ashi
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(2, 6, 23, 1)", // Matches our bg-slate-950
      "gridColor": "rgba(255, 255, 255, 0.05)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "calendar": false,
      "studies": [
        "RSI@tv-basicstudies",
        "MACD@tv-basicstudies",
        "MAExp@tv-basicstudies", // EMA
        "MASimple@tv-basicstudies" // SMA
      ],
      "hide_volume": true,
      "support_host": "https://www.tradingview.com",
      "allow_symbol_change": true, // Let them change it if they want
      "extended_hours": true
    });

    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl" ref={container}>
      <div className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}

export const TradingChart = memo(TradingChartComponent);
