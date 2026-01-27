import fs from "fs";
import path from "path";
import matter from "gray-matter";
import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ACADEMY_DIR = path.join(process.cwd(), "content/academy");

// Duplicates to REMOVE (Keep the better named one)
const DELETIONS = [
  "algo-trading-intro-lesson.md", // Keep basics
  "fibonacci-levels-lesson.md", // Keep retracements
  "moving-average-strategies-lesson.md", // Keep crossovers (specific)
  "risk-management-rules-lesson.md", // Keep 101
  "rsi-divergence-masterclass-lesson.md", // Keep strategies
  "swing-trading-setups-lesson.md", // Keep vs-day-trading (contextual)
  "volume-profile-secrets-lesson.md", // Keep understanding-volume-profile
  "drills.md" // Legacy
];

// Level Corrections
const LEVEL_FIXES: Record<string, string> = {
  "algo-trading-basics-lesson.md": "Beginner",
  "introduction-to-volume-lesson.md": "Beginner",
  "support-and-resistance-basics-lesson.md": "Beginner"
};

async function regenerateContent(filename: string, title: string, level: string) {
  console.log(`♻️ Regenerating EMPTY lesson: ${title}...`);
  
  const prompt = `You are a Senior Institutional Trader. Write a comprehensive, 1500-word lesson on "${title}".
  Target Audience: ${level} Traders.
  
  Structure:
  1. **Executive Summary**: The "Why" and "What".
  2. **The Institutional Perspective**: How banks/algos view this.
  3. **Core Mechanics**: Deep dive into the theory.
  4. **Strategy & Execution**: Step-by-step setup. Entry, Stop Loss, Take Profit.
  5. **Common Pitfalls**: Where most traders lose money with this.
  6. **Quiz**: 3 challenging questions with answers.
  
  Format: Markdown. Use headers (##), bolding, and lists. Be authoritative but engaging. No fluff.`;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: prompt }
    ],
    model: "gpt-4-turbo",
  });

  return completion.choices[0].message.content;
}

async function main() {
  console.log("🔍 Starting Content Audit...");

  // 1. Delete Duplicates
  for (const file of DELETIONS) {
    const p = path.join(ACADEMY_DIR, file);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`🗑️ Deleted duplicate: ${file}`);
    }
  }

  // 2. Audit Remaining Files
  const files = fs.readdirSync(ACADEMY_DIR).filter(f => f.endsWith(".md"));
  
  for (const file of files) {
    const p = path.join(ACADEMY_DIR, file);
    const raw = fs.readFileSync(p, "utf8");
    const { data, content } = matter(raw);
    
    let needsSave = false;

    // Fix Level
    if (LEVEL_FIXES[file] && data.difficulty !== LEVEL_FIXES[file]) {
      data.difficulty = LEVEL_FIXES[file];
      needsSave = true;
      console.log(`🏷️ Corrected level for ${file} to ${data.difficulty}`);
    }

    // Check Content Length
    const wordCount = content.split(" ").length;
    if (wordCount < 400) { // Threshold for "Empty Shell"
      console.log(`⚠️  ${file} is THIN (${wordCount} words). Regenerating...`);
      const newContent = await regenerateContent(file, data.title.replace("Lesson: ", ""), data.difficulty);
      
      // Keep frontmatter, replace content
      const newFileContent = matter.stringify(newContent || content, data);
      fs.writeFileSync(p, newFileContent);
      console.log(`✅ Regenerated ${file}`);
    } else if (needsSave) {
      const newFileContent = matter.stringify(content, data);
      fs.writeFileSync(p, newFileContent);
    }
  }
}

main();
