"use client";

import { useState } from "react";
import { getApiBaseUrl } from "../lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", subject: "General Inquiry", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(`${getApiBaseUrl()}/help/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("sent");
      setForm({ firstName: "", lastName: "", email: "", subject: "General Inquiry", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "An error occurred. Please try again.");
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen pt-20 pb-20 relative overflow-hidden">
      {/* Bg FX */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 grid gap-16 lg:grid-cols-2 items-center">

        {/* Left Column */}
        <div className="space-y-8">
          <h1 className="text-5xl font-bold text-white md:text-6xl">
            Let&apos;s talk <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Alpha.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-md">
            Whether you&apos;re a retail trader needing support or a fund looking for API access, our team is distributed globally and ready to help.
          </p>

          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-white/5 p-3 text-2xl">📧</div>
              <div>
                <h3 className="font-bold text-white">Email Support</h3>
                <p className="text-slate-400 text-sm">support@horizonsvc.com</p>
                <p className="text-slate-500 text-xs mt-1">Response time: &lt; 24hrs</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-white/5 p-3 text-2xl">🛡️</div>
              <div>
                <h3 className="font-bold text-white">Trust &amp; Safety</h3>
                <p className="text-slate-400 text-sm">security@horizonsvc.com</p>
                <p className="text-slate-500 text-xs mt-1">For abuse or compliance reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="glass-card rounded-3xl p-8 md:p-10 relative">
          {status === "sent" ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
              <p className="text-slate-400">We&apos;ll get back to you within 24 hours.</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === "error" && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-xs font-bold uppercase text-slate-500">First Name</label>
                  <input id="firstName" type="text" required value={form.firstName} onChange={update("firstName")} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                  <input id="lastName" type="text" required value={form.lastName} onChange={update("lastName")} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                <input id="email" type="email" required value={form.email} onChange={update("email")} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="jane@trader.com" />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-bold uppercase text-slate-500">Subject</label>
                <select id="subject" value={form.subject} onChange={update("subject")} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all">
                  <option>General Inquiry</option>
                  <option>Billing Issue</option>
                  <option>Bug Report</option>
                  <option>Enterprise API Access</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold uppercase text-slate-500">Message</label>
                <textarea id="message" rows={4} required value={form.message} onChange={update("message")} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="How can we help you?" />
              </div>

              <button type="submit" disabled={status === "sending"} className="btn-primary w-full shadow-xl shadow-blue-900/20 disabled:opacity-50">
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
