"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { PERMS, money, type Project, type Task, type Incident, type Activity, type Article } from "@/lib/admin";
import { StatCard, Card, THead, Table, Avatar } from "../ui";

export default function DashboardView() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [feed, setFeed] = useState<Activity[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()).then(setProjects);
    fetch(`/api/tasks?userId=${user.id}`).then((r) => r.json()).then(setTasks);
    fetch(`/api/incidents?userId=${user.id}`).then((r) => r.json()).then(setIncidents);
    fetch(`/api/activity?userId=${user.id}`).then((r) => r.json()).then(setFeed);
    fetch("/api/news").then((r) => r.json()).then(setArticles);
  }, [user]);

  if (!user) return null;
  const perms = PERMS[user.role];
  const active = projects.filter((x) => x.status !== "Complete");
  const avg = active.length ? Math.round(active.reduce((a, x) => a + x.progress, 0) / active.length) : 0;
  const spent = projects.reduce((a, x) => a + x.spent, 0);
  const openInc = incidents.filter((i) => i.status !== "Closed");
  const myTasks = tasks.filter((t) => t.assignee === user.id && t.status !== "Done");
  const published = articles.filter((a) => a.status === "Published");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active projects" value={active.length} hint={`${projects.length} total in scope`} />
        <StatCard label="Published articles" value={published.length} hint={`${articles.length} total`} />
        {perms.viewBudget
          ? <StatCard label="Spent to date" value={money(spent)} hint="in your project scope" />
          : <StatCard label="My open tasks" value={myTasks.length} hint="assigned to you" />}
        <StatCard label="Open safety items" value={openInc.length} hint={openInc.length ? "need attention" : "all clear"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <Card title="Projects" right={<Link href="/admin/projects" className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">View all →</Link>}>
            <Table>
              <THead cols={["Project", "Type", "Value", ""]} />
              <tbody>
                {projects.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-6 text-sm text-concrete-400">No projects yet.</td></tr>
                )}
                {projects.slice(0, 6).map((x) => (
                  <tr key={x.id} onClick={() => (location.href = `/admin/projects/${x.id}`)} className="cursor-pointer border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <div className="font-display font-semibold text-ink">{x.name}</div>
                      <div className="font-mono text-[11px] text-concrete-500">{x.location}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-concrete-500">{x.type || "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-concrete-500">{x.value > 0 ? money(x.value) : "—"}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-brand-700">→</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Avg completion bar — only meaningful once there are active projects */}
          {active.length > 0 && (
            <div className="mt-4 rounded-xl border border-concrete-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-display font-semibold text-ink">Average project completion</span>
                <span className="font-mono text-xs text-brand-700">{avg}%</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-concrete-100">
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${avg}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          {/* Latest articles */}
          <Card title="Latest articles" right={<Link href="/admin/news" className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">View all →</Link>}>
            <ul>
              {articles.length === 0 && (
                <li className="px-5 py-6 text-sm text-concrete-400">No articles yet.</li>
              )}
              {articles.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 border-b border-concrete-100 px-5 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-semibold text-ink">{a.title}</div>
                    <div className="font-mono text-[11px] text-concrete-400">{a.date}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                    a.status === "Published"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Recent activity */}
          <Card title="Recent activity">
            <ul>
              {feed.length === 0 && (
                <li className="px-5 py-6 text-sm text-concrete-400">No recent activity. Actions like creating projects, uploading photos, and publishing articles will appear here.</li>
              )}
              {feed.map((a, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-concrete-100 px-5 py-3 last:border-b-0">
                  <Avatar name={a.whoName} id={a.who} size="h-7 w-7 text-[10px]" />
                  <div className="min-w-0 text-sm text-concrete-600">
                    <span className="font-semibold text-ink">{a.whoName}</span>{" "}
                    {a.what}
                    {a.projectName && (
                      <Link className="font-semibold text-brand-700 hover:underline" href={`/admin/projects/${a.project}`}>
                        {" "}{a.projectName}
                      </Link>
                    )}
                    <div className="font-mono text-[11px] text-concrete-400">{a.when}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
