import type { Chapter } from "@/types/editor"

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

