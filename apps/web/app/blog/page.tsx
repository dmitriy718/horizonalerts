const posts = [
  {
    title: "How we avoid repainting",
    date: "2026-01-20",
    excerpt: "Closed-bar computation, immutable ledgers, and audit trails."
  },
  {
    title: "Signal confidence explained",
    date: "2026-01-18",
    excerpt: "Pattern quality, liquidity, and regime alignment in one score."
  }
];

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Blog</h1>
      <p className="text-slate-300">
        Daily research posts and methodology updates.
      </p>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.title} className="glass rounded-xl p-5">
            <div className="text-sm text-slate-400">{post.date}</div>
            <div className="mt-1 text-lg text-white">{post.title}</div>
            <div className="mt-2 text-sm text-slate-300">{post.excerpt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
