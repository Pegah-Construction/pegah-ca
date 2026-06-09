"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { NEWS, PERMS, STATS, getUser, type Article } from "@/lib/admin";
import { StatCard, Card, THead, Table, Pill, PrimaryBtn } from "../ui";

export default function NewsView() {
  const { user } = useAuth();
  const [news, setNews] = useState<Article[]>(NEWS);
  if (!user) return null;
  const perms = PERMS[user.role];

  const pub = news.filter((n) => n.status === "Published").length;
  const draft = news.filter((n) => n.status === "Draft").length;

  const togglePublish = (id: string) =>
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, status: n.status === "Published" ? "Draft" : "Published" } : n)));

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Published" value={pub} hint="live on the website" />
        <StatCard label="Drafts" value={draft} hint="awaiting review" />
        <StatCard label="Total articles" value={STATS.articles} hint="SEO case studies" />
      </div>

      <Card title="Articles" right={perms.manageNews ? <PrimaryBtn>+ New article</PrimaryBtn> : undefined}>
        <Table>
          <THead cols={["Title", "Tags", "Author", "Date", "Status", ""]} />
          <tbody>
            {news.map((n) => {
              const a = getUser(n.author);
              return (
                <tr key={n.id} className="border-b border-concrete-100 last:border-0 hover:bg-brand-50/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-ink">{n.title}</span>
                      {n.featured && <span className="text-amber-500" title="Featured">★</span>}
                    </div>
                    <div className="font-mono text-[11px] text-concrete-500">/{n.slug} · {n.words} words</div>
                  </td>
                  <td className="px-5 py-3">
                    {n.tags.map((tg) => (
                      <span key={tg} className="mr-1 inline-block rounded bg-concrete-100 px-2 py-0.5 font-mono text-[10px] text-concrete-500">{tg}</span>
                    ))}
                  </td>
                  <td className="px-5 py-3 text-concrete-500">{a?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-concrete-500">{n.date}</td>
                  <td className="px-5 py-3"><Pill text={n.status} tone={n.status === "Published" ? "green" : "amber"} /></td>
                  <td className="px-5 py-3 text-right">
                    {perms.manageNews && (
                      <button onClick={() => togglePublish(n.id)}
                        className={`font-display text-xs font-semibold ${n.status === "Published" ? "text-concrete-500 hover:text-ink" : "text-brand-700 hover:text-brand-800"}`}>
                        {n.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
