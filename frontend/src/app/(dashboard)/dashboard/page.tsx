"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    api.projects.list().then(setProjects);
  }, []);

  const done = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-8">
      <div className="premium-card p-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor project volume, completion rates, and recent colorization jobs.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="premium-card"><CardHeader><p className="text-sm text-muted-foreground">Projects</p><CardTitle className="text-3xl">{projects.length}</CardTitle></CardHeader></Card>
        <Card className="premium-card"><CardHeader><p className="text-sm text-muted-foreground">Completed</p><CardTitle className="text-3xl">{done}</CardTitle></CardHeader></Card>
        <Card className="premium-card"><CardHeader><p className="text-sm text-muted-foreground">In progress</p><CardTitle className="text-3xl">{projects.length - done}</CardTitle></CardHeader></Card>
      </div>
      <Card className="premium-card">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Recent</CardTitle>
          <Link href="/upload" className={cn(buttonVariants(), "rounded-full")}><Upload className="mr-2 inline h-4 w-4" />Upload</Link>
        </CardHeader>
        <CardContent>
          {projects.slice(0, 5).map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0">
              <span>{p.title}</span>
              <Badge variant="outline">{p.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
