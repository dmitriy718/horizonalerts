"use client";
import { useState, useRef, useEffect } from "react";
import { Share2, Copy, Check, Mail, X } from "lucide-react";

interface ShareButtonProps {
  text: string;
  url?: string;
}

const PLATFORMS = [
  {
    id: "x",
    label: "X (Twitter)",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ),
    color: "hover:bg-slate-700/50",
    action: (text: string, _url?: string) => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    },
  },
  {
    id: "discord",
    label: "Discord",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
    ),
    color: "hover:bg-indigo-500/10",
    action: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        return "Copied for Discord!";
      } catch {
        return "Copy failed";
      }
    },
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
    ),
    color: "hover:bg-sky-500/10",
    action: (text: string, url?: string) => {
      const shareUrl = url || "https://horizonsvc.com";
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    },
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    ),
    color: "hover:bg-blue-500/10",
    action: (_text: string, url?: string) => {
      const shareUrl = url || "https://horizonsvc.com";
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    },
  },
  {
    id: "copy",
    label: "Copy Link",
    icon: () => <Copy size={16} />,
    color: "hover:bg-white/5",
    action: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        return "Copied!";
      } catch {
        return "Copy failed";
      }
    },
  },
  {
    id: "email",
    label: "Email",
    icon: () => <Mail size={16} />,
    color: "hover:bg-white/5",
    action: (text: string) => {
      window.open(`mailto:?subject=${encodeURIComponent("Check out my trading stats!")}&body=${encodeURIComponent(text)}`, "_self");
    },
  },
];

export function ShareButton({ text, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleClick = async (platform: typeof PLATFORMS[number]) => {
    const result = await platform.action(text, url);
    if (typeof result === "string") {
      setToast(result);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Share2 size={14} />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleClick(p)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition-colors ${p.color}`}
            >
              <span className="text-slate-400"><p.icon /></span>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="absolute right-0 top-full mt-2 z-50 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 whitespace-nowrap">
          <Check size={12} /> {toast}
        </div>
      )}
    </div>
  );
}
