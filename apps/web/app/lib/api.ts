export function getApiBaseUrl() {
  // Client-side: use relative path to let Nginx proxy handle it
  if (typeof window !== "undefined") {
    return "/api";
  }

  // Server-side: use internal docker network or configured URL
  return (
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.PUBLIC_API_BASE ||
    "http://localhost:4000"
  );
}
