import "./globals.css";
import Link from "next/link";
import { DisclaimerBar } from "./ui/DisclaimerBar";
import { Analytics } from "./ui/Analytics";
import { Navbar } from "./components/Navbar";

export const metadata = {
  title: "Horizon Alerts | Institutional Trade Intelligence",
  description: "Members-only, non-execution trade alerts for US, Canada, and optional crypto."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <Analytics />
        <Navbar />
        <main className="mx-auto min-h-screen pt-20">{children}</main>
        <footer className="border-t border-white/5 bg-slate-950 py-12 text-sm text-slate-400">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Horizon</h3>
                <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                  Institutional-grade signal intelligence for the modern retail trader.
                  Strict non-repainting policy.
                </p>
              </div>
              <div>
                <h4 className="mb-4 font-bold text-white">Platform</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/pricing" className="hover:text-cyan-400">Pricing</Link></li>
                  <li><Link href="/login" className="hover:text-cyan-400">Login</Link></li>
                  <li><Link href="/settings" className="hover:text-cyan-400">Settings</Link></li>
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
            <div className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
              <DisclaimerBar />
              <p className="mt-4">&copy; {new Date().getFullYear()} Horizon Services. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
