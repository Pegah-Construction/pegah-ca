"use client";

import { useAuth } from "@/lib/auth";
import { PERMS, getUser, getClient, visibleProjects, money } from "@/lib/admin";
import { Card, THead, Table, StatusPill, Bar, Pill, PrimaryBtn } from "../ui";

export default function ProjectsView() {
  const { user } = useAuth();
  if (!user) return null;
  const perms = PERMS[user.role];
  const projs = visibleProjects(user);

  return (
    <>
      {perms.projectScope !== "all" && (
        <p className="mb-4 text-sm text-concrete-500">
          Showing the {projs.length} project{projs.length === 1 ? "" : "s"} {perms.projectScope === "managed" ? "you manage" : "you’re assigned to"}.
        </p>
      )}
      <Card title="All projects" right={perms.editProjects ? <PrimaryBtn>+ New project</PrimaryBtn> : undefined}>
        <Table>
          <THead cols={["Project", "Client", "Sector", "Status", "Progress", ...(perms.viewBudget ? ["Spent / Budget"] : []), "PM"]} />
          <tbody>
            {projs.map((x) => {
              const pm = getUser(x.pm);
              return (
                <tr key={x.id} onClick={() => (location.href = `/admin/projects/${x.id}`)} className="cursor-pointer border-b border-concrete-100 transition-colors last:border-0 hover:bg-brand-50/40">
                  <td className="px-5 py-3"><div className="font-display font-semibold text-ink">{x.name}</div><div className="font-mono text-[11px] text-concrete-500">{x.location}</div></td>
                  <td className="px-5 py-3 text-concrete-500">{getClient(x.client)?.name ?? "—"}</td>
                  <td className="px-5 py-3"><Pill text={x.sector} /></td>
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
    </>
  );
}
