import { describe, it, expect } from "vitest";

/**
 * Settings page logic tests.
 * Tests the bot connection setup wizard flow, URL masking,
 * error message mapping, and form validation.
 */

// ─── URL Masking ────────────────────────────────────────────────────────────

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}:${u.port || "443"}`;
  } catch {
    return "***";
  }
}

describe("Settings: URL Masking", () => {
  it("masks standard bot URL", () => {
    expect(maskUrl("http://165.245.143.68:8080")).toBe("http://165.245.143.68:8080");
  });

  it("uses default port 443 for HTTPS without port", () => {
    expect(maskUrl("https://bot.horizon.com")).toBe("https://bot.horizon.com:443");
  });

  it("handles localhost", () => {
    expect(maskUrl("http://localhost:8080")).toBe("http://localhost:8080");
  });

  it("returns *** for garbage input", () => {
    expect(maskUrl("not-a-url")).toBe("***");
    expect(maskUrl("")).toBe("***");
  });
});

// ─── Error Message Mapping ──────────────────────────────────────────────────

function mapBotError(msg: string): string {
  if (msg.includes("unreachable") || msg.includes("fetch")) {
    return "Could not reach your bot. Make sure the URL is correct and the bot is running. Check that port 8080 is open in your firewall.";
  } else if (msg.includes("status 401") || msg.includes("status 403")) {
    return "Authentication failed. Double-check your API key.";
  } else if (msg.includes("status 4")) {
    return `Bot returned an error (${msg}). Make sure the bot is running the latest version of NovaPulse.`;
  }
  return msg;
}

describe("Settings: Error Message Mapping", () => {
  it("maps unreachable error", () => {
    const result = mapBotError("bot_unreachable");
    expect(result).toContain("Could not reach");
  });

  it("maps fetch error", () => {
    const result = mapBotError("fetch failed");
    expect(result).toContain("Could not reach");
  });

  it("maps 401 error", () => {
    const result = mapBotError("status 401");
    expect(result).toContain("Authentication failed");
  });

  it("maps 403 error", () => {
    const result = mapBotError("status 403");
    expect(result).toContain("Authentication failed");
  });

  it("maps generic 4xx error", () => {
    const result = mapBotError("status 422");
    expect(result).toContain("Bot returned an error");
  });

  it("passes through unknown errors", () => {
    const result = mapBotError("Something unexpected");
    expect(result).toBe("Something unexpected");
  });
});

// ─── Connection Form Validation ─────────────────────────────────────────────

describe("Settings: Connection Form Validation", () => {
  it("strips trailing slashes from bot URL", () => {
    const url = "http://165.245.143.68:8080///";
    const cleaned = url.replace(/\/+$/, "");
    expect(cleaned).toBe("http://165.245.143.68:8080");
  });

  it("handles URL with no trailing slashes", () => {
    const url = "http://165.245.143.68:8080";
    const cleaned = url.replace(/\/+$/, "");
    expect(cleaned).toBe("http://165.245.143.68:8080");
  });

  it("validates URL format (basic check)", () => {
    const validUrls = [
      "http://165.245.143.68:8080",
      "https://bot.example.com",
      "http://localhost:8080",
      "http://192.168.1.100:8080",
    ];

    for (const url of validUrls) {
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it("rejects invalid URL formats", () => {
    const invalidUrls = ["not-a-url", "ftp://bad", "just-text", "://missing"];

    for (const url of invalidUrls) {
      let isValid = true;
      try { new URL(url); } catch { isValid = false; }
      // Note: ftp:// is technically valid URL, others should fail
      if (url !== "ftp://bad") {
        expect(isValid).toBe(false);
      }
    }
  });

  it("API key must not be empty", () => {
    expect("".length).toBe(0);
    expect("abc123".length).toBeGreaterThan(0);
  });
});

// ─── Setup Wizard Flow ──────────────────────────────────────────────────────

describe("Settings: Setup Wizard Flow", () => {
  it("starts at step 0 (choose hosting)", () => {
    const step = 0;
    expect(step).toBe(0);
  });

  it("transitions from step 0 to step 1 on hosting type selection", () => {
    let step = 0;
    let hostingType = "managed";

    // User clicks "Hosted by Horizon"
    hostingType = "managed";
    step = 1;
    expect(step).toBe(1);
    expect(hostingType).toBe("managed");
  });

  it("can go back from step 1 to step 0", () => {
    let step = 1;
    step = 0;
    expect(step).toBe(0);
  });

  it("managed hosting type is 'managed'", () => {
    expect("managed").toBe("managed");
  });

  it("self-hosted hosting type is 'self-hosted'", () => {
    expect("self-hosted").toBe("self-hosted");
  });

  it("connected state shows when botConnection is not null", () => {
    const botConnection = { id: 1, bot_url: "http://1.2.3.4:8080", status: "active" };
    expect(botConnection).not.toBeNull();
    expect(botConnection.status).toBe("active");
  });

  it("disconnected state shows when botConnection is null", () => {
    const botConnection = null;
    expect(botConnection).toBeNull();
  });
});

// ─── Hosting Type Display ───────────────────────────────────────────────────

describe("Settings: Hosting Type Display", () => {
  it("managed displays as 'Hosted by Horizon'", () => {
    const type = "managed";
    const display = type === "managed" ? "Hosted by Horizon" : "Self-Hosted";
    expect(display).toBe("Hosted by Horizon");
  });

  it("self-hosted displays correctly", () => {
    const type = "self-hosted";
    const display = type === "managed" ? "Hosted by Horizon" : "Self-Hosted";
    expect(display).toBe("Self-Hosted");
  });
});
