import type { Descendant } from "slate"

export interface Break {
  id: string
  title: string
  content: string
  wordCount: number
}

export interface Project {
  id: string
  title: string
  breaks: Break[]
  currentBreakId: string | null
}

