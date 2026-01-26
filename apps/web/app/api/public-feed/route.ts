import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.PUBLIC_API_BASE || "http://localhost:4000";
  const res = await fetch(`${base}/public-feed`, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ data: [] });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
