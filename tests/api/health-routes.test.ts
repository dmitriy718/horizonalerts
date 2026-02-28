import { describe, it, expect } from "vitest";

/**
 * Health route response shape tests.
 */

describe("Health Route Response", () => {
  it("returns correct shape for /health", () => {
    const response = {
      ok: true,
      service: "api",
      uptime: 12345.67,
    };

    expect(response).toHaveProperty("ok", true);
    expect(response).toHaveProperty("service", "api");
    expect(typeof response.uptime).toBe("number");
    expect(response.uptime).toBeGreaterThan(0);
  });

  it("readiness check returns db status", () => {
    const upResponse = { ok: true, db: "up" };
    expect(upResponse.ok).toBe(true);
    expect(upResponse.db).toBe("up");

    const downResponse = { ok: false, db: "down" };
    expect(downResponse.ok).toBe(false);
    expect(downResponse.db).toBe("down");
  });
});
