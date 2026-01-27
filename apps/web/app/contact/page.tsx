export default function ContactPage() {
  return (
    <div className="min-h-screen pt-20 pb-20 relative overflow-hidden">
      {/* Bg FX */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-6xl px-6 grid gap-16 lg:grid-cols-2 items-center">
        
        {/* Left Column */}
        <div className="space-y-8">
          <h1 className="text-5xl font-bold text-white md:text-6xl">
            Let's talk <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Alpha.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-md">
            Whether you're a retail trader needing support or a fund looking for API access, our team is distributed globally and ready to help.
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
                <h3 className="font-bold text-white">Trust & Safety</h3>
                <p className="text-slate-400 text-sm">security@horizonsvc.com</p>
                <p className="text-slate-500 text-xs mt-1">For abuse or compliance reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="glass-card rounded-3xl p-8 md:p-10 relative">
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                <input type="text" className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                <input type="text" className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
              <input type="email" className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="jane@trader.com" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Subject</label>
              <select className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all">
                <option>General Inquiry</option>
                <option>Billing Issue</option>
                <option>Bug Report</option>
                <option>Enterprise API Access</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Message</label>
              <textarea rows={4} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="How can we help you?" />
            </div>

            <button type="submit" className="btn-primary w-full shadow-xl shadow-blue-900/20">
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}