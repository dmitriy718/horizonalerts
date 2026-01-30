import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "content/blog");
  const localDir = path.join(process.cwd(), "../../content/blog");
  const targetDir = fs.existsSync(dir) ? dir : localDir;
  
  if (!fs.existsSync(targetDir)) return [];
  
  const files = fs.readdirSync(targetDir);
  return files.filter(f => f.endsWith(".md")).map(f => ({
    slug: f.replace(".md", "")
  }));
}

function getPost(slug: string) {
  const dir = path.join(process.cwd(), "content/blog");
  const localDir = path.join(process.cwd(), "../../content/blog");
  const targetDir = fs.existsSync(dir) ? dir : localDir;
  
  const filePath = path.join(targetDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  
  const raw = fs.readFileSync(filePath, "utf8");
  return matter(raw);
}

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  
  if (!post) {
    return {
      title: "Blog Post | Horizon Alerts",
    };
  }

  return {
    title: `${post.data.title} | Horizon Insights`,
    description: post.data.excerpt || "Institutional market analysis and trading strategies.",
    openGraph: {
      title: post.data.title,
      description: post.data.excerpt,
      images: post.data.image ? [{ url: post.data.image }] : [],
      type: "article",
      publishedTime: post.data.date
    }
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return <div>Post not found</div>;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/blog" className="mb-8 inline-flex items-center text-sm text-slate-400 hover:text-purple-400 transition-colors">
          ← Back to Insights
        </Link>

        <header className="mb-12 text-center">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-400">
            {new Date(post.data.date).toLocaleDateString()}
          </div>
          <h1 className="text-4xl font-bold text-white md:text-5xl leading-tight">
            {post.data.title}
          </h1>
        </header>

        <div className="relative mb-12 h-64 w-full overflow-hidden rounded-3xl border border-white/10 md:h-96">
          <img 
            src={post.data.image} 
            alt={post.data.title}
            className="h-full w-full object-cover"
          />
        </div>

        <article className="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white prose-img:rounded-2xl">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
