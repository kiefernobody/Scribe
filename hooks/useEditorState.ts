import { useState, useCallback } from "react"
import type { Project, Break } from "@/types/editor"
import { calculateWordCount } from "@/utils/editorUtils"

export const useEditorState = (initialContent: string) => {
  const [project, setProject] = useState<Project>({
    id: `project-${Date.now()}`,
    title: "Untitled",
    breaks: [
      {
        id: `break-${Date.now()}`,
        title: "Break 1",
        content: initialContent,
        wordCount: calculateWordCount(initialContent),
      },
    ],
    currentBreakId: `break-${Date.now()}`,
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const getCurrentBreak = useCallback(() => {
    return project.breaks.find((breakItem) => breakItem.id === project.currentBreakId) || project.breaks[0]
  }, [project])

  const updateBreak = useCallback((breakId: string, updates: Partial<Break>) => {
    setProject((prev) => ({
      ...prev,
      breaks: prev.breaks.map((breakItem) => {
        if (breakItem.id === breakId) {
          const updatedBreak = { ...breakItem, ...updates }
          if (updates.content !== undefined) {
            updatedBreak.wordCount = calculateWordCount(updates.content)
          }
          return updatedBreak
        }
        return breakItem
      }),
    }))
  }, [])

  const addBreak = useCallback((title: string) => {
    const newBreak: Break = {
      id: `break-${Date.now()}`,
      title,
      content: "",
      wordCount: 0,
    }
    setProject((prev) => ({
      ...prev,
      breaks: [...prev.breaks, newBreak],
      currentBreakId: newBreak.id,
    }))
  }, [])

  const removeBreak = useCallback((breakId: string) => {
    setProject((prev) => {
      const newBreaks = prev.breaks.filter((breakItem) => breakItem.id !== breakId)
      return {
        ...prev,
        breaks: newBreaks,
        currentBreakId: newBreaks.length > 0 ? newBreaks[0].id : null,
      }
    })
  }, [])

  const switchBreak = useCallback((breakId: string) => {
    setProject((prev) => ({
      ...prev,
      currentBreakId: breakId,
    }))
  }, [])

  const updateProjectTitle = useCallback((newTitle: string) => {
    setProject((prev) => ({
      ...prev,
      title: newTitle,
    }))
  }, [])

  const getTotalWordCount = useCallback(() => {
    return project.breaks.reduce((total: number, breakItem: Break) => total + breakItem.wordCount, 0)
  }, [project.breaks])

  const reorderBreaks = useCallback((startIndex: number, endIndex: number) => {
    setProject((prev) => {
      const newBreaks = Array.from(prev.breaks)
      const [reorderedItem] = newBreaks.splice(startIndex, 1)
      newBreaks.splice(endIndex, 0, reorderedItem)
      return { ...prev, breaks: newBreaks }
    })
  }, [])

  return {
    project,
    setProject,
    getCurrentBreak,
    updateBreak,
    addBreak,
    removeBreak,
    switchBreak,
    updateProjectTitle,
    isDropdownOpen,
    setIsDropdownOpen,
    getTotalWordCount,
    reorderBreaks,
  }
}

