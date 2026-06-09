"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";

import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file || !title.trim()) return;
    setError(null);
    setLoading(true);
    setProgress(20);
    try {
      const project = await api.projects.create({
        title: title.trim(),
        media_type: mediaType,
      });
      setProgress(50);
      await api.projects.upload(project.id, file);
      setProgress(100);
      router.push(`/history?watch=${project.id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Upload failed. Please try again.";
      setError(message);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Upload — free, no account</h1>
      <Card>
        <CardHeader><CardTitle>Grayscale {mediaType}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={mediaType === "image" ? "default" : "outline"} onClick={() => setMediaType("image")}>Image</Button>
            <Button variant={mediaType === "video" ? "default" : "outline"} onClick={() => setMediaType("video")}>Video</Button>
          </div>
          <div
            className="flex flex-col items-center rounded-xl border border-dashed p-12"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, "")); } }}
          >
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <Input type="file" accept={mediaType === "image" ? "image/*" : "video/*"} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, "")); } }} />
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading && <Progress value={progress} />}
          <Button className="w-full" disabled={!file || !title || loading} onClick={submit}>
            {loading ? "Processing…" : "Colorize"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
