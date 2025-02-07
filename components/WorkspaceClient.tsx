"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import type { Project, Break } from "@/types/editor"
import type { Message } from "@/types/assistant"
import { handleCommand } from "@/utils/commandHandler"
import { validateAndSanitizeContent } from "@/utils/contentUtils"
import { parseMarkdown } from "@/utils/markdownParser"
import Assistant from "@/components/Assistant"
import { UserProvider } from "@/contexts/UserContext"
import { GuidedWorkspaceProvider } from "@/contexts/GuidedWorkspaceContext"
import LoadingScreen from "@/components/LoadingScreen"
import Editor from "@/components/Editor"
import Journal from "@/components/Journal"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { JournalNote } from "@/types/journal"
import type { Descendant } from "slate"
import ProjectManager from "@/components/ProjectManager"

const WorkspaceClient: React.FC = () => {
  const [notes, setNotes] = useState<JournalNote[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [activeMobileComponent, setActiveMobileComponent] = useState<"editor" | "journal" | "assistant">("editor")
  const [showProjectSelector, setShowProjectSelector] = useState(true)
  const [shouldBlurUI, setShouldBlurUI] = useState(true)
  const [currentBreak, setCurrentBreak] = useState<Break | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isGuidedWorkspace, setIsGuidedWorkspace] = useState(false)
  const [onResetJournal, setOnResetJournal] = useState<() => void | undefined>(() => () => {})

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    loadProjectsFromStorage()
  }, [])

  useEffect(() => {
    if (project && project.breaks.length > 0) {
      const activeBreak = project.breaks.find(b => b.id === project.currentBreakId) || project.breaks[0]
      setCurrentBreak(activeBreak)
    } else {
      setCurrentBreak(null)
    }
  }, [project])

  const handleAddNote = useCallback((note: JournalNote) => {
    setNotes(prev => [...prev, note])
  }, [])

  const updateBreak = useCallback((breakId: string, updates: Partial<Break>) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      const updatedProject: Project = {
        id: prevProject.id,
        title: prevProject.title,
        breaks: prevProject.breaks.map((breakItem) =>
          breakItem.id === breakId ? { ...breakItem, ...updates } : breakItem,
        ),
        currentBreakId: prevProject.currentBreakId,
      }
      updateProjectInStorage(updatedProject)
      return updatedProject
    })
  }, [])

  const addBreak = useCallback((title: string) => {
    const newBreak: Break = {
      id: `break-${Date.now()}`,
      title,
      content: "",
      wordCount: 0,
    }
    setProject((prevProject) => {
      if (!prevProject) return null;
      const updatedProject: Project = {
        id: prevProject.id,
        title: prevProject.title,
        breaks: [...prevProject.breaks, newBreak],
        currentBreakId: newBreak.id,
      }
      updateProjectInStorage(updatedProject)
      return updatedProject
    })
  }, [])

  const removeBreak = useCallback((breakId: string) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      const newBreaks = prevProject.breaks.filter((breakItem) => breakItem.id !== breakId)
      const updatedProject: Project = {
        id: prevProject.id,
        title: prevProject.title,
        breaks: newBreaks,
        currentBreakId: newBreaks.length > 0
          ? prevProject.currentBreakId === breakId
            ? newBreaks[0].id
            : prevProject.currentBreakId
          : null,
      }
      updateProjectInStorage(updatedProject)
      return updatedProject
    })
  }, [])

  const switchBreak = useCallback((breakId: string) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      const updatedProject: Project = {
        id: prevProject.id,
        title: prevProject.title,
        breaks: prevProject.breaks,
        currentBreakId: breakId,
      }
      updateProjectInStorage(updatedProject)
      return updatedProject
    })
  }, [])

  const updateProjectTitle = useCallback((newTitle: string) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      const updatedProject: Project = {
        id: prevProject.id,
        title: newTitle,
        breaks: prevProject.breaks,
        currentBreakId: prevProject.currentBreakId,
      }
      updateProjectInStorage(updatedProject)
      return updatedProject
    })
  }, [])

  const updateProjectInStorage = useCallback((updatedProject: Project | null) => {
    if (!updatedProject) {
      localStorage.removeItem("currentProject");
      return;
    }

    // Validate and sanitize all break contents
    const sanitizedProject = {
      ...updatedProject,
      breaks: updatedProject.breaks.map(breakItem => ({
        ...breakItem,
        content: validateAndSanitizeContent(breakItem.content)
      }))
    };

    // Update projects list in state
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === sanitizedProject.id ? sanitizedProject : p
      )
    );

    // Save to localStorage
    localStorage.setItem("currentProject", JSON.stringify(sanitizedProject));
    localStorage.setItem("projects", JSON.stringify(sanitizedProject.breaks.map((breakItem) => ({
      ...breakItem,
      content: validateAndSanitizeContent(breakItem.content)
    }))));
  }, []);

  const updateProjectsInStorage = useCallback(
    (updatedProjects: Project[]) => {
      localStorage.setItem("projects", JSON.stringify(updatedProjects))
      setProjects(updatedProjects)
      setShouldBlurUI(updatedProjects.length === 0)
    },
    [],
  )

  const loadProjectsFromStorage = useCallback(() => {
    try {
      const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")
      const validatedProjects = storedProjects.map((p: Project) => ({
        ...p,
        breaks: p.breaks.map((b: Break) => ({
          ...b,
          content: validateAndSanitizeContent(b.content),
        })),
      }))
      setProjects(validatedProjects)

      // Create empty project if none exist
      if (validatedProjects.length === 0) {
        const emptyProject = createEmptyProject()
        setProjects([emptyProject])
      }

      // Load stored project into state but don't auto-select it
      const storedCurrentProject = localStorage.getItem("currentProject")
      if (storedCurrentProject) {
        const parsedCurrentProject = JSON.parse(storedCurrentProject)
        setProject({
          ...parsedCurrentProject,
          breaks: parsedCurrentProject.breaks.map((breakItem: Partial<Break>) => ({
            ...breakItem,
            content: validateAndSanitizeContent(breakItem.content || ""),
          })),
        })
      }

      // Always show project selector on startup
      setShowProjectSelector(true)
      setShouldBlurUI(true)
    } catch (error) {
      console.error("Error loading projects from localStorage:", error)
      const emptyProject = createEmptyProject()
      setProjects([emptyProject])
      setProject(null) // Don't auto-select the empty project
      setShowProjectSelector(true)
      setShouldBlurUI(true)
    }
  }, [])

  useEffect(() => {
    setShouldBlurUI(showProjectSelector)
  }, [showProjectSelector])

  const executeCommand = useCallback(
    async (command: string) => {
      try {
        if (!project) {
          const emptyProject = createEmptyProject();
          setProject(emptyProject);
          return { success: false, message: "No project selected" };
        }

        const result = await handleCommand(
          command,
          project,
          updateBreak,
          addBreak,
          removeBreak,
          switchBreak,
          updateProjectTitle,
          setProject,
          project.currentBreakId || "",
          setShowProjectSelector,
          projects,
          updateProjectsInStorage,
        )

        if (result.isCommand && result.success && command.startsWith("/new")) {
          // Get current projects from localStorage to ensure we have the latest state
          const currentProjects = JSON.parse(localStorage.getItem("projects") || "[]")

          // Add the new project
          const updatedProjects = [...currentProjects, result.newProject]

          // Update both localStorage and state
          localStorage.setItem("projects", JSON.stringify(updatedProjects))
          setProjects(updatedProjects)
          if (result.newProject) {
            setProject(result.newProject)
          }
        }

        return result
      } catch (error) {
        console.error("Error executing command:", error)
        setError(error instanceof Error ? error : new Error("An unknown error occurred"))
        return { success: false, message: "An error occurred while executing the command" }
      }
    },
    [project, updateBreak, addBreak, removeBreak, switchBreak, updateProjectTitle, projects, updateProjectsInStorage],
  )

  const handleSelectProject = (selectedProject: Project | null) => {
    if (selectedProject) {
      setProject(selectedProject)
      localStorage.setItem("currentProject", JSON.stringify(selectedProject))
      setShowProjectSelector(false)
      setShouldBlurUI(false)
      const initialBreak = selectedProject.breaks[0] || null
      setCurrentBreak(initialBreak)
    } else {
      const emptyProject = createEmptyProject()
      setProject(emptyProject)
      setProjects([emptyProject])
      localStorage.setItem("projects", JSON.stringify([emptyProject]))
      localStorage.setItem("currentProject", JSON.stringify(emptyProject))
      setShowProjectSelector(false)
      setShouldBlurUI(false)
    }
  }

  const handleImport = async (file: File) => {
    try {
      const content = await file.text()
      const { html, chapters } = await parseMarkdown(content)

      const newProject: Project = {
        id: `project-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        breaks: chapters.map((chapter) => ({
          id: `break-${Date.now()}-${Math.random()}`,
          title: chapter.title || "Untitled Break",
          content: JSON.stringify([{ 
            type: "paragraph", 
            children: [{ text: chapter.content }] 
          }]),
          wordCount: chapter.content.split(/\s+/).filter(Boolean).length,
        })),
        currentBreakId: null
      }

      setProjects((prevProjects: Project[]) => {
        const typedNewProject: Project = newProject
        return [...prevProjects, typedNewProject]
      })
      
      if (newProject) {
        setProject(newProject)
      }
    } catch (error) {
      console.error("Error importing project:", error)
    }
  }

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects((prevProjects) => {
      const updatedProjects = prevProjects.filter((p) => p.id !== projectId);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      
      if (project?.id === projectId) {
        const newCurrentProject = updatedProjects[0] || createEmptyProject();
        setProject(newCurrentProject);
        localStorage.setItem("currentProject", JSON.stringify(newCurrentProject));
      }
      
      return updatedProjects;
    });
  }, [project]);

  const handleExportProject = useCallback((projectToExport: Project) => {
    const exportData = JSON.stringify(projectToExport, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectToExport.title || 'untitled'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleEraseAllData = useCallback(() => {
    // Cleanup any temporary image URLs and clear all current notes
    if (notes) {
      notes.forEach(note => {
        if (note.type === "image" && note.isTemporary) {
          URL.revokeObjectURL(note.content)
        }
      })
    }
    
    // Clear all localStorage
    localStorage.clear()
    
    // Reset all state
    setNotes([]) // Clear current notes
    setProjects([])
    setProject(null)
    setCurrentBreak(null)
    setMessages([])
    setIsGuidedWorkspace(false)
    
    // Remove specific items to ensure complete cleanup
    localStorage.removeItem("journalNotes")
    localStorage.removeItem("currentProject")
    localStorage.removeItem("projects")
    localStorage.removeItem("messages")
    localStorage.removeItem("isGuidedWorkspace")
    
    // Create new empty project
    const emptyProject = createEmptyProject()
    setProjects([emptyProject])
    setShowProjectSelector(true)
    setShouldBlurUI(true)

    // Force journal to reset its internal state
    onResetJournal?.()
  }, [notes, setIsGuidedWorkspace, onResetJournal])

  // Update the blur effect to cover the entire workspace when project selector is open
  const workspaceStyles = showProjectSelector
    ? "relative filter blur-sm pointer-events-none"
    : "relative";

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="error-display p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h1 className="text-xl font-bold mb-2">An error occurred in WorkspaceClient</h1>
        <pre className="whitespace-pre-wrap">{error.stack}</pre>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <UserProvider>
        <GuidedWorkspaceProvider>
          <div className="h-screen w-screen overflow-hidden bg-background-primary flex flex-col">
            <ProjectManager
              isOpen={showProjectSelector}
              onClose={() => {
                if (project?.id) {
                  setShowProjectSelector(false);
                  setShouldBlurUI(false);
                }
              }}
              currentProject={project}
              setCurrentProject={setProject}
              setCurrentBreak={setCurrentBreak}
              onSelectProject={handleSelectProject}
              onDeleteProject={handleDeleteProject}
              onExportProject={handleExportProject}
              projects={projects}
              setProjects={setProjects}
              createEmptyProject={createEmptyProject}
              setNotes={setNotes}
              setMessages={setMessages}
              setIsGuidedWorkspace={setIsGuidedWorkspace}
            />

            <div className={`${workspaceStyles} flex-1 overflow-hidden p-4 bg-background-primary`}>
              <div className="flex h-full overflow-hidden gap-4">
                {isMobileView ? (
                  <>
                    <button
                      onClick={() =>
                        setActiveMobileComponent((prev) => {
                          if (prev === "journal") return "editor"
                          if (prev === "editor") return "assistant"
                          return "journal"
                        })
                      }
                      className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground p-2 rounded-l-md z-[60]"
                      aria-label="Next Component"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <button
                      onClick={() =>
                        setActiveMobileComponent((prev) => {
                          if (prev === "journal") return "assistant"
                          if (prev === "editor") return "journal"
                          return "editor"
                        })
                      }
                      className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground p-2 rounded-r-md z-[60]"
                      aria-label="Previous Component"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="w-[30%] h-full min-h-full overflow-hidden flex flex-col bg-background rounded-lg"
                      initial={false}
                      animate={{ width: "30%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="flex-1 overflow-hidden">
                        <Journal
                          notes={notes}
                          onAddNote={(note: JournalNote) => handleAddNote(note)}
                          isMobileView={isMobileView}
                          shouldBlur={shouldBlurUI}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="w-[40%] h-full min-h-full overflow-hidden flex flex-col bg-background rounded-lg"
                      animate={{ width: "40%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="flex-1 overflow-hidden">
                        <Editor
                          project={project}
                          updateBreak={updateBreak}
                          addBreak={addBreak}
                          removeBreak={removeBreak}
                          switchBreak={switchBreak}
                          updateProjectTitle={updateProjectTitle}
                          onAddNote={(note) => handleAddNote(note)}
                          setProject={setProject}
                          showProjectSelector={showProjectSelector}
                          setShowProjectSelector={setShowProjectSelector}
                          projects={projects}
                          updateProjectsInStorage={updateProjectsInStorage}
                          handleSelectProject={handleSelectProject}
                          activeMobileComponent={activeMobileComponent}
                          shouldBlur={shouldBlurUI}
                          setShouldBlurUI={setShouldBlurUI}
                          isMobileView={isMobileView}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="w-[30%] h-full min-h-full overflow-hidden flex flex-col bg-background rounded-lg"
                      animate={{ width: "30%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="flex-1 overflow-hidden">
                        <Assistant
                          project={project}
                          updateBreak={updateBreak}
                          addBreak={addBreak}
                          removeBreak={removeBreak}
                          switchBreak={switchBreak}
                          updateProjectTitle={updateProjectTitle}
                          onAddNote={(note) => handleAddNote(note)}
                          setProject={setProject}
                          isMobileView={isMobileView}
                          setShowProjectSelector={setShowProjectSelector}
                          updateProjectsInStorage={updateProjectsInStorage}
                          activeMobileComponent={activeMobileComponent}
                          shouldBlur={shouldBlurUI}
                          setShouldBlurUI={setShouldBlurUI}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Overlay to prevent interaction when blurred */}
            {showProjectSelector && (
              <div 
                className="fixed inset-0 bg-transparent z-40" 
                onClick={(e) => e.preventDefault()}
              />
            )}
          </div>
        </GuidedWorkspaceProvider>
      </UserProvider>
    </ErrorBoundary>
  )
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

const createEmptyProject = (): Project => ({
  id: `project-${Date.now()}`,
  title: "Untitled Project",
  breaks: [
    {
      id: `break-${Date.now()}`,
      title: "Break 1",
      content: JSON.stringify([{ type: "paragraph", children: [{ text: "" }] }]),
      wordCount: 0,
    },
  ],
  currentBreakId: `break-${Date.now()}`,
})

export default WorkspaceClient

