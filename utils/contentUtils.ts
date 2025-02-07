import type { Descendant } from "slate"

export const validateAndSanitizeContent = (content: string | null | undefined): Descendant[] => {
  try {
    const parsed = JSON.parse(content ?? "[]")
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ type: "paragraph", children: [{ text: "" }] }]
  } catch {
    return [{ type: "paragraph", children: [{ text: "" }] }]
  }
}

