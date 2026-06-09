"use client";

import { useAuth } from "@/lib/auth";
import { INCIDENTS, getUser, getProject, visibleIds } from "@/lib/admin";
import { Card, THead, Table, StatusPill, Pill, StatCard, PrimaryBtn } from "../ui";

export default function SafetyView() {
  const { user } = useAuth();
  if (!user) return null;
  const ids = visibleIds(user);
  const inc = INCIDENTS.filter((s) => ids.includes(s.project));
  const open = inc.filter((s) => s.status === "Open").length;
  const review = inc.filter((s) => s.status === "Under review").length;
  const closed = inc.filter((s) => s.status === "Closed").length;

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={open} />
        <StatCard label="Under review" value={review} />
        <StatCard label="Closed" value={closed} />
      </div>
      <Card title="Safety incidents" right={<PrimaryBtn>+ Report incident</PrimaryBtn>}>
        <Table>
          <THead cols={["Date", "Project", "Type", "Severity", "Detail", "Reported by", "Status"]} />
          <tbody>
            {inc.map((s) => (
              <tr key={s.id} onClick={() => (location.href = `/admin/projects/${s.project}`)} className="cursor-pointer border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{s.date}</td>
                <td className="px-5 py-3 text-concrete-600">{getProject(s.project)?.name ?? "—"}</td>
                <td className="px-5 py-3"><Pill text={s.type} /></td>
                <td className="px-5 py-3"><Pill text={s.severity} tone={s.severity === "High" ? "red" : s.severity === "Medium" ? "amber" : "gray"} /></td>
                <td className="px-5 py-3 text-ink">{s.note}</td>
                <td className="px-5 py-3 text-concrete-500">{getUser(s.reportedBy)?.name ?? "—"}</td>
                <td className="px-5 py-3"><StatusPill status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
