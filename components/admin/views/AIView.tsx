"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  AI_PROVIDERS, AI_TOOLS, AI_PROMPTS, TENDERS, INCIDENTS, USERS, ROLES,
  getProject, visibleProjects, visibleIds, money, type User,
} from "@/lib/admin";
import { Card, Pill } from "../ui";

type Msg = { role: "user" | "assistant"; text?: string; tool?: string; node?: React.ReactNode };

function aiRespond(u: User, q: string): Msg {
  const ql = q.toLowerCase();
  if (/tender|rfp|rfq|bid|procure|closing/.test(ql)) {
    const open = TENDERS.filter((t) => t.status !== "Closed").sort((a, b) => (a.closing < b.closing ? -1 : 1)).slice(0, 4);
    return {
      role: "assistant", tool: "getTenders",
      node: (<div>I found {open.length} open opportunities, soonest first:
        <ul className="mt-1">{open.map((t) => (<li key={t.id} className="mt-1">• <a className="font-semibold text-brand-700 hover:underline" href={`/admin/tenders/${t.id}`}>{t.title}</a> — {money(t.value)}, closes <span className="font-mono">{t.closing}</span> ({t.platform})</li>))}</ul>
        <div className="mt-2 text-concrete-500">Want me to draft a prequalification for any of these?</div></div>),
    };
  }
  if (/project|progress|complete|%|over \d/.test(ql)) {
    const top = visibleProjects(u).filter((p) => p.status !== "Complete").sort((a, b) => b.progress - a.progress).slice(0, 4);
    return {
      role: "assistant", tool: "getProjects",
      node: (<div>Here are your active projects by completion:<ul className="mt-1">{top.map((p) => (<li key={p.id} className="mt-1">• <a className="font-semibold text-brand-700 hover:underline" href={`/admin/projects/${p.id}`}>{p.name}</a> — {p.progress}% complete, {p.status}</li>))}</ul></div>),
    };
  }
  if (/safety|incident|hazard|near miss/.test(ql)) {
    const ids = visibleIds(u);
    const inc = INCIDENTS.filter((s) => ids.includes(s.project) && s.status !== "Closed");
    return {
      role: "assistant", tool: "getProjectDetails",
      node: inc.length ? (<div>There are {inc.length} open safety items:<ul className="mt-1">{inc.map((s) => (<li key={s.id} className="mt-1">• <span className="font-semibold">{s.type}</span> — {s.note} ({getProject(s.project)?.name}, {s.status})</li>))}</ul></div>) : <span>No open safety incidents in your scope — all clear.</span>,
    };
  }
  if (/blog|article|news|write|post|case study/.test(ql)) {
    return {
      role: "assistant", tool: "getNews",
      node: (<div>I can draft that. Based on the Riverbend Recreation Complex record (80% complete, Markham), here&rsquo;s an opening:
        <div className="mt-2 rounded-lg bg-white p-3 text-concrete-700 ring-1 ring-concrete-200"><span className="font-semibold">Riverbend Recreation Complex Nears Completion</span><br />As one of Markham&rsquo;s most anticipated community facilities takes shape, our design-build team has reached 80% completion…</div>
        <div className="mt-2 text-concrete-500">Want me to save this as a draft in News &amp; Blog?</div></div>),
    };
  }
  if (/who|assign|team|member|foreman|manager/.test(ql)) {
    return {
      role: "assistant", tool: "getTeamMembers",
      node: (<div>Your team:<ul className="mt-1">{USERS.slice(0, 5).map((m) => (<li key={m.id} className="mt-1">• {m.name} — {ROLES[m.role].label}</li>))}</ul></div>),
    };
  }
  return { role: "assistant", node: <span>I can search across your projects, tenders, tasks, news, docs and company info. Try asking about open tenders, project progress, safety incidents, or ask me to draft a blog post.</span> };
}

export default function AIView() {
  const { user } = useAuth();
  const [provider, setProvider] = useState("claude");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [counts, setCounts] = useState({ projects: 0, tenders: 0 });
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight; }, [messages]);
  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()),
      fetch("/api/tenders").then((r) => r.json()),
    ]).then(([projects, tenders]) => setCounts({ projects: projects.length, tenders: tenders.length }));
  }, [user]);
  if (!user) return null;

  const prov = AI_PROVIDERS.find((p) => p.key === provider)!;
  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }, aiRespond(user, q)]);
    setInput("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <div className="flex flex-col rounded-xl border border-concrete-200 bg-white" style={{ height: "calc(100vh - 220px)" }}>
          <div className="flex items-center justify-between border-b border-concrete-200 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3v1a3 3 0 0 1-6 0v-1a3 3 0 0 1-3-3 3 3 0 0 1 0-6 3 3 0 0 1 3-3V5a3 3 0 0 1 3-3z" /></svg>
              </span>
              <span className="font-display text-sm font-bold text-ink">Assistant</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] text-concrete-400">{prov.model}</span>
            </div>
            <div className="flex items-center gap-2">
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-md border border-concrete-300 bg-white px-2 py-1 font-mono text-[11px] outline-none focus:border-brand-500">
                {AI_PROVIDERS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
              {messages.length > 0 && <button onClick={() => setMessages([])} className="rounded-md border border-concrete-300 px-2 py-1 font-display text-[11px] font-semibold text-concrete-500 hover:text-ink">Clear</button>}
            </div>
          </div>

          <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3v1a3 3 0 0 1-6 0v-1a3 3 0 0 1-3-3 3 3 0 0 1 0-6 3 3 0 0 1 3-3V5a3 3 0 0 1 3-3z" /></svg>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">Ask anything about your data</h3>
                <p className="mt-1 max-w-sm text-sm text-concrete-500">Connected to {counts.projects} projects, {counts.tenders} tenders, tasks, news and docs via {AI_TOOLS.length} tools.</p>
                <div className="mt-5 flex max-w-lg flex-wrap justify-center gap-2">
                  {AI_PROMPTS.map((p) => (<button key={p} onClick={() => send(p)} className="rounded-full border border-concrete-300 px-3 py-1.5 text-left font-display text-xs font-medium text-concrete-600 hover:border-brand-400 hover:text-brand-700">{p}</button>))}
                </div>
              </div>
            ) : messages.map((m, i) => m.role === "user" ? (
              <div key={i} className="flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-700 px-4 py-2.5 text-sm text-white">{m.text}</div></div>
            ) : (
              <div key={i} className="flex gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1 0 6 3 3 0 0 1-3 3v1a3 3 0 0 1-6 0v-1a3 3 0 0 1-3-3 3 3 0 0 1 0-6 3 3 0 0 1 3-3V5a3 3 0 0 1 3-3z" /></svg>
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-concrete-100 px-4 py-2.5 text-sm text-ink">
                  {m.tool && <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 font-mono text-[10px] text-concrete-500 ring-1 ring-concrete-200"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" />called {m.tool}</div>}
                  <div>{m.node}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-concrete-200 p-3">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} rows={1} placeholder="Message the assistant…" className="max-h-32 flex-1 resize-none rounded-lg border border-concrete-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
              <button type="submit" className="rounded-lg bg-brand-700 px-4 py-2.5 font-display text-sm font-semibold text-white hover:bg-brand-800">Send</button>
            </form>
            <p className="mt-2 px-1 font-mono text-[10px] text-concrete-400">Mock assistant — responses are illustrative, generated from local demo data.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card title="Provider">
          <div className="px-5 py-4">
            <div className="flex items-center gap-2"><Pill text={prov.label} tone="blue" /><span className="font-mono text-[11px] text-concrete-400">{prov.model}</span></div>
            <p className="mt-2 text-[11px] text-concrete-500">Switch providers anytime — Claude, OpenAI, Gemini or Grok. API key is encrypted at rest.</p>
          </div>
        </Card>
        <Card title={`Tools (${AI_TOOLS.length})`}>
          <div className="max-h-80 divide-y divide-concrete-100 overflow-y-auto py-1">
            {AI_TOOLS.map((t) => (
              <div key={t.name} className="flex items-start gap-2 px-4 py-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <div><div className="font-mono text-xs font-semibold text-ink">{t.name}</div><div className="text-[11px] leading-snug text-concrete-500">{t.desc}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
