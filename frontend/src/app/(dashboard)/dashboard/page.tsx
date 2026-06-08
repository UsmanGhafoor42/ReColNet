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
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-3xl">{projects.length}</CardTitle><p className="text-sm text-muted-foreground">Projects</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-3xl">{done}</CardTitle><p className="text-sm text-muted-foreground">Completed</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-3xl">{projects.length - done}</CardTitle><p className="text-sm text-muted-foreground">In progress</p></CardHeader></Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Recent</CardTitle>
          <Link href="/upload" className={cn(buttonVariants())}><Upload className="mr-2 h-4 w-4 inline" />Upload</Link>
        </CardHeader>
        <CardContent>
          {projects.slice(0, 5).map((p) => (
            <div key={p.id} className="flex justify-between py-2 border-b last:border-0">
              <span>{p.title}</span>
              <Badge variant="outline">{p.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
