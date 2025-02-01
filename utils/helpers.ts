// Add any helper functions here
export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Add other helper functions as needed

