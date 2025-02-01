import type { Project } from "@/types/editor"

const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

export const setupAutoSave = (getProject: () => Project | null, saveProject: (project: Project) => void) => {
  let timeoutId: NodeJS.Timeout

  const autoSave = () => {
    const project = getProject()
    if (project && project.id) {
      saveProject(project)
      console.log("Auto-saved project:", project.title)
    }
  }

  const resetAutoSaveTimer = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(autoSave, AUTO_SAVE_INTERVAL)
  }

  // Start the auto-save timer
  resetAutoSaveTimer()

  // Return a function to clear the timer when needed
  return () => clearTimeout(timeoutId)
}

