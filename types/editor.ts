export interface Break {
  id: string
  title: string
  content: string
  wordCount: number
}

export interface Project {
  title: string
  breaks: Break[]
  currentBreakId: string | null
}

