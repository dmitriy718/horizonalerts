import { getLessonBySlug, getAllLessons } from "../../lib/academy";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export async function generateStaticParams() {
  const lessons = getAllLessons();
  return lessons.map((lesson) => ({
    slug: lesson.slug,
  }));
}

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return {
      title: "Academy Lesson | Horizon Alerts",
    };
  }

  const title = lesson.title ? lesson.title.replace("Lesson: ", "") : "Lesson";

  return {
    title: `${title} | Horizon Academy`,
    description: `Master ${title} with our institutional-grade trading curriculum. Difficulty: ${lesson.difficulty}.`,
    openGraph: {
      title: `${title} - Horizon Academy`,
      description: `Learn ${title} and apply it to real markets.`,
      type: "article",
    }
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <Link href="/academy" className="mb-8 inline-flex items-center text-sm text-slate-400 hover:text-cyan-400 transition-colors">
          ← Back to Academy
        </Link>

        <article className="glass-card rounded-3xl p-8 md:p-12 overflow-hidden">
          <header className="mb-10 border-b border-white/10 pb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                {lesson.difficulty}
              </span>
              <span className="text-slate-500 text-sm">⏱ {lesson.duration}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {lesson.title ? lesson.title.replace("Lesson: ", "") : "Untitled Lesson"}
            </h1>
          </header>

          <div className="prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-strong:text-white prose-code:text-cyan-200 prose-code:bg-cyan-900/20 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-8 border border-white/10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Mastered this concept?</h3>
            <p className="text-slate-300 mb-6">Apply it to real-time market data with our Pro Scanner.</p>
            <Link href="/pricing" className="btn-primary shadow-lg shadow-indigo-500/30">
              Start Trading Pro
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
