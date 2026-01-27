export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.PUBLIC_API_BASE ||
    "http://localhost:4000"
  );
}
