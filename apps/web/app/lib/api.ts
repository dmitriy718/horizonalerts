export function getApiBaseUrl() {
  // Client-side: use relative path to let Nginx proxy handle it
  if (typeof window !== "undefined") {
    return "/api";
  }

  // Server-side: prefer internal API URL (docker network), then public, then fallback
  return (
    process.env.INTERNAL_API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.PUBLIC_API_BASE ||
    "http://localhost:4000"
  );
}
