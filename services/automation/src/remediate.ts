import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { format } from "date-fns";
import slugify from "slugify";
import https from "https";

// Configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OUT_DIR = path.join(process.cwd(), "generated_content");
const ASSET_DIR = path.join(OUT_DIR, "assets");

if (!fs.existsSync(ASSET_DIR)) fs.mkdirSync(ASSET_DIR, { recursive: true });
if (!fs.existsSync(path.join(OUT_DIR, "academy"))) fs.mkdirSync(path.join(OUT_DIR, "academy"), { recursive: true });
if (!fs.existsSync(path.join(OUT_DIR, "blog"))) fs.mkdirSync(path.join(OUT_DIR, "blog"), { recursive: true });

// Curriculum Structure
const CURRICULUM = [
  // BEGINNER (Foundations)
  { title: "Candlestick Patterns That Work", level: "Beginner", category: "Technical Analysis" },
  { title: "Support & Resistance Basics", level: "Beginner", category: "Technical Analysis" },
  { title: "Risk Management 101", level: "Beginner", category: "Risk Management" },
  { title: "Moving Average Crossovers", level: "Beginner", category: "Technical Analysis" },
  { title: "The Psychology of Stop Losses", level: "Beginner", category: "Psychology" },
  { title: "Market Phases: Trend vs Range", level: "Beginner", category: "Market Mechanics" },
  { title: "Introduction to Volume", level: "Beginner", category: "Market Mechanics" },
  { title: "Trading the Open vs The Close", level: "Beginner", category: "Strategy" },

  // INTERMEDIATE (Strategy & Application - Requires Beginner knowledge)
  { title: "RSI Divergence Strategies", level: "Intermediate", category: "Technical Analysis", req: "Candlesticks, Trends" },
  { title: "Fibonacci Retracements", level: "Intermediate", category: "Technical Analysis", req: "Support/Resistance" },
  { title: "Gap Fill Strategies", level: "Intermediate", category: "Strategy", req: "Market Phases" },
  { title: "Swing Trading vs Day Trading", level: "Intermediate", category: "Strategy", req: "Risk Management" },
  { title: "Bull Flag Breakouts", level: "Intermediate", category: "Technical Analysis", req: "Patterns" },
  { title: "Understanding IV Crush", level: "Intermediate", category: "Options", req: "Market Mechanics" },
  { title: "Sector Rotation Basics", level: "Intermediate", category: "Macro", req: "Market Phases" },
  { title: "News Trading Hazards", level: "Intermediate", category: "Psychology", req: "Risk Management" },

  // ADVANCED (Institutional & Order Flow - Requires Intermediate knowledge)
  { title: "Understanding Volume Profile", level: "Advanced", category: "Order Flow", req: "Intro to Volume" },
  { title: "Institutional Order Flow", level: "Advanced", category: "Order Flow", req: "Support/Resistance, Volume" },
  { title: "Level 2 Data Reading", level: "Advanced", category: "Order Flow", req: "Market Mechanics" },
  { title: "Options Greeks: Delta & Gamma", level: "Advanced", category: "Options", req: "IV Crush" },
  { title: "Algo Trading Basics", level: "Advanced", category: "Quantitative", req: "Strategy" },
  { title: "Short Squeeze Mechanics", level: "Advanced", category: "Market Mechanics", req: "Volume Profile" },
  { title: "Macroeconomic Indicators", level: "Advanced", category: "Macro", req: "Sector Rotation" },
  { title: "The Wyckoff Method", level: "Advanced", category: "Technical Analysis", req: "Market Phases" },
];

async function downloadImage(url: string, destPath: string) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(true);
      });
    }).on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function generateImage(prompt: string, filename: string) {
  try {
    console.log(`🎨 Generating Image: ${filename}...`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `High-quality, futuristic financial trading chart or abstract concept visualization. ${prompt}. Neon blue, cyan, and deep purple color palette. Professional, minimalist, data-driven aesthetic. No text.`,
      n: 1,
      size: "1024x1024",
    });
    
    const url = response.data[0].url;
    if (url) {
      await downloadImage(url, path.join(ASSET_DIR, filename));
      return `/academy-assets/${filename}`; // Return public path
    }
    return null;
  } catch (error) {
    console.error(`❌ Image Gen Failed: ${error}`);
    return "https://via.placeholder.com/1024x1024?text=Gen+Failed";
  }
}

async function generateLessonContent(topic: any) {
  console.log(`📝 Writing Lesson: ${topic.title} [${topic.level}]...`);
  
  const systemPrompt = `You are a Senior Institutional Trader and Educator at Horizon Alerts. 
  Your goal is to write a comprehensive, 15-minute read lesson on "${topic.title}".
  Target Audience: ${topic.level} Traders.
  ${topic.level === 'Intermediate' ? `Prerequisites: Build upon concepts like ${topic.req}.` : ''}
  ${topic.level === 'Advanced' ? `Prerequisites: Assume deep knowledge of ${topic.req}. Focus on institutional mechanics.` : ''}
  
  Structure:
  1. **Executive Summary**: The "Why" and "What".
  2. **The Institutional Perspective**: How banks/algos view this, vs how retail views it.
  3. **Core Mechanics**: Deep dive into the theory. Use analogies.
  4. **Strategy & Execution**: Step-by-step setup. Entry, Stop Loss, Take Profit.
  5. **Common Pitfalls**: Where most traders lose money with this.
  6. **Quiz**: 3 challenging questions with answers.
  
  Format: Markdown. Use headers (##), bolding, and lists. Be authoritative but engaging. No fluff.`;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Write the full lesson for "${topic.title}".` }
    ],
    model: "gpt-4-turbo",
  });

  return completion.choices[0].message.content;
}

async function main() {
  console.log("🚀 Starting Deep Remediation Backfill...");

  for (const topic of CURRICULUM) {
    const slug = slugify(topic.title, { lower: true, strict: true });
    const imageFilename1 = `${slug}-concept.png`;
    const imageFilename2 = `${slug}-chart.png`;

    // 1. Generate Content
    let content = "";
    let attempts = 0;
    while (content.split(" ").length < 1000 && attempts < 3) {
      console.log(`📝 Writing Lesson: ${topic.title} [${topic.level}] (Attempt ${attempts + 1})...`);
      content = await generateLessonContent(topic);
      attempts++;
    }

    if (content.split(" ").length < 1000) {
      console.error(`⚠️ Failed to generate thick content for ${topic.title} after 3 attempts.`);
    }
    
    // 2. Generate Images (Skip if exists to save time/cost, or force if needed)
    // Checking if image exists in target dir
    const img1Path = path.join(ASSET_DIR, imageFilename1);
    const img2Path = path.join(ASSET_DIR, imageFilename2);
    
    let img1 = `/academy-assets/${imageFilename1}`;
    let img2 = `/academy-assets/${imageFilename2}`;

    if (!fs.existsSync(img1Path)) {
      await new Promise(r => setTimeout(r, 3000));
      const url1 = await generateImage(`Abstract concept visualization of ${topic.title}, 3d render, glowing network`, imageFilename1);
      if (url1) img1 = url1;
    }

    if (!fs.existsSync(img2Path)) {
      await new Promise(r => setTimeout(r, 3000));
      const url2 = await generateImage(`Technical trading chart pattern showing ${topic.title}, candlestick data, clean UI`, imageFilename2);
      if (url2) img2 = url2;
    }

    // 3. Assemble Markdown
    const fileContent = `---
title: "Lesson: ${topic.title}"
difficulty: "${topic.level}"
duration: "15 min"
category: "${topic.category}"
image: "${img1}"
---

${content}

## Visual Aids

![Concept Visualization](${img1})

*Figure 1: Conceptual visualization of ${topic.title}*

![Chart Example](${img2})

*Figure 2: Practical chart application*

---
*End of Module. Please verify your understanding with the simulator.*
`;

    // 4. Save Lesson
    fs.writeFileSync(path.join(OUT_DIR, "academy", `${slug}-lesson.md`), fileContent);
    
    // 5. Generate Matching Blog Post (Brief version)
    const blogContent = `---
title: "${topic.title}"
date: "${format(new Date(), "yyyy-MM-dd")}"
excerpt: "Mastering ${topic.title} is crucial for ${topic.level} traders. Here is the institutional breakdown."
image: "${img1}"
---

# ${topic.title}

*An excerpt from our Academy Module.*

${content?.substring(0, 500)}...

**[Read the full 15-minute lesson in the Academy](/academy/${slug}-lesson)**
`;
    fs.writeFileSync(path.join(OUT_DIR, "blog", `${slug}.md`), blogContent);

    console.log(`✅ Completed Module: ${topic.title}`);
  }
}

main();
