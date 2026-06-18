"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Node as TiptapNode, type NodeViewProps } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

// ─── Progress Banner node view (rendered in editor) ─────────────────
function ProgressBannerView({ node }: NodeViewProps) {
  const { label, title, barLabel, percent } = node.attrs;
  return (
    <NodeViewWrapper>
      <div className="article-progress-banner" contentEditable={false}>
        <div className="progress-left">
          <div className="progress-label">{label}</div>
          <div className="progress-title">{title}</div>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-top">
            <span>{barLabel}</span>
            <span>~{percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// ─── Stats Strip node view ───────────────────────────────────────────
function StatsStripView({ node }: NodeViewProps) {
  const stats: { value: string; label: string }[] = JSON.parse(node.attrs.stats || "[]");
  return (
    <NodeViewWrapper>
      <div className="article-stats-strip" contentEditable={false}>
        {stats.map((s, i) => (
          <div key={i} className="stats-cell">
            <div className="stats-value">{s.value}</div>
            <div className="stats-label">{s.label}</div>
          </div>
        ))}
      </div>
    </NodeViewWrapper>
  );
}

// ─── TipTap node definitions ─────────────────────────────────────────
const ProgressBannerNode = TiptapNode.create({
  name: "progressBanner",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      label:    { default: "Billing Progress" },
      title:    { default: "Progress Draw #1" },
      barLabel: { default: "Construction Completion" },
      percent:  { default: 50 },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="progress-banner"]' }];
  },
  renderHTML({ node }) {
    const { label, title, barLabel, percent } = node.attrs;
    return [
      "div", { "data-type": "progress-banner", class: "article-progress-banner" },
      ["div", { class: "progress-left" },
        ["div", { class: "progress-label" }, label],
        ["div", { class: "progress-title" }, title],
      ],
      ["div", { class: "progress-bar-wrap" },
        ["div", { class: "progress-bar-top" },
          ["span", {}, barLabel],
          ["span", {}, `~${percent}%`],
        ],
        ["div", { class: "progress-track" },
          ["div", { class: "progress-fill", style: `width:${percent}%` }],
        ],
      ],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ProgressBannerView);
  },
});

const StatsStripNode = TiptapNode.create({
  name: "statsStrip",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      stats: { default: '[{"value":"0","label":"Stat"}]' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="stats-strip"]' }];
  },
  renderHTML({ node }) {
    const stats: { value: string; label: string }[] = JSON.parse(node.attrs.stats || "[]");
    return [
      "div", { "data-type": "stats-strip", class: "article-stats-strip" },
      ...stats.map((s) => [
        "div", { class: "stats-cell" },
        ["div", { class: "stats-value" }, s.value],
        ["div", { class: "stats-label" }, s.label],
      ] as [string, Record<string, string>, ...unknown[]]),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StatsStripView);
  },
});

// ─── Toolbar helpers ─────────────────────────────────────────────────
function ToolBtn({
  onClick, active, title, children,
}: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button" title={title} onClick={onClick}
      className={`rounded px-2 py-1 font-mono text-xs transition-colors ${
        active ? "bg-brand-100 text-brand-700" : "text-concrete-500 hover:bg-concrete-100 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
const Divider = () => <div className="mx-1 w-px self-stretch bg-concrete-200" />;

// ─── URL parsers ─────────────────────────────────────────────────────
function parseYouTubeId(url: string) {
  const m = url.match(/youtube\.com\/watch\?v=([\w-]+)/) || url.match(/youtu\.be\/([\w-]+)/) || url.match(/youtube\.com\/embed\/([\w-]+)/);
  return m ? m[1] : null;
}
function parseVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

// ─── Main component ──────────────────────────────────────────────────
const emptyProgress = () => ({ label: "Billing Progress", title: "Progress Draw #1 — Month 2026", barLabel: "Construction Completion", percent: "50" });
const emptyStats = () => [
  { value: "", label: "" },
  { value: "", label: "" },
  { value: "", label: "" },
];

type Panel = "video" | "progress" | "stats" | null;

export default function RichEditor({ value, onChange, articleId }: { value: string; onChange: (html: string) => void; articleId?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [progressForm, setProgressForm] = useState(emptyProgress);
  const [stats, setStats] = useState(emptyStats);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      ProgressBannerNode,
      StatsStripNode,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "min-h-[220px] focus:outline-none prose-editor" } },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  const togglePanel = (p: Panel) => setPanel((cur) => (cur === p ? null : p));

  // Image upload
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !articleId || !editor) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/news/${articleId}/media`, { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    }
    setUploading(false);
  };

  // Video embed
  const handleVideoEmbed = () => {
    if (!editor || !videoUrl.trim()) return;
    const ytId = parseYouTubeId(videoUrl);
    if (ytId) {
      editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${ytId}` }).run();
      setPanel(null); setVideoUrl(""); return;
    }
    const vimeoId = parseVimeoId(videoUrl);
    if (vimeoId) {
      editor.chain().focus().insertContent(`<div data-type="videoEmbed"><iframe src="https://player.vimeo.com/video/${vimeoId}" width="640" height="360" frameborder="0" allowfullscreen></iframe></div>`).run();
      setPanel(null); setVideoUrl(""); return;
    }
    alert("Paste a YouTube or Vimeo URL.");
  };

  // Progress banner insert
  const handleInsertProgress = () => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "progressBanner",
      attrs: { ...progressForm, percent: parseInt(progressForm.percent) || 0 },
    }).run();
    setProgressForm(emptyProgress());
    setPanel(null);
  };

  // Stats strip insert
  const handleInsertStats = () => {
    if (!editor) return;
    const filtered = stats.filter((s) => s.value.trim() || s.label.trim());
    if (filtered.length < 1) return;
    editor.chain().focus().insertContent({
      type: "statsStrip",
      attrs: { stats: JSON.stringify(filtered) },
    }).run();
    setStats(emptyStats());
    setPanel(null);
  };

  const setStat = (i: number, k: "value" | "label", v: string) =>
    setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border border-concrete-200 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-concrete-200 bg-concrete-50 px-2 py-1.5">
        <ToolBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><strong>B</strong></ToolBtn>
        <ToolBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><em>I</em></ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><s>S</s></ToolBtn>
        <Divider />
        <ToolBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</ToolBtn>
        <Divider />
        <ToolBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>≡</ToolBtn>
        <ToolBtn title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1.</ToolBtn>
        <Divider />
        <ToolBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>❝</ToolBtn>
        <ToolBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolBtn>
        <Divider />
        {/* Image */}
        <ToolBtn title={articleId ? "Insert image" : "Save article first to insert images"} onClick={() => articleId && fileInputRef.current?.click()} active={false}>
          {uploading
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 animate-spin"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
          }
        </ToolBtn>
        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageFile} />
        {/* Video */}
        <ToolBtn title="Embed YouTube / Vimeo" onClick={() => togglePanel("video")} active={panel === "video"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" />
          </svg>
        </ToolBtn>
        <Divider />
        {/* Progress Banner */}
        <ToolBtn title="Insert progress banner" onClick={() => togglePanel("progress")} active={panel === "progress"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <rect x="2" y="9" width="20" height="6" rx="1" />
            <path d="M2 9h12" strokeWidth="3" />
          </svg>
        </ToolBtn>
        {/* Stats Strip */}
        <ToolBtn title="Insert stats strip" onClick={() => togglePanel("stats")} active={panel === "stats"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <rect x="2" y="2" width="6" height="20" rx="1" />
            <rect x="9" y="7" width="6" height="15" rx="1" />
            <rect x="16" y="12" width="6" height="10" rx="1" />
          </svg>
        </ToolBtn>
        <Divider />
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
      </div>

      {/* Video URL panel */}
      {panel === "video" && (
        <div className="flex items-center gap-2 border-b border-concrete-200 bg-brand-50 px-3 py-2">
          <input autoFocus type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleVideoEmbed(); } if (e.key === "Escape") setPanel(null); }}
            placeholder="Paste a YouTube or Vimeo URL…"
            className="flex-1 bg-transparent font-mono text-xs text-ink outline-none placeholder:text-concrete-400"
          />
          <button type="button" onClick={handleVideoEmbed} className="rounded bg-brand-700 px-2.5 py-1 font-mono text-[10px] font-bold text-white hover:bg-brand-800">Embed</button>
          <button type="button" onClick={() => { setPanel(null); setVideoUrl(""); }} className="text-concrete-400 hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Progress banner panel */}
      {panel === "progress" && (
        <div className="border-b border-concrete-200 bg-concrete-50 px-3 py-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-concrete-500">Progress Banner</p>
          <div className="grid grid-cols-2 gap-2">
            <input autoFocus placeholder="Label (e.g. Billing Progress)" value={progressForm.label} onChange={(e) => setProgressForm((f) => ({ ...f, label: e.target.value }))}
              className="rounded border border-concrete-200 bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-brand-400 placeholder:text-concrete-400" />
            <input placeholder="Title (e.g. Progress Draw #29 — May 2026)" value={progressForm.title} onChange={(e) => setProgressForm((f) => ({ ...f, title: e.target.value }))}
              className="rounded border border-concrete-200 bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-brand-400 placeholder:text-concrete-400" />
            <input placeholder="Bar label (e.g. Construction Completion)" value={progressForm.barLabel} onChange={(e) => setProgressForm((f) => ({ ...f, barLabel: e.target.value }))}
              className="rounded border border-concrete-200 bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-brand-400 placeholder:text-concrete-400" />
            <input type="number" min={0} max={100} placeholder="% complete" value={progressForm.percent} onChange={(e) => setProgressForm((f) => ({ ...f, percent: e.target.value }))}
              className="rounded border border-concrete-200 bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-brand-400 placeholder:text-concrete-400" />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setPanel(null)} className="font-mono text-[10px] text-concrete-400 hover:text-ink">Cancel</button>
            <button type="button" onClick={handleInsertProgress} className="rounded bg-brand-700 px-3 py-1 font-mono text-[10px] font-bold text-white hover:bg-brand-800">Insert</button>
          </div>
        </div>
      )}

      {/* Stats strip panel */}
      {panel === "stats" && (
        <div className="border-b border-concrete-200 bg-concrete-50 px-3 py-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-concrete-500">Stats Strip (up to 3)</p>
          <div className="space-y-1.5">
            {stats.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <input placeholder={`Stat ${i + 1} value (e.g. 29)`} value={s.value} onChange={(e) => setStat(i, "value", e.target.value)}
                  className="rounded border border-concrete-200 bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-brand-400 placeholder:text-concrete-400" />
                <input placeholder={`Stat ${i + 1} label (e.g. Progress Draws)`} value={s.label} onChange={(e) => setStat(i, "label", e.target.value)}
                  className="rounded border border-concrete-200 bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-brand-400 placeholder:text-concrete-400" />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setPanel(null)} className="font-mono text-[10px] text-concrete-400 hover:text-ink">Cancel</button>
            <button type="button" onClick={handleInsertStats} className="rounded bg-brand-700 px-3 py-1 font-mono text-[10px] font-bold text-white hover:bg-brand-800">Insert</button>
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className="px-3 py-2 text-sm text-ink [&_.prose-editor_blockquote]:my-2 [&_.prose-editor_blockquote]:border-l-4 [&_.prose-editor_blockquote]:border-concrete-300 [&_.prose-editor_blockquote]:pl-3 [&_.prose-editor_blockquote]:text-concrete-500 [&_.prose-editor_code]:rounded [&_.prose-editor_code]:bg-concrete-100 [&_.prose-editor_code]:px-1 [&_.prose-editor_h2]:mt-3 [&_.prose-editor_h2]:font-display [&_.prose-editor_h2]:text-lg [&_.prose-editor_h2]:font-bold [&_.prose-editor_h3]:mt-2 [&_.prose-editor_h3]:font-display [&_.prose-editor_h3]:text-base [&_.prose-editor_h3]:font-semibold [&_.prose-editor_img]:my-3 [&_.prose-editor_img]:max-w-full [&_.prose-editor_img]:rounded-lg [&_.prose-editor_li]:ml-4 [&_.prose-editor_ol]:list-decimal [&_.prose-editor_p]:my-1 [&_.prose-editor_p]:leading-relaxed [&_.prose-editor_ul]:list-disc [&_.prose-editor_iframe]:my-3 [&_.prose-editor_iframe]:max-w-full [&_.prose-editor_iframe]:rounded-lg">
        <EditorContent editor={editor} />
      </div>

      {!articleId && (
        <div className="border-t border-concrete-100 px-3 py-1.5 text-[11px] text-concrete-400">
          Save the article first to enable image uploads.
        </div>
      )}
    </div>
  );
}
