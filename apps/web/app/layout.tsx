import "./globals.css";
import Link from "next/link";
import { DisclaimerBar } from "./ui/DisclaimerBar";
import { Analytics } from "./ui/Analytics";
import { Navbar } from "./components/Navbar";
import { CookieBanner } from "./components/CookieBanner";
import { NewsletterPopup } from "./components/NewsletterPopup";
import { FooterNewsletter } from "./components/FooterNewsletter";
import { AuthProvider } from "./context/auth-context";

import type { Metadata } from "next";

const siteUrl = process.env.PUBLIC_SITE_URL || "https://horizonsvc.com";

export const metadata: Metadata = {
  title: {
    default: "Nova by Horizon | Autonomous AI Trading Bots",
    template: "%s | Nova by Horizon",
  },
  description: "Fully autonomous crypto and stock trading bots powered by AI confluence engines. 12 strategies, real-time risk management. Managed hosting or self-hosted.",
  keywords: ["AI trading bot", "crypto trading bot", "stock trading bot", "algorithmic trading", "automated trading", "trading signals", "trading alerts", "Kraken bot", "Coinbase bot", "options alerts"],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Nova by Horizon",
    title: "Nova by Horizon | Autonomous AI Trading Bots",
    description: "Fully autonomous crypto and stock trading bots powered by AI confluence engines. Managed hosting or self-hosted.",
    url: siteUrl,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Nova by Horizon — Autonomous AI Trading Bots" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova by Horizon | Autonomous AI Trading Bots",
    description: "Fully autonomous crypto and stock trading bots powered by AI confluence engines. Managed hosting or self-hosted.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <AuthProvider>
          <Analytics />
          <CookieBanner />
          <NewsletterPopup />
          <Navbar />
          <main className="mx-auto min-h-screen pt-20">{children}</main>
          <footer className="relative border-t border-white/5 bg-slate-950 py-16 text-sm text-slate-400 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
                    <span className="font-mono text-sm font-black text-white">N</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Nova</span>
                    <span className="text-sm font-semibold text-slate-400">by Horizon</span>
                  </div>
                </div>
                <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                  Autonomous AI trading bots for crypto and stocks. Managed hosting or self-hosted.
                  Real performance, real trades, real risk management.
                </p>
                <div className="flex gap-3 pt-1">
                  <div className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-500">Kraken</div>
                  <div className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-500">Coinbase</div>
                  <div className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-500">Alpaca</div>
                </div>
              </div>
              <div>
                <h4 className="mb-4 font-bold text-white">Platform</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/pricing" className="hover:text-cyan-400">Pricing</Link></li>
                  <li><Link href="/dashboard" className="hover:text-cyan-400">Dashboard</Link></li>
                  <li><Link href="/settings" className="hover:text-cyan-400">Settings</Link></li>
                  <li><Link href="/login" className="hover:text-cyan-400">Login</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-bold text-white">Resources</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/academy" className="hover:text-cyan-400">Academy</Link></li>
                  <li><Link href="/blog" className="hover:text-cyan-400">Blog</Link></li>
                  <li><Link href="/contact" className="hover:text-cyan-400">Support</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-bold text-white">Legal & Trust</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/privacy" className="hover:text-cyan-400">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-cyan-400">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="hover:text-cyan-400">Cookie Policy</Link></li>
                  <li><Link href="/trust-safety" className="hover:text-cyan-400">Trust & Safety</Link></li>
                  <li><Link href="/dmarc" className="hover:text-cyan-400">Email Security</Link></li>
                </ul>
              </div>
            </div>
            <FooterNewsletter />
            <div className="mt-14 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
              <DisclaimerBar />
              <p className="mt-4">&copy; {new Date().getFullYear()} Horizon Services LLC. All rights reserved. <span className="text-slate-700">|</span> Built with precision.</p>
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
