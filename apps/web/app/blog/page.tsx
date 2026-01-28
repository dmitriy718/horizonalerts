import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Helper to get posts
function getPosts() {
  const dir = path.join(process.cwd(), "content/blog");
  const localDir = path.join(process.cwd(), "../../content/blog");
  const targetDir = fs.existsSync(dir) ? dir : localDir;
  
  if (!fs.existsSync(targetDir)) return [];

  const files = fs.readdirSync(targetDir);
  return files.filter(f => f.endsWith(".md")).map(f => {
    const raw = fs.readFileSync(path.join(targetDir, f), "utf8");
    const { data } = matter(raw);
    return {
      slug: f.replace(".md", ""),
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || "Institutional analysis and market insights from our quantitative engine.",
      image: data.image
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function BlogPage() {
  const posts = getPosts();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Terminal</span> Blog
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            Deep-dive research, algorithmic insights, and institutional order flow analysis updated daily.
          </p>
        </header>

        {featuredPost && (
          <section className="mb-20">
            <Link href={`/blog/${featuredPost.slug}`} className="group relative block overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/40 transition-all hover:border-purple-500/50">
              <div className="grid lg:grid-cols-2 gap-0 items-center">
                <div className="relative h-full min-h-[400px] overflow-hidden">
                  <img 
                    src={featuredPost.image || "https://via.placeholder.com/800x600"} 
                    alt={featuredPost.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent lg:hidden" />
                </div>
                <div className="p-10 md:p-16 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1 text-xs font-bold text-purple-400 uppercase tracking-widest border border-purple-500/20">
                    Featured Insight
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm font-semibold text-white">
                    <span>Read Full Briefing</span>
                    <span className="h-px w-12 bg-purple-500 transition-all group-hover:w-20" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-3xl bg-slate-900/30 border border-white/5 transition-all hover:border-purple-500/30 hover:bg-slate-900/50 hover:shadow-2xl hover:shadow-purple-950/20">
              <div className="relative h-56 w-full overflow-hidden">
                <img 
                  src={post.image || "https://via.placeholder.com/800x400"} 
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-8">
                <div className="mb-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="text-purple-400">{new Date(post.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>5 min read</span>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="flex-1 text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white border-t border-white/5 pt-6">
                  Learn More <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-white/5 py-32 text-center text-slate-500">
            Scanning for market alpha. New insights publishing shortly.
          </div>
        )}
      </div>
    </div>
  );
}