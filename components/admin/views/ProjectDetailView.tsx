"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  PERMS, TASKS, INCIDENTS, getUser, getClient, getProject,
  visibleIds, moneyFull,
} from "@/lib/admin";
import {
  Card, THead, Table, StatusPill, PriorityPill, RolePill, Pill, Bar, Avatar,
  StatCard, AccessDenied,
} from "../ui";

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-sm text-concrete-500">{k}</dt>
      <dd className="text-right font-display text-sm font-semibold text-ink">{v}</dd>
    </div>
  );
}

export default function ProjectDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  if (!user) return null;
  const x = getProject(id);
  if (!x || !visibleIds(user).includes(id)) return <AccessDenied msg="You don’t have access to this project." />;

  const perms = PERMS[user.role];
  const pm = getUser(x.pm);
  const fm = getUser(x.foreman);
  const done = x.milestones.filter((m) => m.done).length;
  const ptasks = TASKS.filter((t) => t.project === id);
  const pinc = INCIDENTS.filter((s) => s.project === id);

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/projects" className="font-mono text-xs text-concrete-500 hover:text-brand-700">← All projects</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">{x.name}</h2>
          <StatusPill status={x.status} /><Pill text={x.sector} />
        </div>
        <p className="mt-1 font-mono text-xs text-concrete-500">{getClient(x.client)?.name} · {x.location} · {x.start} → {x.end}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completion" value={`${x.progress}%`} hint={<Bar pct={x.progress} />} />
        {perms.viewBudget
          ? <StatCard label="Budget" value={moneyFull(x.budget)} />
          : <StatCard label="Milestones" value={`${done} / ${x.milestones.length}`} />}
        {perms.viewBudget
          ? <StatCard label="Spent" value={moneyFull(x.spent)} hint={`${Math.round((x.spent / x.budget) * 100)}% of budget`} />
          : <StatCard label="Team" value={`${x.team.length} people`} />}
        {perms.viewBudget
          ? <StatCard label="Remaining" value={moneyFull(x.budget - x.spent)} />
          : <StatCard label="Foreman" value={fm?.name ?? "—"} />}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Project timeline">
            <ul className="px-5 py-5">
              {x.milestones.map((m, i) => {
                const last = i === x.milestones.length - 1;
                return (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-concrete-200" />}
                    <span className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${m.done ? "border-brand-600 bg-brand-600" : "border-concrete-300 bg-white"}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-display text-sm font-semibold ${m.done ? "text-ink" : "text-concrete-500"}`}>{m.n}</span>
                        <span className="font-mono text-xs text-concrete-400">{m.d}</span>
                      </div>
                      <span className={`font-mono text-[11px] ${m.done ? "text-emerald-600" : "text-concrete-400"}`}>{m.done ? "Completed" : "Upcoming"}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Tasks">
            <Table>
              <THead cols={["Task", "Assignee", "Due", "Priority", "Status"]} />
              <tbody>
                {ptasks.length ? ptasks.map((t) => (
                  <tr key={t.id} className="border-b border-concrete-100 last:border-0">
                    <td className="px-5 py-3 text-ink">{t.title}</td>
                    <td className="px-5 py-3 text-concrete-500">{getUser(t.assignee)?.name ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-concrete-500">{t.due}</td>
                    <td className="px-5 py-3"><PriorityPill p={t.priority} /></td>
                    <td className="px-5 py-3"><StatusPill status={t.status} /></td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-5 py-6 text-sm text-concrete-400">No tasks logged.</td></tr>}
              </tbody>
            </Table>
          </Card>

          <Card title="Safety">
            <Table>
              <THead cols={["Date", "Type", "Detail", "Reported by", "Status"]} />
              <tbody>
                {pinc.length ? pinc.map((s) => (
                  <tr key={s.id} className="border-b border-concrete-100 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-concrete-500">{s.date}</td>
                    <td className="px-5 py-3"><Pill text={s.type} /></td>
                    <td className="px-5 py-3 text-ink">{s.note}</td>
                    <td className="px-5 py-3 text-concrete-500">{getUser(s.reportedBy)?.name ?? "—"}</td>
                    <td className="px-5 py-3"><StatusPill status={s.status} /></td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-5 py-6 text-sm text-concrete-400">No incidents reported.</td></tr>}
              </tbody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Project team">
            <ul className="divide-y divide-concrete-100">
              {x.team.map((tid) => {
                const tu = getUser(tid)!;
                return (
                  <li key={tid} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={tu.name} id={tu.id} size="h-8 w-8 text-[11px]" />
                    <div className="flex-1"><div className="font-display text-sm font-semibold text-ink">{tu.name}</div><div className="font-mono text-[11px] text-concrete-500">{tu.title}</div></div>
                    <RolePill role={tu.role} />
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card title="Key facts">
            <dl className="divide-y divide-concrete-100 px-5">
              <Fact k="Client" v={getClient(x.client)?.name ?? "—"} />
              <Fact k="Sector" v={x.sector} />
              <Fact k="Location" v={x.location} />
              <Fact k="Project manager" v={pm?.name ?? "—"} />
              <Fact k="Foreman" v={fm?.name ?? "—"} />
              <Fact k="Start" v={x.start} />
              <Fact k="Target finish" v={x.end} />
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
