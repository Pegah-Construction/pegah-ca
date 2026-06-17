"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 font-mono text-xs transition-colors ${
        active
          ? "bg-brand-100 text-brand-700"
          : "text-concrete-500 hover:bg-concrete-100 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <div className="mx-1 w-px self-stretch bg-concrete-200" />;

function parseYouTubeId(url: string): string | null {
  const m =
    url.match(/youtube\.com\/watch\?v=([\w-]+)/) ||
    url.match(/youtu\.be\/([\w-]+)/) ||
    url.match(/youtube\.com\/embed\/([\w-]+)/);
  return m ? m[1] : null;
}

function parseVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export default function RichEditor({
  value,
  onChange,
  articleId,
}: {
  value: string;
  onChange: (html: string) => void;
  articleId?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[220px] focus:outline-none prose-editor",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

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

  const handleVideoEmbed = () => {
    if (!editor || !videoUrl.trim()) return;
    const ytId = parseYouTubeId(videoUrl);
    if (ytId) {
      editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${ytId}` }).run();
      setVideoPrompt(false);
      setVideoUrl("");
      return;
    }
    const vimeoId = parseVimeoId(videoUrl);
    if (vimeoId) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<div data-type="videoEmbed"><iframe src="https://player.vimeo.com/video/${vimeoId}" width="640" height="360" frameborder="0" allowfullscreen></iframe></div>`,
        )
        .run();
      setVideoPrompt(false);
      setVideoUrl("");
      return;
    }
    alert("Paste a YouTube or Vimeo URL.");
  };

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border border-concrete-200 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-concrete-200 bg-concrete-50 px-2 py-1.5">
        <ToolBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <s>S</s>
        </ToolBtn>
        <Divider />
        <ToolBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          H2
        </ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          H3
        </ToolBtn>
        <Divider />
        <ToolBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          ≡
        </ToolBtn>
        <ToolBtn title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          1.
        </ToolBtn>
        <Divider />
        <ToolBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          ❝
        </ToolBtn>
        <ToolBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
          {"</>"}
        </ToolBtn>
        <Divider />
        {/* Image upload */}
        <ToolBtn
          title={articleId ? "Insert image" : "Save article first to insert images"}
          onClick={() => articleId && fileInputRef.current?.click()}
          active={false}
        >
          {uploading ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 animate-spin"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          )}
        </ToolBtn>
        <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm" className="sr-only" onChange={handleImageFile} />
        {/* Video embed */}
        <ToolBtn
          title="Embed YouTube or Vimeo video"
          onClick={() => setVideoPrompt((v) => !v)}
          active={videoPrompt}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" />
          </svg>
        </ToolBtn>
        <Divider />
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
      </div>

      {/* Video URL input (shown inline under toolbar) */}
      {videoPrompt && (
        <div className="flex items-center gap-2 border-b border-concrete-200 bg-brand-50 px-3 py-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-brand-600">
            <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" />
          </svg>
          <input
            autoFocus
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleVideoEmbed(); } if (e.key === "Escape") setVideoPrompt(false); }}
            placeholder="Paste a YouTube or Vimeo URL…"
            className="flex-1 bg-transparent font-mono text-xs text-ink outline-none placeholder:text-concrete-400"
          />
          <button
            type="button"
            onClick={handleVideoEmbed}
            className="rounded bg-brand-700 px-2.5 py-1 font-mono text-[10px] font-bold text-white hover:bg-brand-800"
          >
            Embed
          </button>
          <button type="button" onClick={() => { setVideoPrompt(false); setVideoUrl(""); }} className="text-concrete-400 hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
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
