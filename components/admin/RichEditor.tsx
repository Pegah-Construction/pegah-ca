"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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

export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
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
    if (current !== value) editor.commands.setContent(value, false);
  }, [value, editor]);

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
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
      </div>

      {/* Editor area */}
      <div className="px-3 py-2 text-sm text-ink [&_.prose-editor_blockquote]:my-2 [&_.prose-editor_blockquote]:border-l-4 [&_.prose-editor_blockquote]:border-concrete-300 [&_.prose-editor_blockquote]:pl-3 [&_.prose-editor_blockquote]:text-concrete-500 [&_.prose-editor_code]:rounded [&_.prose-editor_code]:bg-concrete-100 [&_.prose-editor_code]:px-1 [&_.prose-editor_h2]:mt-3 [&_.prose-editor_h2]:font-display [&_.prose-editor_h2]:text-lg [&_.prose-editor_h2]:font-bold [&_.prose-editor_h3]:mt-2 [&_.prose-editor_h3]:font-display [&_.prose-editor_h3]:text-base [&_.prose-editor_h3]:font-semibold [&_.prose-editor_li]:ml-4 [&_.prose-editor_ol]:list-decimal [&_.prose-editor_p]:my-1 [&_.prose-editor_p]:leading-relaxed [&_.prose-editor_ul]:list-disc">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
