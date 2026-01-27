import "./globals.css";
import Link from "next/link";
import { DisclaimerBar } from "./ui/DisclaimerBar";
import { Analytics } from "./ui/Analytics";

export const metadata = {
  title: "Horizon Services Trade Alerts",
  description: "Members-only, non-execution trade alerts for US, Canada, and optional crypto."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <header className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold text-white">
              Horizon Services
            </Link>
            <nav className="flex gap-4 text-sm text-slate-300">
              <Link href="/pricing">Pricing</Link>
              <Link href="/academy">Academy</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/login">Login</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/onboarding">Onboarding</Link>
              <Link href="/trust-safety">Trust & Safety</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
        </header>
        <DisclaimerBar />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="border-t border-slate-800 py-8 text-sm text-slate-400">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
            <span>Horizon Services. Educational alerts only. No trade execution.</span>
            <div className="flex gap-4">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
