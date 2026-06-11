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
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, []);

  const isVideo = detail?.media_type === "video";
  const original = detail?.media_files.find((m) => m.file_type === "original");
  const colorized = detail?.media_files
    .filter((m) => m.file_type === "colorized")
    .at(-1);
  const origSrc = mediaUrl(original?.original_file ?? original?.colorized_file);
  const colSrc = mediaUrl(colorized?.colorized_file ?? colorized?.original_file);
  const processing =
    detail?.status === "processing" || detail?.status === "pending";
  const aiResult = detail?.ai_results.at(-1);
  const explanation = detail?.explanations.at(-1);

  async function downloadColorized() {
    if (!detail) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const a = document.createElement("a");
      a.href = `${API_URL}/projects/${detail.id}/download`;
      a.rel = "noopener";
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setDownloadError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function MediaPreview({
    src,
    label,
    variant,
  }: {
    src: string;
    label: string;
    variant: "original" | "colorized";
  }) {
    const labelClass =
      variant === "colorized" ? "text-primary" : "text-muted-foreground";
    const borderClass =
      variant === "colorized" ? "border-primary/30" : "border-border";

    return (
      <div>
        <p className={`mb-2 text-sm ${labelClass}`}>{label}</p>
        {isVideo ? (
          <video
            src={src}
            controls
            playsInline
            className={`w-full rounded-lg border ${borderClass} bg-black`}
          />
        ) : (
          <img
            src={src}
            alt={label}
            className={`w-full rounded-lg border ${borderClass}`}
          />
        )}
      </div>
    );
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
                      {downloading
                        ? "Downloading..."
                        : isVideo
                          ? "Download video"
                          : "Download"}
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
                <p className="text-sm text-muted-foreground">
                  {isVideo
                    ? "Colorizing video… this may take a few minutes."
                    : "Colorizing…"}
                </p>
                <Progress className="animate-pulse" value={60} />
              </div>
            )}
            {detail.status === "completed" && origSrc && colSrc && (
              <div className="grid gap-4 sm:grid-cols-2">
                <MediaPreview src={origSrc} label="Original" variant="original" />
                <MediaPreview src={colSrc} label="Colorized" variant="colorized" />
              </div>
            )}
            {aiResult && (
              <p className="text-sm">
                Model: {aiResult.model_used} · Confidence:{" "}
                {Math.round((aiResult.confidence_score ?? 0) * 100)}% ·{" "}
                {aiResult.processing_time}s
                {isVideo && aiResult.model_used === "opencv-dnn" && (
                  <> · Full video colorized</>
                )}
              </p>
            )}
            {explanation?.text_explanation && (
              <p className="text-sm text-muted-foreground">
                {explanation.text_explanation}
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
                {p.title} · {p.media_type} ·{" "}
                {new Date(p.created_at).toLocaleString()}
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
