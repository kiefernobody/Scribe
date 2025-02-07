export interface Message {
  type: "user" | "assistant" | "image"
  content: string
  isCommand?: boolean
  sender: "user" | "assistant"
} 