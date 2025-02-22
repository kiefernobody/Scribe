"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect, SetStateAction } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { handleCommand } from "@/utils/commandHandler"
import type { Project, Break } from "@/types/editor"
import { Lightbulb, LightbulbOff, Plus, FolderOpen } from "lucide-react"
import { useGuidedWorkspace } from "@/contexts/GuidedWorkspaceContext"
import { errorHandler } from "@/utils/errorHandler"
import { CustomButton } from "@/components/ui/custom-button"
import { Input } from "@/components/ui/input"
import { ResponsiveToolbar } from "./ResponsiveToolbar"
import type { JournalNote } from "@/types/journal"

interface Message {
  type: "user" | "assistant" | "image"
  content: string
  isCommand?: boolean
  sender: "user" | "assistant"
}

interface AssistantProps {
  project: Project | null
  updateBreak: (breakId: string, updates: Partial<Break>) => void
  addBreak: (title: string) => void
  removeBreak: (breakId: string) => void
  switchBreak: (breakId: string) => void
  updateProjectTitle: (newTitle: string) => void
  onAddNote: (note: JournalNote) => void
  setProject: React.Dispatch<React.SetStateAction<Project | null>>
  isMobileView: boolean
  setShowProjectSelector: React.Dispatch<React.SetStateAction<boolean>>
  updateProjectsInStorage: (updatedProjects: Project[]) => void
  activeMobileComponent: string
  shouldBlur: boolean
  setShouldBlurUI?: React.Dispatch<React.SetStateAction<boolean>>
}

const validateSlateContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return content
    }
  } catch (error) {
    console.warn("Invalid Slate content, resetting to default", error)
  }
  return JSON.stringify([{ type: "paragraph", children: [{ text: "" }] }])
}

const Assistant: React.FC<AssistantProps> = ({
  project,
  updateBreak,
  addBreak,
  removeBreak,
  switchBreak,
  updateProjectTitle,
  onAddNote,
  setProject,
  isMobileView,
  setShowProjectSelector,
  updateProjectsInStorage,
  activeMobileComponent,
  shouldBlur,
  setShouldBlurUI,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const { isGuidedWorkspace, setIsGuidedWorkspace } = useGuidedWorkspace()
  console.log("Assistant - isGuidedWorkspace:", isGuidedWorkspace)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [projects, setProjects] = useState<Project[]>([]) // Assuming you have a state for projects
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Add default welcome message
    setMessages([
      {
        type: "assistant",
        content: `
    <div class="bg-card border-l-4 border-yellow-500 text-foreground p-4 rounded">
      <h3 class="font-bold text-lg mb-2">Welcome to Scribe! 👋</h3>
      <p class="mb-2">I'm here to help you with your writing journey. While I'm not quite ready for full conversations yet, I can assist you in a few ways:</p>
      <ul class="list-disc list-inside space-y-1 mb-4">
        <li>Use the <strong>Stuck</strong> button when you need inspiration</li>
        <li>Try the <strong>Break Review</strong> for feedback on your current section</li>
        <li>Use <strong>Draft Review</strong> to get an overview of your entire project</li>
      </ul>
      <p class="mb-2">You can also use these helpful commands:</p>
      <ul class="list-disc list-inside space-y-1">
        <li><strong>/help</strong> - Display available commands and tips</li>
      </ul>
      <p class="mt-4">Need anything else? Just ask, and I'll do my best to assist you!</p>
    </div>
  `,
        isCommand: true,
        sender: "assistant",
      },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollAreaRef])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const executeCommand = useCallback(async (command: string | null) => {
    if (!command) return;
    
    try {
      if (command.trim()) {
        const result = await handleCommand(
          command,
          project,
          updateBreak,
          addBreak,
          removeBreak,
          switchBreak,
          updateProjectTitle,
          setProject,
          project?.currentBreakId || "",
          setShowProjectSelector,
          projects,
          updateProjectsInStorage
        );

        // Add the command response to messages if it's a command
        if (result.isCommand) {
          const assistantMessage: Message = {
            type: "assistant",
            content: result.message,
            isCommand: true,
            sender: "assistant",
          };
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Error executing command:", error);
      errorHandler.logError("Failed to execute command", "high", error, "Assistant");
      
      // Add error message to the chat
      const errorMessage: Message = {
        type: "assistant",
        content: `
          <div class="bg-card border-l-4 border-red-500 text-foreground p-4 rounded">
            <p class="font-bold">Error</p>
            <p>An error occurred while executing the command. Please try again.</p>
          </div>
        `,
        isCommand: true,
        sender: "assistant",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  }, [
    project,
    updateBreak,
    addBreak,
    removeBreak,
    switchBreak,
    updateProjectTitle,
    setProject,
    setShowProjectSelector,
    updateProjectsInStorage,
    shouldBlur,
    projects
  ]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim() !== "") {
        e.preventDefault()
        const userMessage: Message = { type: "user", content: inputValue, sender: "user" }
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setInputValue("")
        try {
          const response = await executeCommand(inputValue)
        } catch (error) {
          console.error("Error executing command:", error)
          errorHandler.logError("Failed to execute command", "high", error, "Assistant")
        }
        scrollToBottom()
      }
    },
    [inputValue, executeCommand],
  )

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageMessage: Message = {
          type: "image",
          content: e.target?.result as string,
          sender: "user",
        }
        setMessages((prevMessages) => [...prevMessages, imageMessage])
        scrollToBottom()
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleGuidedWorkspaceToggle = useCallback(() => {
    setIsGuidedWorkspace((prev) => {
      const shouldActivate = !prev;
      // Only add message if the state actually changed
      const message: Message = {
        type: "assistant",
        content: shouldActivate
          ? `
          <div class="bg-card border-l-4 border-yellow-500 text-foreground p-4 rounded">
            <h3 class="font-bold text-lg mb-2">Guided Workspace Mode Activated</h3>
            <p class="mb-2">You've entered a focus-encouraging mode which limits the view of your project to small individual paragraphs or portions at a time.</p>
            <p class="mb-2">In the future, this will include Assistant-driven plot/context interpretation, guiding you as to where your story seems to be going next (based directly on your writing, without adding new ideas). This will help you continue writing without having to constantly reread your own words.</p>
            <p>Please note that the assistant-driven help functionality is not available yet, similar to other assistant features currently in development.</p>
          </div>
        `
          : `
          <div class="bg-card border-l-4 border-yellow-500 text-foreground p-4 rounded">
            <h3 class="font-bold text-lg mb-2">Guided Workspace Mode Deactivated</h3>
            <p>You've returned to the standard workspace view. All project content is now visible.</p>
          </div>
        `,
        isCommand: true,
        sender: "assistant",
      };
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
      return shouldActivate;
    });
  }, [setIsGuidedWorkspace]);

  const handleAssistantAction = useCallback((action: string) => {
    // Implement the logic for each action (Stuck, Break Review, Draft)
    console.log(`Assistant action: ${action}`)
    // You can add more specific logic for each action here
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1024 // Assuming 1024px is our mobile breakpoint
      setIsCollapsed(isMobileView && activeMobileComponent === "assistant")
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [activeMobileComponent])

  const handleProjectSelectorClick = useCallback(() => {
    setShowProjectSelector(true)
    setShouldBlurUI?.(true)
  }, [setShowProjectSelector, setShouldBlurUI])

  const handleProjectUpdate = (updatedProject: Project) => {
    if (project) {
      setProject(updatedProject);
      updateProjectsInStorage([updatedProject]);
    }
  };

  return (
    <div
      className={`h-full w-full bg-card flex flex-col rounded-lg overflow-hidden shadow-lg relative assistant-component ${
        shouldBlur ? "blur-sm pointer-events-none" : ""
      }`}
    >
      <ResponsiveToolbar
        className="h-14 px-2"
        leftItems={[
          {
            key: "projects",
            content: (
              <CustomButton
                variant="ghost"
                size="icon"
                onClick={handleProjectSelectorClick}
                className="!h-10 !w-10 !p-0 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
                style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
              >
                <FolderOpen className="h-4 w-4" />
              </CustomButton>
            ),
          },
        ]}
        centerItems={[
          {
            key: "stuck",
            content: (
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={() => handleAssistantAction("Stuck")}
                className="h-10 px-3 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
              >
                Stuck
              </CustomButton>
            ),
          },
          {
            key: "breakReview",
            content: (
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={() => handleAssistantAction("Break Review")}
                className="h-10 px-3 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
              >
                Break Review
              </CustomButton>
            ),
          },
          {
            key: "draftReview",
            content: (
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={() => handleAssistantAction("Draft Review")}
                className="h-10 px-3 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
              >
                Draft Review
              </CustomButton>
            ),
          },
        ]}
        rightItems={[
          {
            key: "guidedWorkspace",
            content: (
              <CustomButton
                variant="ghost"
                size="icon"
                onClick={handleGuidedWorkspaceToggle}
                className="!h-10 !w-10 !p-0 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
                style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
              >
                {isGuidedWorkspace ? <Lightbulb className="h-4 w-4" /> : <LightbulbOff className="h-4 w-4" />}
              </CustomButton>
            ),
          },
        ]}
        isMobileView={isCollapsed}
      />
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div key={index} className="mb-4">
            {message.type === "assistant" && message.isCommand ? (
              <div className="assistant-command-message" dangerouslySetInnerHTML={{ __html: message.content }} />
            ) : message.type === "image" ? (
              <div
                className={`p-3 rounded-lg shadow-md ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-secondary text-secondary-foreground"
                }`}
                style={{ maxWidth: "85%" }}
              >
                <img
                  src={message.content || "/placeholder.svg"}
                  alt="Uploaded image"
                  className="w-full h-auto rounded"
                />
              </div>
            ) : (
              <div
                className={`p-3 rounded-lg shadow-md ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-secondary text-secondary-foreground"
                }`}
                style={{ maxWidth: "85%" }}
              >
                {message.content}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center justify-between p-2 bg-secondary w-full">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-secondary text-foreground border-none h-10 focus:ring-0 focus:ring-offset-0 px-2 mr-2"
          placeholder="Type a message or command..."
          aria-label="Type a message or command"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png"
          style={{ display: "none" }}
        />
        <CustomButton
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="ml-2 !h-10 !w-10 !p-0 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
          style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
        >
          <Plus className="h-4 w-4" />
        </CustomButton>
      </div>
      <style jsx>{`
        .assistant-command-message {
          max-width: 100%;
          overflow-x: auto;
        }
        .assistant-command-message > div {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}

export default Assistant

