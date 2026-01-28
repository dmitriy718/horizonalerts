import { FastifyInstance } from "fastify";
import { query } from "../db.js";
import fs from "fs";
import path from "path";

export async function publicFeedRoutes(server: FastifyInstance) {
  server.get("/candidates", async () => {
    const readCandidates = (filename: string) => {
      try {
        const filePath = path.join(process.cwd(), "../content", filename); // Local dev
        const prodPath = path.join("/app/content", filename); // Docker
        
        const target = fs.existsSync(prodPath) ? prodPath : filePath;
        
        if (fs.existsSync(target)) {
          return JSON.parse(fs.readFileSync(target, "utf-8"));
        }
      } catch (e) {
        // ignore
      }
      return [];
    };

    return {
      day: readCandidates("day_candidates.json"),
      swing: readCandidates("swing_candidates.json"),
      invest: readCandidates("invest_candidates.json")
    };
  });

  server.get("/", async () => {
    const rows = await query<{
      id: string;
      symbol: string;
      venue: string;
      asset_type: string;
      pattern: string;
      entry: number;
      sl: number;
      tp1: number;
      tp2: number;
      tp3: number;
      confidence: number;
      bar_time: string;
      published_at: string;
      interval: string;
    }>(
      `SELECT * FROM (
         SELECT DISTINCT ON (s.symbol) 
           s.id, s.symbol, s.venue, s.asset_type, s.pattern, s.entry, s.sl, s.tp1, s.tp2, s.tp3,
           s.confidence, s.bar_time, pf.published_at, s.interval
         FROM public_feed pf
         JOIN signals s ON s.id = pf.signal_id
         WHERE pf.published_at <= now()
         ORDER BY s.symbol, pf.published_at DESC
       ) t
       ORDER BY published_at DESC
       LIMIT 10`
    );

    return {
      data: rows,
      disclaimer:
        "Educational only. No trade execution. Signals computed on closed bars; records are immutable."
    };
  });
}
