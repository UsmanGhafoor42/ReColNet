"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw, Trash2 } from "lucide-react";

import { API_URL, api } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Project, ProjectDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function HistoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function refresh() {
    api.projects.list().then(setProjects);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const watch = new URLSearchParams(window.location.search).get("watch");
    if (!watch) return;
    const id = Number(watch);
    const poll = () =>
      api.projects.get(id).then((p) => {
        setDetail(p);
        if (p.status === "completed" || p.status === "failed") refresh();
      });
    poll();
    const t = setInterval(poll, 1500);
    return () => clearInterval(t);
  }, []);

  const original = detail?.media_files.find((m) => m.file_type === "original");
  const colorized = detail?.media_files.find((m) => m.file_type === "colorized");
  const origSrc = mediaUrl(original?.original_file ?? original?.colorized_file);
  const colSrc = mediaUrl(colorized?.colorized_file ?? colorized?.original_file);
  const processing =
    detail?.status === "processing" || detail?.status === "pending";

  async function downloadColorized() {
    if (!detail) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const a = document.createElement("a");
      a.href = `${API_URL}/projects/${detail.id}/download`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setDownloadError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6">
        <h1 className="text-2xl font-bold sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review completed jobs, compare outputs, and download results.
        </p>
      </div>

      {detail && (
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{detail.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge>{detail.status}</Badge>
              {detail.status === "completed" && (
                <>
                  {colSrc && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={downloadColorized}
                      disabled={downloading}
                      className="rounded-full"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      {downloading ? "Downloading..." : "Download"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => api.projects.reprocess(detail.id).then(setDetail)}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Reprocess
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {downloadError && (
              <p className="text-sm text-destructive">{downloadError}</p>
            )}
            {processing && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Colorizing…</p>
                <Progress className="animate-pulse" value={60} />
              </div>
            )}
            {detail.status === "completed" && origSrc && colSrc && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Original</p>
                  <img src={origSrc} alt="Original" className="rounded-lg border w-full" />
                </div>
                <div>
                  <p className="mb-2 text-sm text-primary">Colorized</p>
                  <img src={colSrc} alt="Colorized" className="rounded-lg border border-primary/30 w-full" />
                </div>
              </div>
            )}
            {detail.ai_results[0] && (
              <p className="text-sm">
                Model: {detail.ai_results[0].model_used} · Confidence:{" "}
                {Math.round((detail.ai_results[0].confidence_score ?? 0) * 100)}% ·{" "}
                {detail.ai_results[0].processing_time}s
              </p>
            )}
            {detail.explanations[0]?.text_explanation && (
              <p className="text-sm text-muted-foreground">
                {detail.explanations[0].text_explanation}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl">
        <CardContent className="pt-6 divide-y">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-wrap justify-between gap-3 py-3">
              <button
                type="button"
                className="text-left hover:text-primary"
                onClick={() => api.projects.get(p.id).then(setDetail)}
              >
                {p.title} · {new Date(p.created_at).toLocaleString()}
              </button>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{p.status}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await api.projects.delete(p.id);
                    refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
