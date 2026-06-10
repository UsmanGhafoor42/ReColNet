"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminAnalytics } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  const [a, setA] = useState<AdminAnalytics | null>(null);
  const [models, setModels] = useState<Array<Record<string, string>>>([]);

  useEffect(() => {
    api.admin.analytics().then(setA);
    api.admin.models().then((r) => setModels(r.models));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track overall usage and model availability.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl"><CardHeader><p className="text-sm text-muted-foreground">Projects</p><CardTitle>{a?.total_projects ?? "—"}</CardTitle></CardHeader></Card>
        <Card className="rounded-2xl"><CardHeader><p className="text-sm text-muted-foreground">Completed</p><CardTitle>{a?.completed_projects ?? "—"}</CardTitle></CardHeader></Card>
        <Card className="rounded-2xl"><CardHeader><p className="text-sm text-muted-foreground">Active</p><CardTitle>{a?.processing_projects ?? "—"}</CardTitle></CardHeader></Card>
      </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Model Status</CardTitle>
        </CardHeader>
        <div className="space-y-2 px-6 pb-6">
          {models.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-sm">
              <span>{m.name}</span>
              <span className="text-muted-foreground">{m.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
