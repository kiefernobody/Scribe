// Combine all editor-related utility functions here
import { calculateWordCount } from "@/utils/helpers"
import type { Chapter } from "@/types/editor"
import type React from "react" // Import React

export const processImportedHtml = (html: string): string => {
  return html
    .replace(/<p class="indented">/g, '<p class="indented" style="text-indent: 2em; margin: 0;">')
    .replace(/<\/p>\s*<p/g, "</p><p")
    .replace(/(<br\s*\/?>\s*)+/g, "")
}

export const getCommandAtCursor = (selection: Selection | null): string | null => {
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const startNode = range.startContainer

    if (startNode.nodeType === Node.TEXT_NODE) {
      const textContent = startNode.textContent || ""
      const cursorPosition = range.startOffset

      const beforeCursor = textContent.substring(0, cursorPosition)
      const matchBefore = beforeCursor.match(/\/\S+.*$/)
      if (matchBefore) {
        return matchBefore[0].trim()
      }

      const afterCursor = textContent.substring(cursorPosition)
      const matchAfter = afterCursor.match(/^\/\S+.*/)
      if (matchAfter) {
        return matchAfter[0].trim()
      }
    }
  }
  return null
}

export const getChapterContent = (chapterElement: Element): string => {
  let content = ""
  let currentElement = chapterElement.nextElementSibling

  while (currentElement && !currentElement.classList.contains("chapter-title")) {
    content += currentElement.textContent + " "
    currentElement = currentElement.nextElementSibling
  }

  return content.trim()
}

export const addChapter = (
  chapterTitle: string,
  chapters: Chapter[],
  editorRef: React.RefObject<HTMLDivElement>,
  setContent: (content: string) => void,
  setChapters: (chapters: Chapter[]) => void,
  updateCounts: () => void,
  chapterId?: string,
) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0 && editorRef.current) {
    const range = selection.getRangeAt(0)
    const id = chapterId || `chapter-${Date.now()}`
    const chapterElement = document.createElement("h1")
    chapterElement.textContent = `Chapter ${chapters.length + 1}: ${chapterTitle}`
    chapterElement.setAttribute("id", id)
    chapterElement.classList.add("chapter-title")

    range.insertNode(document.createElement("br"))
    range.insertNode(chapterElement)
    range.setStartAfter(chapterElement)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)

    setContent(editorRef.current.innerHTML)
    setChapters([...chapters, { id, title: chapterTitle, wordCount: 0, content: "" }])
    updateCounts()
  }
}

export const removeChapter = (
  chapterId: string,
  editorRef: React.RefObject<HTMLDivElement>,
  setContent: (content: string) => void,
  setChapters: (chapters: Chapter[]) => void,
  updateCounts: () => void,
) => {
  const chapterElement = editorRef.current?.querySelector(`#${chapterId}`)
  if (chapterElement && editorRef.current) {
    chapterElement.remove()
    setContent(editorRef.current.innerHTML)
    setChapters((prevChapters) => prevChapters.filter((chapter) => chapter.id !== chapterId))
    updateCounts()
  }
}

export const jumpToChapter = (
  chapterId: string,
  editorRef: React.RefObject<HTMLDivElement>,
  setIsDropdownOpen: (isOpen: boolean) => void,
  setSelectedChapter: (chapterId: string | null) => void,
) => {
  const chapterElement = editorRef.current?.querySelector(`#${chapterId}`)
  if (chapterElement) {
    setIsDropdownOpen(false)
    setSelectedChapter(chapterId)

    requestAnimationFrame(() => {
      chapterElement.scrollIntoView({ behavior: "smooth", block: "start" })

      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus()
          const selection = window.getSelection()
          const range = document.createRange()
          range.setStartAfter(chapterElement)
          range.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }, 500)
    })
  }
}

// Export calculateWordCount from helpers.ts
export { calculateWordCount }

