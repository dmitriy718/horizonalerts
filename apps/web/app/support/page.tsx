"use client";
import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { getApiBaseUrl } from "../lib/api";
import { Send, Paperclip } from "lucide-react";

export default function SupportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [topic, setTopic] = useState("Technical Issue");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Unregistered Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = user ? await user.getIdToken() : null;
      const endpoint = user ? "/help/ticket" : "/help/public/contact";
      const payload = user 
        ? { topic, subject, message } 
        : { name, email, subject: "General Inquiry", message };

      const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        setSubject("");
        setMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Message Received</h2>
          <p className="text-slate-300 mb-6">We have sent a confirmation to your email. Our team will review your request shortly.</p>
          <button onClick={() => setSuccess(false)} className="btn-secondary">Send Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-slate-400">
            {user ? "Priority support for registered members." : "Have a question? We're here to help."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {!user && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Name</label>
                  <input required type="text" className="w-full mt-2 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Email</label>
                  <input required type="email" className="w-full mt-2 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            )}

            {user && (
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Topic</label>
                <select className="w-full mt-2 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" value={topic} onChange={e => setTopic(e.target.value)}>
                  <option>Technical Issue</option>
                  <option>Billing & Refunds</option>
                  <option>Feature Request</option>
                  <option>Report a Bug</option>
                  <option>Account Security</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Subject</label>
              <input required type="text" className="w-full mt-2 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="Brief summary of your issue" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Message</label>
              <textarea required rows={6} className="w-full mt-2 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="Describe your issue in detail..." value={message} onChange={e => setMessage(e.target.value)} />
            </div>

            {user && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-lg border border-dashed border-slate-600 hover:border-white text-slate-400 hover:text-white transition-colors">
                  <Paperclip size={16} />
                  <span className="text-sm">{file ? file.name : "Attach File (Image, PDF)"}</span>
                  <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} accept="image/*,.pdf,.doc,.docx" />
                </label>
              </div>
            )}

            <div className="pt-4">
              <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? "Sending..." : <>Send Message <Send size={18} /></>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
