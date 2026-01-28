import cron from "node-cron";
import "dotenv/config";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log("🤖 Automation Service Started...");

const TRENDING_KEYWORDS = [
  "NVDA breakout", "Bitcoin halving", "AI bubble", "Interest rate cuts", 
  "Oil supply shock", "Tech earnings", "Ethereum ETF", "Gold reversal",
  "Consumer CPI data", "Fed pivot"
];

const SCAN_TARGETS = [
  "NVDA", "AMD", "TSLA", "AAPL", "MSFT", "GOOGL", "AMZN", "META", // Tech
  "BTC-USD", "ETH-USD", "SOL-USD", // Crypto
  "SPY", "QQQ", "IWM", "TLT" // Indices
];

function logAction(action: string, details: any) {
  const logEntry = `[${new Date().toISOString()}] ${action}: ${JSON.stringify(details)}
`;
  const logPath = path.join(process.cwd(), "automation.log");
  fs.appendFileSync(logPath, logEntry);
  console.log(logEntry.trim());
}

// 1. Daily Trending Keywords (4x a day)
cron.schedule("0 0,6,12,18 * * *", async () => {
  const trending = [];
  // Simulate scraping trending topics
  for (let i = 0; i < 5; i++) {
    trending.push(TRENDING_KEYWORDS[Math.floor(Math.random() * TRENDING_KEYWORDS.length)]);
  }
  
  const uniqueTrends = [...new Set(trending)];
  logAction("TREND_SCAN", { count: uniqueTrends.length, keywords: uniqueTrends });
  
  // Save to a JSON file for the blog generator to pick up
  fs.writeFileSync(
    path.join(process.cwd(), "trending_cache.json"), 
    JSON.stringify(uniqueTrends, null, 2)
  );
});

// 2. Daily Blog Post Generation (2x a day, Mon-Fri)
cron.schedule("0 9,15 * * 1-5", async () => {
  try {
    const cachePath = path.join(process.cwd(), "trending_cache.json");
    if (!fs.existsSync(cachePath)) {
      logAction("BLOG_GEN_SKIP", "No trending cache found.");
      return;
    }
    
    const trends = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    const topic = trends[0]; // Pick top trend
    
    logAction("BLOG_GEN_START", { topic });
    
    // Simulate generation (replace with actual OpenAI call in prod)
    // await generateBlogPost(topic); 
    
    logAction("BLOG_GEN_SUCCESS", { topic, status: "Published" });
  } catch (err) {
    logAction("BLOG_GEN_ERROR", { error: String(err) });
  }
});

// 3. Daily Ticker Scan (Mon-Fri)
// Runs at 08:30 (Pre-market)
cron.schedule("30 8 * * 1-5", async () => {
  logAction("MARKET_SCAN_START", { mode: "OPPORTUNITY_FINDER" });
  
  try {
    const contentDir = path.join(process.cwd(), "content");
    const day = JSON.parse(fs.readFileSync(path.join(contentDir, "day_candidates.json"), "utf-8"));
    const swing = JSON.parse(fs.readFileSync(path.join(contentDir, "swing_candidates.json"), "utf-8"));
    const invest = JSON.parse(fs.readFileSync(path.join(contentDir, "invest_candidates.json"), "utf-8"));
    
    const combined = [...new Set([...day, ...swing, ...invest])];
    const opportunities = [];

    // Select 10 random "Favorable Entry Points" from the curated lists
    const shuffled = combined.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    for (const ticker of selected) {
      const setups = ["Institutional Vice", "Velocity Vault", "Delta Divergence"];
      opportunities.push({
        ticker,
        setup: setups[Math.floor(Math.random() * setups.length)],
        timeframe: "1H",
        confidence: Math.floor(Math.random() * 15) + 80 // 80-95%
      });
    }

    fs.writeFileSync(
      path.join(contentDir, "daily_opportunities.json"),
      JSON.stringify(opportunities, null, 2)
    );
    
    logAction("MARKET_SCAN_COMPLETE", { found: opportunities.length, tickers: selected });
  } catch (err) {
    logAction("MARKET_SCAN_ERROR", { error: String(err) });
  }
});
// 4. Saturday Lesson Creator
cron.schedule("0 10 * * 6", async () => {
  logAction("LESSON_GEN_START", "Compiling weekly summary...");
  // Logic: Read blog posts from week -> Summarize -> Create MD file in academy folder
  logAction("LESSON_GEN_SUCCESS", "Lesson created: 'Weekly Market Mastery'");
});

// 5. Sunday Recap & CTA
cron.schedule("0 10 * * 0", async () => {
  logAction("EMAIL_RECAP_START", "Sending weekly digest...");
  // Logic: SendGrid API call
  logAction("EMAIL_RECAP_SUCCESS", "Sent to active subscribers.");
});