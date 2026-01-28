import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const categories = [
      { 
        type: "day", 
        prompt: "Return a JSON object with a key 'tickers' containing an array of 30 ticker symbols (strings) popular with DAY TRADERS." 
      },
      { 
        type: "swing", 
        prompt: "Return a JSON object with a key 'tickers' containing an array of 30 ticker symbols (strings) popular with SWING TRADERS." 
      },
      { 
        type: "invest", 
        prompt: "Return a JSON object with a key 'tickers' containing an array of 30 ticker symbols (strings) popular with LONG TERM INVESTORS." 
      }
    ];
    
    const STATIC_LISTS: Record<string, string[]> = {
      day: ["TSLA", "NVDA", "AMD", "AAPL", "MSFT", "META", "AMZN", "GOOGL", "NFLX", "COIN", "MARA", "MSTR", "PLTR", "SOFI", "ROKU", "DKNG", "SHOP", "SQ", "U", "AFRM", "HOOD", "RBLX", "PATH", "OPEN", "AI", "UPST", "CVNA", "LCID", "GME", "AMC"],
      swing: ["JPM", "BAC", "WFC", "C", "GS", "MS", "AXP", "BLK", "USB", "PNC", "TFC", "BK", "STT", "COF", "FITB", "KEY", "RF", "HBAN", "CFG", "MTB", "ZION", "CMA", "NYCB", "WAL", "PACW", "SCHW", "ALLY", "SO", "F", "GM"],
      invest: ["V", "MA", "JNJ", "PG", "PG", "HD", "KO", "PEP", "MRK", "ABBV", "PFE", "TMO", "LLY", "BMY", "DHR", "ABT", "MDT", "SYK", "ISRG", "EW", "BSX", "BDX", "ZTS", "CI", "CVS", "UNH", "EL", "HUM", "MCK", "COR"]
    };
    
    async function main() {
      console.log("🚀 Seeding Candidates...");
      
      // Ensure content directory exists
      const contentDir = path.join(process.cwd(), "content"); 
      if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
    
      for (const cat of categories) {
        let tickers = [];
        try {
          console.log(`Generating ${cat.type}...`);
          const completion = await openai.chat.completions.create({
            messages: [
              { role: "system", content: "You are a helpful assistant designed to output JSON." },
              { role: "user", content: cat.prompt }
            ],
            model: "gpt-4-turbo",
            response_format: { type: "json_object" }
          });
    
          const raw = completion.choices[0].message.content || "{}";
          const data = JSON.parse(raw);
          tickers = data.tickers || [];
        } catch (err) {
          console.error(`⚠️ AI Failed ${cat.type}, using static fallback.`);
          tickers = STATIC_LISTS[cat.type];
        }
    
        fs.writeFileSync(
          path.join(contentDir, `${cat.type}_candidates.json`),
          JSON.stringify(tickers, null, 2)
        );
        
        console.log(`✅ Saved ${tickers.length} tickers for ${cat.type}`);
      }
    }
    
main();
