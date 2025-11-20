import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
  EyeOff
} from "lucide-react";
import "./customEditor.css";

export default function TiptapEditor({ onChange, value = "", height = "400px" }) {
  const [showHTML, setShowHTML] = useState(false);
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 10,
        },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: "Start typing your note here...",
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (!mounted) return;
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
    setMounted(true);
  }, [value, editor, mounted]);

  // Initialize mounted state after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return <div className="p-4 text-gray-400">Loading editor...</div>;

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
      <div className="flex flex-wrap gap-1 bg-base-200 p-3 rounded-lg border border-base-300">
        <div className="flex flex-wrap gap-1 w-full">
          <ToolbarButton
            title="Bold (Ctrl+B)"
            icon={Bold}
            isActive={editor.isActive("bold")}
            action={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            title="Italic (Ctrl+I)"
            icon={Italic}
            isActive={editor.isActive("italic")}
            action={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            title="Underline (Ctrl+U)"
            icon={UnderlineIcon}
            isActive={editor.isActive("underline")}
            action={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            title="Strikethrough"
            icon={Minus}
            isActive={editor.isActive("strike")}
            action={() => editor.chain().focus().toggleStrike().run()}
          />
          
          <div className="divider divider-horizontal mx-1 h-auto my-0"></div>

          <ToolbarButton
            title="Code (Ctrl+`)"
            icon={Code}
            isActive={editor.isActive("code")}
            action={() => editor.chain().focus().toggleCode().run()}
          />
          <ToolbarButton
            title="Code Block"
            icon={Code2}
            isActive={editor.isActive("codeBlock")}
            action={() => editor.chain().focus().toggleCodeBlock().run()}
          />
          
          <div className="divider divider-horizontal mx-1 h-auto my-0"></div>

          <ToolbarButton
            title="Quote"
            icon={Quote}
            isActive={editor.isActive("blockquote")}
            action={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            title="Heading 2"
            icon={Heading}
            isActive={editor.isActive("heading")}
            action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          
          <div className="divider divider-horizontal mx-1 h-auto my-0"></div>

          <ToolbarButton
            title="Bullet List"
            icon={List}
            isActive={editor.isActive("bulletList")}
            action={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            title="Ordered List"
            icon={ListOrdered}
            isActive={editor.isActive("orderedList")}
            action={() => editor.chain().focus().toggleOrderedList().run()}
          />
          
          <div className="divider divider-horizontal mx-1 h-auto my-0"></div>

          <ToolbarButton
            title="Insert Link"
            icon={LinkIcon}
            isActive={editor.isActive("link")}
            action={() => {
              const url = prompt("Enter URL (e.g., https://example.com):");
              if (url) {
                editor
                  .chain()
                  .focus()
                  .setLink({ href: url })
                  .run();
              }
            }}
          />
          <ToolbarButton
            title="Remove Link"
            icon={Link2Off}
            isActive={false}
            action={() => editor.chain().focus().unsetLink().run()}
          />

          <div className="divider divider-horizontal mx-1 h-auto my-0"></div>

          <ToolbarButton
            title={showHTML ? "Hide HTML" : "Show HTML"}
            icon={showHTML ? EyeOff : Eye}
            isActive={showHTML}
            action={() => setShowHTML((prev) => !prev)}
          />
        </div>
      </div>

      {/* Editor or HTML Preview */}
      <div
        className="rounded-md border-2 border-base-300 bg-base-100 overflow-y-auto editor-container"
        style={{ height }}
      >
        {showHTML ? (
          <div className="p-4 text-sm whitespace-pre-wrap font-mono bg-base-200 h-full overflow-auto">
            {editor.getHTML()}
          </div>
        ) : (
          <EditorContent
            editor={editor}
            className="tiptap-editor h-full"
          />
        )}
      </div>
    </div>
  );
}
