import { parseMarkdown } from "@/utils/markdownParser"
import { htmlToMarkdown } from "@/utils/htmlToMarkdown"
import type { Chapter } from "@/types/editor"

export const handleImport = async (payload: string): Promise<{ html: string; chapters: Chapter[] }> => {
  console.log("Handling import with payload:", payload.substring(0, 100) + "...")

  if (!payload || typeof payload !== "string") {
    throw new Error("Invalid import payload")
  }

  try {
    const { html, chapters } = await parseMarkdown(payload)
    if (!html) {
      throw new Error("Parsed HTML is empty")
    }
    console.log("Parsed HTML:", html.substring(0, 100) + "...")
    console.log("Parsed chapters:", chapters)

    // No need to process the HTML further as indentation is already added
    return { html, chapters }
  } catch (error) {
    console.error("Error in handleImport:", error)
    throw error
  }
}

export const handleExport = (content: string, title: string): void => {
  const markdownContent = htmlToMarkdown(content)
  const blob = new Blob([markdownContent], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

