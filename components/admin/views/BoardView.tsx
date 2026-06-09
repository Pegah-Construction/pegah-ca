"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { BOARD_COLUMNS, getUser, getProject, type Card as TCard } from "@/lib/admin";
import { Avatar, PriorityPill, Pill } from "../ui";

const DOT: Record<string, string> = {
  gray: "bg-concrete-400", blue: "bg-brand-500", red: "bg-red-500", amber: "bg-amber-500", green: "bg-emerald-500",
};

export default function BoardView() {
  const { user } = useAuth();
  const [cards, setCards] = useState<TCard[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/board?userId=${user.id}`).then((r) => r.json()).then(setCards);
  }, [user]);

  if (!user) return null;

  const drop = async (col: string) => {
    if (!dragId) return;
    setCards((prev) => prev.map((c) => (c.id === dragId ? { ...c, col } : c)));
    setDragId(null);
    setOverCol(null);
    await fetch(`/api/board/${dragId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ col }),
    });
  };

  const open = openId ? cards.find((c) => c.id === openId) ?? null : null;

  const toggleSub = async (cardId: string, i: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const updated = card.subtasks.map((s, j) => (j === i ? { ...s, done: !s.done } : s));
    setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, subtasks: updated } : c));
    await fetch(`/api/board/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtasks: updated }),
    });
  };

  return (
    <>
      <p className="mb-4 text-sm text-concrete-500">Drag cards between columns to update status. Click a card to open subtasks &amp; comments.</p>
      <div className="flex gap-5 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.col === col.key);
          return (
            <div key={col.key} className="flex w-72 shrink-0 flex-col">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${DOT[col.tone]}`} />
                <span className="font-display text-sm font-bold text-ink">{col.label}</span>
                <span className="font-mono text-xs text-concrete-400">{colCards.length}</span>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
                onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                onDrop={() => drop(col.key)}
                className={`flex-1 space-y-3 rounded-xl p-3 min-h-[120px] transition-colors ${overCol === col.key ? "bg-brand-50/60 ring-2 ring-brand-400" : "bg-concrete-100/60"}`}>
                {colCards.length ? colCards.map((c) => {
                  const a = getUser(c.assignee);
                  const pr = getProject(c.project);
                  const subDone = c.subtasks.filter((s) => s.done).length;
                  return (
                    <div key={c.id} draggable onDragStart={() => setDragId(c.id)} onClick={() => setOpenId(c.id)}
                      className="group cursor-grab rounded-lg border border-concrete-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing">
                      <span className="font-display text-sm font-semibold leading-snug text-ink">{c.title}</span>
                      <div className="mt-2 font-mono text-[11px] text-concrete-500">{pr?.name}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PriorityPill p={c.priority} />
                          {c.subtasks.length > 0 && <span className="font-mono text-[11px] text-concrete-400">{subDone}/{c.subtasks.length}</span>}
                          {c.comments.length > 0 && <span className="font-mono text-[11px] text-concrete-400">💬 {c.comments.length}</span>}
                        </div>
                        {a && <Avatar name={a.name} id={a.id} size="h-6 w-6 text-[9px]" />}
                      </div>
                    </div>
                  );
                }) : <div className="rounded-lg border-2 border-dashed border-concrete-200 px-3 py-6 text-center font-mono text-[11px] text-concrete-300">Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>
      {open && <CardDrawer card={open} onClose={() => setOpenId(null)} onToggleSub={toggleSub} />}
    </>
  );
}

function CardDrawer({ card, onClose, onToggleSub }: { card: TCard; onClose: () => void; onToggleSub: (id: string, i: number) => void }) {
  const a = getUser(card.assignee);
  const pr = getProject(card.project);
  return (
    <div onClick={onClose} className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/40 p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-concrete-200 px-6 py-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">{card.title}</h2>
          <button onClick={onClose} className="text-xl leading-none text-concrete-400 hover:text-ink">×</button>
        </div>
        <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <PriorityPill p={card.priority} /><Pill text={card.col} />{pr && <Pill text={pr.name} tone="blue" />}
            {a && <span className="ml-auto flex items-center gap-2 text-sm text-concrete-500"><Avatar name={a.name} id={a.id} size="h-6 w-6 text-[9px]" />{a.name}</span>}
          </div>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-label text-concrete-500">Subtasks</div>
          <div className="mb-5">
            {card.subtasks.length ? card.subtasks.map((s, i) => (
              <label key={i} className="flex items-center gap-2 py-1.5 text-sm">
                <input type="checkbox" checked={s.done} onChange={() => onToggleSub(card.id, i)} className="h-4 w-4 rounded border-concrete-300 text-brand-600" />
                <span className={s.done ? "text-concrete-400 line-through" : "text-ink"}>{s.t}</span>
              </label>
            )) : <p className="text-sm text-concrete-400">No subtasks.</p>}
          </div>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-label text-concrete-500">Comments</div>
          <div className="divide-y divide-concrete-100">
            {card.comments.length ? card.comments.map((cm, i) => {
              const w = getUser(cm.who);
              return (
                <div key={i} className="flex gap-2 py-2">
                  {w && <Avatar name={w.name} id={w.id} size="h-6 w-6 text-[9px]" />}
                  <div><div className="text-sm text-ink"><span className="font-semibold">{w?.name}</span> <span className="font-mono text-[11px] text-concrete-400">{cm.when}</span></div><div className="text-sm text-concrete-600">{cm.text}</div></div>
                </div>
              );
            }) : <p className="text-sm text-concrete-400">No comments yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
