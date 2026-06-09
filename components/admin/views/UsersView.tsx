"use client";

import { USERS, ROLES, type RoleKey } from "@/lib/admin";
import { Card, THead, Table, RolePill, Pill, Avatar, PrimaryBtn } from "../ui";

export default function UsersView() {
  return (
    <>
      <Card title="Users & roles" right={<PrimaryBtn>+ Invite user</PrimaryBtn>}>
        <Table>
          <THead cols={["User", "Title", "Role", "Status", "Since", ""]} />
          <tbody>
            {USERS.map((m) => (
              <tr key={m.id} className="border-b border-concrete-100 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} id={m.id} size="h-8 w-8 text-[11px]" />
                    <div><div className="font-display font-semibold text-ink">{m.name}</div><div className="font-mono text-[11px] text-concrete-500">{m.email}</div></div>
                  </div>
                </td>
                <td className="px-5 py-3 text-concrete-600">{m.title}</td>
                <td className="px-5 py-3"><RolePill role={m.role} /></td>
                <td className="px-5 py-3"><Pill text={m.status} tone={m.status === "Active" ? "green" : "amber"} /></td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{m.since}</td>
                <td className="px-5 py-3 text-right"><button className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(Object.keys(ROLES) as RoleKey[]).map((k) => (
          <div key={k} className="rounded-xl border border-concrete-200 bg-white p-5">
            <div className="flex items-center gap-2"><RolePill role={k} /></div>
            <p className="mt-3 text-sm text-concrete-500">{ROLES[k].blurb}</p>
          </div>
        ))}
      </div>
    </>
  );
}
