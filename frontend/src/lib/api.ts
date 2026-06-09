import type { AdminAnalytics, Project, ProjectDetail } from "@/lib/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: isForm
      ? options.headers
      : { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail ?? "Request failed", res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  projects: {
    list: () => request<Project[]>("/projects"),
    create: (data: { title: string; media_type: "image" | "video" }) =>
      request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
    get: (id: number) => request<ProjectDetail>(`/projects/${id}`),
    delete: (id: number) =>
      request<void>(`/projects/${id}`, { method: "DELETE" }),
    upload: (id: number, file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return request<ProjectDetail>(`/projects/${id}/upload`, {
        method: "POST",
        body: fd,
      });
    },
    reprocess: (id: number) =>
      request<ProjectDetail>(`/projects/${id}/reprocess`, { method: "POST" }),
  },
  admin: {
    analytics: () => request<AdminAnalytics>("/admin/analytics"),
    models: () =>
      request<{ models: Array<Record<string, string>> }>("/admin/models"),
  },
};
