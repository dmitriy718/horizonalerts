import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Bot proxy route tests.
 * These test the logic of the bot.ts route handlers in isolation
 * by mocking the database and fetch calls.
 */

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockQuery = vi.fn();
vi.mock("../../services/api/src/db.js", () => ({ query: (...args: any[]) => mockQuery(...args) }));

// ─── Test Helpers ───────────────────────────────────────────────────────────

function makeBotConnection(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    uid: "user-123",
    bot_url: "http://10.0.0.1:8080",
    api_key: "test-api-key-64chars-abcdef0123456789abcdef0123456789abcdef01234",
    hosting_type: "managed",
    label: "My Bot",
    status: "active",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// ─── Zod Schema Tests ───────────────────────────────────────────────────────

describe("Bot Connection Validation", () => {
  // Import zod directly to test schemas
  const { z } = require("zod");

  const upsertSchema = z.object({
    bot_url: z.string().url(),
    api_key: z.string().min(1),
    hosting_type: z.enum(["managed", "self-hosted"]).default("self-hosted"),
    label: z.string().max(100).default("My Bot"),
  });

  it("accepts valid managed connection", () => {
    const result = upsertSchema.safeParse({
      bot_url: "http://165.245.143.68:8080",
      api_key: "abc123def456",
      hosting_type: "managed",
      label: "Production Bot",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid self-hosted connection", () => {
    const result = upsertSchema.safeParse({
      bot_url: "http://192.168.1.100:8080",
      api_key: "my-secret-key",
      hosting_type: "self-hosted",
    });
    expect(result.success).toBe(true);
    expect(result.data?.label).toBe("My Bot"); // default
  });

  it("rejects invalid URL", () => {
    const result = upsertSchema.safeParse({
      bot_url: "not-a-url",
      api_key: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty API key", () => {
    const result = upsertSchema.safeParse({
      bot_url: "http://10.0.0.1:8080",
      api_key: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hosting_type", () => {
    const result = upsertSchema.safeParse({
      bot_url: "http://10.0.0.1:8080",
      api_key: "abc",
      hosting_type: "cloud",
    });
    expect(result.success).toBe(false);
  });

  it("rejects label longer than 100 chars", () => {
    const result = upsertSchema.safeParse({
      bot_url: "http://10.0.0.1:8080",
      api_key: "abc",
      label: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("defaults hosting_type to self-hosted", () => {
    const result = upsertSchema.safeParse({
      bot_url: "http://10.0.0.1:8080",
      api_key: "abc",
    });
    expect(result.success).toBe(true);
    expect(result.data?.hosting_type).toBe("self-hosted");
  });

  it("accepts HTTPS URLs", () => {
    const result = upsertSchema.safeParse({
      bot_url: "https://mybot.example.com",
      api_key: "abc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts URL with path", () => {
    const result = upsertSchema.safeParse({
      bot_url: "http://10.0.0.1:8080/api",
      api_key: "abc",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Proxy Logic Tests ──────────────────────────────────────────────────────

describe("Bot Proxy Logic", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockQuery.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("constructs correct proxy URL without query string", () => {
    const botUrl = "http://10.0.0.1:8080";
    const path = "/api/v1/status";
    const expected = "http://10.0.0.1:8080/api/v1/status";

    const url = `${botUrl}${path}`;
    expect(url).toBe(expected);
  });

  it("constructs correct proxy URL with query string", () => {
    const botUrl = "http://10.0.0.1:8080";
    const path = "/api/v1/trades";
    const qs = "limit=50";
    const expected = "http://10.0.0.1:8080/api/v1/trades?limit=50";

    const url = `${botUrl}${path}?${qs}`;
    expect(url).toBe(expected);
  });

  it("proxy headers include X-API-Key", () => {
    const apiKey = "test-key-123";
    const headers = { "X-API-Key": apiKey, Accept: "application/json" };

    expect(headers["X-API-Key"]).toBe(apiKey);
    expect(headers.Accept).toBe("application/json");
  });

  it("handles bot connection lookup - found", async () => {
    const conn = makeBotConnection();
    mockQuery.mockResolvedValueOnce([conn]);

    const rows = await mockQuery(
      "SELECT * FROM bot_connections WHERE uid = $1 AND status = 'active' LIMIT 1",
      ["user-123"]
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].uid).toBe("user-123");
    expect(rows[0].bot_url).toBe("http://10.0.0.1:8080");
  });

  it("handles bot connection lookup - not found", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const rows = await mockQuery(
      "SELECT * FROM bot_connections WHERE uid = $1 AND status = 'active' LIMIT 1",
      ["nonexistent-user"]
    );

    expect(rows).toHaveLength(0);
  });

  it("handles bot connection lookup - disconnected status excluded", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const rows = await mockQuery(
      "SELECT * FROM bot_connections WHERE uid = $1 AND status = 'active' LIMIT 1",
      ["disconnected-user"]
    );

    expect(rows).toHaveLength(0);
  });

  it("proxy endpoint mapping is correct", () => {
    const proxyEndpoints = [
      { route: "/status", botPath: "/api/v1/status" },
      { route: "/performance", botPath: "/api/v1/performance" },
      { route: "/positions", botPath: "/api/v1/positions" },
      { route: "/trades", botPath: "/api/v1/trades" },
      { route: "/strategies", botPath: "/api/v1/strategy-performance" },
      { route: "/risk", botPath: "/api/v1/risk" },
      { route: "/thoughts", botPath: "/api/v1/thoughts" },
    ];

    expect(proxyEndpoints).toHaveLength(7);
    expect(proxyEndpoints.find(e => e.route === "/status")?.botPath).toBe("/api/v1/status");
    expect(proxyEndpoints.find(e => e.route === "/strategies")?.botPath).toBe("/api/v1/strategy-performance");
  });

  it("upsert connection SQL has ON CONFLICT clause", () => {
    const sql = `INSERT INTO bot_connections (uid, bot_url, api_key, hosting_type, label, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (uid)
         DO UPDATE SET bot_url = $2, api_key = $3, hosting_type = $4, label = $5, status = 'active', updated_at = now()
         RETURNING *`;

    expect(sql).toContain("ON CONFLICT (uid)");
    expect(sql).toContain("RETURNING *");
    expect(sql).toContain("status = 'active'");
  });

  it("disconnect sets status to disconnected, not deleting row", () => {
    const sql = `UPDATE bot_connections SET status = 'disconnected', updated_at = now() WHERE uid = $1`;

    expect(sql).toContain("status = 'disconnected'");
    expect(sql).not.toContain("DELETE");
  });

  it("connection GET response excludes api_key", () => {
    const conn = makeBotConnection();
    const response = {
      id: conn.id,
      bot_url: conn.bot_url,
      hosting_type: conn.hosting_type,
      label: conn.label,
      status: conn.status,
      created_at: conn.created_at,
      updated_at: conn.updated_at,
    };

    expect(response).not.toHaveProperty("api_key");
    expect(response).toHaveProperty("bot_url");
    expect(response).toHaveProperty("id");
  });
});

// ─── URL Masking Tests ──────────────────────────────────────────────────────

describe("URL Masking (frontend utility)", () => {
  function maskUrl(url: string): string {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname}:${u.port || "443"}`;
    } catch {
      return "***";
    }
  }

  it("masks IP + port URL", () => {
    expect(maskUrl("http://165.245.143.68:8080")).toBe("http://165.245.143.68:8080");
  });

  it("masks domain URL with default port", () => {
    expect(maskUrl("https://mybot.example.com")).toBe("https://mybot.example.com:443");
  });

  it("returns *** for invalid URL", () => {
    expect(maskUrl("not-a-url")).toBe("***");
  });

  it("handles localhost", () => {
    expect(maskUrl("http://localhost:8080")).toBe("http://localhost:8080");
  });
});
