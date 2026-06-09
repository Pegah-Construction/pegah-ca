"use client";

import { useAuth } from "@/lib/auth";
import { DOCUMENTS, getUser, getProject, visibleIds } from "@/lib/admin";
import { Card, THead, Table, PrimaryBtn } from "../ui";

export default function DocumentsView() {
  const { user } = useAuth();
  if (!user) return null;
  const ids = visibleIds(user);
  const docs = DOCUMENTS.filter((d) => d.project === null || ids.includes(d.project));

  return (
    <Card title="Documents" right={<PrimaryBtn>Upload</PrimaryBtn>}>
      <Table>
        <THead cols={["Name", "Project", "Size", "Owner", "Updated", ""]} />
        <tbody>
          {docs.map((d) => {
            const pr = d.project ? getProject(d.project) : null;
            return (
              <tr key={d.id} className="border-b border-concrete-100 last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-9 items-center justify-center rounded-md bg-concrete-100 font-mono text-[10px] font-bold text-concrete-500">{d.type}</span>
                    <span className="font-display font-semibold text-ink">{d.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-concrete-500">{pr?.name ?? "Company-wide"}</td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{d.size}</td>
                <td className="px-5 py-3 text-concrete-500">{getUser(d.owner)?.name ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-concrete-500">{d.updated}</td>
                <td className="px-5 py-3 text-right"><button className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Download</button></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}
