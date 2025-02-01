"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import type { Project, Break } from "@/types/editor"
import EditorContent from "./EditorContent"
import { ResponsiveToolbar } from "./ResponsiveToolbar"
import useDebounce from "@/hooks/useDebounce"

interface EditorProps {
  project: Project
  updateBreak: (breakId: string, updates: Partial<Break>) => void
  isMobileView: boolean
  shouldBlur: boolean
}

const Editor: React.FC<EditorProps> = ({ project, updateBreak, isMobileView, shouldBlur }) => {
  const [currentBreak, setCurrentBreak] = useState<Break | null>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const editorContentRef = useRef<HTMLDivElement | null>(null)
  const debouncedUpdateBreak = useDebounce(updateBreak, 500)

  useEffect(() => {
    setCurrentBreak(project.breaks?.find((breakItem) => breakItem.id === project.currentBreakId) || null)
  }, [project.currentBreakId, project.breaks])

  useEffect(() => {
    if (currentBreak && editorContentRef.current) {
      editorContentRef.current.focus()
    }
  }, [currentBreak])

  const handleUpdateBreak = useCallback(
    (updates: Partial<Break>) => {
      if (currentBreak) {
        debouncedUpdateBreak(currentBreak.id, updates)
      }
    },
    [currentBreak, debouncedUpdateBreak],
  )

  return (
    <motion.div className="h-full w-full flex rounded-lg editor-component custom-scrollbar">
      <motion.div
        className={`w-full bg-card rounded-lg overflow-hidden shadow-lg flex flex-col ${shouldBlur ? "blur-sm" : ""}`}
      >
        <ResponsiveToolbar
          className="h-14 px-2"
          leftItems={[]}
          centerItems={[]}
          rightItems={[]}
          isMobileView={isMobileView}
        />
        <motion.div ref={editorWrapperRef} className="editor-wrapper flex-grow flex flex-col relative overflow-hidden">
          <div className="w-full h-full">
            {currentBreak && (
              <EditorContent
                key={currentBreak.id}
                currentBreak={currentBreak}
                updateBreak={handleUpdateBreak}
                editorContentRef={editorContentRef}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Editor

