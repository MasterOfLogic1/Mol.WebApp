import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import ResizableImage from "./ResizableImage";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Toolbar from "./Toolbar";
import "./editor.css";

export default function JournalEditor({ value, onChange, editable = true }) {
  const editorContainerRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      ResizableImage.configure({ allowBase64: true, inline: false }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editable,
    content: value ?? undefined,
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    }
  });

  // Update editor content when value prop changes (for editing)
  useEffect(() => {
    if (editor && value !== undefined && value !== null) {
      const currentContent = editor.getJSON();
      // Only update if content is actually different to avoid unnecessary updates
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      const currentStr = JSON.stringify(currentContent);
      if (valueStr !== currentStr) {
        editor.commands.setContent(value);
      }
    }
  }, [editor, value]);

  // Handle drag and drop and paste
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container || !editor || !editable) return;

    // Convert file to base64 data URL
    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    // Handle image insertion
    const insertImage = async (file) => {
      if (!file || !file.type.startsWith('image/')) {
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        editor.chain().focus().setImage({ src: base64 }).run();
      } catch (error) {
        console.error('Error inserting image:', error);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.style.opacity = '0.7';
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.style.opacity = '1';
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.style.opacity = '1';

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        // Insert all dropped images
        for (const file of imageFiles) {
          await insertImage(file);
        }
      }
    };

    // Handle paste events
    const handlePaste = async (e) => {
      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter(item => item.type.startsWith('image/'));

      if (imageItems.length > 0) {
        e.preventDefault();
        for (const item of imageItems) {
          const file = item.getAsFile();
          if (file) {
            await insertImage(file);
          }
        }
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('paste', handlePaste);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('paste', handlePaste);
    };
  }, [editor, editable]);

  if (!editor) return null;

  return (
    <div className="doc-editor" ref={editorContainerRef}>
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="doc-content" />
    </div>
  );
}