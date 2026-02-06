import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
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
  Type,
  CheckSquare,
  Minus,
  Eye,
  EyeOff
} from "lucide-react";
import "./customEditor.css";

export default function TiptapEditor({ onChange, value = "", height = "400px" }) {
  const [showHTML, setShowHTML] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const slashRangeRef = useRef(null);
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);

  const commands = useMemo(() => [
    {
      title: "Text",
      description: "Normal paragraph",
      icon: Type,
      keywords: ["paragraph", "text", "normal"],
      action: (ed) => ed.chain().focus().setParagraph().run(),
    },
    {
      title: "Heading 1",
      description: "Large section title",
      icon: Heading,
      keywords: ["h1", "heading", "title"],
      action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section title",
      icon: Heading,
      keywords: ["h2", "heading", "subtitle"],
      action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section title",
      icon: Heading,
      keywords: ["h3", "heading"],
      action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "Bold",
      description: "Emphasize text",
      icon: Bold,
      keywords: ["bold", "strong"],
      action: (ed) => ed.chain().focus().toggleBold().run(),
    },
    {
      title: "Italic",
      description: "Emphasize text",
      icon: Italic,
      keywords: ["italic", "emphasis"],
      action: (ed) => ed.chain().focus().toggleItalic().run(),
    },
    {
      title: "Underline",
      description: "Underline text",
      icon: UnderlineIcon,
      keywords: ["underline"],
      action: (ed) => ed.chain().focus().toggleUnderline().run(),
    },
    {
      title: "Strikethrough",
      description: "Strike text",
      icon: Minus,
      keywords: ["strike", "strikethrough"],
      action: (ed) => ed.chain().focus().toggleStrike().run(),
    },
    {
      title: "Bullet List",
      description: "Create a bullet list",
      icon: List,
      keywords: ["list", "bullet"],
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Checklist",
      description: "Create a task list",
      icon: CheckSquare,
      keywords: ["task", "checklist", "todo"],
      action: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      icon: ListOrdered,
      keywords: ["list", "ordered", "numbered"],
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "Quote",
      description: "Insert a quote block",
      icon: Quote,
      keywords: ["quote", "blockquote"],
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "Inline Code",
      description: "Code style",
      icon: Code,
      keywords: ["code", "inline"],
      action: (ed) => ed.chain().focus().toggleCode().run(),
    },
    {
      title: "Code Block",
      description: "Block of code",
      icon: Code2,
      keywords: ["code", "block"],
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "Divider",
      description: "Horizontal rule",
      icon: Minus,
      keywords: ["divider", "hr", "line"],
      action: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },
    {
      title: "Link",
      description: "Add or edit a link",
      icon: LinkIcon,
      keywords: ["link", "url"],
      action: (ed) => {
        const url = prompt("Enter URL (e.g., https://example.com):");
        if (!url) return;
        ed.chain().focus().setLink({ href: url }).run();
      },
    },
    {
      title: "Remove Link",
      description: "Clear link formatting",
      icon: Link2Off,
      keywords: ["unlink", "remove link"],
      action: (ed) => ed.chain().focus().unsetLink().run(),
    },
  ], []);

  const filteredCommands = useMemo(() => {
    const q = slashQuery.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q))
    );
  }, [commands, slashQuery]);

  useEffect(() => {
    if (!slashOpen) return;
    if (slashIndex >= filteredCommands.length) {
      setSlashIndex(0);
    }
  }, [slashOpen, slashIndex, filteredCommands.length]);

  const applySlashCommand = (cmd) => {
    const ed = editorRef.current;
    if (!ed || !cmd) return;
    const range = slashRangeRef.current;
    if (range) {
      ed.chain().focus().deleteRange(range).run();
    }
    cmd.action(ed);
    setSlashOpen(false);
  };

  const updateSlashMenu = (ed) => {
    if (!ed || !ed.view) return;
    const { $from } = ed.state.selection;
    const text = $from.parent.textBetween(0, $from.parentOffset, "\n");
    const lastSlash = text.lastIndexOf("/");
    if (lastSlash === -1) {
      setSlashOpen(false);
      return;
    }
    if (lastSlash > 0 && text[lastSlash - 1] !== " ") {
      setSlashOpen(false);
      return;
    }
    const query = text.slice(lastSlash + 1);
    if (query.includes(" ")) {
      setSlashOpen(false);
      return;
    }
    const from = $from.start() + lastSlash + 1;
    const to = $from.pos;
    slashRangeRef.current = { from: from - 1, to };
    setSlashQuery(query);
    setSlashOpen(true);
    const coords = ed.view.coordsAtPos(to);
    const containerRect = editorContainerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setSlashPos({
        top: coords.bottom - containerRect.top + 8,
        left: coords.left - containerRect.left,
      });
    }
  };

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
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
    ],
    content: value || "<p></p>",
    onCreate: ({ editor }) => {
      editorRef.current = editor;
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      updateSlashMenu(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      updateSlashMenu(editor);
    },
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (!slashOpen) return false;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSlashIndex((prev) =>
            filteredCommands.length === 0 ? 0 : (prev + 1) % filteredCommands.length
          );
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSlashIndex((prev) =>
            filteredCommands.length === 0
              ? 0
              : (prev - 1 + filteredCommands.length) % filteredCommands.length
          );
          return true;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setSlashOpen(false);
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          applySlashCommand(filteredCommands[slashIndex]);
          return true;
        }
        return false;
      },
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

  if (!editor) return <div className="p-4 text-base-content/60">Loading editor...</div>;

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
        ref={editorContainerRef}
        className="rounded-md border-2 border-base-300 bg-base-100 overflow-y-auto editor-container relative"
        style={{ height }}
      >
        {showHTML ? (
          <div className="p-4 text-sm whitespace-pre-wrap font-mono bg-base-200 text-base-content h-full overflow-auto">
            {editor.getHTML()}
          </div>
        ) : (
          <EditorContent
            editor={editor}
            className="tiptap-editor h-full"
          />
        )}

        {slashOpen && filteredCommands.length > 0 && (
          <div
            className="absolute z-50 w-72 max-h-64 overflow-auto rounded-xl border border-base-200 bg-base-100 shadow-xl"
            style={{ top: slashPos.top, left: slashPos.left }}
          >
            <div className="px-3 py-2 text-xs font-semibold text-base-content/60 border-b border-base-200">
              Slash Commands
            </div>
            <div className="p-1">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isActive = idx === slashIndex;
                return (
                  <button
                    key={cmd.title}
                    type="button"
                    className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left ${
                      isActive ? "bg-base-200" : "hover:bg-base-200/70"
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySlashCommand(cmd);
                    }}
                  >
                    <span className="mt-0.5 text-base-content/80">
                      <Icon size={16} />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-base-content">
                        {cmd.title}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {cmd.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
