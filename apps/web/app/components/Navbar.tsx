"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Logo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* The Shining Horizon Glow (Back) */}
      <div className="absolute -inset-2 rounded-full bg-cyan-500/30 blur-lg animate-pulse-slow" />
      
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" /> {/* Cyan-500 */}
            <stop offset="1" stopColor="#4f46e5" /> {/* Indigo-600 */}
          </linearGradient>
          <radialGradient id="horizonShine" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(20)">
            <stop stopColor="white" stopOpacity="0.6" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Main Box */}
        <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#logoGradient)" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
        
        {/* Horizon Arc Effect */}
        <path d="M2 28 C 2 28, 10 36, 20 36 C 30 36, 38 28, 38 28" stroke="white" strokeOpacity="0.3" strokeWidth="2" fill="none" />
        <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#horizonShine)" style={{ mixBlendMode: 'overlay' }} />

        {/* The 'H' */}
        <text x="20" y="29" fontFamily="monospace" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">H</text>
      </svg>
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setIsOpen(false), [pathname]);

  const navLinks = [
    { name: "Pricing", href: "/pricing" },
    { name: "Academy", href: "/academy" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled || isOpen ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group relative z-50 flex items-center gap-3">
          <Logo />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              Horizon Alerts
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 group-hover:text-cyan-200/70 transition-colors">
              Institutional Order Flow
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white hover:shadow-[0_1px_0_0_white]"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">
            Login
          </Link>
          <Link
            href="/pricing"
            className="btn-primary py-2.5 px-6 text-sm shadow-lg shadow-blue-500/20"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 block rounded-full bg-white/5 p-2 text-white md:hidden hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute inset-0 top-0 w-full bg-slate-950 pt-28 px-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center justify-between border-b border-white/5 pb-4 text-2xl font-semibold text-white active:text-cyan-400"
                  >
                    {link.name}
                    <ChevronRight className="text-slate-600" />
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-col gap-4">
                <Link href="/pricing" className="btn-primary w-full text-center py-4 text-lg">
                  Start Membership
                </Link>
                <Link href="/login" className="btn-secondary w-full text-center py-4 text-lg">
                  Member Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}