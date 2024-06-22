"use client";
import "@/styles/markdown.module.css";

import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import {
  EditorProvider,
  useCurrentEditor,
  EditorContent,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type EditorProps = {
  content?: string;
  setContent: (v: string) => void;
};
export default function Editor({
  content = `
  <p>
    Add a description in <em>markdown</em>
  </p>
  `,
  setContent,
}: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight, Typography],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base m-5 focus:outline-none",
      },
    },
    content: content,
    onBlur({ editor, event }) {
      // The editor isn’t focused anymore.
      const html = editor.getHTML();
      setContent(html);
    },
  });

  return <EditorContent editor={editor} />;
}
