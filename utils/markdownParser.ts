export interface ParsedMarkdown {
  chapters: { id: string; title: string; content: string }[];
}

export async function parseMarkdown(markdown: string): Promise<ParsedMarkdown> {
  if (typeof markdown !== "string") {
    throw new Error(`Invalid markdown input: expected a string but received ${typeof markdown}`);
  }

  const chapters = markdown
    .split(/^#\s+/gm) // Splits the markdown content into sections based on headers
    .filter(Boolean) // Removes empty values from the array
    .map((section, index) => {
      const lines = section.split("\n");
      const title = lines.shift()?.trim() || `Chapter ${index + 1}`;
      const content = lines.join("\n").trim();
      return { id: `chapter-${index + 1}`, title, content };
    });

  return { chapters };
}

/**
 * Converts HTML content into markdown format.
 */
export function htmlToMarkdown(html: string): string {
  if (typeof html !== "string") {
    throw new Error(`Invalid HTML input: expected a string but received ${typeof html}`);
  }

  // Basic HTML to Markdown conversion (extendable for more complex cases)
  return html
    .replace(/<\/?strong>/g, "**") // Bold text
    .replace(/<\/?em>/g, "*") // Italic text
    .replace(/<\/?h1>/g, "# ") // Header 1
    .replace(/<\/?h2>/g, "## ") // Header 2
    .replace(/<\/?h3>/g, "### ") // Header 3
    .replace(/<\/?p>/g, "\n") // Paragraphs as new lines
    .replace(/<\/?br\s*\/?>/g, "\n") // Line breaks
    .replace(/&nbsp;/g, " ") // Convert non-breaking spaces to normal spaces
    .trim();
}
