import { FastifyInstance } from "fastify";
import { query } from "../db.js";

export async function publicFeedRoutes(server: FastifyInstance) {
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
      `select s.id, s.symbol, s.venue, s.asset_type, s.pattern, s.entry, s.sl, s.tp1, s.tp2, s.tp3,
              s.confidence, s.bar_time, pf.published_at, s.interval
       from public_feed pf
       join signals s on s.id = pf.signal_id
       where pf.published_at <= now()
       order by pf.published_at desc
       limit 10`
    );

    return {
      data: rows,
      disclaimer:
        "Educational only. No trade execution. Signals computed on closed bars; records are immutable."
    };
  });
}
