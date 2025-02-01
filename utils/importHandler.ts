import { parseMarkdown } from "@/utils/markdownParser"
import type { Chapter } from "@/types/editor"

export const importHandler = async (payload: string | File): Promise<{ html: string; chapters: Chapter[] }> => {
  let content: string
  if (typeof payload === "string") {
    content = payload
  } else {
    content = await payload.text()
  }

  console.log("Handling import with payload:", content.substring(0, 100) + "...")

  if (!content || typeof content !== "string") {
    throw new Error("Invalid import payload")
  }

  try {
    const { html, chapters } = await parseMarkdown(content)
    if (!html) {
      throw new Error("Parsed HTML is empty")
    }
    console.log("Parsed HTML:", html.substring(0, 100) + "...")
    console.log("Parsed chapters:", chapters)

    // Process the HTML to ensure proper formatting
    const processedHtml = chapters
      .map(
        (chapter) => `
      <h1 id="${chapter.id}" class="chapter-title">${chapter.title}</h1>
      ${chapter.content}
    `,
      )
      .join("\n\n")

    return { html: processedHtml, chapters }
  } catch (error) {
    console.error("Error in handleImport:", error)
    throw error
  }
}

