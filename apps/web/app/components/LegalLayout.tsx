import Link from "next/link";
import { ReactNode } from "react";

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
  lastUpdated: string;
}

export function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="relative min-h-screen pb-20 pt-10">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-2">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Legal Center</p>
              {[
                { name: "Terms of Service", href: "/terms" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Cookie Policy", href: "/cookies" },
                { name: "Trust & Safety", href: "/trust-safety" },
                { name: "DMARC / Email", href: "/dmarc" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-4 py-2 text-sm transition-all ${
                    title === link.name 
                      ? "bg-blue-500/10 text-blue-400 font-medium" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main>
            <div className="glass-card overflow-hidden rounded-2xl p-8 md:p-12">
              <header className="mb-10 border-b border-white/5 pb-8">
                <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>
                <p className="mt-4 text-sm text-slate-400">Last Updated: <span className="text-blue-400">{lastUpdated}</span></p>
              </header>
              <div className="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300">
                {children}
              </div>
            </div>
            
            {/* Mobile Nav Footer */}
            <div className="mt-8 flex flex-wrap gap-4 lg:hidden">
              <Link href="/terms" className="text-xs text-slate-500 underline">Terms</Link>
              <Link href="/privacy" className="text-xs text-slate-500 underline">Privacy</Link>
              <Link href="/cookies" className="text-xs text-slate-500 underline">Cookies</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
