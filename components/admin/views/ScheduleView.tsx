"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { type Project } from "@/lib/admin";
import { Card, StatusPill } from "../ui";

export default function ScheduleView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    if (!user) return;
    fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()).then(setProjects);
  }, [user]);
  if (!user) return null;

  return (
    <Card title="Milestone schedule">
      <div>
        {projects.map((x) => (
          <div key={x.id} className="border-b border-concrete-100 px-5 py-4 last:border-0">
            <div className="flex items-center justify-between">
              <Link href={`/admin/projects/${x.id}`} className="font-display text-sm font-semibold text-ink hover:text-brand-700">{x.name}</Link>
              <StatusPill status={x.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {x.milestones.map((m, i) => (
                <span key={i} className={`inline-flex items-center gap-1 rounded-md border border-concrete-200 px-2 py-1 font-mono text-[11px] ${m.done ? "bg-brand-50 text-brand-700" : "text-concrete-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${m.done ? "bg-brand-600" : "bg-concrete-300"}`} />
                  {m.d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
