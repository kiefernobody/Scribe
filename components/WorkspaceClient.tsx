"use client"

import type React from "react"
import { useState, useEffect, useCallback, Suspense } from "react"
import { motion } from "framer-motion"
import type { Project, Break } from "@/types/editor"
import dynamic from "next/dynamic"
import { UserProvider } from "@/contexts/UserContext"
import { GuidedWorkspaceProvider } from "@/contexts/GuidedWorkspaceContext"
import LoadingScreen from "@/components/LoadingScreen"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Assistant = dynamic(() => import("@/components/Assistant"), {
  loading: () => <LoadingScreen />,
})
const Editor = dynamic(() => import("@/components/Editor"), {
  loading: () => <LoadingScreen />,
})
const Journal = dynamic(() => import("@/components/Journal"), {
  loading: () => <LoadingScreen />,
})
const ProjectManager = dynamic(() => import("@/components/ProjectManager"), {
  loading: () => <LoadingScreen />,
})

const defaultProject: Project = {
  id: "default",
  title: "Untitled Project",
  breaks: [],
  currentBreakId: null,
}

const WorkspaceClient: React.FC = () => {
  const [project, setProject] = useState<Project>(defaultProject)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [activeMobileComponent, setActiveMobileComponent] = useState<"editor" | "journal" | "assistant">("editor")
  const [showProjectSelector, setShowProjectSelector] = useState(true)
  const [shouldBlurUI, setShouldBlurUI] = useState(false)

  useEffect(() => {
    const loadingTimeout = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(loadingTimeout)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024)
      setShouldBlurUI(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem("projects")
      const parsedProjects = storedProjects ? JSON.parse(storedProjects) : []

      if (Array.isArray(parsedProjects) && parsedProjects.every(isValidProject)) {
        setProjects(parsedProjects)
      } else {
        throw new Error("Invalid projects data in localStorage")
      }

      const storedCurrentProject = localStorage.getItem("currentProject")
      if (storedCurrentProject) {
        const parsedCurrentProject = JSON.parse(storedCurrentProject)
        if (isValidProject(parsedCurrentProject)) {
          setProject(parsedCurrentProject)
          setShowProjectSelector(false)
        } else {
          throw new Error("Invalid current project data in localStorage")
        }
      } else if (parsedProjects.length > 0) {
        setProject(parsedProjects[0])
        setShowProjectSelector(false)
      } else {
        setShowProjectSelector(true)
      }
    } catch (error) {
      console.error("Error loading projects from localStorage:", error)
      setProjects([])
      setProject(defaultProject)
      setShowProjectSelector(true)
    }
  }, [])

  const updateBreak = useCallback((breakId: string, updates: Partial<Break>) => {
    setProject((prevProject) => {
      if (!prevProject) return defaultProject
      return {
        ...prevProject,
        breaks: prevProject.breaks.map((breakItem) =>
          breakItem.id === breakId ? { ...breakItem, ...updates } : breakItem,
        ),
      }
    })
  }, [])

  const updateProjectsInStorage = useCallback((updatedProjects: Project[]) => {
    try {
      localStorage.setItem("projects", JSON.stringify(updatedProjects))
      setProjects(updatedProjects)
    } catch (error) {
      console.error("Error updating projects in localStorage:", error)
    }
  }, [])

  const handleAddNote = useCallback((note: string) => {
    console.log("Adding note:", note)
    // Implement note adding logic here
  }, [])

  const handleAddBreak = useCallback((title: string) => {
    console.log("Adding break:", title)
    // Implement break adding logic here
  }, [])

  const handleRemoveBreak = useCallback((breakId: string) => {
    console.log("Removing break:", breakId)
    // Implement break removal logic here
  }, [])

  const handleSwitchBreak = useCallback((breakId: string) => {
    console.log("Switching to break:", breakId)
    // Implement break switching logic here
  }, [])

  const handleUpdateProjectTitle = useCallback((newTitle: string) => {
    console.log("Updating project title:", newTitle)
    // Implement project title update logic here
  }, [])

  if (isLoading) return <LoadingScreen />
  if (error)
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h1 className="text-xl font-bold mb-2">An error occurred in WorkspaceClient</h1>
        <pre className="whitespace-pre-wrap">{error.message}</pre>
      </div>
    )

  return (
    <ErrorBoundary>
      <UserProvider>
        <GuidedWorkspaceProvider>
          <div className="flex h-screen w-full bg-background p-4 space-x-4 overflow-hidden relative custom-scrollbar">
            {isMobileView && (
              <>
                <button
                  onClick={() =>
                    setActiveMobileComponent((prev) =>
                      prev === "journal" ? "editor" : prev === "editor" ? "assistant" : "journal",
                    )
                  }
                  className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground p-2 rounded-l-md z-[60]"
                  aria-label="Next Component"
                >
                  <ChevronRight size={24} />
                </button>
                <button
                  onClick={() =>
                    setActiveMobileComponent((prev) =>
                      prev === "journal" ? "assistant" : prev === "editor" ? "journal" : "editor",
                    )
                  }
                  className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground p-2 rounded-r-md z-[60]"
                  aria-label="Previous Component"
                >
                  <ChevronLeft size={24} />
                </button>
              </>
            )}
            <Suspense fallback={<LoadingScreen />}>
              <motion.div
                className={`${isMobileView ? "fixed inset-0 w-full h-full z-50" : "w-[30%] h-full relative"} overflow-hidden`}
                initial={false}
                animate={{
                  x: isMobileView
                    ? activeMobileComponent === "journal"
                      ? "0%"
                      : activeMobileComponent === "editor"
                        ? "-100%"
                        : "100%"
                    : "0%",
                  width: isMobileView ? "100%" : "30%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Journal notes={[]} onAddNote={handleAddNote} isMobileView={isMobileView} shouldBlur={shouldBlurUI} />
              </motion.div>
              <motion.div
                className={`${isMobileView ? "fixed inset-0 w-full h-full" : "w-[40%] flex-grow"} h-full overflow-hidden flex flex-col`}
                animate={{
                  x: isMobileView
                    ? activeMobileComponent === "editor"
                      ? "0%"
                      : activeMobileComponent === "journal"
                        ? "-100%"
                        : "100%"
                    : "0%",
                  width: isMobileView ? "100%" : "40%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                aria-label="Main editor area"
              >
                <Editor
                  project={project}
                  updateBreak={updateBreak}
                  isMobileView={isMobileView}
                  shouldBlur={shouldBlurUI}
                />
              </motion.div>
              <motion.div
                className={`${isMobileView ? "fixed inset-0 w-full h-full z-50" : "w-[30%] h-full relative"} overflow-hidden`}
                initial={false}
                animate={{
                  x: isMobileView
                    ? activeMobileComponent === "assistant"
                      ? "0%"
                      : activeMobileComponent === "journal"
                        ? "-100%"
                        : "100%"
                    : "0%",
                  width: isMobileView ? "100%" : "30%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Assistant
                  project={project}
                  updateBreak={updateBreak}
                  addBreak={handleAddBreak}
                  removeBreak={handleRemoveBreak}
                  switchBreak={handleSwitchBreak}
                  updateProjectTitle={handleUpdateProjectTitle}
                  onAddNote={handleAddNote}
                  setProject={setProject}
                  isMobileView={isMobileView}
                  setShowProjectSelector={setShowProjectSelector}
                  updateProjectsInStorage={updateProjectsInStorage}
                  activeMobileComponent={activeMobileComponent}
                  shouldBlur={shouldBlurUI}
                />
              </motion.div>
              <ProjectManager
                isOpen={showProjectSelector}
                onClose={() => setShowProjectSelector(false)}
                currentProject={project}
                onSelectProject={setProject}
                onDeleteProject={(projectId: string) => {
                  console.log("Deleting project:", projectId)
                  // Implement project deletion logic here
                }}
                onExportProject={(projectToExport: Project) => {
                  console.log("Exporting project:", projectToExport.title)
                  // Implement project export logic here
                }}
                projects={projects}
                updateProjectsInStorage={updateProjectsInStorage}
                setShouldBlurUI={setShouldBlurUI}
              />
            </Suspense>
          </div>
        </GuidedWorkspaceProvider>
      </UserProvider>
    </ErrorBoundary>
  )
}

function isValidProject(project: any): project is Project {
  return (
    typeof project === "object" &&
    project !== null &&
    typeof project.id === "string" &&
    typeof project.title === "string" &&
    Array.isArray(project.breaks) &&
    (project.currentBreakId === null || typeof project.currentBreakId === "string")
  )
}

export default WorkspaceClient

