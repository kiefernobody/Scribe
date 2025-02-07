import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkHtml from "remark-html"
import { visit } from "unist-util-visit"

interface Chapter {
  id: string
  title: string
  content: string
}

export const parseMarkdown = async (markdown: string): Promise<{ html: string; chapters: Chapter[] }> => {
  const chapters: Chapter[] = []
  let currentChapter: Chapter | null = null
  let currentContent: string[] = []

  // Process the markdown content
  const processor = unified()
    .use(remarkParse)
    .use(remarkHtml)

  // Split content by lines
  const lines = markdown.split("\n")
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for headings (both # and === style)
    const isHeading = line.startsWith("#") || (i > 0 && lines[i-1].trim() !== "" && /^[=]+$/.test(line))
    
    if (isHeading || i === lines.length - 1) {
      // Save previous chapter if exists
      if (currentChapter) {
        currentChapter.content = currentContent.join("\n")
        chapters.push(currentChapter)
        currentContent = []
      }

      if (i < lines.length - 1 || isHeading) {
        // Create new chapter
        let title = line.startsWith("#") 
          ? line.replace(/^#+\s*/, "").trim()
          : lines[i-1].trim()

        currentChapter = {
          id: `chapter-${Date.now()}-${Math.random()}`,
          title: title || "Untitled Chapter",
          content: ""
        }
      }
    } else if (!line.match(/^[=]+$/)) { // Skip === lines
      currentContent.push(line)
    }
  }

  // Add the last chapter if exists
  if (currentChapter && currentContent.length > 0) {
    currentChapter.content = currentContent.join("\n")
    chapters.push(currentChapter)
  }

  // If no chapters were created (no headings found), create a single chapter
  if (chapters.length === 0) {
    chapters.push({
      id: `chapter-${Date.now()}`,
      title: "Main Content",
      content: markdown
    })
  }

  // Clean up HTML tags and convert to plain text for Slate
  const cleanContent = (content: string): string => {
    return content
      .replace(/<hr\/?>/g, '\n---\n') // Convert hr to markdown horizontal rule
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n') // Remove p tags but keep content with proper spacing
      .replace(/<br\/?>/g, '\n') // Convert br to newline
      .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim()
  }

  // Process each chapter's content
  for (let chapter of chapters) {
    // First convert markdown to HTML
    const processedContent = await processor.process(chapter.content)
    // Then clean up the HTML and convert to plain text
    chapter.content = cleanContent(String(processedContent))
  }

  // Generate clean HTML for preview purposes
  const file = await processor.process(markdown)
  const cleanHtml = cleanContent(String(file))

  return {
    html: cleanHtml,
    chapters
  }
}

