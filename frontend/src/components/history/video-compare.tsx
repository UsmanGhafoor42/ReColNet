"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import { Film, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VideoCompareProps = {
  originalSrc: string;
  colorizedSrc: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type VideoPanelProps = {
  src: string;
  label: string;
  sublabel: string;
  variant: "original" | "colorized";
  muted: boolean;
  onReady: () => void;
  onTimeUpdate: (el: HTMLVideoElement) => void;
  onEnded: () => void;
};

const VideoPanel = forwardRef<HTMLVideoElement, VideoPanelProps>(
  function VideoPanel(
    { src, label, sublabel, variant, muted, onReady, onTimeUpdate, onEnded },
    ref
  ) {
    const isColorized = variant === "colorized";

    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-black/95 shadow-sm",
          isColorized ? "border-primary/40 ring-1 ring-primary/20" : "border-border/60"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b px-3 py-2",
            isColorized ? "border-primary/20 bg-primary/5" : "border-border/50 bg-muted/40"
          )}
        >
          <div className="flex items-center gap-2">
            <Film
              className={cn(
                "h-4 w-4",
                isColorized ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  isColorized && "text-primary"
                )}
              >
                {label}
              </p>
              <p className="text-[11px] text-muted-foreground">{sublabel}</p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              isColorized
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isColorized ? "Enhanced" : "Source"}
          </span>
        </div>

        <div className="relative aspect-video bg-black">
          <video
            ref={ref}
            src={src}
            controls
            playsInline
            preload="metadata"
            muted={muted}
            className="absolute inset-0 h-full w-full object-contain"
            onLoadedMetadata={(e) => {
              onReady();
              onTimeUpdate(e.currentTarget);
            }}
            onTimeUpdate={(e) => onTimeUpdate(e.currentTarget)}
            onEnded={onEnded}
          />
        </div>
      </div>
    );
  }
);

export function VideoCompare({ originalSrc, colorizedSrc }: VideoCompareProps) {
  const originalRef = useRef<HTMLVideoElement>(null);
  const colorizedRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState({ original: false, colorized: false });

  const bothReady = ready.original && ready.colorized;

  const syncTime = useCallback((source: HTMLVideoElement) => {
    const other =
      source === originalRef.current
        ? colorizedRef.current
        : originalRef.current;
    if (other && Math.abs(other.currentTime - source.currentTime) > 0.08) {
      other.currentTime = source.currentTime;
    }
    setProgress(source.currentTime);
    if (source.duration && Number.isFinite(source.duration)) {
      setDuration(source.duration);
    }
  }, []);

  const togglePlay = async () => {
    const orig = originalRef.current;
    const col = colorizedRef.current;
    if (!orig || !col) return;

    if (playing) {
      orig.pause();
      col.pause();
      setPlaying(false);
      return;
    }

    col.currentTime = orig.currentTime;
    await Promise.all([orig.play(), col.play()]);
    setPlaying(true);
  };

  const toggleMute = () => {
    const next = !muted;
    if (originalRef.current) originalRef.current.muted = next;
    if (colorizedRef.current) colorizedRef.current.muted = next;
    setMuted(next);
  };

  const seek = (value: number) => {
    if (originalRef.current) originalRef.current.currentTime = value;
    if (colorizedRef.current) colorizedRef.current.currentTime = value;
    setProgress(value);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <VideoPanel
          ref={originalRef}
          src={originalSrc}
          label="Original"
          sublabel="Grayscale source"
          variant="original"
          muted={muted}
          onReady={() => setReady((r) => ({ ...r, original: true }))}
          onTimeUpdate={syncTime}
          onEnded={() => setPlaying(false)}
        />
        <VideoPanel
          ref={colorizedRef}
          src={colorizedSrc}
          label="Colorized"
          sublabel="AI enhanced output"
          variant="colorized"
          muted={muted}
          onReady={() => setReady((r) => ({ ...r, colorized: true }))}
          onTimeUpdate={syncTime}
          onEnded={() => setPlaying(false)}
        />
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={progress}
            disabled={!bothReady}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary disabled:opacity-40"
          />
          <span className="min-w-[4.5rem] text-right text-xs tabular-nums text-muted-foreground">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              className="rounded-full"
              disabled={!bothReady}
              onClick={togglePlay}
            >
              {playing ? (
                <Pause className="mr-1.5 h-4 w-4" />
              ) : (
                <Play className="mr-1.5 h-4 w-4" />
              )}
              {playing ? "Pause" : "Play both"}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full"
              disabled={!bothReady}
              onClick={toggleMute}
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Synced side-by-side playback · use native controls on each panel
          </p>
        </div>
      </div>
    </div>
  );
}
