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
      const title = lines[0]?.trim() || `Untitled Chapter ${index + 1}`;
      const content = lines.slice(1).join("\n").trim();

      return {
        id: `chapter-${index + 1}`,
        title,
        content,
      };
    });

  return { chapters };
}
