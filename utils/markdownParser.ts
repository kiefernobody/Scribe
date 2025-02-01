import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import { visit } from "unist-util-visit"

type TreeNode = {
  type: string
  children?: TreeNode[]
  value?: string
  data?: {
    hProperties?: {
      className?: string
      id?: string
    }
  }
}

interface ParsedContent {
  html: string
  chapters: { id: string; title: string; content: string }[]
}

export async function parseMarkdown(...) { await 
    throw new Error(`Invalid markdown input: ${typeof markdown }`)
  }

  const chapters: { id: string; title: string; content: string }[] = []
  let currentChapter: { id: string; title: string; content: string } | null = null

  try {
    const result = await unified()
      .use(remarkParse)
      .use(() => (tree) => {
        console.log("Parsed tree:", JSON.stringify(tree, null, 2))
        visit(tree, (node: TreeNode) => {
          if (node.type === "heading" && node.depth === 1) {
            if (node.children && node.children[0] && node.children[0].type === "text") {
              if (currentChapter) {
                chapters.push(currentChapter)
              }
              const title = node.children[0].value || "Untitled Chapter"
              const id = `chapter-${Date.now()}-${chapters.length}`
              currentChapter = { id, title, content: "" }
              console.log("New chapter:", currentChapter)

              if (!node.data) node.data = {}
              if (!node.data.hProperties) node.data.hProperties = {}
              node.data.hProperties.id = id
              node.data.hProperties.className = "chapter-title"
              return
            }
          } else if (currentChapter) {
            if (node.type === "paragraph") {
              // Add indentation to paragraphs
              currentChapter.content += "<p class='indented'>"
              if (node.children) {
                node.children.forEach((child: TreeNode) => {
                  if (child.type === "text" && child.value) {
                    currentChapter!.content += child.value.replace(/\s+/g, " ")
                  } else if (child.type === "break") {
                    currentChapter!.content += "<br>"
                  }
                })
              }
              currentChapter.content += "</p>"
            } else if (node.type === "break") {
              currentChapter.content += "<br>"
            }
          }

          // Remove horizontal rules
          if (node.type === "thematicBreak") {
            return null
          }
        })

        if (currentChapter) {
          chapters.push(currentChapter)
        }

        // If no chapters were found, create a default chapter
        if (chapters.length === 0) {
          chapters.push({ id: "chapter-default", title: "Untitled", content: markdown })
        }
      })
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown)

    const html = result.toString()

    if (!html) {
      throw new Error("Failed to generate HTML from markdown")
    }

    const parsedContent = {
      html,
      chapters,
    }
    console.log("Parsed content:", JSON.stringify(parsedContent, null, 2))
    return parsedContent
  } catch (error) {
    console.error(`Error in parseMarkdown: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

