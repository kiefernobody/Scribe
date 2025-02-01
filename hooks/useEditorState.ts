import { useState, useCallback } from "react"
import type { Chapter, Project } from "@/types/editor"
import { calculateWordCount } from "@/utils/editorUtils"

export const useEditorState = (initialContent: string) => {
  const [project, setProject] = useState<Project>({
    title: "Untitled",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter 1",
        content: initialContent,
        wordCount: calculateWordCount(initialContent),
      },
    ],
    currentChapterId: "chapter-1",
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const getCurrentChapter = useCallback(() => {
    return project.chapters.find((chapter) => chapter.id === project.currentChapterId) || project.chapters[0]
  }, [project])

  const updateChapter = useCallback((chapterId: string, updates: Partial<Chapter>) => {
    setProject((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          const updatedChapter = { ...chapter, ...updates }
          if (updates.content !== undefined) {
            updatedChapter.wordCount = calculateWordCount(updatedChapter.content)
          }
          return updatedChapter
        }
        return chapter
      }),
    }))
  }, [])

  const addChapter = useCallback((title: string) => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title,
      content: "",
      wordCount: 0,
    }
    setProject((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
      currentChapterId: newChapter.id,
    }))
  }, [])

  const removeChapter = useCallback((chapterId: string) => {
    setProject((prev) => {
      const newChapters = prev.chapters.filter((chapter) => chapter.id !== chapterId)
      return {
        ...prev,
        chapters: newChapters,
        currentChapterId: newChapters.length > 0 ? newChapters[0].id : null,
      }
    })
  }, [])

  const switchChapter = useCallback((chapterId: string) => {
    setProject((prev) => ({
      ...prev,
      currentChapterId: chapterId,
    }))
  }, [])

  const updateProjectTitle = useCallback((newTitle: string) => {
    setProject((prev) => ({
      ...prev,
      title: newTitle,
    }))
  }, [])

  const getTotalWordCount = useCallback(() => {
    return project.chapters.reduce((total, chapter) => total + chapter.wordCount, 0)
  }, [project.chapters])

  const reorderChapters = useCallback((startIndex: number, endIndex: number) => {
    setProject((prev) => {
      const newChapters = Array.from(prev.chapters)
      const [reorderedItem] = newChapters.splice(startIndex, 1)
      newChapters.splice(endIndex, 0, reorderedItem)
      return { ...prev, chapters: newChapters }
    })
  }, [])

  return {
    project,
    setProject,
    getCurrentChapter,
    updateChapter,
    addChapter,
    removeChapter,
    switchChapter,
    updateProjectTitle,
    isDropdownOpen,
    setIsDropdownOpen,
    getTotalWordCount,
    reorderChapters,
  }
}

