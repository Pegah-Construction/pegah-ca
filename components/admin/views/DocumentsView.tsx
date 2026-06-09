"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getUser, type Doc } from "@/lib/admin";
import { Card, THead, Table, PrimaryBtn, Modal, Field, inputCls } from "../ui";

const KNOWN_TYPES = ["PDF","XLSX","DWG","DOCX","PPT","ZIP"];
type ProjectRow = { id: string; name: string };

function formatSize(bytes: number) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${Math.round(bytes / 1_024)} KB`;
  return `${bytes} B`;
}

export default function DocumentsView() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/documents?userId=${user.id}`).then((r) => r.json()).then(setDocs);
  }, [user]);

  const openModal = () => {
    setFile(null);
    setProjectId("");
    if (user) fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()).then(setProjects);
    setOpen(true);
  };

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("projectId", projectId);
    fd.append("ownerId", user.id);
    const res = await fetch("/api/documents", { method: "POST", body: fd });
    const created = await res.json();
    setDocs((prev) => [created, ...prev]);
    setOpen(false);
    setSaving(false);
  };

  return (
    <>
      <Card title="Documents" right={<PrimaryBtn onClick={openModal}>Upload</PrimaryBtn>}>
        <Table>
          <THead cols={["Name", "Project", "Size", "Owner", "Updated", ""]} />
          <tbody>
            {docs.map((d) => {
              const pr = d.project ? projects.find((p) => p.id === d.project) : null;
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
                  <td className="px-5 py-3 text-right">
                    {d.path ? (
                      <a href={d.path} download className="font-display text-xs font-semibold text-brand-700 hover:text-brand-800">Download</a>
                    ) : (
                      <span className="font-display text-xs text-concrete-300">Download</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      {open && (
        <Modal title="Upload document" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="File">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-concrete-200 px-4 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-concrete-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {file ? (
                  <span className="text-sm font-semibold text-ink">{file.name} <span className="font-normal text-concrete-400">({formatSize(file.size)})</span></span>
                ) : (
                  <span className="text-sm text-concrete-500">Click to choose a file</span>
                )}
                <input required type="file" className="sr-only" onChange={handleFileChange} />
              </label>
            </Field>
            <Field label="Project (optional)">
              <select className={inputCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Company-wide</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <div className="flex justify-end gap-2 border-t border-concrete-100 pt-4">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-concrete-600 hover:text-ink">Cancel</button>
              <button type="submit" disabled={saving || !file} className="rounded-md bg-brand-700 px-4 py-2 font-display text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
                {saving ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
