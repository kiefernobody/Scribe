"use client";

import type React from "react";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Node as SlateNode, BaseEditor, Descendant, Editor, Transforms, Range, Element } from 'slate'
import { createEditor } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history'
import { validateAndSanitizeContent } from "@/utils/contentUtils";
import type { Break } from '@/types/editor'

// Define custom types for our editor
type CustomElement = {
  type: 'paragraph' | 'list-item'
  children: CustomText[]
  indent?: number
}

type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

const DEFAULT_CONTENT: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
    indent: 0
  },
] as CustomElement[]

// Add a new function to handle indentation
const isCustomElement = (node: unknown): node is CustomElement => {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    'children' in node &&
    (node as any).type === 'paragraph'
  );
};

const indentBlock = (editor: BaseEditor & ReactEditor & HistoryEditor, path: number[], increase: boolean) => {
  const [node] = Editor.node(editor, path);
  if (!isCustomElement(node)) return;
  
  const currentIndent = node.indent || 0;
  const newIndent = increase ? currentIndent + 1 : Math.max(0, currentIndent - 1);
  
  Transforms.setNodes<CustomElement>(
    editor,
    { indent: newIndent },
    { at: path }
  );
};

const toggleMark = (editor: BaseEditor & ReactEditor & HistoryEditor, format: keyof Omit<CustomText, 'text'>) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor: BaseEditor & ReactEditor & HistoryEditor, format: keyof Omit<CustomText, 'text'>) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const calculateWordCount = (text: string): number => {
  return text.split(/\s+/).filter(Boolean).length;
}

interface EditorContentProps {
  currentBreak: Break | null
  updateBreak: (breakId: string, updates: Partial<Break>) => void
  isLoading: boolean
  isGuidedWorkspace: boolean
}

const EditorContent: React.FC<EditorContentProps> = ({ 
  currentBreak, 
  updateBreak, 
  isLoading,
  isGuidedWorkspace 
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>(DEFAULT_CONTENT);
  const previousBreakId = useRef<string | null>(null);
  
  // Reset editor content
  const resetEditor = useCallback((content: Descendant[]) => {
    editor.children = content;
    editor.selection = null;
    setValue(content);
  }, [editor]);
  
  useEffect(() => {
    if (!currentBreak) {
      resetEditor(DEFAULT_CONTENT);
      return;
    }

    // Only update content if we've switched breaks or content has changed externally
    if (previousBreakId.current !== currentBreak.id) {
      try {
        const parsedContent = currentBreak.content 
          ? JSON.parse(currentBreak.content) 
          : DEFAULT_CONTENT;
        
        const validContent = Array.isArray(parsedContent) ? parsedContent : DEFAULT_CONTENT;
        resetEditor(validContent);
        previousBreakId.current = currentBreak.id;
      } catch (error) {
        console.error("Error parsing break content:", error);
        resetEditor(DEFAULT_CONTENT);
      }
    }
  }, [currentBreak?.id, currentBreak?.content, resetEditor]);

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      if (!currentBreak || isLoading) return;
      
      setValue(newValue);
      
      try {
        const content = JSON.stringify(newValue);
        const text = newValue
          .map(node => SlateNode.string(node))
          .join(' ');
        const wordCount = calculateWordCount(text);

        updateBreak(currentBreak.id, { content, wordCount });
      } catch (error) {
        console.error("Error updating break content:", error);
      }
    },
    [currentBreak?.id, isLoading, updateBreak]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!editor) return;

      // Handle bold (Ctrl/Cmd + B)
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleMark(editor, 'bold');
        return;
      }

      // Handle italic (Ctrl/Cmd + I)
      if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault();
        toggleMark(editor, 'italic');
        return;
      }

      // Handle tab for indentation
      if (event.key === 'Tab') {
        event.preventDefault();
        
        const { selection } = editor;
        if (!selection) return;

        const [start, end] = Range.edges(selection);
        
        // Get all block paths in the selection
        const blockEntries = Array.from(
          Editor.nodes(editor, {
            at: selection,
            match: (n: unknown) => isCustomElement(n),
          })
        );

        // Apply indentation to each selected block
        for (const [, path] of blockEntries) {
          indentBlock(editor, path, !event.shiftKey);
        }
      }
    },
    [editor]
  );

  const renderLeaf = useCallback((props: any) => {
    let { attributes, children, leaf } = props;

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }
    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  const renderElement = useCallback((props: any) => {
    const { attributes, children, element } = props;
    const indentSize = 2; // 2em per indent level
    const style = element.indent ? { marginLeft: `${element.indent * indentSize}em` } : undefined;

    return (
      <div {...attributes} style={style} className="py-1">
        {children}
      </div>
    );
  }, []);

  if (!currentBreak) {
    return <div>No break selected</div>;
  }

  return (
    <div className="flex-grow overflow-auto p-4">
      <Slate
        editor={editor}
        initialValue={value}
        onChange={handleChange}
        key={currentBreak?.id || 'empty'}
      >
        <Editable
          className="min-h-full outline-none max-w-none"
          placeholder="Start writing..."
          spellCheck
          autoFocus
          onKeyDown={onKeyDown}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
        />
      </Slate>
    </div>
  );
};

export default EditorContent;
