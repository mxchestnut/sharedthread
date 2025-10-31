'use client';

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';
import Typography from '@tiptap/extension-typography';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  EyeOff,
  Save,
  MessageSquare,
  Maximize,
  Minimize
} from 'lucide-react';

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  focusMode?: boolean;
  onFocusModeToggle?: () => void;
  showComments?: boolean;
  onCommentsToggle?: () => void;
}

export default function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
  focusMode = false,
  onFocusModeToggle,
  showComments = false,
  onCommentsToggle
}: TiptapEditorProps) {
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Focus.configure({
        className: 'has-focus',
      }),
      Typography,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent hover:underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML();
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // TODO: Implement actual save functionality
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  }, []);

  const addLink = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`${className} ${focusMode ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Toolbar */}
      <div className={`border-b border-border bg-white ${focusMode ? 'p-4' : 'p-3'} flex items-center gap-2 flex-wrap`}>
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
            title="Code"
          >
            <Code size={16} />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            title="Quote"
          >
            <Quote size={16} />
          </button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <button
            onClick={addLink}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
            title="Add Link"
          >
            <LinkIcon size={16} />
          </button>
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-100"
            title="Add Image"
          >
            <ImageIcon size={16} />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo size={16} />
          </button>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setIsMarkdown(false)}
              className={`px-3 py-1 text-sm rounded ${!isMarkdown ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              Rich Text
            </button>
            <button
              onClick={() => setIsMarkdown(true)}
              className={`px-3 py-1 text-sm rounded ${isMarkdown ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              Markdown
            </button>
          </div>

          {/* Comments Toggle */}
          {onCommentsToggle && (
            <button
              onClick={onCommentsToggle}
              className={`p-2 rounded hover:bg-gray-100 ${showComments ? 'bg-gray-200' : ''}`}
              title="Toggle Comments"
            >
              <MessageSquare size={16} />
            </button>
          )}

          {/* Focus Mode Toggle */}
          {onFocusModeToggle && (
            <button
              onClick={onFocusModeToggle}
              className="p-2 rounded hover:bg-gray-100"
              title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            >
              {focusMode ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`${focusMode ? 'flex-1 overflow-y-auto' : ''}`}>
        <div className={`${focusMode ? 'max-w-4xl mx-auto py-8 px-6' : ''}`}>
          {isMarkdown ? (
            <textarea
              className="w-full h-96 p-6 font-mono text-sm border-0 resize-none focus:outline-none"
              value={editor.getHTML()}
              onChange={(e) => {
                editor.commands.setContent(e.target.value);
              }}
              placeholder="Write in Markdown..."
            />
          ) : (
            <EditorContent 
              editor={editor} 
              className={`min-h-[500px] ${focusMode ? 'min-h-[70vh]' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Focus Mode Overlay */}
      {focusMode && (
        <div className="absolute top-4 right-4">
          <button
            onClick={onFocusModeToggle}
            className="p-2 bg-white border border-border rounded-lg shadow-lg hover:bg-gray-50"
            title="Exit Focus Mode"
          >
            <EyeOff size={16} />
          </button>
        </div>
      )}
    </div>
  );
}