"use client";
import { useEffect, useRef, memo } from "react";

interface MiniChartProps {
  symbol: string;
  colorTheme?: "dark" | "light";
}

function MiniChartComponent({ symbol, colorTheme = "dark" }: MiniChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "dateRange": "1D",
      "colorTheme": colorTheme,
      "isTransparent": true,
      "autosize": true,
      "largeChartUrl": ""
    });

    container.current.appendChild(script);
  }, [symbol, colorTheme]);

  return (
    <div className="h-24 w-full overflow-hidden rounded-lg opacity-80 hover:opacity-100 transition-opacity" ref={container}>
      <div className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}

export const MiniChart = memo(MiniChartComponent);
