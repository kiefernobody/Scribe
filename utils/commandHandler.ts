import type { Project, Break } from "@/types/editor"
import type React from "react"

export const handleCommand = async (
  command: string,
  project: Project,
  updateBreak: (breakId: string, updates: Partial<Break>) => void,
  addBreak: (title: string) => void,
  removeBreak: (breakId: string) => void,
  switchBreak: (breakId: string) => void,
  updateProjectTitle: (newTitle: string) => void,
  setProject: React.Dispatch<React.SetStateAction<Project>>,
  currentBreakId: string,
  setShowProjectSelector: React.Dispatch<React.SetStateAction<boolean>>,
  projects: Project[],
  updateProjectsInStorage: (updatedProjects: Project[]) => void,
): Promise<{ success: boolean; message: string; isCommand: boolean; newProject?: Project }> => {
  console.log("Handling command:", command)

  const parts = command.split(" ")
  const commandName = parts[0].toLowerCase()

  if (!commandName.startsWith("/")) {
    return { success: true, message: "", isCommand: false }
  }

  try {
    switch (commandName) {
      case "/help":
        return { ...(await handleHelpCommand()), isCommand: true }
      default:
        return {
          success: false,
          message: `
            <div class="bg-card border-l-4 border-red-500 text-foreground p-4 rounded" role="alert">
              <p class="font-bold">Unknown command</p>
              <p>The command "${commandName}" is not recognized. Type /help for a list of available commands.</p>
            </div>
          `,
          isCommand: true,
        }
    }
  } catch (error) {
    console.error("Error executing command:", error)
    return {
      success: false,
      message: `
        <div class="bg-card border-l-4 border-red-500 text-foreground p-4 rounded" role="alert">
          <p class="font-bold">Error</p>
          <p>An error occurred while executing the command: ${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `,
      isCommand: true,
    }
  }
}

const handleHelpCommand = () => {
  const helpText = `
    <div class="bg-card border-l-4 border-yellow-500 text-foreground p-4 rounded">
      <h3 class="font-bold text-lg mb-2">Scribe Help</h3>
      <p class="mb-2">Here are some ways I can assist you:</p>
      <ul class="list-disc list-inside space-y-2">
        <li><strong>/help</strong> - Display this help information</li>
      </ul>
      <div class="mt-4">
        <p class="font-semibold">Quick Actions</p>
        <p>You can use the following buttons for quick assistance:</p>
        <ul class="list-disc list-inside mt-2">
          <li><strong>Stuck</strong> - Get help when you're facing writer's block</li>
          <li><strong>Break Review</strong> - Get feedback on your current section</li>
          <li><strong>Draft Review</strong> - Get an overview of your entire project</li>
        </ul>
      </div>
      <p class="mt-4">Remember, you can always ask me questions, and I'll do my best to help!</p>
    </div>
  `
  return { success: true, message: helpText.trim() }
}

