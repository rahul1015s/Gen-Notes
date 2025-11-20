// NotionEditor.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import FloatingMenu from "@tiptap/extension-floating-menu";
import Suggestion from "@tiptap/suggestion";

import { lowlight } from "lowlight/lib/common"; // common languages bundled
import "highlight.js/styles/github.css"; // pick any highlight.js style

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Code as CodeIcon,
  Copy,
  Link as LinkIcon,
  Hash,
  List as ListIcon,
  ListOrdered,
  Quote as QuoteIcon,
  ChevronDown,
  Terminal,
  Plus,
  X,
} from "lucide-react";

import axios from "axios";

/* -------------------------
  Slash suggestion logic (minimal)
   - shows a small menu on typing `/`
   - items: paragraph, h1-h3, code, todo, bullet list, quote, table
---------------------------*/
const slashItems = [
  { title: "Paragraph", command: ({ editor, range }) => editor.chain().focus().setParagraph().run() },
  { title: "Heading 1", command: ({ editor, range }) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: "Heading 2", command: ({ editor, range }) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: "Heading 3", command: ({ editor, range }) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { title: "Code Block", command: ({ editor, range }) => editor.chain().focus().toggleCodeBlock().run() },
  { title: "To-do", command: ({ editor, range }) => editor.chain().focus().toggleTaskList().run() },
  { title: "Bullet List", command: ({ editor, range }) => editor.chain().focus().toggleBulletList().run() },
  { title: "Quote", command: ({ editor, range }) => editor.chain().focus().toggleBlockquote().run() },
  { title: "Table (2x2)", command: ({ editor, range }) => editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run() },
];

const SlashCommand = () => {
  return {
    // This create method required by @tiptap/suggestion
    char: "/",
    startOfLine: true,
    command: ({ editor, range, props }) => {
      props.command({ editor, range });
    },
    items: ({ query }) => {
      if (!query) return slashItems;
      return slashItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
    },
  };
};

/* -------------------------
  Main Editor Component
---------------------------*/
export default function NotionEditor({ initial = "<p><br></p>", docId = null }) {
  const [showHTML, setShowHTML] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Type '/' for commands, or start writing..." }),
      Code.configure(),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: "notion-code-block rounded-md" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      BubbleMenu.configure({
        // bubble menu attached to selection (we render later)
      }),
      FloatingMenu.configure({
        // floating menu on caret (we render later)
      }),
      Suggestion.configure(SlashCommand()),
    ],
    content: initial,
    autofocus: false,
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      setMounted(true);
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    },
  });

  // safe destroy
  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  // Toolbar actions helpers
  const toggleMark = (mark) => editor.chain().focus()[`toggle${capitalize(mark)}`]().run();
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Save / load handlers (calls Express backend)
  const saveDocument = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const html = editor.getHTML();
      const payload = { id: docId, content: html };
      await axios.post("/api/doc/save", payload);
      setSaving(false);
      // show toast with DaisyUI? We'll just set saving false
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const loadDocument = async () => {
    if (!docId) return;
    try {
      const res = await axios.get(`/api/doc/load/${docId}`);
      if (res.data?.content && editor) {
        editor.commands.setContent(res.data.content);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (docId) loadDocument();
  }, [docId, editor]);

  // Copy code block content helper
  const copyCurrentCodeBlock = async () => {
    if (!editor) return;
    const { state } = editor;
    // attempt to find the nearest codeBlock node under selection
    const { from, to } = state.selection;
    let code = null;
    state.doc.nodesBetween(from, to, (node) => {
      if (!code && node.type.name === "codeBlock") {
        code = node.textContent;
      }
    });
    if (!code) {
      // fallback: get full selection text
      code = editor.state.doc.textBetween(from, to, "\n");
    }
    try {
      await navigator.clipboard.writeText(code || "");
      // optionally show UI feedback
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  // set code block language (works with code-block-lowlight by setting node attrs)
  const setCodeBlockLanguage = (lang) => {
    editor.chain().focus().updateAttributes("codeBlock", { language: lang }).run();
    setSelectedLanguage(lang);
  };

  if (!editor || !mounted) return <div className="p-4">Loading editor...</div>;

  /* -------------------------
     UI layout (DaisyUI + Tailwind)
  ---------------------------*/
  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-base-100 border rounded-md px-2 py-1 flex items-center gap-1">
          <button className={`btn btn-sm btn-ghost`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <Bold size={16} />
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={16} /></button>
          <button className="btn btn-sm btn-ghost" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={16} /></button>
          <button className="btn btn-sm btn-ghost" onClick={() => editor.chain().focus().toggleStrike().run()} title="Strike"><X size={16} /></button>
          <div className="divider divider-vertical h-6" />
          <button className="btn btn-sm btn-ghost" onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet"><ListIcon size={16} /></button>
          <button className="btn btn-sm btn-ghost" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered"><ListOrdered size={16} /></button>
          <button className="btn btn-sm btn-ghost" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><QuoteIcon size={16} /></button>
          <div className="divider divider-vertical h-6" />
          <button className="btn btn-sm btn-ghost" onClick={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }} title="Insert link"><LinkIcon size={16} /></button>
          <button className="btn btn-sm btn-ghost" onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link"><LinkIcon size={16} /></button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">{wordCount} words</div>

          <select className="select select-sm" value={selectedLanguage} onChange={(e) => setCodeBlockLanguage(e.target.value)}>
            {/* show a few common languages; lowlight supports many */}
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="bash">Bash</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
          </select>

          <button className={`btn btn-sm ${saving ? "loading" : "btn-primary"}`} onClick={saveDocument}>
            {saving ? "Saving" : "Save"}
          </button>

          <button className="btn btn-sm btn-ghost" onClick={() => setShowHTML(s => !s)} title="Toggle HTML view">
            <Terminal size={16} />
          </button>
        </div>
      </div>

      {/* Editor container */}
      <div className="card border bg-white shadow-sm">
        <div className="card-body p-0">
          {/* Floating menu (shows when caret at start of block) */}
          <FloatingMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            shouldShow={({ state }) => {
              // show if selection is empty (caret) and current node is paragraph
              const { empty } = state.selection;
              return empty;
            }}
          >
            <div className="bg-base-200 p-2 rounded-md flex items-center gap-1">
              <button className="btn btn-ghost btn-xs" title="Insert block" onClick={() => {
                // example: insert image placeholder
                const url = prompt("Image URL (optional)");
                editor.chain().focus().insertContent('<p><img src="'+(url||'https://placehold.co/600x200')+'"/></p>').run();
              }}><Plus size={14} /></button>
              <button className="btn btn-ghost btn-xs" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><QuoteIcon size={14} /></button>
              <button className="btn btn-ghost btn-xs" onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code"><CodeIcon size={14} /></button>
            </div>
          </FloatingMenu>

          {/* Bubble Menu (selection formatting) */}
          <BubbleMenu editor={editor} tippyOptions={{ duration: 120 }}>
            <div className="bg-base-200 p-2 rounded-md flex items-center gap-1">
              <button className="btn btn-ghost btn-xs" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></button>
              <button className="btn btn-ghost btn-xs" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></button>
              <button className="btn btn-ghost btn-xs" onClick={() => editor.chain().focus().toggleCode().run()}><CodeIcon size={14} /></button>
              <button className="btn btn-ghost btn-xs" onClick={() => {
                const url = prompt("Link URL:");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}><LinkIcon size={14} /></button>
            </div>
          </BubbleMenu>

          <div className="p-6 min-h-[300px]">
            {showHTML ? (
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono whitespace-pre-wrap">
                {editor.getHTML()}
              </pre>
            ) : (
              <EditorContent editor={editor} className="prose max-w-none outline-none" />
            )}
          </div>

          {/* status bar */}
          <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-500 border-t">
            <div>
              {editor.isActive("heading", { level: 1 }) && "Heading 1"}
              {editor.isActive("heading", { level: 2 }) && "Heading 2"}
              {editor.isActive("heading", { level: 3 }) && "Heading 3"}
              {editor.isActive("paragraph") && !editor.isActive("heading") && "Paragraph"}
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-xs" onClick={copyCurrentCodeBlock} title="Copy code"><Copy size={14} /></button>
              <div>Last saved: Just now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
