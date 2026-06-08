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
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle>{a?.total_projects ?? "—"} projects</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardTitle>{a?.completed_projects ?? "—"} done</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardTitle>{a?.processing_projects ?? "—"} active</CardTitle></CardHeader></Card>
      </div>
      <ul className="space-y-2">{models.map((m) => <li key={m.id} className="text-sm">{m.name} — {m.status}</li>)}</ul>
    </div>
  );
}
