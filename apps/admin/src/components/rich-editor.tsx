"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TiptapImage from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  ImagePlus,
  Undo,
  Redo,
} from "lucide-react";

interface RichEditorProps {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export function RichEditor({
  content,
  onChange,
  onImageUpload,
}: RichEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({ levels: [2, 3, 4] }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
    ],
    content: content ?? undefined,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
  });

  const handleImageFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url, alt: "" }).run();
      } catch {
        // エラーは親コンポーネントで処理
      }
      e.target.value = "";
    },
    [editor, onImageUpload],
  );

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="見出し2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="見出し3"
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 4 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          title="見出し4"
        >
          <Heading4 size={16} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="太字"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜体"
        >
          <Italic size={16} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="箇条書き"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="番号付きリスト"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          active={false}
          onClick={() => fileRef.current?.click()}
          title="画像を追加"
        >
          <ImagePlus size={16} />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="元に戻す"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="やり直す"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="rich-editor-content prose prose-sm max-w-none px-3 py-2 text-sm [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none"
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageFile}
        className="hidden"
      />
    </div>
  );
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-600 hover:bg-gray-200 disabled:opacity-30"
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 w-px self-stretch bg-gray-200" />;
}
