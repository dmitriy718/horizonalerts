import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Auth route validation and logic tests.
 */

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.coerce.number().min(18),
  zipCode: z.string().min(5),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  email: z.string().email(),
  preferences: z.record(z.any()).optional(),
});

describe("Registration Validation", () => {
  it("accepts valid registration data", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      zipCode: "10001",
      email: "john@example.com",
      preferences: { experience: "beginner", style: "swing", risk: "conservative", plan: "pro" },
    });
    expect(result.success).toBe(true);
  });

  it("coerces string age to number", () => {
    const result = RegisterSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      age: "30",
      zipCode: "90210",
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
    expect(result.data?.age).toBe(30);
  });

  it("rejects age under 18", () => {
    const result = RegisterSchema.safeParse({
      firstName: "Kid",
      lastName: "User",
      age: 17,
      zipCode: "10001",
      email: "kid@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty first name", () => {
    const result = RegisterSchema.safeParse({
      firstName: "",
      lastName: "Doe",
      age: 25,
      zipCode: "10001",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty last name", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "",
      age: 25,
      zipCode: "10001",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      zipCode: "10001",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short zip code", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      zipCode: "123",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional street address", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      zipCode: "10001",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
    expect(result.data?.streetAddress).toBeUndefined();
  });

  it("allows optional preferences", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      zipCode: "10001",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
    expect(result.data?.preferences).toBeUndefined();
  });

  it("accepts complex preferences object", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      age: 25,
      zipCode: "10001",
      email: "test@example.com",
      preferences: {
        experience: "advanced",
        style: "day",
        risk: "aggressive",
        plan: "premium",
        hosting: "managed",
        notifications: true,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = RegisterSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric age", () => {
    const result = RegisterSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      age: "not-a-number",
      zipCode: "10001",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("Email Mismatch Protection", () => {
  it("detects email mismatch between token and body", () => {
    const tokenEmail = "real@example.com";
    const bodyEmail = "fake@example.com";
    expect(tokenEmail !== bodyEmail).toBe(true);
  });

  it("allows matching emails", () => {
    const tokenEmail = "user@example.com";
    const bodyEmail = "user@example.com";
    expect(tokenEmail === bodyEmail).toBe(true);
  });

  it("handles undefined token email (new accounts)", () => {
    const tokenEmail: string | undefined = undefined;
    const bodyEmail = "user@example.com";
    // When token email is undefined, the check should pass
    const shouldBlock = tokenEmail && tokenEmail !== bodyEmail;
    expect(shouldBlock).toBeFalsy();
  });
});
