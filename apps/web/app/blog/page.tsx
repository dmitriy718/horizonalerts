import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Helper to get posts (similar to academy)
function getPosts() {
  const dir = path.join(process.cwd(), "content/blog");
  // Try backup path for local dev
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
      excerpt: data.excerpt,
      image: data.image
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="mb-16 text-center text-5xl font-bold text-white md:text-7xl">
          Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Insights</span>
        </h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-3xl bg-slate-900/50 border border-white/10 transition-all hover:bg-slate-900 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20">
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={post.image || "https://via.placeholder.com/800x400"} 
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                  {new Date(post.date).toLocaleDateString()}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {post.title}
                </h3>
                <p className="flex-1 text-sm text-slate-400 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-white">
                  Read Article <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}