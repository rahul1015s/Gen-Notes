import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Link2Off,
  Code,
  Code2,
  List,
  ListOrdered,
  Quote,
  Heading,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";

export default function TiptapEditor({ onChange }) {
  const [showHTML, setShowHTML] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      CodeBlock,
    ],
    content: "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({ icon: Icon, action, isActive, title }) => (
    <button
      type="button"
      title={title}
      className={`btn btn-sm btn-square ${
        isActive ? "btn-primary" : "btn-outline"
      }`}
      onClick={action}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 bg-base-200 p-2 rounded-lg">
        <ToolbarButton title="Bold" icon={Bold} isActive={editor.isActive("bold")} action={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton title="Italic" icon={Italic} isActive={editor.isActive("italic")} action={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton title="Underline" icon={UnderlineIcon} isActive={editor.isActive("underline")} action={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton title="Strikethrough" icon={Minus} isActive={editor.isActive("strike")} action={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarButton title="Inline Code" icon={Code} isActive={editor.isActive("code")} action={() => editor.chain().focus().toggleCode().run()} />
        <ToolbarButton title="Code Block" icon={Code2} isActive={editor.isActive("codeBlock")} action={() => editor.chain().focus().toggleCodeBlock().run()} />
        <ToolbarButton title="Quote" icon={Quote} isActive={editor.isActive("blockquote")} action={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton title="Heading" icon={Heading} isActive={editor.isActive("heading")} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton title="Bullet List" icon={List} isActive={editor.isActive("bulletList")} action={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton title="Ordered List" icon={ListOrdered} isActive={editor.isActive("orderedList")} action={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton title="Insert Link" icon={LinkIcon} isActive={editor.isActive("link")} action={() => {
          const url = prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} />
        <ToolbarButton title="Remove Link" icon={Link2Off} isActive={false} action={() => editor.chain().focus().unsetLink().run()} />
        <ToolbarButton title="Toggle HTML View" icon={showHTML ? EyeOff : Eye} isActive={false} action={() => setShowHTML((prev) => !prev)} />
      </div>

      {/* Editor or HTML Preview */}
      <div className="rounded-md border border-base-300 bg-base-100 min-h-[400px] max-h-[600px] overflow-y-auto">
        {showHTML ? (
          <div className="p-4 text-sm whitespace-pre-wrap font-mono">{editor.getHTML()}</div>
        ) : (
          <EditorContent
            editor={editor}
            className="p-4 prose max-w-none outline-none min-h-[380px]"
          />
        )}
      </div>
    </div>
  );
}
