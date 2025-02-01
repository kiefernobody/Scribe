"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Break } from "@/types/editor";
import { calculateWordCount } from "@/utils/helpers";

interface EditorContentProps {
  currentBreak: Break;
  updateBreak: (breakId: string, updates: Partial<Break>) => void;
  editorContentRef: React.RefObject<HTMLDivElement>;
}

const EditorContent: React.FC<EditorContentProps> = ({ currentBreak, updateBreak, editorContentRef }) => {
  const [content, setContent] = useState<string>(currentBreak.content || "");
  const selectionRef = useRef<{ node: Node | null; offset: number } | null>(null);

  useEffect(() => {
    setContent(currentBreak.content || "");
  }, [currentBreak.content]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      selectionRef.current = { node: range.startContainer, offset: range.startOffset };
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (selectionRef.current && editorContentRef.current) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(selectionRef.current.node || editorContentRef.current, selectionRef.current.offset);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editorContentRef]);

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);
      updateBreak(currentBreak.id, { content: newContent, wordCount: calculateWordCount(newContent) });
    },
    [currentBreak.id, updateBreak]
  );

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    saveSelection();
    updateContent(e.currentTarget.innerText);
    restoreSelection();
  }, [updateContent, saveSelection, restoreSelection]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const paragraphs = text.split(/\r?\n/).map(line => `<p>${line}</p>`).join("");
    document.execCommand("insertHTML", false, paragraphs);
  }, []);

  return (
    <motion.div className="w-full h-full">
      <div
        ref={editorContentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        className="w-full h-full p-8 text-foreground focus:outline-none font-sans overflow-y-auto selection:bg-primary/30 selection:text-foreground"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          lineHeight: "1.8",
          fontSize: "18px",
          maxWidth: "100%",
        }}
      >
        {content}
      </div>
    </motion.div>
  );
};

export default EditorContent;

