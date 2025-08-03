import React, { useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import {
  EditorState,
  ContentState,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './customEditor.css'; // ✅ We'll create this next

const RichTextEditor = ({ value, onChange }) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    if (value) {
      const blocksFromHtml = htmlToDraft(value);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [value]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    onChange(html);
  };

  return (
    <div className="border border-base-300 rounded bg-base-100">
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbarClassName="editor-toolbar"
        wrapperClassName="editor-wrapper"
        editorClassName="editor-main px-4 py-2 min-h-[200px]"
        toolbar={{
          options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'history'],
          inline: { options: ['bold', 'italic', 'underline'] },
          blockType: {
            inDropdown: true,
            options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote', 'Code'],
          },
          fontSize: {
            inDropdown: false,
            options: [8, 9, 10, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
          },
        }}
      />
    </div>
  );
};

export default RichTextEditor;
