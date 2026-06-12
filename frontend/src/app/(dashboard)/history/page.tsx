"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Clock,
  Download,
  Film,
  ImageIcon,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

import { VideoCompare } from "@/components/history/video-compare";
import { API_URL, api } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Project, ProjectDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

  function selectProject(id: number) {
    api.projects.get(id).then(setDetail);
    window.history.replaceState(null, "", `/history?watch=${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6 backdrop-blur">
        <h1 className="text-2xl font-bold sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review completed jobs, compare outputs side-by-side, and download
          results.
        </p>
      </div>

      {detail && (
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{detail.title}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {isVideo ? (
                      <Film className="mr-1 h-3 w-3" />
                    ) : (
                      <ImageIcon className="mr-1 h-3 w-3" />
                    )}
                    {detail.media_type}
                  </Badge>
                  <Badge
                    className={cn(
                      detail.status === "completed" && "bg-primary",
                      detail.status === "failed" && "bg-destructive"
                    )}
                  >
                    {detail.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(detail.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {detail.status === "completed" && colSrc && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={downloadColorized}
                    disabled={downloading}
                    className="rounded-full"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    {downloading
                      ? "Downloading…"
                      : isVideo
                        ? "Download video"
                        : "Download image"}
                  </Button>
                )}
                {detail.status === "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => api.projects.reprocess(detail.id).then(setDetail)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Reprocess
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-4 sm:p-6">
            {downloadError && (
              <p className="text-sm text-destructive">{downloadError}</p>
            )}

            {processing && (
              <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                  {isVideo
                    ? "Enhancing video frame-by-frame…"
                    : "Colorizing image…"}
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {isVideo
                    ? "Full video colorization with OpenCV DNN. This may take several minutes."
                    : "Applying OpenCV DNN colorization."}
                </p>
                <Progress className="animate-pulse" value={65} />
              </div>
            )}

            {detail.status === "completed" && origSrc && colSrc && (
              <>
                {isVideo ? (
                  <VideoCompare
                    originalSrc={origSrc}
                    colorizedSrc={colSrc}
                  />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ImagePanel src={origSrc} label="Original" variant="original" />
                    <ImagePanel src={colSrc} label="Colorized" variant="colorized" />
                  </div>
                )}
              </>
            )}

            {aiResult && (
              <div className="flex flex-wrap gap-2">
                <StatChip label="Model" value={aiResult.model_used} />
                <StatChip
                  label="Confidence"
                  value={`${Math.round((aiResult.confidence_score ?? 0) * 100)}%`}
                />
                <StatChip
                  label="Processing"
                  value={`${aiResult.processing_time}s`}
                  icon={<Clock className="h-3 w-3" />}
                />
                {isVideo && (
                  <StatChip label="Output" value="Full video · H.264 MP4" />
                )}
              </div>
            )}

            {explanation?.text_explanation && (
              <p className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {explanation.text_explanation}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All jobs</CardTitle>
        </CardHeader>
        <CardContent className="divide-y px-0 pb-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 px-6 py-3 transition-colors",
                detail?.id === p.id ? "bg-primary/5" : "hover:bg-muted/30"
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => selectProject(p.id)}
              >
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.media_type} · {new Date(p.created_at).toLocaleString()}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{p.status}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await api.projects.delete(p.id);
                    if (detail?.id === p.id) setDetail(null);
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

function StatChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-xs">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

function ImagePanel({
  src,
  label,
  variant,
}: {
  src: string;
  label: string;
  variant: "original" | "colorized";
}) {
  const isColorized = variant === "colorized";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border",
        isColorized ? "border-primary/30 ring-1 ring-primary/15" : "border-border/60"
      )}
    >
      <div
        className={cn(
          "border-b px-3 py-2 text-sm font-medium",
          isColorized
            ? "border-primary/20 bg-primary/5 text-primary"
            : "bg-muted/30 text-muted-foreground"
        )}
      >
        {label}
      </div>
      <img src={src} alt={label} className="w-full object-contain" />
    </div>
  );
}
