const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
export const API_ORIGIN = API.replace(/\/api\/v1\/?$/, "");

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
