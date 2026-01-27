import Link from "next/link";
import { getAllLessons } from "../lib/academy";

export default function AcademyPage() {
  const lessons = getAllLessons();
  
  // Categorize or Group (Mock categories for now based on difficulty or arbitrary)
  const categories = ["Technical Analysis", "Psychology", "Risk Management", "Market Mechanics"];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-white md:text-7xl">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Academy</span>
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            Stop guessing. Start executing. Our curriculum is built on institutional order flow mechanics.
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <p>Lessons are being compiled by the Automation Engine. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <Link key={lesson.slug} href={`/academy/${lesson.slug}`} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-8 transition-all hover:border-cyan-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-cyan-900/20">
                <div className="flex items-start justify-between mb-6">
                  <div className="rounded-lg bg-white/5 p-3 text-2xl group-hover:bg-cyan-500/20 transition-colors">
                    🎓
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${
                    lesson.difficulty === 'Expert' || lesson.difficulty === 'Advanced' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
                    lesson.difficulty === 'Intermediate' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                    'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {lesson.difficulty}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {lesson.title.replace("Lesson: ", "")}
                </h3>
                
                <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 font-medium border-t border-white/5 pt-4">
                  <span className="flex items-center gap-2">
                    ⏱ {lesson.duration}
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform text-cyan-400 flex items-center gap-1">
                    Start Lesson →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
