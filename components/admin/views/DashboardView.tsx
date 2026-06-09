"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  PERMS, PROJECTS, TASKS, INCIDENTS, ACTIVITY,
  getUser, getProject, visibleProjects, visibleIds, money,
} from "@/lib/admin";
import { StatCard, Card, THead, Table, StatusPill, Bar, Avatar } from "../ui";

export default function DashboardView() {
  const { user } = useAuth();
  if (!user) return null;
  const perms = PERMS[user.role];
  const projs = visibleProjects(user);
  const ids = visibleIds(user);
  const active = projs.filter((x) => x.status !== "Complete");
  const avg = active.length ? Math.round(active.reduce((a, x) => a + x.progress, 0) / active.length) : 0;
  const spent = projs.reduce((a, x) => a + x.spent, 0);
  const openInc = INCIDENTS.filter((i) => ids.includes(i.project) && i.status !== "Closed");
  const myTasks = TASKS.filter((t) => t.assignee === user.id && t.status !== "Done");

  const upcoming = projs
    .flatMap((x) => x.milestones.filter((m) => !m.done).map((m) => ({ p: x, m })))
    .sort((a, b) => (a.m.d < b.m.d ? -1 : 1))
    .slice(0, 6);

  const feed = ACTIVITY.filter((a) => !a.project || ids.includes(a.project)).slice(0, 6);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active projects" value={active.length} hint={`${projs.length} total in scope`} />
        <StatCard label="Avg. completion" value={`${avg}%`} hint="across active projects" />
        {perms.viewBudget
          ? <StatCard label="Spent to date" value={money(spent)} hint="in your project scope" />
          : <StatCard label="My open tasks" value={myTasks.length} hint="assigned to you" />}
        <StatCard label="Open safety items" value={openInc.length} hint={openInc.length ? "need attention" : "all clear"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Projects in your scope" right={<Link href="/admin/projects" className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">View all →</Link>}>
            <Table>
              <THead cols={["Project", "Status", "Progress", ...(perms.viewBudget ? ["Spent / Budget"] : []), "PM"]} />
              <tbody>
                {projs.slice(0, 6).map((x) => {
                  const pm = getUser(x.pm);
                  return (
                    <tr key={x.id} onClick={() => (location.href = `/admin/projects/${x.id}`)} className="cursor-pointer border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                      <td className="px-5 py-3"><div className="font-display font-semibold text-ink">{x.name}</div><div className="font-mono text-[11px] text-concrete-500">{x.sector} · {x.location}</div></td>
                      <td className="px-5 py-3"><StatusPill status={x.status} /></td>
                      <td className="px-5 py-3"><Bar pct={x.progress} /></td>
                      {perms.viewBudget && <td className="px-5 py-3 font-mono text-xs text-concrete-500">{money(x.spent)} / {money(x.budget)}</td>}
                      <td className="px-5 py-3 text-concrete-500">{pm?.name ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Upcoming milestones">
            <ul className="divide-y divide-concrete-100">
              {upcoming.length ? upcoming.map((o, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{o.m.n}</div>
                    <Link href={`/admin/projects/${o.p.id}`} className="font-mono text-[11px] text-concrete-500 hover:text-brand-700">{o.p.name}</Link>
                  </div>
                  <span className="font-mono text-xs text-concrete-500">{o.m.d}</span>
                </li>
              )) : <li className="px-5 py-6 text-sm text-concrete-400">Nothing scheduled.</li>}
            </ul>
          </Card>

          <Card title="Recent activity">
            <ul className="divide-y divide-concrete-100">
              {feed.map((a, i) => {
                const w = getUser(a.who)!;
                const pr = a.project ? getProject(a.project) : null;
                return (
                  <li key={i} className="flex items-start gap-3 px-5 py-3">
                    <Avatar name={w.name} id={w.id} size="h-7 w-7 text-[10px]" />
                    <div className="text-sm text-concrete-600">
                      <span className="font-semibold text-ink">{w.name}</span> {a.what}{" "}
                      {pr && <Link className="font-semibold text-brand-700 hover:underline" href={`/admin/projects/${pr.id}`}>{pr.name}</Link>}
                      <div className="font-mono text-[11px] text-concrete-400">{a.when}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
