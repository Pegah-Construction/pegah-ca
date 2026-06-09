"use client";

import { useAuth } from "@/lib/auth";
import { CLIENTS, PERMS } from "@/lib/admin";
import { Card, THead, Table, Pill, PrimaryBtn } from "../ui";

export default function ClientsView() {
  const { user } = useAuth();
  if (!user) return null;
  const perms = PERMS[user.role];

  return (
    <Card title="Clients & companies" right={perms.manageClients ? <PrimaryBtn>+ Add client</PrimaryBtn> : undefined}>
      <Table>
        <THead cols={["Client", "Sector", "Primary contact", "Email", "Projects", "Since"]} />
        <tbody>
          {CLIENTS.map((c) => (
            <tr key={c.id} className="border-b border-concrete-100 last:border-0">
              <td className="px-5 py-3"><div className="font-display font-semibold text-ink">{c.name}</div></td>
              <td className="px-5 py-3"><Pill text={c.sector} /></td>
              <td className="px-5 py-3 text-concrete-600">{c.contact}</td>
              <td className="px-5 py-3 font-mono text-xs text-concrete-500">{c.email}</td>
              <td className="px-5 py-3 text-concrete-500">{c.projects}</td>
              <td className="px-5 py-3 font-mono text-xs text-concrete-500">{c.since}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
